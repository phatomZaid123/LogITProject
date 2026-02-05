import { LOGBOOK } from "../models/logbook.js";
import { TIMESHEET } from "../models/timesheet.js";
import { TASK } from "../models/task.js";
import mongoose from "mongoose";
import Student from "../models/student.js";

// @desc    Create a new weekly log with attachments
// @route   POST /api/student/logs
const createWeeklyLog = async (req, res) => {
  try {
    const {
      weekNumber,
      weekStartDate,
      weekEndDate,
      dutiesAndResponsibilities,
      newThingsLearned,
      problemsEncountered,
      solutionsImplemented,
      accomplishmentsAndDeliverables,
      goalsForNextWeek,
    } = req.body;

    // Request Validation
    if (
      !dutiesAndResponsibilities ||
      !newThingsLearned ||
      !problemsEncountered ||
      !solutionsImplemented ||
      !accomplishmentsAndDeliverables ||
      !goalsForNextWeek
    ) {
      return res
        .status(400)
        .json({ message: "All logbook questions must be answered" });
    }

    // Map files from Multer (req.files) to the Schema format
    const attachments = req.files
      ? req.files.map((file) => ({
          fileUrl: `/uploads/${file.filename}`, // URL path for frontend to access
          fileType: file.mimetype,
          originalName: file.originalname,
        }))
      : [];

    // Save to Database
    const newLog = await LOGBOOK.create({
      weekNumber,
      weekStartDate,
      weekEndDate,
      dutiesAndResponsibilities,
      newThingsLearned,
      problemsEncountered,
      solutionsImplemented,
      accomplishmentsAndDeliverables,
      goalsForNextWeek,
      attachments,
      created_by: req.user._id, // From your protect middleware
    });

    res.status(201).json({
      success: true,
      message: "Log submitted successfully",
      data: newLog,
    });
  } catch (error) {
    console.error("Creation Error:", error);
    res.status(500).json({ message: "Server error creating log" });
  }
};

// @desc    Get all logs for the logged-in student
// @route   GET /api/student/logs
const getStudentLogs = async (req, res) => {
  try {
    // req.user._id comes from your protect middleware
    const logs = await LOGBOOK.find({ created_by: req.user._id }).sort({
      createdAt: -1,
    }); // Newest first

    res.status(200).json(logs);
  } catch (error) {
    console.error("Fetch Logs Error:", error);
    res.status(500).json({ message: "Failed to fetch logbook entries" });
  }
};

