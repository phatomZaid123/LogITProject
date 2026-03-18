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

  const getProfileImageSrc = (value = "") => {
    if (!value) return null;
    if (value.startsWith("http://") || value.startsWith("https://"))
      return value;
    return `http://localhost:5000${value}`;
  };

  const fetchReport = async () => {
    try {
      setLoadingReport(true);
      const response = await api.get("/dean/reports/batch");
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
      const response = await api.get("/dean/reports/batch", {
        params: { format: "pdf" },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `batch-report-${report.batch.session_name}.pdf`;
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
          {/* Batch Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Batch</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-gray-900">
                  Session: {report.batch.session_name}
                </p>
                <p>Year: {report.batch.year}</p>
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

          {/* Student Reports Cards */}
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
                  <p className="text-gray-500">
                    No students found in active batch.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {report.studentReports.map((studentReport) => (
                  <Card
                    key={studentReport.student._id}
                    className={`hover:shadow-lg transition-shadow ${
                      studentReport.error ? "border-red-200" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      {studentReport.error ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="text-4xl text-red-500 mb-2">⚠️</div>
                          <p className="text-sm font-semibold text-gray-900 text-center">
                            {studentReport.student.name}
                          </p>
                          <p className="text-xs text-red-600 mt-2">
                            {studentReport.error}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {/* Header with name and status */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">
                                {studentReport.student.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {studentReport.student.student_admission_number}
                              </p>
                            </div>
                            <div className="ml-2">
                              {studentReport.summary.isOjtComplete ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                  Completed
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                  Ongoing
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Course and Company */}
                          <div className="space-y-2 border-t border-gray-100 pt-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">
                                Course
                              </p>
                              <p className="text-sm text-gray-900 font-medium">
                                {studentReport.student.student_course || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">
                                Company
                              </p>
                              <p className="text-sm text-gray-900 font-medium truncate">
                                {studentReport.student
                                  .assigned_company_name || (
                                  <span className="text-gray-400">
                                    Unassigned
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-3 gap-3 bg-linear-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                            {/* Approved Hours */}
                            <div className="text-center">
                              <div className="flex items-center justify-center h-8 bg-blue-100 rounded-lg mb-2">
                                <Clock size={16} className="text-blue-600" />
                              </div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">
                                Hours
                              </p>
                              <p className="text-sm font-bold text-gray-900">
                                {studentReport.summary.approvedHours}h
                              </p>
                            </div>

                            {/* Logbooks */}
                            <div className="text-center">
                              <div className="flex items-center justify-center h-8 bg-green-100 rounded-lg mb-2">
                                <BookOpen
                                  size={16}
                                  className="text-green-600"
                                />
                              </div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">
                                Logs
                              </p>
                              <p className="text-sm font-bold text-gray-900">
                                {studentReport.metrics?.logs?.total || 0}
                              </p>
                            </div>

                            {/* Progress */}
                            <div className="text-center">
                              <div className="flex items-center justify-center h-8 bg-purple-100 rounded-lg mb-2">
                                <TrendingUp
                                  size={16}
                                  className="text-purple-600"
                                />
                              </div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">
                                Progress
                              </p>
                              <p className="text-sm font-bold text-gray-900">
                                {studentReport.summary.progressPercent}%
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2 border-t border-gray-100 pt-4">
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-600 font-semibold">
                                OJT Progress
                              </p>
                              <p className="text-xs font-bold text-purple-600">
                                {studentReport.summary.approvedHours} /{" "}
                                {studentReport.summary.requiredHours} hours
                              </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  studentReport.summary.progressPercent >= 100
                                    ? "bg-green-500"
                                    : studentReport.summary.progressPercent >=
                                        75
                                      ? "bg-blue-500"
                                      : studentReport.summary.progressPercent >=
                                          50
                                        ? "bg-yellow-500"
                                        : "bg-orange-500"
                                }`}
                                style={{
                                  width: `${Math.min(studentReport.summary.progressPercent, 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Email footer */}
                          <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs text-gray-500">
                              {studentReport.student.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!report && !loadingReport && (
        <Card>
          <CardContent className="p-6 text-sm text-gray-500">
            Click{" "}
            <span className="font-semibold text-gray-700">Generate Report</span>{" "}
            to build reports for all students in the active batch
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DeanReports;
