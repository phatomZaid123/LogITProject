import express from "express";
import {
  // Logbook functions
  createWeeklyLog,
  getStudentLogs,
  getLogStats,
  // Timesheet functions
  getStudentTimesheets,
  updateTimesheet,
  submitWeeklyTimesheet,
  getStudentOjtProgress,
  createTimesheetEntry,
  createTimesheet,
  submitTimesheetsToDean,
  getStudentTasks,
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
  "/timesheets/submit-to-dean",
  protect,
  authorize("student"),
  submitTimesheetsToDean,
);
router.put("/timesheets/:id", protect, authorize("student"), updateTimesheet);
router.post(
  "/create-timesheet",
  protect,
  authorize("student"),
  createTimesheet,
);
router.get("/tasks", protect, authorize("student"), getStudentTasks);
export default router;
