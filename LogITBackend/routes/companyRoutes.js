import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  searchStudents,
  assignStudentToCompany,
  assignedInterns,
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

    
export default router;
