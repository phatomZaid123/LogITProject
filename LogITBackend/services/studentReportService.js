import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import Student from "../models/student.js";
import { LOGBOOK } from "../models/logbook.js";
import { TIMESHEET } from "../models/timesheet.js";
import { TASK } from "../models/task.js";
import { httpError } from "../utils/httpError.js";
import { markPastTimesheetAbsencesForStudent } from "./studentWorkflowService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");

const ensureValidStudentId = (studentId) => {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw httpError(400, "Invalid student ID format");
  }
};

const aggregateStudentReport = async (studentId) => {
  ensureValidStudentId(studentId);

  const student = await Student.findById(studentId)
    .select("-password -createdAt -updatedAt -__v -role")
    .populate("student_batch", "session_name year")
    .populate(
      "assigned_company",
      "name company_address contact_person job_title",
    );

  if (!student) {
    throw httpError(404, "Student not found");
  }

  await markPastTimesheetAbsencesForStudent(studentId);

  const [logs, timesheets, tasks] = await Promise.all([
    LOGBOOK.find({ created_by: studentId }).sort({ createdAt: -1 }).lean(),
    TIMESHEET.find({ student: studentId }).sort({ date: -1 }).lean(),
    TASK.find({ assigned_to: studentId }).sort({ dueDate: -1 }).lean(),
  ]);

  const requiredHours = Number(student.ojt_hours_required || 500);
  const approvedHours = timesheets
    .filter((entry) => entry.status === "company_approved")
    .reduce((sum, entry) => sum + Number(entry.totalHours || 0), 0);
  const loggedHours = timesheets.reduce(
    (sum, entry) => sum + Number(entry.totalHours || 0),
    0,
  );

  const timesheetStatusCounts = timesheets.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const logStatusCounts = logs.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const taskStatusCounts = tasks.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const progress = requiredHours
    ? Number(((approvedHours / requiredHours) * 100).toFixed(2))
    : 0;

  return {
    student: {
      ...student.toObject(),
      student_batch_name: student.student_batch?.session_name || "N/A",
      student_batch_year: student.student_batch?.year || "N/A",
      assigned_company_name: student.assigned_company?.name || "Unassigned",
      assigned_company_address:
        student.assigned_company?.company_address || "N/A",
      assigned_company_contact_name:
        student.assigned_company?.contact_person?.name || "N/A",
      assigned_company_contact_email:
        student.assigned_company?.contact_person?.email || "N/A",
      assigned_company_job_title:
        student.assigned_company?.job_title || "N/A",
    },
    summary: {
      requiredHours,
      approvedHours: Number(approvedHours.toFixed(2)),
      loggedHours: Number(loggedHours.toFixed(2)),
      remainingHours: Number(
        Math.max(0, requiredHours - approvedHours).toFixed(2),
      ),
      progressPercent: progress,
      isOjtComplete: approvedHours >= requiredHours,
    },
    metrics: {
      logs: {
        total: logs.length,
        byStatus: logStatusCounts,
      },
      timesheets: {
        total: timesheets.length,
        byStatus: timesheetStatusCounts,
      },
      tasks: {
        total: tasks.length,
        byStatus: taskStatusCounts,
      },
    },
    latest: {
      log: logs[0] || null,
      timesheet: timesheets[0] || null,
      task: tasks[0] || null,
    },
    details: {
      logbooks: logs,
      timesheets,
      tasks,
    },
  };
};

export const generateDeanStudentReport = async ({ studentId, deanId }) => {
  const base = await aggregateStudentReport(studentId);

  return {
    generatedAt: new Date().toISOString(),
    generatedByRole: "dean",
    generatedBy: deanId,
    scope: "full-student-report",
    ...base,
  };
};

export const generateCompanyStudentReport = async ({
  studentId,
  companyId,
}) => {
  const base = await aggregateStudentReport(studentId);

  const assignedCompanyId = base.student?.assigned_company?._id?.toString();
  if (!assignedCompanyId || assignedCompanyId !== companyId.toString()) {
    throw httpError(403, "This student is not assigned to your company");
  }

  return {
    generatedAt: new Date().toISOString(),
    generatedByRole: "company",
    generatedBy: companyId,
    scope: "assigned-student-report",
    ...base,
  };
};

