import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  searchStudents,
  assignStudentToCompany,
  assignedInterns,
  getAssignedStudentProfile,
  approveAllStudentEntries,
  getPendingApprovals,
  companyReviewTimesheet,
  getStudentTimesheets,
  getStudentLogsForCompany,
  companyReviewLogbook,
  createTask,
  getCompanyTasks,
  updateTaskStatus,
} from "../controllers/companyController.js";
import { getCompanyStudentReport } from "../controllers/studentReportController.js";

const router = express.Router();

// Get all students
router.get("/assignedInterns", protect, authorize("company"), assignedInterns);
// Search students by name
router.get("/searchStudents", protect, authorize("company"), searchStudents);

// Assign a specific student to a company
router.post(
  "/assignStudent",
  protect,
  authorize("company"),
  assignStudentToCompany,
);
router.get(
  "/pending-approvals",
  protect,
  authorize("company"),
  getPendingApprovals,
);
router.get(
  "/student/:studentId/timesheets",
  protect,
  authorize("company"),
  getStudentTimesheets,
);
router.get(
  "/student/:studentId/logs",
  protect,
  authorize("company"),
  getStudentLogsForCompany,
);
router.get(
  "/student/:studentId/profile",
  protect,
  authorize("company"),
  getAssignedStudentProfile,
);
router.get(
  "/reports/student/:studentId",
  protect,
  authorize("company"),
  getCompanyStudentReport,
);
router.put(
  "/approve-all/:studentId",
  protect,
  authorize("company"),
  approveAllStudentEntries,
);
router.put(
  "/timesheets/:id/approve",
  protect,
  authorize("company"),
  companyReviewTimesheet,
);
router.put(
  "/logs/:id/review",
  protect,
  authorize("company"),
  companyReviewLogbook,
);
router.get("/tasks", protect, authorize("company"), getCompanyTasks);
router.post("/tasks", protect, authorize("company"), createTask);
router.patch(
  "/tasks/:taskId/status",
  protect,
  authorize("company"),
  updateTaskStatus,
);

export default router;
