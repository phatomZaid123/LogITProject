import Batch from "../models/batch.js";
import { v4 as uuidv4 } from "uuid";
import Student from "../models/student.js";
import mongoose from "mongoose";

//creating of new batch by dean
const createBatch = async (req, res) => {
  try {
    const { batchName, batchYear } = req.body;

    if (!batchName && !batchYear) {
      return res.status(401).json({ message: "Please enter correct inputs" });
    }

    const existingBatch = await Batch.findOne({ session_name: batchName });

    if (existingBatch) {
      return res
        .status(400)
        .json({ message: `Batch ${batchName} already exists` });
    }

    // Invalidate all previous batches
    await Batch.updateMany({}, { isActive: false });

    const newInviteToken = uuidv4();

    //create new student batch
    const newBatch = new Batch({
      session_name: batchName,
      year: batchYear,
      created_by: req.user._id,
      isActive: true,
      student_invite_code: newInviteToken,
      company_invite_code: uuidv4(),
    });

    await newBatch.save();

    // Send the FULL URL to the Frontend so the Dean can copy it

    const baseUrl = process.env.BASE_URL || "http://localhost:5173";

    res.status(201).json({
      success: true,
      message: `${batchName} created successfully!`,
      // Return the full clickable link to the UI
      inviteLink: `${baseUrl}/register/student?token=${newInviteToken}`,
    });
  } catch (error) {
    console.error("Batch Creation Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getAllBatch = async (req, res) => {
  try {
    // find({}) retrieves every document in the "batches" collection
    const batches = await Batch.find({}).select("session_name");

    // Return the array of batches to the frontend
    res.status(200).json(batches);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching batches", error: error.message });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      studentName,
      studentEmail,
      studentPassword,
      studentAdmissionNumber,
      studentCourse,
      studentBatch,
    } = req.body;

    if (
      !studentName ||
      !studentEmail ||
      !studentPassword ||
      !studentAdmissionNumber ||
      !studentCourse ||
      !studentBatch
    ) {
      return res.status(401).json({ message: "Please review inputs" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentBatch)) {
      return res.status(404).json({ message: "Invalid ID format" });
    }

    const activeBatch = await Batch.findOne({ isActive: true });

    if (!activeBatch) {
      return res.status(400).json({
        message: "No active batch found. Please create a batch first.",
      });
    }
    if (studentBatch != activeBatch) {
      return res.status(400).json({
        message: "No active batch found. Please create a batch first.",
      });
    }

    const newStudent = await Student({
      name: studentName,
      email: studentEmail,
      password: studentPassword,
      student_admission_number: studentAdmissionNumber,
      student_course: studentCourse,
      student_batch: studentBatch,
      role: "student",
    });

    await newStudent.save();

    res.status(201).json({ message: `${newStudent} Successfully created` });
  } catch (error) {
    console.error("Batch Creation Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export { createBatch, createStudent, getAllBatch };
