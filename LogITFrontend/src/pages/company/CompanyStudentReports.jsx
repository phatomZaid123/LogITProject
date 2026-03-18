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
import { Download, FileText, RefreshCw } from "lucide-react";

function CompanyStudentReports() {
  const { api } = useAuth();
  const [interns, setInterns] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [report, setReport] = useState(null);
  const [loadingInterns, setLoadingInterns] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const selectedIntern = useMemo(
    () => interns.find((student) => student._id === selectedStudentId) || null,
    [interns, selectedStudentId],
  );

  const getProfileImageSrc = (value = "") => {
    if (!value) return null;
    if (value.startsWith("http://") || value.startsWith("https://"))
      return value;
    return `http://localhost:5000${value}`;
  };

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        setLoadingInterns(true);
        const response = await api.get("/company/assignedInterns");
        setInterns(response.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load interns");
      } finally {
        setLoadingInterns(false);
      }
    };

    fetchInterns();
  }, [api]);
  // fetch report data for selected student and generate report
  const fetchReport = async () => {
    if (!selectedStudentId) {
      toast.error("Please select an intern first");
      return;
    }

    try {
      setLoadingReport(true);
      const response = await api.get(
        `/company/reports/student/${selectedStudentId}`,
      );
      setReport(response.data?.report || null);
      setExpandedLogId(null);
      toast.success("Report generated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate report");
    } finally {
      setLoadingReport(false);
    }
  };
  // download report as csv
  const downloadCsv = async () => {
    if (!selectedStudentId) {
      toast.error("Please select an intern first");
      return;
    }

    try {
      setDownloading(true);
      const response = await api.get(
        `/company/reports/student/${selectedStudentId}`,
        {
          params: { format: "csv" },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `company-student-report-${selectedStudentId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download CSV");
    } finally {
      setDownloading(false);
    }
  };
  
  // download report as pdf
  const downloadPdf = async () => {
    if (!selectedStudentId) {
      toast.error("Please select an intern first");
      return;
    }

    try {
      setDownloading(true);
      const response = await api.get(
        `/company/reports/student/${selectedStudentId}`,
        {
          params: { format: "pdf" },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `company-student-report-${selectedStudentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-emerald-700 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Intern Student Reports</h1>
        <p className="text-emerald-100 mt-2">
          Generate role-scoped reports for interns assigned to your company.
        </p>
      </div>

      <Card elevated>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} className="text-emerald-600" /> Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Intern
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Choose intern...</option>
                {interns.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} - {student.student_admission_number} (
                    {student.student_course})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={fetchReport}
                disabled={loadingReport || loadingInterns}
              >
                {loadingReport ? "Generating..." : "Generate"}
              </Button>
              <Button
                variant="outline"
                onClick={downloadCsv}
                disabled={downloading || loadingInterns}
              >
                <Download size={16} className="mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={downloadPdf}
                disabled={downloading || loadingInterns}
              >
                <Download size={16} className="mr-2" />
                PDF
              </Button>
            </div>
          </div>

          {loadingInterns && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin" /> Loading
              interns...
            </p>
          )}
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Intern</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-1">
                {getProfileImageSrc(report.student?.profile_image) && (
                  <img
                    src={getProfileImageSrc(report.student?.profile_image)}
                    alt="Intern profile"
                    className="w-16 h-16 rounded-full object-cover border border-gray-200 mb-2"
                  />
                )}
                <p className="font-semibold text-gray-900">
                  {report.student?.name}
                </p>
                <p>{report.student?.email || "N/A"}</p>
                <p>Course: {report.student?.student_course || "N/A"}</p>
                <p>
                  Admission: {report.student?.student_admission_number || "N/A"}
                </p>
                <p>Batch: {report.student?.student_batch_name || "N/A"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hours</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-1">
                <p>Required: {report.summary?.requiredHours || 0}h</p>
                <p>Approved: {report.summary?.approvedHours || 0}h</p>
                <p>Remaining: {report.summary?.remainingHours || 0}h</p>
                <p className="font-semibold text-gray-900">
                  Progress: {report.summary?.progressPercent || 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700 space-y-1">
                <p>Logs: {report.metrics?.logs?.total || 0}</p>
                <p>Timesheets: {report.metrics?.timesheets?.total || 0}</p>
                <p>Tasks: {report.metrics?.tasks?.total || 0}</p>
                <p>
                  Generated: {new Date(report.generatedAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timesheet Entries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Time In</th>
                      <th className="px-3 py-2 text-left">Time Out</th>
                      <th className="px-3 py-2 text-left">Hours</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Daily Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(report.details?.timesheets || []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-6 text-center text-gray-500"
                        >
                          No timesheet entries found.
                        </td>
                      </tr>
                    ) : (
                      (report.details?.timesheets || []).map((item) => (
                        <tr key={item._id}>
                          <td className="px-3 py-2">
                            {item.date
                              ? new Date(item.date).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-3 py-2">{item.timeIn || "-"}</td>
                          <td className="px-3 py-2">{item.timeOut || "-"}</td>
                          <td className="px-3 py-2">
                            {Number(item.totalHours || 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            {item.status === "absent"
                              ? "Absent"
                              : item.status || "-"}
                          </td>
                          <td className="px-3 py-2 max-w-md">
                            <div className="line-clamp-3">
                              {item.dailyLog || "-"}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Logbook Entries</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left">Submitted</th>
                      <th className="px-3 py-2 text-left">Week</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Answers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(report.details?.logbooks || []).length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-6 text-center text-gray-500"
                        >
                          No logbook entries found.
                        </td>
                      </tr>
                    ) : (
                      (report.details?.logbooks || []).map((item) => (
                        <Fragment key={item._id}>
                          <tr>
                            <td className="px-3 py-2">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="px-3 py-2">
                              {item.weekNumber
                                ? `Week ${item.weekNumber}`
                                : "Weekly Log"}
                            </td>
                            <td className="px-3 py-2">{item.status || "-"}</td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedLogId((prev) =>
                                    prev === item._id ? null : item._id,
                                  )
                                }
                                className="px-2 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              >
                                {expandedLogId === item._id
                                  ? "Hide full answers"
                                  : "View full answers"}
                              </button>
                            </td>
                          </tr>
                          {expandedLogId === item._id && (
                            <tr>
                              <td colSpan={4} className="px-4 py-4 bg-gray-50">
                                <div className="space-y-3 text-sm text-gray-700">
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      1. Duties and Responsibilities
                                    </p>
                                    <p className="whitespace-pre-wrap">
                                      {item.dutiesAndResponsibilities || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      2. New Things Learned
                                    </p>
                                    <p className="whitespace-pre-wrap">
                                      {item.newThingsLearned || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      3. Problems Encountered
                                    </p>
                                    <p className="whitespace-pre-wrap">
                                      {item.problemsEncountered || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      4. Solutions Implemented
                                    </p>
                                    <p className="whitespace-pre-wrap">
                                      {item.solutionsImplemented || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      5. Accomplishments and Deliverables
                                    </p>
                                    <p className="whitespace-pre-wrap">
                                      {item.accomplishmentsAndDeliverables ||
                                        "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      6. Goals for Next Week
                                    </p>
                                    <p className="whitespace-pre-wrap">
                                      {item.goalsForNextWeek || "-"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!report && selectedIntern && !loadingReport && (
        <Card>
          <CardContent className="p-6 text-sm text-gray-500">
            Click <span className="font-semibold text-gray-700">Generate</span>{" "}
            to build report for {selectedIntern.name}.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CompanyStudentReports;
