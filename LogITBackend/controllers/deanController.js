import Batch from "../models/batch.js";
import QRCode from "qrcode";
import Student from "../models/student.js";
import mongoose from "mongoose";
import Company from "../models/company.js";

// Helper to generate the full object
const generateInviteData = async (token, type) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:5173";
  const link = `${baseUrl}/register/${type}?token=${token}`;
  const qrCode = await QRCode.toDataURL(link);
  return { link, qrCode };
};

//creating of new batch by dean
const createBatch = async (req, res) => {
  try {
    const { batchName, batchYear } = req.body;
    if (!batchName || !batchYear) {
      return res.status(401).json({ message: "Please enter correct inputs" });
    }

    const existingBatch = await Batch.findOne({ session_name: batchName });
    if (existingBatch) {
      return res
        .status(400)
        .json({ message: `Batch ${batchName} already exists` });
    }

    await Batch.updateMany({}, { isActive: false });

    const studentInviteToken = crypto.randomUUID(); // Modern 2026 approach for tokens
    const companyInviteToken = crypto.randomUUID();

    const newBatch = new Batch({
      session_name: batchName,
      year: batchYear,
      created_by: req.user._id,
      isActive: true,
      student_invite_code: studentInviteToken,
      company_invite_code: companyInviteToken,
    });

    await newBatch.save();

    // Generate QR codes for the response
    const studentInvite = await generateInviteData(
      studentInviteToken,
      "student",
    );
    const companyInvite = await generateInviteData(
      companyInviteToken,
      "company",
    );

    res.status(201).json({
      message: `Batch ${batchName} created successfully`,
      studentInvite,
      companyInvite,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getAllBatch = async (req, res) => {
  try {
    const batches = await Batch.find({}).select("-__v");

    const batchesWithQRs = await Promise.all(
      batches.map(async (batch) => {
        const studentData = await generateInviteData(
          batch.student_invite_code,
          "student",
        );
        const companyData = await generateInviteData(
          batch.company_invite_code,
          "company",
        );

        return {
          ...batch._doc,
          student_invite: studentData,
          company_invite: companyData,
        };
      }),
    );

    res.status(200).json(batchesWithQRs);
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
    // Fetch Students with populated names
    const students = await Student.find({})
      .select("-password -createdAt -updatedAt -__v -role -company")
      .populate("assigned_company", "name")
      .populate("student_batch", "session_name")
      .lean();

    // Flatten the student response to use string names
    const flattenedStudents = students.map((student) => {
      const companyName = student.assigned_company?.name || "Unassigned";
      const companyId = student.assigned_company?._id || null;
      const batchName = student.student_batch?.session_name || "N/A";
      const batchId = student.student_batch?._id || null;

      return {
        ...student,

        assigned_company: companyName,
        assigned_company_id: companyId,
        student_batch: batchName,
        student_batch_id: batchId,
        assigned_company_name: companyName,
        student_batch_name: batchName,
      };
    });

    res.status(200).json({
      students: flattenedStudents,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const getAllCompany = async (req, res) => {
  try {
    const companies = await Company.find({})
      .select("-password -createdAt -updatedAt -__v -role ")
      .lean();

    res.status(200).json({
      company: companies,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    const student = await Student.findById(studentId)
      .select("-password -createdAt -updatedAt -__v -role")
      .populate("student_batch", "session_name");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Get Student Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export {
  createBatch,
  createStudent,
  getAllBatch,
  getAllStudents,
  getAllCompany,
  filterStudentsByBatch,
  getStudentById,
};
