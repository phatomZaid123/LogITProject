import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  Download,
  FileText,
  RefreshCw,
  BookOpen,
  Clock,
  TrendingUp,
} from "lucide-react";

function DeanReports() {
  const { api } = useAuth();
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [reportType, setReportType] = useState("batch"); // batch or course
  const [selectedCourse, setSelectedCourse] = useState("BSCS");

  const courses = ["BSCS", "BSIT", "BSSE", "BSDS"];

  const getProfileImageSrc = (value = "") => {
    if (!value) return null;
    if (value.startsWith("http://") || value.startsWith("https://"))
      return value;
    return `http://localhost:5000${value}`;
  };

  const fetchReport = async () => {
    try {
      setLoadingReport(true);
      const endpoint =
        reportType === "batch" ? "/dean/reports/batch" : "/dean/reports/course";
      const params = reportType === "course" ? { course: selectedCourse } : {};
      const response = await api.get(endpoint, { params });
      setReport(response.data);
      toast.success("Reports generated successfully");
    } catch (error) {
      console.error("Error generating reports:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to generate reports";
      toast.error(errorMsg);
    } finally {
      setLoadingReport(false);
    }
  };

  const downloadPdf = async () => {
    try {
      setDownloading(true);
      const endpoint =
        reportType === "batch" ? "/dean/reports/batch" : "/dean/reports/course";
      const params =
        reportType === "course"
          ? { course: selectedCourse, format: "pdf" }
          : { format: "pdf" };
      const response = await api.get(endpoint, {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const reportName =
        reportType === "batch"
          ? `batch-report-${report.batch.session_name}.pdf`
          : `course-report-${report.course.name}.pdf`;
      link.download = reportName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error(error.response?.data?.message || "Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-purple-700 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Batch Reports</h1>
        <p className="text-purple-100 mt-2">
          Generate detailed progress reports for all students in the active
          batch.
        </p>
      </div>

      <Card elevated>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} className="text-purple-600" /> Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Report Type Selection */}
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="batch"
                  checked={reportType === "batch"}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  By Batch
                </span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="course"
                  checked={reportType === "course"}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  By Course
                </span>
              </label>
            </div>
          </div>

          {/* Course Selector - Only show when course mode is selected */}
          {reportType === "course" && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Select Course:
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Generate and Download Buttons */}
          <div className="flex gap-2">
            <Button onClick={fetchReport} disabled={loadingReport}>
              {loadingReport ? "Generating..." : "Generate Report"}
            </Button>
            <Button
              variant="outline"
              onClick={downloadPdf}
              disabled={downloading || !report}
            >
              <Download size={16} className="mr-2" />
              PDF
            </Button>
          </div>

          {loadingReport && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin" /> Generating
              reports for all students...
            </p>
          )}
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {reportType === "batch" ? "Batch" : "Course"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-1">
                {reportType === "batch" ? (
                  <>
                    <p className="font-semibold text-gray-900">
                      Session: {report.batch?.session_name}
                    </p>
                    <p>Year: {report.batch?.year}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900">
                      {report.course?.name || selectedCourse}
                    </p>
                    <p>Code: {report.course?.name || "N/A"}</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-1">
                <p>Total Students: {report.summary.totalStudents}</p>
                <p>Completed: {report.summary.studentsCompleted}</p>
                <p>Ongoing: {report.summary.studentsOngoing}</p>
                <p className="font-semibold text-gray-900">
                  Avg Progress: {report.summary.averageProgress}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hours</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-1">
                <p>Total Approved Hours: {report.summary.totalApprovedHours}</p>
                <p>
                  Generated: {new Date(report.generatedAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Student Reports Table */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Student Reports
              </h2>
              <span className="text-sm font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                {report.studentReports.length} Students
              </span>
            </div>

            {report.studentReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No students found.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                            Name
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                            Student ID
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                            Course
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                            Company
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                            Approved Hours
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                            Logs
                          </th>

                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.studentReports.map((studentReport) => (
                          <tr
                            key={studentReport.student._id}
                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                              studentReport.error ? "bg-red-50" : ""
                            }`}
                          >
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                              {studentReport.error ? (
                                <span className="text-red-600">
                                  {studentReport.student.name}
                                </span>
                              ) : (
                                studentReport.student.name
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {studentReport.student.student_admission_number}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {studentReport.student.student_course || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 truncate max-w-xs">
                              {studentReport.student.assigned_company_name || (
                                <span className="text-gray-400">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                              {studentReport.error ? (
                                <span className="text-red-600">-</span>
                              ) : (
                                `${studentReport.summary.approvedHours}h`
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                              {studentReport.error ? (
                                <span className="text-red-600">-</span>
                              ) : (
                                studentReport.metrics?.logs?.total || 0
                              )}
                            </td>

                            <td className="px-6 py-4 text-sm">
                              {studentReport.error ? (
                                <span className="text-xs text-red-600 font-semibold">
                                  {studentReport.error}
                                </span>
                              ) : studentReport.summary.isOjtComplete ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                  Completed
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                  Ongoing
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {!report && !loadingReport && (
        <Card>
          <CardContent className="p-6 text-sm text-gray-500">
            Click{" "}
            <span className="font-semibold text-gray-700">Generate Report</span>{" "}
            to build reports for all students in the{" "}
            {reportType === "batch" ? "active batch" : "selected course"}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DeanReports;
