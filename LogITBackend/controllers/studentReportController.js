import asyncHandler from "../middleware/asyncHandler.js";
import {
  convertStudentReportToCsv,
  convertStudentReportToPdfBuffer,
  generateCompanyStudentReport,
  generateDeanStudentReport,
} from "../services/studentReportService.js";

const sendCsvReport = (res, filename, csvContent) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
  return res.status(200).send(csvContent);
};

const sendPdfReport = (res, filename, pdfBuffer) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
  return res.status(200).send(pdfBuffer);
};

export const getDeanStudentReport = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const format = String(req.query.format || "json").toLowerCase();

  const report = await generateDeanStudentReport({
    studentId,
    deanId: req.user?._id,
  });

  if (format === "csv") {
    const csv = convertStudentReportToCsv(report);
    return sendCsvReport(res, `dean-student-report-${studentId}.csv`, csv);
  }

  if (format === "pdf") {
    const pdf = await convertStudentReportToPdfBuffer(report);
    return sendPdfReport(res, `dean-student-report-${studentId}.pdf`, pdf);
  }

  return res.status(200).json({
    success: true,
    report,
  });
});

export const getCompanyStudentReport = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const format = String(req.query.format || "json").toLowerCase();

  const report = await generateCompanyStudentReport({
    studentId,
    companyId: req.user?._id,
  });

  if (format === "csv") {
    const csv = convertStudentReportToCsv(report);
    return sendCsvReport(res, `company-student-report-${studentId}.csv`, csv);
  }

  if (format === "pdf") {
    const pdf = await convertStudentReportToPdfBuffer(report);
    return sendPdfReport(res, `company-student-report-${studentId}.pdf`, pdf);
  }

  return res.status(200).json({
    success: true,
    report,
  });
});
