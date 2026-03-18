import mongoose from "mongoose";
import { LOGBOOK } from "../models/logbook.js";
import { TIMESHEET } from "../models/timesheet.js";
import { TASK } from "../models/task.js";
import Student from "../models/student.js";
import Evaluation from "../models/evaluation.js";
import { createNotification } from "../utils/notificationUtils.js";
import { httpError } from "../utils/httpError.js";

const MAX_LOGBOOK_WORDS_PER_ANSWER = 200;

const countWords = (value = "") =>
  String(value).trim().split(/\s+/).filter(Boolean).length;

export const createWeeklyLogForStudent = async ({
  studentId,
  payload,
  files,
}) => {
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
  } = payload || {};

  if (
    !dutiesAndResponsibilities ||
    !newThingsLearned ||
    !problemsEncountered ||
    !solutionsImplemented ||
    !accomplishmentsAndDeliverables ||
    !goalsForNextWeek
  ) {
    throw httpError(400, "All logbook questions must be answered");
  }

  const answers = [
    { key: "dutiesAndResponsibilities", value: dutiesAndResponsibilities },
    { key: "newThingsLearned", value: newThingsLearned },
    { key: "problemsEncountered", value: problemsEncountered },
    { key: "solutionsImplemented", value: solutionsImplemented },
    {
      key: "accomplishmentsAndDeliverables",
      value: accomplishmentsAndDeliverables,
    },
    { key: "goalsForNextWeek", value: goalsForNextWeek },
  ];

  const exceeded = answers.find(
    (item) => countWords(item.value) > MAX_LOGBOOK_WORDS_PER_ANSWER,
  );
  if (exceeded) {
    throw httpError(
      400,
      `Answer for ${exceeded.key} exceeds ${MAX_LOGBOOK_WORDS_PER_ANSWER} words.`,
    );
  }

  const attachments = files
    ? files.map((file) => ({
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        originalName: file.originalname,
      }))
    : [];

  return LOGBOOK.create({
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
    created_by: studentId,
  });
};

export const getStudentLogsByStudent = async (studentId) => {
  return LOGBOOK.find({ created_by: studentId }).sort({ createdAt: -1 });
};

export const getStudentLogStats = async (studentId) => {
  const stats = await LOGBOOK.aggregate([
    { $match: { created_by: studentId } },
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

  return stats[0] || { total: 0, approved: 0, pending: 0 };
};

export const submitLogToCompanyForStudent = async ({
  logId,
  studentId,
  studentName,
}) => {
  if (!mongoose.Types.ObjectId.isValid(logId)) {
    throw httpError(400, "Invalid logbook ID format");
  }

  const log = await LOGBOOK.findById(logId);
  if (!log) {
    throw httpError(404, "Logbook entry not found");
  }

  if (log.created_by.toString() !== studentId.toString()) {
    throw httpError(403, "Not authorized");
  }

  const student = await Student.findById(studentId).select("assigned_company");
  if (!student?.assigned_company) {
    throw httpError(400, "No company assigned yet.");
  }

  if (!log.status || !["draft", "declined"].includes(log.status)) {
    throw httpError(
      400,
      "Only draft or declined logbook entries can be submitted",
    );
  }

  log.status = "pending";
  await log.save();

  await createNotification({
    recipient: student.assigned_company,
    recipientRole: "company",
    type: "logbook_submitted",
    title: "Logbook submitted for review",
    message: `${studentName || "A student"} submitted ${log.weekNumber ? `Week ${log.weekNumber} ` : ""}logbook for review.`,
    link: "/company/dashboard/interns",
    data: {
      studentId,
      logId: log._id,
    },
  });

  return log;
};

export const submitWeeklyTimesheetForStudent = async ({
  studentId,
  studentName,
  weekStart,
  weekEnd,
}) => {
  const dateFilter = {};

  if (weekStart && weekEnd) {
    dateFilter.date = {
      $gte: new Date(weekStart),
      $lte: new Date(weekEnd),
    };
  }

  const entries = await TIMESHEET.find({
    student: studentId,
    status: { $in: ["pending", "company_declined"] },
    ...dateFilter,
  });

  if (!entries.length) {
    throw httpError(400, "No draft entries found for this week.");
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
      message: `${studentName || "A student"} submitted ${entries.length} timesheet entr${entries.length === 1 ? "y" : "ies"}.`,
      link: "/company/dashboard/interns",
      data: {
        studentId,
        entryIds: entries.map((item) => item._id),
      },
    });
  }

  return {
    modifiedCount: entries.length,
    autoTimedOutCount,
  };
};