export const convertStudentReportToCsv = (report) => {
  const lines = [
    ["generatedAt", report.generatedAt],
    ["generatedByRole", report.generatedByRole],
    ["studentName", report.student?.name || ""],
    ["studentEmail", report.student?.email || ""],
    ["studentAdmissionNumber", report.student?.student_admission_number || ""],
    ["studentCourse", report.student?.student_course || ""],
    ["batch", report.student?.student_batch_name || ""],
    ["batchYear", report.student?.student_batch_year || ""],
    ["assignedCompany", report.student?.assigned_company_name || ""],
    ["assignedCompanyAddress", report.student?.assigned_company_address || ""],
    [
      "assignedCompanyContactName",
      report.student?.assigned_company_contact_name || "",
    ],
    [
      "assignedCompanyContactEmail",
      report.student?.assigned_company_contact_email || "",
    ],
    ["assignedCompanyJobTitle", report.student?.assigned_company_job_title || ""],
    ["requiredHours", report.summary?.requiredHours || 0],
    ["approvedHours", report.summary?.approvedHours || 0],
    ["loggedHours", report.summary?.loggedHours || 0],
    ["remainingHours", report.summary?.remainingHours || 0],
    ["progressPercent", report.summary?.progressPercent || 0],
    ["isOjtComplete", report.summary?.isOjtComplete ? "yes" : "no"],
    ["logsTotal", report.metrics?.logs?.total || 0],
    ["timesheetsTotal", report.metrics?.timesheets?.total || 0],
    ["tasksTotal", report.metrics?.tasks?.total || 0],
  ];

  const escapeCsv = (value) => {
    const text = String(value ?? "");
    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const toRow = (values = []) =>
    values.map((value) => escapeCsv(value)).join(",");
  const csvRows = [];

  csvRows.push(toRow(["section", "Summary"]));
  csvRows.push(toRow(["field", "value"]));
  lines.forEach(([field, value]) => {
    csvRows.push(toRow([field, value]));
  });

  csvRows.push("");
  csvRows.push(toRow(["section", "Timesheet Entries"]));
  csvRows.push(
    toRow([
      "date",
      "timeIn",
      "timeOut",
      "breakMinutes",
      "totalHours",
      "status",
      "dailyLog",
    ]),
  );

  const timesheets = report.details?.timesheets || [];
  if (!timesheets.length) {
    csvRows.push(toRow(["No timesheet entries"]));
  } else {
    timesheets.forEach((entry) => {
      csvRows.push(
        toRow([
          entry.date ? new Date(entry.date).toISOString().split("T")[0] : "",
          entry.timeIn || "",
          entry.timeOut || "",
          entry.breakMinutes ?? 0,
          entry.totalHours ?? 0,
          entry.status || "",
          entry.dailyLog || "",
        ]),
      );
    });
  }

  csvRows.push("");
  csvRows.push(toRow(["section", "Weekly Logbook Entries"]));
  csvRows.push(
    toRow([
      "submittedAt",
      "week",
      "status",
      "dutiesAndResponsibilities",
      "newThingsLearned",
      "problemsEncountered",
      "solutionsImplemented",
      "accomplishmentsAndDeliverables",
      "goalsForNextWeek",
    ]),
  );

  const logbooks = report.details?.logbooks || [];
  if (!logbooks.length) {
    csvRows.push(toRow(["No logbook entries"]));
  } else {
    logbooks.forEach((entry) => {
      csvRows.push(
        toRow([
          entry.createdAt ? new Date(entry.createdAt).toISOString() : "",
          entry.weekNumber ? `Week ${entry.weekNumber}` : "Weekly Log",
          entry.status || "",
          entry.dutiesAndResponsibilities || "",
          entry.newThingsLearned || "",
          entry.problemsEncountered || "",
          entry.solutionsImplemented || "",
          entry.accomplishmentsAndDeliverables || "",
          entry.goalsForNextWeek || "",
        ]),
      );
    });
  }

  return csvRows.join("\n");
};

export const convertStudentReportToPdfBuffer = async (report) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const ensureSpace = (requiredHeight = 80) => {
      const bottomY = doc.page.height - doc.page.margins.bottom;
      if (doc.y + requiredHeight > bottomY) {
        doc.addPage();
      }
    };

    const addLine = (label, value) => {
      ensureSpace(20);
      doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
      doc.font("Helvetica").text(String(value ?? "N/A"));
    };

    const addBlock = (label, value) => {
      ensureSpace(50);
      doc.font("Helvetica-Bold").text(label);
      doc.font("Helvetica").text(String(value || "-"), {
        width: 500,
      });
      doc.moveDown(0.4);
    };

    const addStudentProfileImage = () => {
      const profileImage = report.student?.profile_image;
      if (!profileImage) return;

      const normalizedPath = String(profileImage).replace(/^\/+/, "");
      const absolutePath = path.join(backendRoot, normalizedPath);

      try {
        ensureSpace(90);
        doc.font("Helvetica-Bold").text("Profile Image");
        doc.moveDown(0.2);
        doc.image(absolutePath, {
          fit: [90, 90],
          align: "left",
          valign: "top",
        });
        doc.moveDown(0.6);
      } catch (_error) {
        // If the image file cannot be found/read, continue PDF generation silently.
      }
    };

    doc.fontSize(18).font("Helvetica-Bold").text("Student Progress Report");
    doc.moveDown(0.6);
    doc.fontSize(10).font("Helvetica");
    addLine("Generated At", new Date(report.generatedAt).toLocaleString());
    addLine("Generated By Role", report.generatedByRole);
    addLine("Report Scope", report.scope);

    doc.moveDown();
    doc.fontSize(13).font("Helvetica-Bold").text("Student Information");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    addLine("Name", report.student?.name || "N/A");
    addLine("Email", report.student?.email || "N/A");
    addLine(
      "Admission Number",
      report.student?.student_admission_number || "N/A",
    );
    addLine("Course", report.student?.student_course || "N/A");
    addLine("Batch", report.student?.student_batch_name || "N/A");
    addLine("Batch Year", report.student?.student_batch_year || "N/A");
    addLine(
      "Assigned Company",
      report.student?.assigned_company_name || "Unassigned",
    );
    addLine(
      "Company Address",
      report.student?.assigned_company_address || "N/A",
    );
    addLine(
      "Company Contact",
      report.student?.assigned_company_contact_name || "N/A",
    );
    addLine(
      "Company Contact Email",
      report.student?.assigned_company_contact_email || "N/A",
    );
    addLine(
      "Company Contact Title",
      report.student?.assigned_company_job_title || "N/A",
    );
    addStudentProfileImage();

    doc.moveDown();
    doc.fontSize(13).font("Helvetica-Bold").text("Hours Summary");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    addLine("Required Hours", report.summary?.requiredHours || 0);
    addLine("Approved Hours", report.summary?.approvedHours || 0);
    addLine("Logged Hours", report.summary?.loggedHours || 0);
    addLine("Remaining Hours", report.summary?.remainingHours || 0);
    addLine("Progress", `${report.summary?.progressPercent || 0}%`);
    addLine("OJT Completed", report.summary?.isOjtComplete ? "Yes" : "No");

    doc.moveDown();
    doc.fontSize(13).font("Helvetica-Bold").text("Activity Metrics");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    addLine("Logbook Entries", report.metrics?.logs?.total || 0);
    addLine("Timesheet Entries", report.metrics?.timesheets?.total || 0);
    addLine("Tasks", report.metrics?.tasks?.total || 0);

    doc.moveDown();
    doc.fontSize(13).font("Helvetica-Bold").text("Timesheet Details");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");

    const timesheets = report.details?.timesheets || [];
    if (!timesheets.length) {
      doc.text("No timesheet entries.");
    } else {
      timesheets.forEach((entry, index) => {
        ensureSpace(110);
        doc.font("Helvetica-Bold").text(`Entry ${index + 1}`);
        doc.font("Helvetica");
        addLine(
          "Date",
          entry.date ? new Date(entry.date).toLocaleDateString() : "N/A",
        );
        addLine("Time In", entry.timeIn || "-");
        addLine("Time Out", entry.timeOut || "-");
        addLine("Break Minutes", entry.breakMinutes ?? 0);
        addLine("Total Hours", entry.totalHours ?? 0);
        addLine(
          "Status",
          entry.status === "absent" ? "Absent" : entry.status || "-",
        );
        addBlock("Daily Log", entry.dailyLog || "-");
      });
    }

    doc.moveDown();
    doc.fontSize(13).font("Helvetica-Bold").text("Weekly Logbook Details");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");

    const logbooks = report.details?.logbooks || [];
    if (!logbooks.length) {
      doc.text("No weekly logbook entries.");
    } else {
      logbooks.forEach((entry, index) => {
        ensureSpace(180);
        doc.font("Helvetica-Bold").text(`Log ${index + 1}`);
        doc.font("Helvetica");
        addLine(
          "Submitted",
          entry.createdAt
            ? new Date(entry.createdAt).toLocaleDateString()
            : "N/A",
        );
        addLine(
          "Week",
          entry.weekNumber ? `Week ${entry.weekNumber}` : "Weekly Log",
        );
        addLine("Status", entry.status || "-");
        addBlock(
          "1. Duties and Responsibilities",
          entry.dutiesAndResponsibilities,
        );
        addBlock("2. New Things Learned", entry.newThingsLearned);
        addBlock("3. Problems Encountered", entry.problemsEncountered);
        addBlock("4. Solutions Implemented", entry.solutionsImplemented);
        addBlock(
          "5. Accomplishments and Deliverables",
          entry.accomplishmentsAndDeliverables,
        );
        addBlock("6. Goals for Next Week", entry.goalsForNextWeek);
      });
    }

    doc.end();
  });
};

