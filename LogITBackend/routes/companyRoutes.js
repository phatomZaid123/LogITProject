import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  searchStudents,
  assignStudentToCompany,
  assignedInterns,
  approveAllStudentEntries,
  getPendingApprovals,
  companyReviewTimesheet,
  getStudentTimesheets,
  createTask,
  getCompanyTasks,
  updateTaskStatus,
} from "../controllers/companyController.js";

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
router.get("/tasks", protect, authorize("company"), getCompanyTasks);
router.post("/tasks", protect, authorize("company"), createTask);
router.patch(
  "/tasks/:taskId/status",
  protect,
  authorize("company"),
  updateTaskStatus,
);

export default router;
