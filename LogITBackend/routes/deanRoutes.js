import { protect, authorize } from "../middleware/authMiddleware.js";

import {
  createBatch,
  createStudent,
  getAllStudents,
  filterStudentsByBatch,
  getAllBatch,
  getStudentById,
  getAllCompany,
  getPendingLogs,
  reviewStudentLog,
  getPendingTimesheets,
  reviewTimesheet,
  getDashboardStats,
  getStudentRegistrationQR,
  getCompanyRegistrationQR,
  suspendCompany,
  unsuspendCompany,
  getCompaniesByStatus,
  getCompanyProfile,
  filterStudentsByCourse,
  getAlumniBatches,
  getAlumniBatchStudents,
} from "../controllers/deanController.js";
import express from "express";

const router = express.Router();

// // create dean route
// router.post("/createDean", createDean);

//create batch route
router.post("/createBatch", protect, authorize("dean"), createBatch);
router.post("/createStudent", protect, authorize("dean"), createStudent);
router.get("/getAllBatch", protect, authorize("dean"), getAllBatch);
router.get("/getAllStudents", protect, authorize("dean"), getAllStudents);
router.get("/getAllCompany", protect, authorize("dean"), getAllCompany);
router.get("/dashboard/stats", protect, authorize("dean"), getDashboardStats);
router.get(
  "/companies/status",
  protect,
  authorize("dean"),
  getCompaniesByStatus,
);
router.get(
  "/company/:companyId/profile",
  protect,
  authorize("dean"),
  getCompanyProfile,
);
router.put(
  "/company/:companyId/suspend",
  protect,
  authorize("dean"),
  suspendCompany,
);
router.put(
  "/company/:companyId/unsuspend",
  protect,
  authorize("dean"),
  unsuspendCompany,
);
router.get(
  "/registration/qr",
  protect,
  authorize("dean"),
  getStudentRegistrationQR,
);
router.get(
  "/company/registration/qr",
  protect,
  authorize("dean"),
  getCompanyRegistrationQR,
);
router.get(
  "/students/batch/:batchId",
  protect,
  authorize("dean"),
  filterStudentsByBatch,
);
router.get(
  "/students/course/:course",
  protect,
  authorize("dean"),
  filterStudentsByCourse,
);
router.get(
  "/alumni/batches",
  protect,
  authorize("dean"),
  getAlumniBatches,
);
router.get(
  "/alumni/batch/:batchId",
  protect,
  authorize("dean"),
  getAlumniBatchStudents,
);
router.get("/student/:studentId", protect, authorize("dean"), getStudentById);
router.get("/logs/pending", protect, authorize("dean"), getPendingLogs);
router.put("/logs/:id/review", protect, authorize("dean"), reviewStudentLog);
router.get(
  "/timesheets/pending",
  protect,
  authorize("dean"),
  getPendingTimesheets,
);
router.put(
  "/timesheets/:id/review",
  protect,
  authorize("dean"),
  reviewTimesheet,
);

export default router;
