import express from "express";
import {
  // Logbook functions
  createWeeklyLog,
  getStudentLogs,
  getLogStats,
  submitLogToCompany,
  // Timesheet functions
  getStudentTimesheets,
  updateTimesheet,
  submitWeeklyTimesheet,
  submitTimesheetEntryToCompany,
  getMyProfileDetails,
  getStudentOjtProgress,
  createTimesheetEntry,
  createTimesheet,
  getStudentTasks,
  updateMyTaskStatus,
  getStudentDashboardStats,
  uploadStudentDocuments,
} from "../controllers/studentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploads.js";

const router = express.Router();

router.post(
  "/logs",
  protect,
  authorize("student"),
  upload.array("doc_attachment", 5),
  createWeeklyLog,
);
router.get("/logs", protect, authorize("student"), getStudentLogs);
router.get("/logs/stats", protect, authorize("student"), getLogStats);
router.get("/profile", protect, authorize("student"), getMyProfileDetails);
router.post(
  "/documents",
  protect,
  authorize("student"),
  upload.array("documents", 5),
  uploadStudentDocuments,
);
router.put(
  "/logs/:id/submit",
  protect,
  authorize("student"),
  submitLogToCompany,
);

router.post("/timesheets", protect, authorize("student"), createTimesheetEntry);
router.get(
  "/timesheets/student/:studentId",
  protect,
  authorize("student"),
  getStudentTimesheets,
);
router.get(
  "/ojt-progress/:studentId",
  protect,
  authorize("student"),
  getStudentOjtProgress,
);
router.put(
  "/timesheets/submit-week",
  protect,
  authorize("student"),
  submitWeeklyTimesheet,
);
router.put(
  "/timesheets/:id/submit-company",
  protect,
  authorize("student"),
  submitTimesheetEntryToCompany,
);

router.put("/timesheets/:id", protect, authorize("student"), updateTimesheet);
router.post(
  "/create-timesheet",
  protect,
  authorize("student"),
  createTimesheet,
);
router.get("/tasks", protect, authorize("student"), getStudentTasks);
router.patch(
  "/tasks/:taskId/status",
  protect,
  authorize("student"),
  updateMyTaskStatus,
);
router.get(
  "/dashboard/stats",
  protect,
  authorize("student"),
  getStudentDashboardStats,
);
export default router;