export const submitTimesheetEntryToCompanyForStudent = async ({
  entryId,
  studentId,
  studentName,
}) => {
  if (!mongoose.Types.ObjectId.isValid(entryId)) {
    throw httpError(400, "Invalid timesheet ID format");
  }

  const entry = await TIMESHEET.findById(entryId);
  if (!entry) {
    throw httpError(404, "Timesheet entry not found");
  }

  if (entry.student.toString() !== studentId.toString()) {
    throw httpError(403, "Not authorized");
  }

  if (!["pending", "company_declined"].includes(entry.status)) {
    throw httpError(
      400,
      "Only draft or declined entries can be submitted to company",
    );
  }

  if (!entry.timeIn || !entry.timeOut) {
    throw httpError(400, "Please set both time in and time out before submit");
  }

  if (!entry.dailyLog || !entry.dailyLog.trim()) {
    throw httpError(
      400,
      "Please add daily accomplished tasks before submitting",
    );
  }

  if (!entry.company) {
    const student =
      await Student.findById(studentId).select("assigned_company");
    if (!student?.assigned_company) {
      throw httpError(400, "No company assigned yet.");
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
    message: `${studentName || "A student"} submitted a timesheet entry for review.`,
    link: "/company/dashboard/interns",
    data: {
      studentId,
      entryId: entry._id,
    },
  });

  return entry;
};

export const getMyProfileDetailsForStudent = async (studentId) => {
  const student = await Student.findById(studentId)
    .select("-password -createdAt -updatedAt -__v -role")
    .populate("student_batch", "session_name year")
    .populate("assigned_company", "name company_address");

  if (!student) {
    throw httpError(404, "Student not found");
  }

  const [logs, timesheets, evaluation] = await Promise.all([
    LOGBOOK.find({ created_by: studentId }).sort({ createdAt: -1 }),
    TIMESHEET.find({ student: studentId }).sort({ date: -1 }),
    Evaluation.findOne({ student: studentId })
      .populate("company", "name")
      .lean(),
  ]);

  const approvedHours = timesheets
    .filter((item) => item.status === "company_approved")
    .reduce((sum, item) => sum + (item.totalHours || 0), 0);

  const requiredHours = student.ojt_hours_required || 500;

  return {
    ...student.toObject(),
    logs,
    timesheets,
    evaluation,
    ojt_hours_completed: approvedHours,
    ojt_hours_remaining: Math.max(0, requiredHours - approvedHours),
  };
};

export const uploadStudentDocumentsForStudent = async ({
  studentId,
  files,
}) => {
  if (!files?.length) {
    throw httpError(400, "No documents uploaded");
  }

  const student = await Student.findById(studentId).select(
    "assigned_company documents",
  );

  if (!student) {
    throw httpError(404, "Student not found");
  }

  if (!student.assigned_company) {
    throw httpError(400, "No company assigned yet.");
  }

  const documents = files.map((file) => ({
    fileUrl: `/uploads/${file.filename}`,
    fileType: file.mimetype,
    originalName: file.originalname,
    uploadedBy: "student",
    category: "requirement",
    uploadedAt: new Date(),
  }));

  student.documents = [...(student.documents || []), ...documents];
  await student.save();

  return student.documents || [];
};

