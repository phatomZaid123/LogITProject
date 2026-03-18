// models/Student.js
import mongoose from "mongoose";
import User from "./user.js";

const studentSchema = new mongoose.Schema({
  student_admission_number: {
    type: Number,
    required: true,
    unique: true,
    sparse: true,
  },
  student_course: {
    type: String,
    required: true,
    enum: ["BSCS", "BSIT", "BSSE", "BSDS"],
  },

  ojt_hours_required: {
    type: Number,
    required: true,
  },

  completed_program: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["enrolled", "ongoing", "completed"],
    default: "enrolled",
  },
  student_batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },

  // Add company link here for when they get hired
  assigned_company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "company",
    default: null,
  },

  documents: [
    {
      fileUrl: String,
      fileType: String,
      originalName: String,
      uploadedBy: {
        type: String,
        enum: ["student", "company"],
        default: "student",
      },
      category: {
        type: String,
        enum: ["requirement", "certification"],
        default: "requirement",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Student = User.discriminator("student", studentSchema);
export default Student;
