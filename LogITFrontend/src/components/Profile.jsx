import { UserCircleIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Calendar,
  Clock,
  Image as ImageIcon,
  Building2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "./ui/Button";

const evaluationRatingSections = [
  {
    title: "I. Task Performance",
    fields: [
      { key: "qualityOfWork", label: "Quality of Work" },
      { key: "quantityOfWork", label: "Quantity of Work" },
      { key: "jobKnowledge", label: "Job Knowledge" },
      { key: "dependability", label: "Dependability" },
    ],
  },
  {
    title: "II. Attendance and Punctuality",
    fields: [
      { key: "attendance", label: "Attendance" },
      { key: "punctuality", label: "Punctuality" },
    ],
  },
  {
    title: "III. Work Attitude/Habits",
    fields: [
      { key: "trustworthinessReliability", label: "Trustworthiness and Reliability" },
      { key: "initiativeCooperation", label: "Initiative and Cooperation" },
      { key: "willingnessToLearn", label: "Willingness to Learn" },
    ],
  },
  {
    title: "IV. Personality and Appearance",
    fields: [
      { key: "grooming", label: "Grooming" },
      { key: "interpersonalSkills", label: "Interpersonal Skills" },
      { key: "courtesy", label: "Courtesy" },
    ],
  },
];

const evaluationRemarkOptions = [
  {
    value: "absorb_student",
    label: "The company will absorb the student-trainee",
  },
  {
    value: "consider_future_hiring",
    label: "The company will consider the student-trainee for future hiring",
  },
  {
    value: "highly_recommended",
    label: "Highly recommended for placement",
  },
  {
    value: "moderately_recommended",
    label: "Moderately recommended for placement",
  },
  {
    value: "not_recommended",
    label: "Not recommended for placement",
  },
  {
    value: "needs_orientation",
    label: "Needs proper orientation and acquire more skills",
  },
];

const evaluationRemarkLabels = evaluationRemarkOptions.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const legacyRecommendationMap = {
  recommend: "highly_recommended",
  recommend_with_reservation: "moderately_recommended",
  do_not_recommend: "not_recommended",
};

const isImageDocument = (doc) => {
  const fileType = String(doc?.fileType || "");
  if (fileType.startsWith("image/")) return true;
  const name = String(doc?.originalName || doc?.fileUrl || "");
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
};

const isCertificationDocument = (doc) =>
  doc?.category === "certification" || doc?.uploadedBy === "company";

const normalizeEvaluationRemarks = (evaluation) => {
  if (!evaluation) return [];
  if (Array.isArray(evaluation.remarks) && evaluation.remarks.length) {
    return evaluation.remarks;
  }
  const mapped = legacyRecommendationMap[evaluation.recommendation];
  return mapped ? [mapped] : [];
};

export default function StudentProfile({
  selfView = false,
  profilePreview = null,
}) {
  const { id } = useParams();
  const { api, user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("logs");
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const endpoint = selfView ? "/student/profile" : `/dean/student/${id}`;
        const response = await api.get(endpoint);
        setStudent(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching student:", err);
        const errorMsg =
          err.response?.data?.message || "Failed to fetch student details";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if ((selfView || id) && api) {
      fetchStudentData();
    }
  }, [id, api, selfView, user]);

  const markAsCompleted = async () => {
    if (selfView) return;

    try {
      await api.put(`/dean/students/${id}/complete`);
      toast.success("Student marked as completed");

      const response = await api.get(`/dean/student/${id}`);
      setStudent(response.data);
    } catch (err) {
      console.error("Error marking student as completed:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to mark student as completed";
      toast.error(errorMsg);
    }
  };

  const handleDocumentUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("documents", file));

    try {
      setUploadingDocuments(true);
      const response = await api.post("/student/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedDocuments = response.data?.documents || [];
      setStudent((prev) =>
        prev ? { ...prev, documents: updatedDocuments } : prev,
      );
      toast.success("Documents uploaded successfully");
    } catch (err) {
      console.error("Error uploading documents:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to upload documents";
      toast.error(errorMsg);
    } finally {
      setUploadingDocuments(false);
      event.target.value = "";
    }
  };

  //Generating student report

  const getStudentId = () => {
    return id || user?.id;
  };

  const fetchReport = async () => {
    const studentId = getStudentId();
    if (!studentId) {
      toast.error("Student ID not found");
      return;
    }

    try {
      setLoadingReport(true);
      const response = await api.get(`/dean/reports/student/${studentId}`);
      setReport(response.data?.report || null);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error.response?.data?.message || "Failed to generate report");
    } finally {
      setLoadingReport(false);
    }
  };

  const downloadCsv = async () => {
    const studentId = getStudentId();
    if (!studentId) {
      toast.error("Student ID not found");
      return;
    }

    try {
      setDownloading(true);
      const response = await api.get(`/dean/reports/student/${studentId}`, {
        params: { format: "csv" },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `student-report-${studentId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error(error.response?.data?.message || "Failed to download CSV");
    } finally {
      setDownloading(false);
    }
  };

  const downloadPdf = async () => {
    const studentId = getStudentId();
    if (!studentId) {
      toast.error("Student ID not found");
      return;
    }

    try {
      setDownloading(true);
      const response = await api.get(`/dean/reports/student/${studentId}`, {
        params: { format: "pdf" },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `student-report-${studentId}.pdf`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <p className="text-red-600 font-semibold">
            {error || "Student not found"}
          </p>
        </div>
      </div>
    );
  }

  const studentName = student?.name || "N/A";
  const studentCourse = student?.student_course || "N/A";
  const studentEmail = student?.email || "N/A";
  const admissionNumber = student?.student_admission_number || "N/A";
  const batchName = student?.student_batch?.session_name || "N/A";
  const batchYear = student?.student_batch?.year || "";
  const companyName = student?.assigned_company?.name || "Not assigned";
  const companyAddress =
    student?.assigned_company?.company_address ||
    student?.assigned_company?.address ||
    "N/A";

  // Calculate statistics
  const ojtHoursRequired = Number(student?.ojt_hours_required || 500);
  const ojtHoursCompleted = Number(student?.ojt_hours_completed || 0);
  const ojtHoursRemaining = Number(
    student?.ojt_hours_remaining ??
      Math.max(0, ojtHoursRequired - ojtHoursCompleted),
  );
  const progressPercentage = ojtHoursRequired
    ? Math.min((ojtHoursCompleted / ojtHoursRequired) * 100, 100)
    : 0;

  const totalLogs = student?.logs?.length || 0;
  const approvedLogs =
    student?.logs?.filter((log) => log.status === "approved").length || 0;
  const pendingLogs =
    student?.logs?.filter((log) => log.status === "pending").length || 0;

  const totalTimesheets = student?.timesheets?.length || 0;
  const totalApprovedHours = ojtHoursCompleted;
  const evaluation = student?.evaluation || null;
  const evaluationRemarks = normalizeEvaluationRemarks(evaluation);
  const documents = student?.documents || [];
  const isCompleted = Boolean(
    student?.completed_program || student?.status === "completed",
  );
  const showCompletionOnlySections = !selfView || isCompleted;
  const visibleDocuments =
    selfView && !isCompleted
      ? documents.filter((doc) => !isCertificationDocument(doc))
      : documents;
  const baseFileUrl = api?.defaults?.baseURL?.replace(/\/api\/?$/, "") || "";
  const resolveFileUrl = (value) =>
    value ? (value.startsWith("http") ? value : `${baseFileUrl}${value}`) : "#";

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      {/* Profile Header */}
      <div className="bg-purple-800 px-8 py-8 shadow-lg rounded-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon size={48} className="text-white/80" />
              )}
            </div>

            <div className="text-white">
              <h1 className="text-3xl font-bold mb-1">{studentName}</h1>
              <p className="text-purple-100 text-lg flex items-center gap-2">
                {studentCourse} • {admissionNumber}
              </p>
              <p className="text-purple-200 text-sm mt-1">
                {batchName} {batchYear && `(${batchYear})`}
              </p>
            </div>
          </div>

          {!selfView && (
            <button
              onClick={fetchReport}
              disabled={loadingReport}
              className="bg-white hover:bg-gray-100 text-purple-600 px-6 py-3 rounded-lg text-sm font-semibold shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingReport ? "Generating..." : "GENERATE REPORT"}
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-8 mt-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="text-purple-600" size={24} />}
            label="OJT Progress"
            value={`${progressPercentage.toFixed(1)}%`}
            subtitle={`${ojtHoursCompleted.toFixed(1)}h approved • ${ojtHoursRemaining.toFixed(1)}h remaining`}
            color="purple"
          />
          <StatCard
            icon={<FileText className="text-blue-600" size={24} />}
            label="Weekly Logs"
            value={totalLogs}
            subtitle={`${approvedLogs} approved, ${pendingLogs} pending`}
            color="blue"
          />
          <StatCard
            icon={<Calendar className="text-green-600" size={24} />}
            label="Timesheets"
            value={totalTimesheets}
            subtitle={`${totalApprovedHours.toFixed(1)} approved hours`}
            color="green"
          />
          <StatCard
            icon={<Building2 className="text-indigo-600" size={24} />}
            label="Company"
            value={companyName !== "Not assigned" ? "Assigned" : "Unassigned"}
            subtitle={companyName}
            color="indigo"
          />
        </div>
      </div>

      {/* Info Cards */}
      <div className="px-8 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Student Information */}
        <InfoCard
          title="Student Information"
          icon={<UserCircleIcon size={20} className="text-purple-600" />}
        >
          <InfoItem label="Full Name" value={studentName} />
          <InfoItem label="Admission No." value={admissionNumber} />
          <InfoItem label="Course" value={studentCourse} />
          <InfoItem
            label="Batch"
            value={`${batchName}${batchYear ? ` (${batchYear})` : ""}`}
          />
          <InfoItem label="Email" value={studentEmail} />
        </InfoCard>

        {/* OJT Information */}
        <InfoCard
          title="OJT Information"
          icon={<Building2 size={20} className="text-indigo-600" />}
        >
          <InfoItem
            label="Company Name"
            value={companyName}
            highlight={companyName !== "Not assigned"}
          />
          <InfoItem label="Company Address" value={companyAddress} />

          {/* Progress Bar */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                OJT Progress
              </span>
              <span className="text-sm font-bold text-purple-600">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progressPercentage >= 100
                    ? "bg-green-500"
                    : progressPercentage >= 75
                      ? "bg-blue-500"
                      : progressPercentage >= 50
                        ? "bg-yellow-500"
                        : "bg-orange-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">Completed</span>
              <span className="text-sm font-semibold text-gray-700">
                {ojtHoursCompleted} / {ojtHoursRequired} hours
              </span>
            </div>
          </div>
        </InfoCard>
      </div>

      <div className="px-8 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Required Documents
              </h2>
              <p className="text-sm text-gray-500">
                Upload your internship requirements and attachments.
              </p>
            </div>
            {selfView && (
              <label className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2">
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleDocumentUpload}
                  disabled={uploadingDocuments}
                />
                {uploadingDocuments ? "Uploading..." : "Upload Documents"}
              </label>
            )}
          </div>

          {visibleDocuments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              No documents uploaded yet.
            </div>
          ) : (
            <>
              {selfView ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleDocuments.map((doc, index) => {
                    const isImage = isImageDocument(doc);
                    const fileUrl = resolveFileUrl(doc.fileUrl);
                    return (
                      <div
                        key={`${doc.fileUrl}-${index}`}
                        className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden"
                      >
                        <div className="h-36 bg-gray-100 flex items-center justify-center">
                          {isImage ? (
                            <img
                              src={fileUrl}
                              alt={doc.originalName || "Document preview"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                              <FileText size={28} />
                              <span className="text-xs">No preview</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {doc.originalName || "Document"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.uploadedAt
                              ? new Date(doc.uploadedAt).toLocaleDateString()
                              : "Upload date unavailable"}
                          </p>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex mt-3 text-sm font-semibold text-purple-600 hover:text-purple-800"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleDocuments.map((doc, index) => (
                    <div
                      key={`${doc.fileUrl}-${index}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {doc.originalName || "Document"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.uploadedAt
                              ? new Date(doc.uploadedAt).toLocaleDateString()
                              : "Upload date unavailable"}
                          </p>
                        </div>
                      </div>
                      <a
                        href={resolveFileUrl(doc.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-purple-600 hover:text-purple-800"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCompletionOnlySections && (
        <div className="px-8 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Company Evaluation
              </h2>
              {evaluation ? (
                <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                  Submitted
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold">
                  Not submitted
                </span>
              )}
            </div>

            {!evaluation ? (
              <p className="text-sm text-gray-500">
                No company evaluation has been submitted yet.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <EvaluationItem
                    label="Overall Score"
                    value={`${Number(evaluation.overallScore || 0).toFixed(2)} / 5`}
                  />
                </div>

                {evaluationRatingSections.map((section) => (
                  <div key={section.title} className="mb-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                      {section.title}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {section.fields.map((field) => (
                        <EvaluationItem
                          key={field.key}
                          label={field.label}
                          value={`${Number(evaluation.ratings?.[field.key] || 0).toFixed(1)} / 5`}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <TextBlock
                    label="Strong Personality & Work Performance"
                    value={evaluation.strengths}
                  />
                  <TextBlock
                    label="Areas Needing Improvement"
                    value={evaluation.areasForImprovement}
                  />
                  {evaluation.additionalComments?.trim() && (
                    <TextBlock
                      label="Additional Comments"
                      value={evaluation.additionalComments}
                    />
                  )}
                  <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                      Remarks
                    </p>
                    {evaluationRemarks.length ? (
                      <ul className="text-sm text-gray-800 mt-1 space-y-1">
                        {evaluationRemarks.map((remark) => (
                          <li key={remark}>
                            {evaluationRemarkLabels[remark] ||
                              remark.replaceAll("_", " ")}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-800 mt-1">-</p>
                    )}
                    <p className="text-xs text-gray-500 mt-3">
                      By {evaluation.company?.name || "Company"} on{" "}
                      {evaluation.submittedAt
                        ? new Date(evaluation.submittedAt).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* GENERATED REPORT SECTION */}
      {report && (
        <div className="px-8 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Generated Report
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Generated: {new Date(report.generatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadCsv}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? "Downloading..." : "Download CSV"}
                </button>
                <button
                  onClick={downloadPdf}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? "Downloading..." : "Download PDF"}
                </button>
              </div>
            </div>

            {/* Report Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
                  Approved Hours
                </p>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {report.summary?.approvedHours || report.approvedHours || 0}h
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold">
                  Progress
                </p>
                <p className="text-2xl font-bold text-purple-900 mt-2">
                  {report.summary?.progressPercent ||
                    report.progressPercent ||
                    0}
                  %
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-green-600 font-semibold">
                  Status
                </p>
                <p className="text-lg font-bold text-green-900 mt-2">
                  {report.summary?.isOjtComplete ? "Completed" : "Ongoing"}
                </p>
              </div>
            </div>

            {/* Report Details Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-200">
                  {report.logs && report.logs.length > 0 && (
                    <>
                      <tr className="bg-gray-50">
                        <td
                          colSpan="2"
                          className="px-4 py-3 font-bold text-gray-800"
                        >
                          Weekly Logs Summary
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-gray-600 font-medium">
                          Total Logs
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-semibold">
                          {report.logs.length}
                        </td>
                      </tr>
                    </>
                  )}
                  {report.metrics && (
                    <>
                      <tr className="bg-gray-50">
                        <td
                          colSpan="2"
                          className="px-4 py-3 font-bold text-gray-800"
                        >
                          Metrics
                        </td>
                      </tr>
                      {report.metrics.logs && (
                        <tr>
                          <td className="px-4 py-3 text-gray-600 font-medium">
                            Logs Submitted
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-semibold">
                            {report.metrics.logs.total || 0}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                  {report.summary && (
                    <>
                      <tr className="bg-gray-50">
                        <td
                          colSpan="2"
                          className="px-4 py-3 font-bold text-gray-800"
                        >
                          OJT Summary
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-gray-600 font-medium">
                          Required Hours
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-semibold">
                          {report.summary.requiredHours || 500}h
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-gray-600 font-medium">
                          Approved Hours
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-semibold">
                          {report.summary.approvedHours || 0}h
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-gray-600 font-medium">
                          Remaining Hours
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-semibold">
                          {Math.max(
                            0,
                            (report.summary.requiredHours || 500) -
                              (report.summary.approvedHours || 0),
                          )}
                          h
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-gray-600 font-medium">
                          Progress Percentage
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-semibold">
                          {report.summary.progressPercent || 0}%
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT SECTION */}
      <div className="px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 px-6 bg-linear-to-r from-gray-50 to-white">
            <TabButton
              active={activeTab === "logs"}
              onClick={() => setActiveTab("logs")}
              icon={<FileText size={18} />}
              label="Weekly Logbooks"
              count={totalLogs}
            />
            <TabButton
              active={activeTab === "timesheet"}
              onClick={() => setActiveTab("timesheet")}
              icon={<Calendar size={18} />}
              label="Daily Timesheets"
              count={totalTimesheets}
            />
          </div>
          <div className="p-6">
            {activeTab === "logs" ? (
              <StudentLogTable logs={student.logs || []} />
            ) : (
              <StudentTimeTable timesheets={student.timesheets || []} />
            )}
            {!selfView && (
              <div className="text-right">
                <Button
                  className="justify-center m-2 "
                  onClick={markAsCompleted}
                >
                  Mark as Completed
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* Sub-Components for the Report Section */

  function StatCard({ icon, label, value, subtitle, color }) {
    const colorClasses = {
      purple: "from-purple-50 to-purple-100 border-purple-200",
      blue: "from-blue-50 to-blue-100 border-blue-200",
      green: "from-green-50 to-green-100 border-green-200",
      indigo: "from-indigo-50 to-indigo-100 border-indigo-200",
    };

    return (
      <div
        className={`bg-linear-to-br ${colorClasses[color]} rounded-xl p-5 border shadow-sm`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="bg-white rounded-lg p-2 shadow-sm">{icon}</div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>
    );
  }

  function TabButton({ active, onClick, icon, label, count }) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${
          active
            ? "border-purple-600 text-purple-600 bg-white"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }`}
      >
        {icon} {label}
        {count !== undefined && (
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              active
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  }

  function StudentLogTable({ logs }) {
    if (logs.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="text-gray-500 font-medium">No logbook entries yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Weekly logs will appear here once submitted
          </p>
        </div>
      );
    }

    const formatLogTitle = (log) => {
      if (log.weekNumber) return `Week ${log.weekNumber}`;
      if (log.weekStartDate)
        return `Week of ${new Date(log.weekStartDate).toLocaleDateString()}`;
      if (log.weekEndDate)
        return `Through ${new Date(log.weekEndDate).toLocaleDateString()}`;
      return "Weekly Log Entry";
    };

    const formatLogDescription = (log) =>
      log.accomplishmentsAndDeliverables ||
      log.dutiesAndResponsibilities ||
      log.goalsForNextWeek ||
      log.newThingsLearned ||
      log.problemsEncountered ||
      log.solutionsImplemented ||
      "No summary provided";

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-gray-600 bg-gray-50 border-y border-gray-200">
              <th className="px-4 py-3">Date Submitted</th>
              <th className="px-4 py-3">Week</th>
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3 text-center">Files</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr
                key={log._id}
                className="text-sm hover:bg-purple-50/30 transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                  {new Date(log.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 font-semibold text-gray-800">
                  {formatLogTitle(log)}
                </td>
                <td className="px-4 py-4 text-gray-600 max-w-xs truncate">
                  {formatLogDescription(log)}
                </td>
                <td className="px-4 py-4 text-center">
                  {log.attachments?.length > 0 ? (
                    <span className="inline-flex items-center gap-1 text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded-md">
                      <ImageIcon size={14} /> {log.attachments.length}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-4 py-4 text-center">
                  <StatusPill status={log.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function StudentTimeTable({ timesheets }) {
    if (timesheets.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="text-gray-500 font-medium">No timesheet entries yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Daily timesheets will appear here once submitted
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-gray-600 bg-gray-50 border-y border-gray-200">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time In</th>
              <th className="px-4 py-3">Time Out</th>
              <th className="px-4 py-3 text-center">Break</th>
              <th className="px-4 py-3 text-center">
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} />
                  Total Hours
                </span>
              </th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {timesheets.map((ts) => (
              <tr
                key={ts._id}
                className="hover:bg-green-50/30 transition-colors"
              >
                <td className="px-4 py-4 text-gray-600">
                  {new Date(ts.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-4 font-mono text-gray-700 font-medium">
                  {ts.timeIn}
                </td>
                <td className="px-4 py-4 font-mono text-gray-700 font-medium">
                  {ts.timeOut}
                </td>
                <td className="px-4 py-4 text-gray-500 text-center">
                  {ts.breakMinutes}m
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full font-bold text-green-700">
                    {ts.totalHours}h
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <StatusPill status={ts.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function StatusPill({ status }) {
    const configs = {
      company_approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: <CheckCircle2 size={12} />,
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: <CheckCircle2 size={12} />,
      },
      pending: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <AlertCircle size={12} />,
      },
      submitted_to_company: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: <AlertCircle size={12} />,
      },
      edited_by_company: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-200",
        icon: <AlertCircle size={12} />,
      },
      company_declined: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: <XCircle size={12} />,
      },
      absent: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: <XCircle size={12} />,
      },
      // Backward-compatible aliases
      dean_declined: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: <XCircle size={12} />,
      },
      declined: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: <XCircle size={12} />,
      },
    };

    const config = configs[status] || configs.pending;
    const displayStatus = status?.replace(/_/g, " ") || "pending";

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.icon}
        {displayStatus}
      </span>
    );
  }

  function EvaluationItem({ label, value }) {
    return (
      <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
          {label}
        </p>
        <p className="text-sm font-bold text-gray-800 mt-1">{value}</p>
      </div>
    );
  }

  function TextBlock({ label, value }) {
    return (
      <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
        <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
          {label}
        </p>
        <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
          {value?.trim() ? value : "-"}
        </p>
      </div>
    );
  }

  /* Reusable Components */
  function InfoCard({ title, icon, children }) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          {icon}
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
        <div className="space-y-3 text-sm">{children}</div>
      </div>
    );
  }

  function InfoItem({ label, value, highlight }) {
    return (
      <div className="flex justify-between items-start py-1">
        <span className="font-medium text-gray-600">{label}:</span>
        <span
          className={`text-right max-w-[60%] ${highlight ? "text-purple-600 font-semibold" : "text-gray-800 font-medium"}`}
        >
          {value}
        </span>
      </div>
    );
  }
}