export const getStudentTimesheetsForStudent = async (studentId) => {
  if (!studentId || studentId === "undefined") {
    throw httpError(400, "Student ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw httpError(400, "Invalid Student ID format");
  }

  return TIMESHEET.find({ student: studentId }).sort({ date: -1 });
};

export const getStudentOjtProgressForStudent = async (studentId) => {
  if (!studentId || studentId === "undefined") {
    throw httpError(400, "Student ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw httpError(400, "Invalid Student ID format");
  }

  const student =
    await Student.findById(studentId).select("ojt_hours_required");
  if (!student) {
    throw httpError(404, "Student not found");
  }

  const stats = await TIMESHEET.aggregate([
    {
      $match: {
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

  return {
    totalRequired: required,
    totalRendered: rendered,
    remainingHours: Math.max(0, required - rendered),
    progressPercentage: ((rendered / required) * 100).toFixed(2),
  };
};

export const createTimesheetEntryForStudent = async ({
  studentId,
  payload,
}) => {
  const { date, timeIn } = payload || {};

  const student = await Student.findById(studentId);
  if (!student) {
    throw httpError(404, "Student not found.");
  }

  if (!student?.assigned_company) {
    throw httpError(400, "No company assigned yet.");
  }

  const entryDate = new Date(date || new Date());
  entryDate.setHours(0, 0, 0, 0);

  const existingEntry = await TIMESHEET.findOne({
    student: studentId,
    date: {
      $gte: entryDate,
      $lt: new Date(entryDate.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (existingEntry) {
    throw httpError(
      400,
      "An entry for this day already exists. Please edit the existing entry instead.",
    );
  }

  const dayOfWeek = entryDate.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(entryDate);
  weekStart.setDate(entryDate.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  weekEnd.setHours(0, 0, 0, 0);

  const weekEntries = await TIMESHEET.countDocuments({
    student: studentId,
    date: {
      $gte: weekStart,
      $lt: weekEnd,
    },
  });

  if (weekEntries >= 7) {
    throw httpError(
      400,
      "Maximum 7 entries per week allowed (one per day). This week is full.",
    );
  }

  return TIMESHEET.create({
    student: studentId,
    company: student.assigned_company,
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
    status: "pending",
  });
};

export const createTimesheetForStudent = async ({ payload }) => {
  const { studentId, companyId, weekStartDate } = payload || {};

  if (!studentId || !companyId || !weekStartDate) {
    throw httpError(400, "studentId, companyId and weekStartDate are required");
  }

  const start = new Date(weekStartDate);
  start.setHours(0, 0, 0, 0);

  const existing = await TIMESHEET.findOne({
    student: studentId,
    date: {
      $gte: start,
      $lt: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  if (existing) {
    throw httpError(400, "Week already started!");
  }

  const entries = [];
  for (let i = 0; i < 5; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    entries.push({
      student: studentId,
      company: companyId,
      date,
      timeIn: "00:00",
      timeOut: "",
      breakMinutes: 0,
      totalHours: 0,
      dailyLog: "",
      status: "pending",
    });
  }

  const created = await TIMESHEET.insertMany(entries);
  return created;
};

export const updateTimesheetEntryForStudent = async ({
  entryId,
  studentId,
  payload,
}) => {
  const { timeOut, breakMinutes, dailyLog } = payload || {};

  const entry = await TIMESHEET.findById(entryId);
  if (!entry) {
    throw httpError(404, "Entry not found");
  }

  if (!["pending", "company_declined"].includes(entry.status)) {
    throw httpError(
      403,
      "Locked: You cannot edit an entry that has been submitted or reviewed.",
    );
  }

  if (entry.student.toString() !== studentId.toString()) {
    throw httpError(403, "Not authorized");
  }

  if (!timeOut) {
    throw httpError(400, "Time out is required");
  }

  if (!dailyLog || !dailyLog.trim()) {
    throw httpError(400, "Daily accomplished tasks are required");
  }

  if (entry.timeOut) {
    throw httpError(400, "Time out is already recorded for this day");
  }

  entry.timeOut = timeOut;
  entry.dailyLog = dailyLog.trim();
  entry.autoTimedOut = false;
  if (breakMinutes !== undefined) {
    entry.breakMinutes = breakMinutes;
  }

  await entry.save();
  return entry;
};

export const getStudentTasksForStudent = async (studentId) => {
  return TASK.find({ assigned_to: studentId })
    .populate("created_by_company", "name email")
    .sort({ dueDate: 1, createdAt: -1 });
};

export const updateStudentTaskStatus = async ({
  taskId,
  studentId,
  status,
}) => {
  const allowedStatuses = ["in-progress", "submitted"];

  if (!status || !allowedStatuses.includes(status)) {
    throw httpError(400, "Invalid status value");
  }

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw httpError(400, "Invalid task ID format");
  }

  const task = await TASK.findOne({
    _id: taskId,
    assigned_to: studentId,
  }).populate("created_by_company", "name email");

  if (!task) {
    throw httpError(404, "Task not found");
  }

  if (task.status === "completed") {
    throw httpError(400, "Completed tasks cannot be edited");
  }

  task.status = status;
  await task.save();
  return task;
};

export const getStudentDashboardStatsForStudent = async (studentId) => {
  const student = await Student.findById(studentId)
    .select("ojt_hours_required assigned_company completed_program documents")
    .populate(
      "assigned_company",
      "name contact_person job_title company_address isSuspended",
    )
    .lean();

  if (!student) {
    throw httpError(404, "Student not found");
  }

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

  let internshipStatus = "enrolled";

  if (student.assigned_company) internshipStatus = "company_assigned";
  if (student.documents?.length) internshipStatus = "documents_uploaded";
  if (student.completed_program) internshipStatus = "internship_completed";

  return {
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
    internshipStatus,
  };
};