const buildSummaryReportPdfBuffer = ({ title, headerLines = [], report }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const ensureSpace = (requiredHeight = 80) => {
      const bottomY = doc.page.height - doc.page.margins.bottom;
      if (doc.y + requiredHeight > bottomY) {
        doc.addPage();
      }
    };

    const addLine = (label, value) => {
      ensureSpace(20);
      doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
      doc.font("Helvetica").text(String(value ?? "N/A"));
    };

    doc.fontSize(18).font("Helvetica-Bold").text(title);
    doc.moveDown(0.6);
    doc.fontSize(10).font("Helvetica");
    addLine("Generated At", new Date(report.generatedAt).toLocaleString());

    headerLines.forEach(([label, value]) => {
      addLine(label, value);
    });

    doc.moveDown();
    doc.fontSize(13).font("Helvetica-Bold").text("Summary");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");

    const summary = report.summary || {};
    addLine("Total Students", report.totalStudents ?? summary.totalStudents ?? 0);
    addLine("Total Approved Hours", summary.totalApprovedHours ?? 0);
    addLine("Average Progress", `${summary.averageProgress ?? 0}%`);
    addLine("Students Completed", summary.studentsCompleted ?? 0);
    addLine("Students Ongoing", summary.studentsOngoing ?? 0);

    doc.moveDown();
    doc.fontSize(13).font("Helvetica-Bold").text("Student Reports");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");

    const studentReports = report.studentReports || [];
    if (!studentReports.length) {
      doc.text("No student reports available.");
      doc.end();
      return;
    }

    studentReports.forEach((item, index) => {
      ensureSpace(120);
      const student = item.student || {};
      const name = student.name || "N/A";

      doc.font("Helvetica-Bold").text(`${index + 1}. ${name}`);
      doc.font("Helvetica");
      addLine(
        "Admission Number",
        student.student_admission_number || "N/A",
      );
      addLine("Course", student.student_course || "N/A");
      addLine(
        "Assigned Company",
        student.assigned_company_name || "Unassigned",
      );

      if (item.error) {
        addLine("Error", item.error);
      } else {
        addLine("Approved Hours", item.summary?.approvedHours ?? 0);
        addLine("Logbook Entries", item.metrics?.logs?.total ?? 0);
        addLine(
          "Progress",
          `${item.summary?.progressPercent ?? 0}%`,
        );
        addLine(
          "OJT Status",
          item.summary?.isOjtComplete ? "Completed" : "Ongoing",
        );
      }

      doc.moveDown(0.4);
    });

    doc.end();
  });

export const convertBatchReportToPdfBuffer = async (report) =>
  buildSummaryReportPdfBuffer({
    title: "Batch Report",
    report,
    headerLines: [
      ["Batch Session", report.batch?.session_name || "N/A"],
      ["Batch Year", report.batch?.year || "N/A"],
    ],
  });

export const convertCourseReportToPdfBuffer = async (report) =>
  buildSummaryReportPdfBuffer({
    title: "Course Report",
    report,
    headerLines: [
      ["Course", report.course?.name || "N/A"],
      ["Course Count", report.course?.count ?? report.totalStudents ?? 0],
    ],
  });
