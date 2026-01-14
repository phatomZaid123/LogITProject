// models/Student.js
import mongoose from "mongoose";
import User from "./user.js";

const studentSchema = new mongoose.Schema({
  
  student_admission_number: {
    type: Number,
    required: true,
    unique: true,
  },
  student_course: {
    type: String,
    required: true,
    enum: ["BSCS", "BSIT", "BSSE", "BSDS"],
  },
  student_batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch", 
    required: true,
  },
  // Add company link here for when they get hired
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    default: null,
  },
});

const Student = User.discriminator("student", studentSchema);
export default Student;