// @desc    Get logbook statistics for the dashboard
// @route   GET /api/student/logs/stats
const getLogStats = async (req, res) => {
  try {
    const stats = await LOGBOOK.aggregate([
      { $match: { created_by: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || { total: 0, approved: 0, pending: 0 };
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate stats" });
  }
};

// @desc    Bulk submit pending timesheets to company
const submitWeeklyTimesheet = async (req, res) => {
  try {
    const result = await TIMESHEET.updateMany(
      {
        student: req.user._id, // From protect middleware
        status: "pending",
      },
      { $set: { status: "submitted_to_company" } },
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} entries submitted to company.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Submission failed", error: error.message });
  }
};

const getStudentTimesheets = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if studentId exists
    if (!studentId || studentId === "undefined") {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Check if ID is valid to avoid cast errors
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid Student ID format" });
    }

    const entries = await TIMESHEET.find({ student: studentId }).sort({
      date: -1,
    });

    // DEBUG: Check if data exists in DB but is just not returning
    console.log(`Found ${entries.length} entries for student ${studentId}`);

    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Calculate Progress (Refined with ObjectId casting)
const getStudentOjtProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if studentId exists
    if (!studentId || studentId === "undefined") {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid Student ID format" });
    }

    const student =
      await Student.findById(studentId).select("ojt_hours_required");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const stats = await TIMESHEET.aggregate([
      {
        $match: {
          // Explicitly cast to ObjectId for aggregate to work
          student: new mongoose.Types.ObjectId(studentId),
          status: "dean_approved",
        },
      },
      {
        $group: {
          _id: null,
          totalRendered: { $sum: "$totalHours" },
        },
      },
    ]);

    const rendered = stats.length > 0 ? stats[0].totalRendered : 0;
    const required = student.ojt_hours_required || 500;

    res.status(200).json({
      totalRequired: required,
      totalRendered: rendered,
      remainingHours: Math.max(0, required - rendered),
      progressPercentage: ((rendered / required) * 100).toFixed(2),
    });
  } catch (error) {
    console.error("OJT Progress Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new daily timesheet entry
// @route   POST /api/student/timesheets
export const createTimesheetEntry = async (req, res) => {
  try {
    const { date, timeIn, timeOut, breakMinutes } = req.body;

    //  Get student to find their assigned company
    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    console.log("Student data:", student);
    console.log("Assigned company:", student.assigned_company);

    // Normalize the date to start of day for comparison
    const entryDate = new Date(date || new Date());
    entryDate.setHours(0, 0, 0, 0);

    // Check if an entry already exists for this day
    const existingEntry = await TIMESHEET.findOne({
      student: req.user._id,
      date: {
        $gte: entryDate,
        $lt: new Date(entryDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingEntry) {
      return res.status(400).json({
        message:
          "An entry for this day already exists. Please edit the existing entry instead.",
      });
    }

    // Calculate week boundaries to check max entries per week
    const dayOfWeek = entryDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(entryDate);
    weekStart.setDate(entryDate.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    weekEnd.setHours(0, 0, 0, 0);

    // Count entries in this week
    const weekEntries = await TIMESHEET.countDocuments({
      student: req.user._id,
      date: {
        $gte: weekStart,
        $lt: weekEnd,
      },
    });

    if (weekEntries >= 7) {
      return res.status(400).json({
        message:
          "Maximum 7 entries per week allowed (one per day). This week is full.",
      });
    }

    if (!student?.assigned_company) {
      return res.status(400).json({ message: "No company assigned yet." });
    }

    //  Create the record
    const newEntry = await TIMESHEET.create({
      student: req.user._id,
      company: student.assigned_company || null, // Allow null for now
      date: entryDate,
      timeIn,
      timeOut,
      breakMinutes: breakMinutes || 0,
      status: "pending", // Initial state
    });

    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Create Timesheet Error:", error);
    res
      .status(500)
      .json({ message: "Failed to create entry", error: error.message });
  }
};

// Create a blank timesheet for the current week
export const createTimesheet = async (req, res) => {
  try {
    const { studentId, companyId, weekStartDate } = req.body;

    // Check if week already exists
    const existing = await Timesheet.findOne({ studentId, weekStartDate });
    if (existing)
      return res.status(400).json({ message: "Week already started!" });

    // Create 5 empty days (Mon-Fri)
    const start = new Date(weekStartDate);
    const entries = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      entries.push({
        date: date,
        day: date.toLocaleDateString("en-US", { weekday: "long" }),
        timeIn: "",
        timeOut: "",
        totalHours: 0,
        tasks: "",
        status: "Pending", // Entry level status
      });
    }

    const newTimesheet = new Timesheet({
      studentId,
      companyId,
      weekStartDate,
      entries,
      status: "Pending", // Weekly status (Draft/Pending/Approved)
    });

    await newTimesheet.save();
    res.status(201).json(newTimesheet);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update a single timesheet entry (Inline Grid Editing)
// @route   PUT /api/student/timesheets/:id
const updateTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeIn, timeOut, breakMinutes } = req.body;

    // 1. Find the entry
    const entry = await TIMESHEET.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // 2. SECURITY: Only allow edits if the status is still 'pending'
    // If it's 'submitted', 'approved', or 'edited_by_company', lock it for the student.
    if (entry.status !== "pending") {
      return res.status(403).json({
        message:
          "Locked: You cannot edit an entry that has been submitted or reviewed.",
      });
    }

    // 3. Update fields
    if (timeIn) entry.timeIn = timeIn;
    if (timeOut) entry.timeOut = timeOut;
    if (breakMinutes !== undefined) entry.breakMinutes = breakMinutes;

    // 4. Save the entry
    // NOTE: Using .save() is critical because it triggers your Schema pre-save hook
    // to automatically recalculate totalHours.
    await entry.save();

    res.status(200).json(entry);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update entry", error: error.message });
  }
};

// @desc    Submit approved timesheets to dean for final review
// @route   PUT /api/student/timesheets/submit-to-dean
const submitTimesheetsToDean = async (req, res) => {
  try {
    // Only submit entries that have been approved by company
    const result = await TIMESHEET.updateMany(
      {
        student: req.user._id,
        status: "company_approved",
      },
      { $set: { status: "submitted_to_dean" } },
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        message: "No company-approved entries found to submit to dean.",
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} entries submitted to dean for review.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Submission failed", error: error.message });
  }
};

const getStudentTasks = async (req, res) => {
  try {
    const tasks = await TASK.find({ assigned_to: req.user._id })
      .populate("created_by_company", "name email")
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Get Student Tasks Error:", error);
    res
      .status(500)
      .json({ message: "Failed to load tasks", error: error.message });
  }
};

export {
  createWeeklyLog,
  getLogStats,
  getStudentLogs,
  submitWeeklyTimesheet,
  getStudentOjtProgress,
  updateTimesheet,
  getStudentTimesheets,
  submitTimesheetsToDean,
  getStudentTasks,
};
