import { LOGBOOK } from "../models/logbook.js";
import { TIMESHEET } from "../models/timesheet.js";
import { TASK } from "../models/task.js";
import mongoose from "mongoose";
import Student from "../models/student.js";
import { createNotification } from "../utils/notificationUtils.js";

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

// @desc    Submit a single logbook entry to company review
// @route   PUT /api/student/logs/:id/submit
const submitLogToCompany = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid logbook ID format" });
    }

    const log = await LOGBOOK.findById(id);
    if (!log) {
      return res.status(404).json({ message: "Logbook entry not found" });
    }

    if (log.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const student = await Student.findById(req.user._id).select(
      "assigned_company",
    );
    if (!student?.assigned_company) {
      return res.status(400).json({ message: "No company assigned yet." });
    }

    if (!log.status || !["draft", "declined"].includes(log.status)) {
      return res.status(400).json({
        message: "Only draft or declined logbook entries can be submitted",
      });
    }

    log.status = "pending";
    await log.save();

    await createNotification({
      recipient: student.assigned_company,
      recipientRole: "company",
      type: "logbook_submitted",
      title: "Logbook submitted for review",
      message: `${req.user?.name || "A student"} submitted ${log.weekNumber ? `Week ${log.weekNumber} ` : ""}logbook for review.`,
      link: "/company/dashboard/interns",
      data: {
        studentId: req.user._id,
        logId: log._id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Log submitted to company",
      data: log,
    });
  } catch (error) {
    console.error("Submit Log Error:", error);
    res
      .status(500)
      .json({ message: "Failed to submit log", error: error.message });
  }
};

