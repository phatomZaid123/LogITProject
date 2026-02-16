import express from "express";
import {
  login,
  logout,
  getMe,
  registerStudent,
  registerCompany,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//login route
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

//student register route
router.post("/students/register", registerStudent);

//company register route
router.post("/companies/register", registerCompany);
export default router;
