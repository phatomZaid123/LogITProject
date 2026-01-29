import Student from "../models/student.js";

const assignedInterns = async (req, res) => {
  const user = req.user; // The logged-in company from auth middleware
  if (!user || !user._id) {
    return res.status(400).json({ message: "Company information is required" });
  }

  try {
    const students = await Student.find({ assigned_company: user._id }).select(
      "-password -createdAt -updatedAt -__v -role",
    );
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Search students by name
const searchStudents = async (req, res) => {
  const { name } = req.query;

  console.log("Searching for students with name:", name);
  try {
    if (!name)
      return res.status(400).json({ message: "Search term is required" });

    // Use regex for partial, case-insensitive matching
    const students = await Student.find({
      name: { $regex: new RegExp(name, "i") },
    });

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
};

// Assign a specific student to a company
const assignStudentToCompany = async (req, res) => {
  const { studentId } = req.body;
  const user = req.user; // The logged-in company from auth middleware

  console.log(
    "Assign request for student ID:",
    studentId,
    "by company ID:",
    user?._id,
  );
  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required" });
  }
  if (!user || !user._id) {
    return res.status(400).json({ message: "Company information is required" });
  }

  try {
    const updateStudent = await Student.findByIdAndUpdate(
      studentId,
      { assigned_company: user._id },
      { new: true },
    ).select("-password -createdAt -updatedAt -__v -role");

    if (!updateStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(updateStudent);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export { searchStudents, assignStudentToCompany, assignedInterns };
