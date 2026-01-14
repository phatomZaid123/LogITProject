import Batch from "../models/batch.js";
import { v4 as uuidv4 } from "uuid";
import Student from "../models/student.js";
import mongoose from "mongoose";

//creating of new batch by dean
const createBatch = async (req, res) => {
  try {
    const { batchName, batchYear } = req.body;

    if (!batchName && !batchYear) {
      return res
        .status(401)
        .json({ message: "Please enter the correct input fields" });
    }
    // Check if a with the given batch name already exists
    const existingBatch = await Batch.findOne({ batchName });
    if (existingBatch) {
      return res.status(400).json({
        message: `Batch ${batchName} already exist`,
      });
    }

    //Create new Batch
    const newBatch = await Batch({
      session_name: batchName,
      year: batchYear,
      created_by: req.user._id,
      inviteToken: encodeURIComponent(uuidv4()),
    });

    //Create url invitation link
    const baseUrl = process.env.BASE_URL;
    newBatch.student_invite_code = `${baseUrl}/register/student?token=${newBatch.inviteToken}`;
    newBatch.company_invite_code = `${baseUrl}/register/company?token=${uuidv4()}`;

    //save to database and respond with batch data
    await newBatch.save();

    res.status(201).json({
      message: `${batchName} created successfully!`,
    });
    console.log(newBatch);
  } catch (error) {
    console.error("Batch Creation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    
    const newStudent = await Student({
      name: studentName,
      email: studentEmail,
      password: studentPassword,
      student_admission_number: studentAdmissionNumber,
      student_course: studentCourse,
      student_batch: studentBatch,
    });

    await newStudent.save();

    res.status(201).json({ message: `${newStudent} Successfully created` });
  } catch (error) {
    console.error("Batch Creation Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { createBatch, createStudent, getAllBatch };
