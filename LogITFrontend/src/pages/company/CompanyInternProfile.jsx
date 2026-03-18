import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import EvaluationForm from "../../components/EvaluationForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import {
  ArrowLeft,
  UserCircle2,
  Building2,
  FileText,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react";

function CompanyInternProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewingLogId, setReviewingLogId] = useState(null);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [activeTab, setActiveTab] = useState("logs");

  const getAttachmentUrl = (value = "") => {
    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }
    return `http://localhost:5000${value}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/company/student/${studentId}/profile`);
        setStudent(res.data);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load intern profile",
        );
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchProfile();
  }, [api, studentId]);

  const handleReviewLog = async (logId, status) => {
    try {
      setReviewingLogId(logId);
      const response = await api.put(`/company/logs/${logId}/review`, {
        status,
      });

      const updatedLog = response?.data?.data || response?.data;

      setStudent((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          logs: (prev.logs || []).map((log) =>
            log._id === logId ? updatedLog : log,
          ),
        };
      });

      toast.success(`Log ${status === "approved" ? "approved" : "declined"}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to review logbook");
    } finally {
      setReviewingLogId(null);
    }
  };

  const progress = useMemo(() => {
    const required = Number(student?.ojt_hours_required || 500);
    const completed = Number(student?.ojt_hours_completed || 0);
    const pct = required ? Math.min((completed / required) * 100, 100) : 0;
    return {
      required,
      completed,
      remaining: Math.max(0, required - completed),
      pct,
    };
  }, [student]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading intern profile...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 font-semibold">Intern not found</p>
            <Button
              className="mt-4"
              onClick={() => navigate("/company/dashboard/interns")}
            >
              Back to interns
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-indigo-600 rounded-xl p-6 text-white shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserCircle2 size={48} />
            <div>
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <p className="text-indigo-100 text-sm">
                {student.student_course} • Admission:{" "}
                {student.student_admission_number}
              </p>
              <p className="text-indigo-100 text-xs mt-1">
                {student.email || "No email"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            onClick={() => navigate("/company/dashboard/interns")}
          >
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat
          icon={<Building2 size={16} />}
          label="Company"
          value={student.assigned_company?.name || "N/A"}
        />
        <Stat
          icon={<Clock3 size={16} />}
          label="Required Hours"
          value={`${progress.required}h`}
        />
        <Stat
          icon={<CheckCircle2 size={16} />}
          label="Logged Hours"
          value={`${progress.completed.toFixed(1)}h`}
        />
        <Stat
          icon={<Clock3 size={16} />}
          label="Remaining"
          value={`${progress.remaining.toFixed(1)}h`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OJT Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {progress.pct.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {activeTab === "logs" ? (
              <FileText size={18} />
            ) : (
              <CalendarDays size={18} />
            )}
            {activeTab === "logs" ? "Weekly Logs" : "Timesheets"}
          </CardTitle>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1.5 rounded-md text-sm ${activeTab === "logs" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
              onClick={() => setActiveTab("logs")}
            >
              Logs ({student.logs?.length || 0})
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm ${activeTab === "timesheets" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
              onClick={() => setActiveTab("timesheets")}
            >
              Timesheets ({student.timesheets?.length || 0})
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "logs" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Submitted</th>
                    <th className="px-3 py-2 text-left">Week</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Details</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(student.logs || []).map((log) => {
                    const isExpanded = expandedLogId === log._id;

                    return (
                      <Fragment key={log._id}>
                        <tr>
                          <td className="px-3 py-2">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2">
                            {log.weekNumber
                              ? `Week ${log.weekNumber}`
                              : "Weekly Log"}
                          </td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                              {log.status || "draft"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() =>
                                setExpandedLogId((prev) =>
                                  prev === log._id ? null : log._id,
                                )
                              }
                              className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                            >
                              {isExpanded ? "Hide" : "View"}
                            </button>
                          </td>
                          <td className="px-3 py-2">
                            {log.status === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleReviewLog(log._id, "approved")
                                  }
                                  disabled={reviewingLogId === log._id}
                                  className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleReviewLog(log._id, "declined")
                                  }
                                  disabled={reviewingLogId === log._id}
                                  className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="px-3 py-3 bg-gray-50">
                              <div className="space-y-3 text-sm text-gray-700">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    Duties and responsibilities
                                  </p>
                                  <p className="whitespace-pre-wrap">
                                    {log.dutiesAndResponsibilities || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    New things learned
                                  </p>
                                  <p className="whitespace-pre-wrap">
                                    {log.newThingsLearned || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    Problems encountered
                                  </p>
                                  <p className="whitespace-pre-wrap">
                                    {log.problemsEncountered || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    Solutions implemented
                                  </p>
                                  <p className="whitespace-pre-wrap">
                                    {log.solutionsImplemented || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    Accomplishments and deliverables
                                  </p>
                                  <p className="whitespace-pre-wrap">
                                    {log.accomplishmentsAndDeliverables || "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    Goals for next week
                                  </p>
                                  <p className="whitespace-pre-wrap">
                                    {log.goalsForNextWeek || "-"}
                                  </p>
                                </div>
                                {Array.isArray(log.attachments) &&
                                  log.attachments.length > 0 && (
                                    <div>
                                      <p className="font-semibold text-gray-900 mb-1">
                                        Attachments
                                      </p>
                                      <ul className="list-disc pl-5 space-y-1">
                                        {log.attachments.map((file, idx) => (
                                          <li key={`${log._id}-file-${idx}`}>
                                            <a
                                              href={getAttachmentUrl(
                                                file.fileUrl,
                                              )}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-indigo-600 hover:underline"
                                            >
                                              {file.originalName ||
                                                `Attachment ${idx + 1}`}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                  {(student.logs || []).length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-center text-gray-500"
                      >
                        No logs yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">In</th>
                    <th className="px-3 py-2 text-left">Out</th>
                    <th className="px-3 py-2 text-left">Hours</th>
                    <th className="px-3 py-2 text-left">Daily Tasks</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(student.timesheets || []).map((t) => (
                    <tr key={t._id}>
                      <td className="px-3 py-2">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">{t.timeIn || "-"}</td>
                      <td className="px-3 py-2">{t.timeOut || "-"}</td>
                      <td className="px-3 py-2">
                        {Number(t.totalHours || 0).toFixed(1)}h
                      </td>
                      <td className="px-3 py-2 max-w-md whitespace-pre-wrap wrap-break-word">
                        {t.dailyLog?.trim() ? t.dailyLog : "-"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            t.status === "absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {t.status === "absent" ? "Absent" : t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(student.timesheets || []).length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 py-6 text-center text-gray-500"
                      >
                        No timesheets yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <EvaluationForm
        studentId={studentId}
        api={api}
        evaluation={student.evaluation || null}
        progress={progress}
        onSubmitted={(saved) =>
          setStudent((prev) => (prev ? { ...prev, evaluation: saved } : prev))
        }
      />
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
          {icon}
          {label}
        </div>
        <p className="text-lg font-bold text-gray-900 mt-2">{value}</p>
      </CardContent>
    </Card>
  );
}

export default CompanyInternProfile;