// @desc    Bulk submit pending timesheets to company
const submitWeeklyTimesheet = async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.body || {};
    const dateFilter = {};

    if (weekStart && weekEnd) {
      dateFilter.date = {
        $gte: new Date(weekStart),
        $lte: new Date(weekEnd),
      };
    }

    const entries = await TIMESHEET.find({
      student: req.user._id,
      status: { $in: ["pending", "company_declined"] },
      ...dateFilter,
    });

    if (!entries.length) {
      return res.status(400).json({
        success: false,
        message: "No draft entries found for this week.",
      });
    }

    let autoTimedOutCount = 0;

    for (const entry of entries) {
      if (!entry.timeOut) {
        entry.timeOut = "23:59";
        entry.autoTimedOut = true;
        autoTimedOutCount += 1;
      }

      entry.status = "submitted_to_company";
      await entry.save();
    }

    const recipientCompanyId = entries[0]?.company;
    if (recipientCompanyId) {
      await createNotification({
        recipient: recipientCompanyId,
        recipientRole: "company",
        type: "timesheet_submitted",
        title: "Timesheets submitted for review",
        message: `${req.user?.name || "A student"} submitted ${entries.length} timesheet entr${entries.length === 1 ? "y" : "ies"}.`,
        link: "/company/dashboard/interns",
        data: {
          studentId: req.user._id,
          entryIds: entries.map((item) => item._id),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `${entries.length} entries submitted to company.${
        autoTimedOutCount
          ? ` ${autoTimedOutCount} entr${autoTimedOutCount === 1 ? "y was" : "ies were"} automatically timed out.`
          : ""
      }`,
      modifiedCount: entries.length,
      autoTimedOutCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Submission failed", error: error.message });
  }
};

// @desc    Submit a single timesheet entry to company
// @route   PUT /api/student/timesheets/:id/submit-company
const submitTimesheetEntryToCompany = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid timesheet ID format" });
    }

    const entry = await TIMESHEET.findById(id);
    if (!entry) {
      return res.status(404).json({ message: "Timesheet entry not found" });
    }

    if (entry.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["pending", "company_declined"].includes(entry.status)) {
      return res.status(400).json({
        message: "Only draft or declined entries can be submitted to company",
      });
    }

    if (!entry.timeIn || !entry.timeOut) {
      return res.status(400).json({
        message: "Please set both time in and time out before submit",
      });
    }

    if (!entry.dailyLog || !entry.dailyLog.trim()) {
      return res.status(400).json({
        message: "Please add daily accomplished tasks before submitting",
      });
    }

    if (!entry.company) {
      const student = await Student.findById(req.user._id).select(
        "assigned_company",
      );
      if (!student?.assigned_company) {
        return res.status(400).json({ message: "No company assigned yet." });
      }
      entry.company = student.assigned_company;
    }

    entry.status = "submitted_to_company";
    await entry.save();

    await createNotification({
      recipient: entry.company,
      recipientRole: "company",
      type: "timesheet_submitted",
      title: "Timesheet submitted for review",
      message: `${req.user?.name || "A student"} submitted a timesheet entry for review.`,
      link: "/company/dashboard/interns",
      data: {
        studentId: req.user._id,
        entryId: entry._id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Entry submitted to company",
      data: entry,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Submission failed", error: error.message });
  }
};

// @desc    Get logged-in student's full profile details (same shape as dean student detail view)
// @route   GET /api/student/profile
const getMyProfileDetails = async (req, res) => {
  try {
    const studentId = req.user?._id;

    const student = await Student.findById(studentId)
      .select("-password -createdAt -updatedAt -__v -role")
      .populate("student_batch", "session_name year")
      .populate("assigned_company", "name company_address");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const [logs, timesheets] = await Promise.all([
      LOGBOOK.find({ created_by: studentId }).sort({ createdAt: -1 }),
      TIMESHEET.find({ student: studentId }).sort({ date: -1 }),
    ]);

    const approvedHours = timesheets
      .filter((entry) => entry.status === "company_approved")
      .reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

    const requiredHours = student.ojt_hours_required || 500;

    const studentData = {
      ...student.toObject(),
      logs,
      timesheets,
      ojt_hours_completed: approvedHours,
      ojt_hours_remaining: Math.max(0, requiredHours - approvedHours),
    };

    res.status(200).json(studentData);
  } catch (error) {
    console.error("Get My Profile Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
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
          timeOut: { $exists: true, $ne: "" },
          totalHours: { $gt: 0 },
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
    const { date, timeIn } = req.body;

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
      timeIn:
        timeIn ||
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      timeOut: "",
      breakMinutes: 0,
      dailyLog: "",
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
    const { timeOut, breakMinutes, dailyLog } = req.body;

    // 1. Find the entry
    const entry = await TIMESHEET.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // 2. SECURITY: Only allow edits if the status is still 'pending'
    // If it's 'submitted', 'approved', or 'edited_by_company', lock it for the student.
    if (!["pending", "company_declined"].includes(entry.status)) {
      return res.status(403).json({
        message:
          "Locked: You cannot edit an entry that has been submitted or reviewed.",
      });
    }

    if (entry.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 3. Update fields (clock-out flow)
    if (!timeOut) {
      return res.status(400).json({ message: "Time out is required" });
    }

    if (!dailyLog || !dailyLog.trim()) {
      return res
        .status(400)
        .json({ message: "Daily accomplished tasks are required" });
    }

    if (entry.timeOut) {
      return res
        .status(400)
        .json({ message: "Time out is already recorded for this day" });
    }

    entry.timeOut = timeOut;
    entry.dailyLog = dailyLog.trim();
    entry.autoTimedOut = false;
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

const updateMyTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["in-progress", "submitted"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const task = await TASK.findOne({
      _id: taskId,
      assigned_to: req.user._id,
    }).populate("created_by_company", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status === "completed") {
      return res
        .status(400)
        .json({ message: "Completed tasks cannot be edited" });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ success: true, task });
  } catch (error) {
    console.error("Update Student Task Status Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update task status", error: error.message });
  }
};

// @desc    Get student dashboard stats and overview data
// @route   GET /api/student/dashboard/stats
const getStudentDashboardStats = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .select("ojt_hours_required assigned_company")
      .populate(
        "assigned_company",
        "name contact_person job_title company_address isSuspended",
      )
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = req.user._id;
    const requiredHours = student.ojt_hours_required || 500;

    const [
      approvedHoursAgg,
      approvedLogs,
      pendingLogs,
      completedTasks,
      pendingTimesheets,
      approvedTimesheets,
      recentLogs,
      recentTimesheets,
      recentTasks,
      upcomingTasks,
    ] = await Promise.all([
      TIMESHEET.aggregate([
        {
          $match: {
            student: new mongoose.Types.ObjectId(studentId),
            status: "company_approved",
          },
        },
        { $group: { _id: null, totalHours: { $sum: "$totalHours" } } },
      ]),
      LOGBOOK.countDocuments({
        created_by: studentId,
        status: "approved",
      }),
      LOGBOOK.countDocuments({
        created_by: studentId,
        status: "pending",
      }),
      TASK.countDocuments({
        assigned_to: studentId,
        status: "completed",
      }),
      TIMESHEET.countDocuments({
        student: studentId,
        status: {
          $in: ["submitted_to_company", "edited_by_company"],
        },
      }),
      TIMESHEET.countDocuments({
        student: studentId,
        status: "company_approved",
      }),
      LOGBOOK.find({ created_by: studentId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("weekNumber status createdAt"),
      TIMESHEET.find({ student: studentId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("date status totalHours createdAt"),
      TASK.find({ assigned_to: studentId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("title status dueDate updatedAt"),
      TASK.find({
        assigned_to: studentId,
        status: { $ne: "completed" },
        dueDate: { $gte: new Date() },
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .select("title status dueDate"),
    ]);

    const totalApprovedHours = approvedHoursAgg[0]?.totalHours || 0;
    const percentComplete =
      requiredHours > 0
        ? Number(((totalApprovedHours / requiredHours) * 100).toFixed(2))
        : 0;

    const getPriority = (dueDate) => {
      const now = new Date();
      const diffDays = Math.ceil(
        (new Date(dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays <= 3) return "high";
      if (diffDays <= 7) return "medium";
      return "low";
    };

    const companyInfo = student.assigned_company
      ? {
          name: student.assigned_company.name || "N/A",
          mentor: student.assigned_company.contact_person?.name || "N/A",
          mentorEmail: student.assigned_company.contact_person?.email || "N/A",
          jobTitle: student.assigned_company.job_title || "N/A",
          address: student.assigned_company.company_address || "N/A",
          status: student.assigned_company.isSuspended ? "suspended" : "active",
        }
      : null;

    res.status(200).json({
      stats: {
        hours: {
          total: totalApprovedHours,
          required: requiredHours,
          remaining: Math.max(0, requiredHours - totalApprovedHours),
          percent: percentComplete,
        },
        logs: {
          approved: approvedLogs,
          pending: pendingLogs,
        },
        timesheets: {
          pending: pendingTimesheets,
          approved: approvedTimesheets,
        },
        tasks: {
          completed: completedTasks,
        },
        pendingApprovals: pendingLogs + pendingTimesheets,
      },
      recentActivity: {
        logs: recentLogs,
        timesheets: recentTimesheets,
        tasks: recentTasks,
      },
      upcomingDeadlines: upcomingTasks.map((task) => ({
        id: task._id,
        title: task.title,
        dueDate: task.dueDate,
        status: task.status,
        priority: getPriority(task.dueDate),
      })),
      companyInfo,
    });
  } catch (error) {
    console.error("Student Dashboard Stats Error:", error);
    res.status(500).json({
      message: "Failed to load dashboard data",
      error: error.message,
    });
  }
};

export {
  createWeeklyLog,
  getLogStats,
  getStudentLogs,
  submitLogToCompany,
  submitWeeklyTimesheet,
  submitTimesheetEntryToCompany,
  getMyProfileDetails,
  getStudentOjtProgress,
  updateTimesheet,
  getStudentTimesheets,
  getStudentTasks,
  updateMyTaskStatus,
  getStudentDashboardStats,
};
