import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createComplaint,
  getAllComplaints,
  getCompanyComplaints,
  replyToComplaint,
} from "../controllers/complaintController.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize("company"), createComplaint);
router.get("/mine", authorize("company"), getCompanyComplaints);
router.get("/", authorize("dean"), getAllComplaints);
router.post("/:complaintId/reply", authorize("dean"), replyToComplaint);

export default router;
