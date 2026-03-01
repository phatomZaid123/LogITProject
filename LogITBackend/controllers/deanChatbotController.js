import mongoose from "mongoose";
import Student from "../models/student.js";
import Company from "../models/company.js";
import { LOGBOOK } from "../models/logbook.js";
import { TIMESHEET } from "../models/timesheet.js";
import Evaluation from "../models/evaluation.js";

const extractQuotedValue = (message = "") => {
  const quoteMatch = String(message).match(/"([^"]+)"|'([^']+)'/);
  return quoteMatch ? (quoteMatch[1] || quoteMatch[2]).trim() : "";
};

const parseValue = (message = "", label = "") => {
  const pattern = new RegExp(`${label}\\s*[:=-]\\s*([^,\\n;]+)`, "i");
  const match = String(message).match(pattern);
  return match ? match[1].trim() : "";
};

const extractStudentQuery = (message = "") => {
  const quoted = extractQuotedValue(message);
  if (quoted) return quoted;

  const byKey =
    parseValue(message, "admission") ||
    parseValue(message, "student id") ||
    parseValue(message, "student name") ||
    parseValue(message, "student") ||
    parseValue(message, "name");
  if (byKey) return byKey;

  const summaryMatch = String(message).match(/summary of\s+student\s+(.+)/i);
  return summaryMatch ? summaryMatch[1].trim() : "";
};

const extractCompanyQuery = (message = "") => {
  const quoted = extractQuotedValue(message);
  if (quoted) return quoted;

  const byKey =
    parseValue(message, "company id") ||
    parseValue(message, "company name") ||
    parseValue(message, "company");
  if (byKey) return byKey;

  const summaryMatch = String(message).match(/summary of\s+company\s+(.+)/i);
  return summaryMatch ? summaryMatch[1].trim() : "";
};

const inferIntent = (message = "") => {
  const text = String(message).toLowerCase();
  if (/\bstudent\b|admission|intern/.test(text)) return "student";
  if (/\bcompany\b|partner/.test(text)) return "company";
  return "unknown";
};

const getApprovedHours = async (studentId) => {
  const hoursAgg = await TIMESHEET.aggregate([
    {
      $match: {
        student: new mongoose.Types.ObjectId(studentId),
        status: "company_approved",
      },
    },
    {
      $group: {
        _id: "$student",
        totalHours: { $sum: "$totalHours" },
      },
    },
  ]);

  return Number(hoursAgg[0]?.totalHours || 0);
};

const buildStudentSummary = ({
  student,
  approvedHours,
  logsCount,
  evaluation,
}) => {
  const requiredHours = Number(student.ojt_hours_required || 500);
  const remaining = Math.max(0, requiredHours - approvedHours);
  const progress = requiredHours
    ? Number(((approvedHours / requiredHours) * 100).toFixed(1))
    : 0;
  const performance =
    progress >= 100
      ? "Completed"
      : progress >= 75
        ? "On track"
        : progress >= 40
          ? "Progressing"
          : "Needs attention";

  return [
    "Student Summary",
    `Name: ${student.name}`,
    `Admission No.: ${student.student_admission_number || "N/A"}`,
    `Course: ${student.student_course || "N/A"}`,
    `Batch: ${student.student_batch?.session_name || "N/A"}`,
    `Assigned Company: ${student.assigned_company?.name || "Unassigned"}`,
    `Approved Hours: ${approvedHours.toFixed(1)} / ${requiredHours.toFixed(1)}`,
    `Remaining Hours: ${remaining.toFixed(1)}`,
    `Progress: ${progress}%`,
    `Logs Submitted: ${logsCount}`,
    `Status: ${performance}`,
    evaluation
      ? `Evaluation: ${Number(evaluation.overallScore || 0).toFixed(2)}/5 (${String(
          evaluation.recommendation || "-",
        ).replaceAll("_", " ")})`
      : "Evaluation: Not submitted",
  ].join("\n");
};

const buildCompanySummary = ({ company, students, stats }) => {
  const rows = students.slice(0, 8).map((student) => {
    const progress = Number(student.progress || 0).toFixed(1);
    return `• ${student.name} — ${Number(student.renderedHours || 0).toFixed(1)}h (${progress}%)`;
  });

  return [
    "Company Summary",
    `Company: ${company.name}`,
    `Address: ${company.company_address || "N/A"}`,
    `Contact Person: ${company.contact_person?.name || "N/A"}`,
    `Assigned Students: ${Number(stats.totalStudents || 0)}`,
    `Completed: ${Number(stats.completedStudents || 0)}`,
    `In Progress: ${Number(stats.inProgressStudents || 0)}`,
    `Total Approved Hours: ${Number(stats.totalHoursLogged || 0).toFixed(1)}`,
    `Average Progress: ${Number(stats.averageProgress || 0).toFixed(1)}%`,
    rows.length
      ? `Top Student Snapshot:\n${rows.join("\n")}`
      : "Top Student Snapshot: No students assigned yet.",
  ].join("\n");
};

