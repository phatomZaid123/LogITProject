import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createBatch,
  createStudent,
  getAllBatch,
} from "../controllers/deanController.js";
import express from "express";

const router = express.Router();

// // create dean route
// router.post("/createDean", createDean);

//create batch route
router.post("/createBatch", protect, authorize("dean"), createBatch);
router.post("/createStudent", protect, authorize("dean"), createStudent);
router.get("/getAllBatch", protect, authorize("dean"), getAllBatch);
export default router;
