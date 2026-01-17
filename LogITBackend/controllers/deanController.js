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

    const studentInviteToken = uuidv4();
    const companyInviteToken = uuidv4();

    const newBatch = new Batch({
      session_name: batchName,
      year: batchYear,
      created_by: req.user._id,
      isActive: true,
      student_invite_code: studentInviteToken,
      company_invite_code: companyInviteToken,
    });

    await newBatch.save();

    const baseUrl = process.env.BASE_URL || "http://localhost:5173";

    res.status(201).json({
      message: `Batch ${batchName} created successfully`,
      inviteLink: `${baseUrl}/register/student?token=${studentInviteToken}`,
      companyInviteLink: `${baseUrl}/register/company?token=${companyInviteToken}`,
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
    const batches = await Batch.find({}).select(
      "session_name isActive student_invite_code company_invite_code _id",
    );

    const baseUrl = process.env.BASE_URL || "http://localhost:5173";

    // Add full invite links to response
    const batchesWithLinks = batches.map((batch) => ({
      ...batch._doc,
      student_invite_link: `${baseUrl}/register/student?token=${batch.student_invite_code}`,
      company_invite_link: `${baseUrl}/register/company?token=${batch.company_invite_code}`,
    }));

    res.status(200).json(batchesWithLinks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching batches", error: error.message });
  }
};

const filterStudentsByBatch = async (req, res) => {
  const { batchId } = req.params;

  try {
    const students = await Student.find({ student_batch: batchId }).select(
      "-password -createdAt -updatedAt -__v -role",
    );
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
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
    console.log(studentBatch);

    if (!mongoose.Types.ObjectId.isValid(studentBatch)) {
      return res.status(404).json({ message: "Invalid ID format" });
    }

    const activeBatch = await Batch.findOne({ isActive: true });
    console.log(activeBatch);

    if (!activeBatch) {
      return res.status(400).json({
        message: "No active batch found. Please create a batch first.",
      });
    }
    if (studentBatch != activeBatch._id) {
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

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}).select(
      "-password -createdAt -updatedAt -__v -role",
    );
    const batches = await Batch.find({}).select("session_name");

    // Map batch IDs to session names for easy lookup
    const batchMap = {};
    batches.forEach((batch) => {
      batchMap[batch._id] = batch.session_name;
    });

    // Keep batch ID for filtering and add batch name for display
    const studentsWithBatchInfo = students.map((student) => {
      return {
        ...student._doc,
        student_batch_id: student.student_batch, // Keep ID for filtering
        student_batch_name: batchMap[student.student_batch], // Add name for display
      };
    });

    res.status(200).json(studentsWithBatchInfo);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export {
  createBatch,
  createStudent,
  getAllBatch,
  getAllStudents,
  filterStudentsByBatch,
};