const resolveStudentSummary = async (query) => {
  const normalized = String(query).trim();
  const isAdmissionLookup = /^\d+$/.test(normalized);

  const filter = isAdmissionLookup
    ? { student_admission_number: Number(normalized) }
    : {
        name: { $regex: new RegExp(normalized, "i") },
      };

  const students = await Student.find(filter)
    .select(
      "name student_admission_number student_course student_batch assigned_company ojt_hours_required",
    )
    .populate("student_batch", "session_name")
    .populate("assigned_company", "name")
    .limit(8)
    .lean();

  if (!students.length) {
    return `No student found for "${query}". Try full name or admission number.`;
  }

  if (!isAdmissionLookup && students.length > 1) {
    return [
      `I found multiple students for "${query}":`,
      ...students
        .slice(0, 5)
        .map(
          (student) =>
            `• ${student.name} (${student.student_admission_number || "N/A"})`,
        ),
      "Please refine your query or include the admission number.",
    ].join("\n");
  }

  const student = students[0];
  const [approvedHours, logsCount, evaluation] = await Promise.all([
    getApprovedHours(student._id),
    LOGBOOK.countDocuments({ created_by: student._id }),
    Evaluation.findOne({ student: student._id }).select(
      "overallScore recommendation",
    ),
  ]);

  return buildStudentSummary({
    student,
    approvedHours,
    logsCount,
    evaluation,
  });
};

const resolveCompanySummary = async (query) => {
  const normalized = String(query).trim();

  const companies = await Company.find({
    name: { $regex: new RegExp(normalized, "i") },
  })
    .select("name company_address contact_person")
    .limit(8)
    .lean();

  if (!companies.length) {
    return `No company found for "${query}". Try the full company name.`;
  }

  if (companies.length > 1) {
    return [
      `I found multiple companies for "${query}":`,
      ...companies.slice(0, 5).map((company) => `• ${company.name}`),
      "Please refine your query with a more specific name.",
    ].join("\n");
  }

  const company = companies[0];
  const students = await Student.find({ assigned_company: company._id })
    .select("name ojt_hours_required completed_program")
    .lean();

  const studentIds = students.map((student) => student._id);
  const approvedByStudent = studentIds.length
    ? await TIMESHEET.aggregate([
        {
          $match: {
            student: { $in: studentIds },
            status: "company_approved",
          },
        },
        {
          $group: {
            _id: "$student",
            totalHours: { $sum: "$totalHours" },
          },
        },
      ])
    : [];

  const approvedMap = approvedByStudent.reduce((acc, row) => {
    acc[row._id.toString()] = Number(row.totalHours || 0);
    return acc;
  }, {});

  const enrichedStudents = students.map((student) => {
    const renderedHours = approvedMap[student._id.toString()] || 0;
    const required = Number(student.ojt_hours_required || 500);
    const progress = required ? (renderedHours / required) * 100 : 0;
    return {
      ...student,
      renderedHours,
      progress,
    };
  });

  const totalHoursLogged = enrichedStudents.reduce(
    (sum, student) => sum + Number(student.renderedHours || 0),
    0,
  );
  const completedStudents = enrichedStudents.filter(
    (student) =>
      Number(student.progress || 0) >= 100 || student.completed_program,
  ).length;

  const stats = {
    totalStudents: enrichedStudents.length,
    completedStudents,
    inProgressStudents: Math.max(
      0,
      enrichedStudents.length - completedStudents,
    ),
    totalHoursLogged,
    averageProgress: enrichedStudents.length
      ? enrichedStudents.reduce(
          (sum, student) => sum + Number(student.progress || 0),
          0,
        ) / enrichedStudents.length
      : 0,
  };

  return buildCompanySummary({
    company,
    students: enrichedStudents,
    stats,
  });
};

export const askDeanAssistant = async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const intent = inferIntent(message);

    if (intent === "student") {
      const query = extractStudentQuery(message);
      if (!query) {
        return res.status(200).json({
          success: true,
          intent,
          summary:
            'Please provide a student name or admission number. Example: summary for student "Zaid Mustapha" or student admission: 12345',
        });
      }

      const summary = await resolveStudentSummary(query);
      return res.status(200).json({ success: true, intent, summary });
    }

    if (intent === "company") {
      const query = extractCompanyQuery(message);
      if (!query) {
        return res.status(200).json({
          success: true,
          intent,
          summary:
            'Please provide a company name. Example: summary for company "LogIT"',
        });
      }

      const summary = await resolveCompanySummary(query);
      return res.status(200).json({ success: true, intent, summary });
    }

    return res.status(200).json({
      success: true,
      intent: "unknown",
      summary:
        'I can summarize student or company details. Try: "summary for student \"Zaid Mustapha\"" or "summary for company \"LogIT\"".',
    });
  } catch (error) {
    console.error("Dean assistant error:", error);
    res.status(500).json({ message: "Failed to generate summary" });
  }
};
