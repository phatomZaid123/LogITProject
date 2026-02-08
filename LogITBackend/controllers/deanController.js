import Batch from "../models/batch.js";
import QRCode from "qrcode";
import Student from "../models/student.js";
import mongoose from "mongoose";
import Company from "../models/company.js";
import { LOGBOOK } from "../models/logbook.js";
import { TIMESHEET } from "../models/timesheet.js";

const enrichCompaniesWithAssignments = async (companies = []) => {
  if (!companies.length) return companies;

  const companyIds = companies.map((company) => company._id);
  const assignmentCounts = await Student.aggregate([
    {
      $match: {
        assigned_company: { $in: companyIds },
      },
    },
    {
      $group: {
        _id: "$assigned_company",
        count: { $sum: 1 },
      },
    },
  ]);

  const assignmentMap = assignmentCounts.reduce((acc, entry) => {
    acc[entry._id.toString()] = entry.count;
    return acc;
  }, {});

  return companies.map((company) => ({
    ...company,
    assignedStudentCount: assignmentMap[company._id.toString()] || 0,
  }));
};

// Helper to generate the full object
const generateInviteData = async (token, type) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:5173";
  const link = `${baseUrl}/register/${type}?token=${token}`;
  const qrCode = await QRCode.toDataURL(link);
  return { link, qrCode };
};
const buildApprovedHoursMap = async (studentIds = []) => {
  if (!studentIds.length) return {};

  const stats = await TIMESHEET.aggregate([
    {
      $match: {
        student: {
          $in: studentIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
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

//creating of new batch by dean
const createBatch = async (req, res) => {
  try {
    const { batchName, batchYear } = req.body;
    if (!batchName || !batchYear) {
      return res.status(401).json({ message: "Please enter correct inputs" });
    }

    const existingBatch = await Batch.findOne({ session_name: batchName });
    if (existingBatch) {
      return res
        .status(400)
        .json({ message: `Batch ${batchName} already exists` });
    }

    await Batch.updateMany({}, { isActive: false });

    const studentInviteToken = crypto.randomUUID();
    const companyInviteToken = crypto.randomUUID();

    const newBatch = new Batch({
      session_name: batchName,
      year: batchYear,
      created_by: req.user._id,
      isActive: true,
      student_invite_code: studentInviteToken,
      company_invite_code: companyInviteToken,
    });

    await newBatch.save();

    res.status(201).json({
      message: `Batch ${batchName} created successfully`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getAllBatch = async (req, res) => {
  try {
    const batches = await Batch.find({}).select("-__v");

    const batchesWithQRs = await Promise.all(
      batches.map(async (batch) => {
        const studentData = await generateInviteData(
          batch.student_invite_code,
          "student",
        );
        const companyData = await generateInviteData(
          batch.company_invite_code,
          "company",
        );

        return {
          ...batch._doc,
          student_invite: studentData,
          company_invite: companyData,
        };
      }),
    );

    res.status(200).json(batchesWithQRs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching batches", error: error.message });
  }
};

const filterStudentsByBatch = async (req, res) => {
  const { batchId } = req.params;

  try {
    const students = await Student.find({ student_batch: batchId })
      .select("-password -createdAt -updatedAt -__v -role")
      .populate("assigned_company", "name")
      .populate("student_batch", "session_name")
      .lean();

    // Flatten the student response to use string names
    const flattenedStudents = students.map((student) => {
      const companyName = student.assigned_company?.name || "Unassigned";
      const companyId = student.assigned_company?._id || null;
      const batchName = student.student_batch?.session_name || "N/A";
      const batchId = student.student_batch?._id || null;

      return {
        ...student,
        assigned_company: companyName,
        assigned_company_id: companyId,
        student_batch: batchName,
        student_batch_id: batchId,
      };
    });

    const studentsWithHours = await attachStudentHourStats(flattenedStudents);

    res.status(200).json(studentsWithHours);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

const filterStudentsByCourse = async (req, res) => {
  const { course } = req.params;

  try {
    const normalizedCourse = course?.toUpperCase().trim();

    if (!normalizedCourse) {
      return res.status(400).json({ message: "Course is required" });
    }

    const students = await Student.find({ student_course: normalizedCourse })
      .select("-password -createdAt -updatedAt -__v -role")
      .populate("assigned_company", "name")
      .populate("student_batch", "session_name")
      .lean();

    const flattenedStudents = students.map((student) => {
      const companyName = student.assigned_company?.name || "Unassigned";
      const companyId = student.assigned_company?._id || null;
      const batchName = student.student_batch?.session_name || "N/A";
      const batchId = student.student_batch?._id || null;

      return {
        ...student,
        assigned_company: companyName,
        assigned_company_id: companyId,
        student_batch: batchName,
        student_batch_id: batchId,
      };
    });

    const studentsWithHours = await attachStudentHourStats(flattenedStudents);

    res.status(200).json(studentsWithHours);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      studentPassword,
      studentAdmissionNumber,
      studentCourse,
      studentBatch,
    } = req.body;

    if (
      !studentName ||
      !studentEmail ||
      !studentPassword ||
      !studentAdmissionNumber ||
      !studentCourse ||
      !studentBatch
    ) {
      return res.status(401).json({ message: "Please review inputs" });
    }
    console.log(studentBatch);

    if (!mongoose.Types.ObjectId.isValid(studentBatch)) {
      return res.status(404).json({ message: "Invalid ID format" });
    }

    const activeBatch = await Batch.findOne({ isActive: true });
    console.log(activeBatch);

    if (!activeBatch) {
      return res.status(400).json({
        message: "No active batch found. Please create a batch first.",
      });
    }
    if (studentBatch != activeBatch._id) {
      return res.status(400).json({
        message: "No active batch found. Please create a batch first.",
      });
    }

    const newStudent = await Student({
      name: studentName,
      email: studentEmail,
      password: studentPassword,
      student_admission_number: studentAdmissionNumber,
      student_course: studentCourse,
      student_batch: studentBatch,
      ojt_hours_required: 500,
      role: "student",
    });

    await newStudent.save();

    res.status(201).json({ message: `${newStudent} Successfully created` });
  } catch (error) {
    console.error("Batch Creation Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const activeBatch = await Batch.findOne({ isActive: true }).select("_id");
    if (!activeBatch) {
      return res.status(200).json({ students: [] });
    }

    // Fetch Students with populated names
    const students = await Student.find({ student_batch: activeBatch._id })
      .select("-password -createdAt -updatedAt -__v -role -company")
      .populate("assigned_company", "name")
      .populate("student_batch", "session_name")
      .lean();

    // Flatten the student response to use string names
    const flattenedStudents = students.map((student) => {
      const companyName = student.assigned_company?.name || "Unassigned";
      const companyId = student.assigned_company?._id || null;
      const batchName = student.student_batch?.session_name || "N/A";
      const batchId = student.student_batch?._id || null;

      return {
        ...student,

        assigned_company: companyName,
        assigned_company_id: companyId,
        student_batch: batchName,
        student_batch_id: batchId,
        assigned_company_name: companyName,
        student_batch_name: batchName,
      };
    });

    const studentsWithHours = await attachStudentHourStats(flattenedStudents);

    res.status(200).json({
      students: studentsWithHours,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllCompany = async (req, res) => {
  try {
    const companies = await Company.find({})
      .select("-password -createdAt -updatedAt -__v -role ")
      .lean();

    const enrichedCompanies = await enrichCompaniesWithAssignments(companies);

    res.status(200).json({
      company: enrichedCompanies,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAlumniBatches = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const query = { isActive: false };
    const total = await Batch.countDocuments(query);

    const batches = await Batch.find(query)
      .select("session_name year isActive createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      batches,
      page,
      total,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error("Alumni batches error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAlumniBatchStudents = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ message: "Invalid batch ID format" });
    }

    const batch = await Batch.findById(batchId)
      .select("session_name year isActive createdAt")
      .lean();

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    const students = await Student.find({ student_batch: batchId })
      .select(
        "name email student_admission_number student_course assigned_company student_batch ojt_hours_required completed_program",
      )
      .populate("assigned_company", "name")
      .populate("student_batch", "session_name year")
      .lean();

    const flattenedStudents = students.map((student) => {
      const companyName = student.assigned_company?.name || "Unassigned";
      const companyId = student.assigned_company?._id || null;
      const batchName = student.student_batch?.session_name || "N/A";
      const batchDocId = student.student_batch?._id || null;

      return {
        ...student,
        assigned_company: companyName,
        assigned_company_id: companyId,
        student_batch: batchName,
        student_batch_id: batchDocId,
      };
    });

    const studentsWithHours = await attachStudentHourStats(flattenedStudents);

    const alumniStudents = studentsWithHours.map((student) => ({
      ...student,
      approved_hours: Number(student.ojt_hours_completed || 0),
    }));

    res.status(200).json({
      batch,
      students: alumniStudents,
    });
  } catch (error) {
    console.error("Alumni batch students error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getCompanyProfile = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid company ID format" });
    }

    const company = await Company.findById(companyId)
      .select("-password -__v -role")
      .lean();

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const students = await Student.find({ assigned_company: companyId })
      .select(
        "name email student_admission_number student_course ojt_hours_required completed_program",
      )
      .lean();

    const studentsWithHours = await attachStudentHourStats(students);

    const studentIds = studentsWithHours.map((student) => student._id);
    const lastEntryStats = studentIds.length
      ? await TIMESHEET.aggregate([
          { $match: { student: { $in: studentIds } } },
          {
            $group: {
              _id: "$student",
              lastEntry: { $max: "$date" },
            },
          },
        ])
      : [];

    const lastEntryMap = lastEntryStats.reduce((acc, stat) => {
      acc[stat._id.toString()] = stat.lastEntry || null;
      return acc;
    }, {});

    const enrichedStudents = studentsWithHours.map((student) => {
      const required = student.ojt_hours_required || 500;
      const completed = Number(student.ojt_hours_completed || 0);
      const progress = required
        ? Number(((completed / required) * 100).toFixed(1))
        : 0;

      return {
        ...student,
        renderedHours: completed,
        progress,
        lastEntry: lastEntryMap[student._id.toString()] || null,
      };
    });

    const totalCompanyHours = enrichedStudents.reduce(
      (sum, student) => sum + (student.renderedHours || 0),
      0,
    );

    const stats = {
      totalStudents: enrichedStudents.length,
      completedStudents: enrichedStudents.filter(
        (student) => student.completed_program,
      ).length,
      inProgressStudents: enrichedStudents.filter(
        (student) => !student.completed_program,
      ).length,
      totalHoursLogged: Number(totalCompanyHours.toFixed(2)),
      averageProgress: enrichedStudents.length
        ? Number(
            (
              enrichedStudents.reduce(
                (sum, student) => sum + (student.progress || 0),
                0,
              ) / enrichedStudents.length
            ).toFixed(1),
          )
        : 0,
    };

    res.status(200).json({
      success: true,
      company,
      stats,
      students: enrichedStudents,
    });
  } catch (error) {
    console.error("Company Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company profile",
      error: error.message,
    });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    // Fetch the student profile
    const student = await Student.findById(studentId)
      .select("-password -createdAt -updatedAt -__v -role")
      .populate("student_batch", "session_name year")
      .populate("assigned_company", "name address");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    //  Fetch the Student's Weekly Logs
    const logs = await LOGBOOK.find({ created_by: studentId }).sort({
      createdAt: -1,
    });

    //  Fetch the Student's Timesheets
    const timesheets = await TIMESHEET.find({ student: studentId }).sort({
      date: -1,
    });

    const approvedHours = timesheets
      .filter((entry) => entry.status === "dean_approved")
      .reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const requiredHours = student.ojt_hours_required || 500;

    // Combine data into one response object
    // We convert student to a plain object to add the new fields
    const studentData = {
      ...student.toObject(),
      logs,
      timesheets,
      ojt_hours_completed: approvedHours,
      ojt_hours_remaining: Math.max(0, requiredHours - approvedHours),
    };

    res.status(200).json(studentData);
  } catch (error) {
    console.error("Get Student Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Review a student log (approve/decline)
const reviewStudentLog = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const { id } = req.params;

    // Validation: Ensure status is either approved or declined
    if (!["approved", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    // Find and Update the log
    const updatedLog = await LOGBOOK.findByIdAndUpdate(
      id,
      {
        status: status,
        deanFeedback: feedback || "",
      },
      { new: true, runValidators: true },
    ).populate("created_by", "name email"); // return student details

    if (!updatedLog) {
      return res.status(404).json({ message: "Logbook entry not found" });
    }

    res.status(200).json({
      success: true,
      message: `Log has been ${status}`,
      data: updatedLog,
    });
  } catch (error) {
    console.error("Dean Review Error:", error);
    res.status(500).json({ message: "Server error during review" });
  }
};

// @desc    Get all pending logbooks submitted to dean
const getPendingLogs = async (req, res) => {
  try {
    const pendingLogs = await LOGBOOK.find({ status: "pending" })
      .populate("created_by", "name email student_admission_number _id")
      .sort({ createdAt: 1 }); // Oldest first (FIFO)

    res.status(200).json(pendingLogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending logs" });
  }
};

// @desc    Get all pending timesheets submitted to dean
const getPendingTimesheets = async (req, res) => {
  try {
    const pendingTimesheets = await TIMESHEET.find({
      status: "submitted_to_dean",
    })
      .populate("student", "name email student_admission_number")
      .populate("company", "name")
      .sort({ date: 1 });

    res.status(200).json(pendingTimesheets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending timesheets" });
  }
};

// @desc    Review a student timesheet (approve/decline)
const reviewTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deanNotes } = req.body;

    if (!["dean_approved", "dean_declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const timesheet = await TIMESHEET.findById(id);
    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    timesheet.status = status;
    if (deanNotes) timesheet.deanNotes = deanNotes;

    await timesheet.save();

    res.status(200).json({
      success: true,
      message: `Timesheet ${status === "dean_approved" ? "approved" : "declined"}`,
      data: timesheet,
    });
  } catch (error) {
    console.error("Dean Review Error:", error);
    res.status(500).json({ message: "Server error during review" });
  }
};

// @desc    Get dashboard statistics and overview data
const getDashboardStats = async (req, res) => {
  try {
    // Get active batch
    const activeBatch = await Batch.findOne({ isActive: true }).select(
      "session_name year",
    );

    if (!activeBatch) {
      return res.status(200).json({
        activeBatch: {
          session_name: "No Active Batch",
          year: "N/A",
        },
        students: {
          total: 0,
          active: 0,
          unassigned: 0,
          completed: 0,
        },
        companies: {
          total: 0,
          active: 0,
        },
        pending: {
          logbooks: 0,
          timesheets: 0,
          total: 0,
        },
        recentActivity: {
          logs: [],
          timesheets: [],
        },
      });
    }

    const batchStudents = await Student.find({
      student_batch: activeBatch._id,
    })
      .select("_id assigned_company completed_program")
      .lean();

    const studentIds = batchStudents.map((student) => student._id);
    const totalStudents = batchStudents.length;
    const activeStudents = batchStudents.filter(
      (student) => student.assigned_company,
    ).length;
    const unassignedStudents = totalStudents - activeStudents;
    const completedStudents = batchStudents.filter(
      (student) => student.completed_program,
    ).length;

    const assignedCompanyIds = Array.from(
      new Set(
        batchStudents
          .map((student) => student.assigned_company)
          .filter(Boolean)
          .map((id) => id.toString()),
      ),
    ).map((id) => new mongoose.Types.ObjectId(id));

    const totalCompanies = assignedCompanyIds.length;
    const activeCompanies = assignedCompanyIds.length
      ? await Company.countDocuments({
          _id: { $in: assignedCompanyIds },
          isSuspended: { $ne: true },
        })
      : 0;

    const pendingLogs = studentIds.length
      ? await LOGBOOK.countDocuments({
          status: "pending",
          created_by: { $in: studentIds },
        })
      : 0;

    const pendingTimesheets = studentIds.length
      ? await TIMESHEET.countDocuments({
          status: "submitted_to_dean",
          student: { $in: studentIds },
        })
      : 0;

    const recentLogs = studentIds.length
      ? await LOGBOOK.find({ created_by: { $in: studentIds } })
          .populate("created_by", "name email student_admission_number")
          .sort({ createdAt: -1 })
          .limit(5)
          .select("weekNumber status createdAt")
      : [];

    const recentTimesheets = studentIds.length
      ? await TIMESHEET.find({ student: { $in: studentIds } })
          .populate("student", "name email student_admission_number")
          .sort({ createdAt: -1 })
          .limit(5)
          .select("date status totalHours createdAt")
      : [];

    // Combine stats
    const stats = {
      activeBatch,
      students: {
        total: totalStudents,
        active: activeStudents,
        unassigned: unassignedStudents,
        completed: completedStudents,
      },
      companies: {
        total: totalCompanies,
        active: activeCompanies,
      },
      pending: {
        logbooks: pendingLogs,
        timesheets: pendingTimesheets,
        total: pendingLogs + pendingTimesheets,
      },
      recentActivity: {
        logs: recentLogs,
        timesheets: recentTimesheets,
      },
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

// Get student registration QR code for the active batch
const getStudentRegistrationQR = async (req, res) => {
  try {
    // Get the active batch
    const activeBatch = await Batch.findOne({ isActive: true }).select(
      "session_name year student_invite_code",
    );

    if (!activeBatch) {
      return res.status(404).json({
        success: false,
        message: "No active batch found. Please create a batch first.",
      });
    }

    // Generate QR code and link using the existing helper
    const studentInvite = await generateInviteData(
      activeBatch.student_invite_code,
      "student",
    );

    res.status(200).json({
      success: true,
      batchName: activeBatch.session_name,
      batchYear: activeBatch.year,
      registrationLink: studentInvite.link,
      qrCode: studentInvite.qrCode,
    });
  } catch (error) {
    console.error("Error fetching student registration QR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get company registration QR code for the active batch
const getCompanyRegistrationQR = async (req, res) => {
  try {
    // Get the active batch
    const activeBatch = await Batch.findOne({ isActive: true }).select(
      "session_name year company_invite_code",
    );

    if (!activeBatch) {
      return res.status(404).json({
        success: false,
        message: "No active batch found. Please create a batch first.",
      });
    }

    // Generate QR code and link using the existing helper
    const companyInvite = await generateInviteData(
      activeBatch.company_invite_code,
      "company",
    );

    res.status(200).json({
      success: true,
      batchName: activeBatch.session_name,
      batchYear: activeBatch.year,
      registrationLink: companyInvite.link,
      qrCode: companyInvite.qrCode,
    });
  } catch (error) {
    console.error("Error fetching company registration QR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Suspend a company
const suspendCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    company.isSuspended = true;
    company.suspendedAt = new Date();
    company.suspendedBy = req.user._id;
    await company.save();

    res.status(200).json({
      success: true,
      message: `${company.name} has been suspended successfully`,
      company,
    });
  } catch (error) {
    console.error("Error suspending company:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Unsuspend a company
const unsuspendCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    company.isSuspended = false;
    company.suspendedAt = null;
    company.suspendedBy = null;
    await company.save();

    res.status(200).json({
      success: true,
      message: `${company.name} has been unsuspended successfully`,
      company,
    });
  } catch (error) {
    console.error("Error unsuspending company:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get companies by status (active/suspended)
const getCompaniesByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status === "active") {
      // Include companies where isSuspended is false, undefined, or null
      filter.$or = [
        { isSuspended: false },
        { isSuspended: { $exists: false } },
        { isSuspended: null },
      ];
    } else if (status === "suspended") {
      filter.isSuspended = true;
    }
    // if status is 'all' or undefined, no filter is applied

    const companies = await Company.find(filter)
      .select("-password -__v")
      .lean();
    const enrichedCompanies = await enrichCompaniesWithAssignments(companies);

    res.status(200).json({
      success: true,
      count: enrichedCompanies.length,
      company: enrichedCompanies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  createBatch,
  createStudent,
  getAllBatch,
  getAllStudents,
  getAllCompany,
  filterStudentsByBatch,
  filterStudentsByCourse,
  getStudentById,
  getAlumniBatches,
  getAlumniBatchStudents,
  getPendingLogs,
  reviewStudentLog,
  getPendingTimesheets,
  reviewTimesheet,
  getDashboardStats,
  getStudentRegistrationQR,
  getCompanyRegistrationQR,
  getCompanyProfile,
  suspendCompany,
  unsuspendCompany,
  getCompaniesByStatus,
};
