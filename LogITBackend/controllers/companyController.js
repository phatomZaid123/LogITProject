import Student from "../models/student.js";
import { TIMESHEET } from "../models/timesheet.js";
import { TASK } from "../models/task.js";
import mongoose from "mongoose";

const buildApprovedHoursMap = async (studentIds = []) => {
  if (!studentIds.length) return {};

  const stats = await TIMESHEET.aggregate([
    {
      $match: {
        student: { $in: studentIds.map((id) => new mongoose.Types.ObjectId(id)) },
        status: "dean_approved",
      },
    },
    {
      $group: {
        _id: "$student",
        totalHours: { $sum: "$totalHours" },
      },
    },
  ]);

  return stats.reduce((acc, entry) => {
    acc[entry._id.toString()] = entry.totalHours || 0;
    return acc;
  }, {});
};

const attachStudentHourStats = async (students = []) => {
  if (!students.length) return students;

  const studentIds = students.map((student) => student._id);
  const approvedMap = await buildApprovedHoursMap(studentIds);

  return students.map((student) => {
    const required = student.ojt_hours_required || 500;
    const completed = approvedMap[student._id.toString()] || 0;
    return {
      ...student,
      ojt_hours_completed: completed,
      ojt_hours_remaining: Math.max(0, required - completed),
    };
  });
};

