import asyncHandler from "../middleware/asyncHandler.js";
import {
  createTimesheetEntryForStudent,
  createTimesheetForStudent,
  createWeeklyLogForStudent,
  getMyProfileDetailsForStudent,
  getStudentDashboardStatsForStudent,
  getStudentLogStats,
  getStudentLogsByStudent,
  getStudentOjtProgressForStudent,
  getStudentTasksForStudent,
  getStudentTimesheetsForStudent,
  submitLogToCompanyForStudent,
  submitTimesheetEntryToCompanyForStudent,
  submitWeeklyTimesheetForStudent,
  updateStudentTaskStatus,
  updateTimesheetEntryForStudent,
  uploadStudentDocumentsForStudent,
} from "../services/studentWorkflowService.js";

// @desc    Create a new weekly log with attachments
// @route   POST /api/student/logs
const createWeeklyLog = asyncHandler(async (req, res) => {
  const newLog = await createWeeklyLogForStudent({
    studentId: req.user._id,
    payload: req.body,
    files: req.files,
  });

  res.status(201).json({
    success: true,
    message: "Log submitted successfully",
    data: newLog,
  });
});

// @desc    Get all logs for the logged-in student
// @route   GET /api/student/logs
const getStudentLogs = asyncHandler(async (req, res) => {
  const logs = await getStudentLogsByStudent(req.user._id);
  res.status(200).json(logs);
});

// @desc    Get logbook statistics for the dashboard
// @route   GET /api/student/logs/stats
const getLogStats = asyncHandler(async (req, res) => {
  const result = await getStudentLogStats(req.user._id);
  res.status(200).json(result);
});

// @desc    Submit a single logbook entry to company review
// @route   PUT /api/student/logs/:id/submit
const submitLogToCompany = asyncHandler(async (req, res) => {
  const log = await submitLogToCompanyForStudent({
    logId: req.params.id,
    studentId: req.user._id,
    studentName: req.user?.name,
  });

  res.status(200).json({
    success: true,
    message: "Log submitted to company",
    data: log,
  });
});

// @desc    Bulk submit pending timesheets to company
const submitWeeklyTimesheet = asyncHandler(async (req, res) => {
  const { weekStart, weekEnd } = req.body || {};

  const { modifiedCount, autoTimedOutCount } =
    await submitWeeklyTimesheetForStudent({
      studentId: req.user._id,
      studentName: req.user?.name,
      weekStart,
      weekEnd,
    });

  res.status(200).json({
    success: true,
    message: `${modifiedCount} entries submitted to company.${
      autoTimedOutCount
        ? ` ${autoTimedOutCount} entr${autoTimedOutCount === 1 ? "y was" : "ies were"} automatically timed out.`
        : ""
    }`,
    modifiedCount,
    autoTimedOutCount,
  });
});

// @desc    Submit a single timesheet entry to company
// @route   PUT /api/student/timesheets/:id/submit-company
const submitTimesheetEntryToCompany = asyncHandler(async (req, res) => {
  const entry = await submitTimesheetEntryToCompanyForStudent({
    entryId: req.params.id,
    studentId: req.user._id,
    studentName: req.user?.name,
  });

  res.status(200).json({
    success: true,
    message: "Entry submitted to company",
    data: entry,
  });
});

// @desc    Get logged-in student's full profile details (same shape as dean student detail view)
// @route   GET /api/student/profile
const getMyProfileDetails = asyncHandler(async (req, res) => {
  const studentData = await getMyProfileDetailsForStudent(req.user?._id);
  res.status(200).json(studentData);
});

// @desc    Upload required student documents
// @route   POST /api/student/documents
const uploadStudentDocuments = asyncHandler(async (req, res) => {
  const documents = await uploadStudentDocumentsForStudent({
    studentId: req.user._id,
    files: req.files,
  });

  res.status(201).json({
    success: true,
    message: "Documents uploaded successfully",
    documents,
  });
});

const getStudentTimesheets = asyncHandler(async (req, res) => {
  const entries = await getStudentTimesheetsForStudent(req.params.studentId);
  res.status(200).json(entries);
});

// @desc    Calculate Progress (Refined with ObjectId casting)
const getStudentOjtProgress = asyncHandler(async (req, res) => {
  const result = await getStudentOjtProgressForStudent(req.params.studentId);
  res.status(200).json(result);
});

// @desc    Create a new daily timesheet entry
// @route   POST /api/student/timesheets
const createTimesheetEntry = asyncHandler(async (req, res) => {
  const newEntry = await createTimesheetEntryForStudent({
    studentId: req.user._id,
    payload: req.body,
  });

  res.status(201).json(newEntry);
});

// Create a blank timesheet week starter entries
const createTimesheet = asyncHandler(async (req, res) => {
  const createdEntries = await createTimesheetForStudent({
    payload: req.body,
  });

  res.status(201).json(createdEntries);
});

// @desc    Update a single timesheet entry (Inline Grid Editing)
// @route   PUT /api/student/timesheets/:id
const updateTimesheet = asyncHandler(async (req, res) => {
  const entry = await updateTimesheetEntryForStudent({
    entryId: req.params.id,
    studentId: req.user._id,
    payload: req.body,
  });

  res.status(200).json(entry);
});

const getStudentTasks = asyncHandler(async (req, res) => {
  const tasks = await getStudentTasksForStudent(req.user._id);
  res.status(200).json({ success: true, tasks });
});

const updateMyTaskStatus = asyncHandler(async (req, res) => {
  const task = await updateStudentTaskStatus({
    taskId: req.params.taskId,
    studentId: req.user._id,
    status: req.body?.status,
  });

  res.status(200).json({ success: true, task });
});

// @desc    Get student dashboard stats and overview data
// @route   GET /api/student/dashboard/stats
const getStudentDashboardStats = asyncHandler(async (req, res) => {
  const dashboard = await getStudentDashboardStatsForStudent(req.user._id);
  res.status(200).json(dashboard);
});

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
  createTimesheetEntry,
  createTimesheet,
  getStudentTasks,
  updateMyTaskStatus,
  getStudentDashboardStats,
  uploadStudentDocuments,
};
