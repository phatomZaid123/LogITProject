import { protect, authorize } from "../middleware/authMiddleware.js";

import {
  createBatch,
  createStudent,
  getAllStudents,
  filterStudentsByBatch,
  getAllBatch,
  getStudentById,
  getAllCompany,
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
router.get(
  "/getStudentByBatch/:batchId",
  protect,
  authorize("dean"),
  filterStudentsByBatch,
);
router.get("/student/:studentId", protect, authorize("dean"), getStudentById);

export default router;