const assignedInterns = async (req, res) => {
  const user = req.user; // The logged-in company from auth middleware
  if (!user || !user._id) {
    return res.status(400).json({ message: "Company information is required" });
  }

  try {
    const students = await Student.find({ assigned_company: user._id })
      .select("-password -createdAt -updatedAt -__v -role")
      .lean();

    const enriched = await attachStudentHourStats(students);
    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Search students by name
const searchStudents = async (req, res) => {
  const { name } = req.query;

  console.log("Searching for students with name:", name);
  try {
    if (!name)
      return res.status(400).json({ message: "Search term is required" });

    // Use regex for partial, case-insensitive matching
    // Filter out students who already have an assigned company
    const students = await Student.find({
      name: { $regex: new RegExp(name, "i") },
      $or: [
        { assigned_company: { $exists: false } },
        { assigned_company: null },
      ],
    }).limit(10); // Limit results for better performance

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
};

// Assign a specific student to a company
const assignStudentToCompany = async (req, res) => {
  const { studentId } = req.body;
  const user = req.user; // The logged-in company from auth middleware

  console.log(
    "Assign request for student ID:",
    studentId,
    "by company ID:",
    user?._id,
  );
  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required" });
  }
  if (!user || !user._id) {
    return res.status(400).json({ message: "Company information is required" });
  }

  try {
    const updateStudent = await Student.findByIdAndUpdate(
      studentId,
      { assigned_company: user._id },
      { new: true },
    ).select("-password -createdAt -updatedAt -__v -role");

    if (!updateStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(updateStudent);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Finds students who have at least one 'submitted_to_company' timesheet for this company
export const getPendingApprovals = async (req, res) => {
  try {
    const companyId = req.user._id;

    // First get all students assigned to this company
    const assignedStudents = await Student.find({ assigned_company: companyId }).select('_id');
    const studentIds = assignedStudents.map(s => s._id);

    const pendingStudents = await TIMESHEET.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          status: "submitted_to_company",
        },
      },
      {
        $group: {
          _id: "$student", // Group by the student ID
          submittedCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users", // Since Student uses discriminator on User model
          localField: "_id",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      { $unwind: "$studentInfo" },
      {
        $project: {
          _id: "$studentInfo._id",
          name: "$studentInfo.name",
          email: "$studentInfo.email",
          submittedCount: 1,
        },
      },
    ]);

    res.status(200).json(pendingStudents);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching pending list", error: error.message });
  }
};

// BULK APPROVE (For the "Approve All" Button)
export const approveAllStudentEntries = async (req, res) => {
  try {
    const { studentId } = req.params;
    const companyId = req.user._id;

    // Verify student is assigned to this company first
    const student = await Student.findById(studentId);
    if (!student || student.assigned_company?.toString() !== companyId.toString()) {
      return res.status(403).json({ message: "Student is not assigned to your company" });
    }

    // Update all 'submitted_to_company' entries for this specific student
    const result = await TIMESHEET.updateMany(
      {
        student: studentId,
        status: "submitted_to_company",
      },
      { $set: { status: "company_approved" } },
    );

    res.status(200).json({
      message: `Successfully approved ${result.modifiedCount} entries.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Bulk approval failed" });
  }
};

// 3. INDIVIDUAL REVIEW (Individual entry approval/decline)
export const companyReviewTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, timeIn, timeOut, breakMinutes, companyNotes } = req.body;
    const companyId = req.user._id;

    const entry = await TIMESHEET.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // Security: Verify the student who owns this entry is assigned to this company
    const student = await Student.findById(entry.student);
    if (!student || student.assigned_company?.toString() !== companyId.toString()) {
      return res.status(403).json({ message: "Not authorized to review this entry" });
    }

    // Only allow review if entry is in 'submitted_to_company' status
    if (entry.status !== "submitted_to_company") {
      return res.status(400).json({ message: "Entry is not pending company review" });
    }

    // Handle Time Edits vs Status Updates
    if (timeIn || timeOut || breakMinutes !== undefined) {
      if (timeIn) entry.timeIn = timeIn;
      if (timeOut) entry.timeOut = timeOut;
      if (breakMinutes !== undefined) entry.breakMinutes = breakMinutes;
      entry.status = "edited_by_company";
    } else if (status) {
      // Allow company to approve or decline
      if (["company_approved", "company_declined"].includes(status)) {
        entry.status = status;
      }
    }

    if (companyNotes !== undefined) entry.companyNotes = companyNotes;

    await entry.save();
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: "Review failed", error: error.message });
  }
};

// 4. GET STUDENT TIMESHEETS (for company to view)
const getStudentTimesheets = async (req, res) => {
  try {
    const { studentId } = req.params;
    const companyId = req.user._id;

    // Validate studentId
    if (!studentId || studentId === "undefined") {
      return res.status(400).json({ message: "Student ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid Student ID format" });
    }

    // Verify the student is assigned to this company
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.assigned_company?.toString() !== companyId.toString()) {
      return res
        .status(403)
        .json({ message: "This student is not assigned to your company" });
    }

    // Get all timesheets for this student
    const timesheets = await TIMESHEET.find({ student: studentId }).sort({
      date: -1,
    });

    res.status(200).json(timesheets);
  } catch (error) {
    console.error("Get Student Timesheets Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const companyId = req.user?._id;
    const { title, description, dueDate, studentId, resourceLink } = req.body;

    if (!companyId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !description || !dueDate || !studentId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    const student = await Student.findById(studentId).select(
      "assigned_company name email student_admission_number",
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.assigned_company?.toString() !== companyId.toString()) {
      return res
        .status(403)
        .json({ message: "Student is not assigned to your company" });
    }

    const attachments = resourceLink
      ? [
          {
            fileUrl: resourceLink,
            originalName: resourceLink,
            fileType: "link",
          },
        ]
      : [];

    const task = await TASK.create({
      title,
      description,
      dueDate,
      assigned_to: studentId,
      created_by_company: companyId,
      companyAttachments: attachments,
    });

    await task.populate(
      "assigned_to",
      "name email student_admission_number",
    );

    res.status(201).json({
      success: true,
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign task",
      error: error.message,
    });
  }
};

const getCompanyTasks = async (req, res) => {
  try {
    const companyId = req.user?._id;

    const tasks = await TASK.find({ created_by_company: companyId })
      .populate("assigned_to", "name email student_admission_number")
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Get Company Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const companyId = req.user?._id;
    const { taskId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "assigned",
      "in-progress",
      "submitted",
      "completed",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const task = await TASK.findOne({
      _id: taskId,
      created_by_company: companyId,
    }).populate("assigned_to", "name email student_admission_number");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;
    await task.save();

    res.status(200).json({
      success: true,
      message: "Task status updated",
      task,
    });
  } catch (error) {
    console.error("Update Task Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task status",
      error: error.message,
    });
  }
};

export {
  searchStudents,
  assignStudentToCompany,
  assignedInterns,
  getStudentTimesheets,
  createTask,
  getCompanyTasks,
  updateTaskStatus,
};
