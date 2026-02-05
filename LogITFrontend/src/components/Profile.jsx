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

export default function StudentProfile() {
  const { id } = useParams();
  const { api } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("logs");
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/dean/student/${id}`);
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

    if (id && api) {
      fetchStudentData();
    }
  }, [id, api]);

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
  const studentContactNo = student?.contact_no || "N/A";
  const admissionNumber = student?.student_admission_number || "N/A";
  const batchName = student?.student_batch?.session_name || "N/A";
  const batchYear = student?.student_batch?.year || "";
  const companyName = student?.assigned_company?.name || "Not assigned";
  const companyAddress = student?.assigned_company?.address || "N/A";

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

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      {/* Profile Header */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 px-8 py-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
              <UserCircleIcon className="h-20 w-20 text-white" />
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

          <button className="bg-white hover:bg-gray-100 text-purple-600 px-6 py-3 rounded-lg text-sm font-semibold shadow-lg transition-all hover:shadow-xl">
            GENERATE REPORT
          </button>
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
          <InfoItem label="Contact No." value={studentContactNo} />
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
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: <CheckCircle2 size={12} />,
      },
      dean_approved: {
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
      submitted_to_dean: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: <AlertCircle size={12} />,
      },
      declined: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: <XCircle size={12} />,
      },
      dean_declined: {
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
