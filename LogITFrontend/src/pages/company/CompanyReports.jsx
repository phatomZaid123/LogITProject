import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  CheckCircle,
  Clock,
  User,
  ArrowRight,
  AlertCircle,
  CalendarCheck,
  CheckCheck,
  History,
  Info,
  Filter,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CompanyTimesheetGrid from "../../components/TimeSheet";
import toast from "react-hot-toast";

const COMPANY_STATE_META = {
  idle: {
    label: "No Submissions",
    badge: "bg-gray-100 text-gray-600 border border-gray-200",
    description: "Student has not sent any logs to the company yet.",
  },
  awaiting_review: {
    label: "Awaiting Review",
    badge: "bg-amber-50 text-amber-600 border border-amber-100",
    description: "Logs are waiting for company action.",
  },
  needs_student: {
    label: "Sent Back",
    badge: "bg-red-50 text-red-600 border border-red-100",
    description: "Company declined at least one day. Student must revise before resubmitting.",
  },
  ready_for_dean: {
    label: "Approved",
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    description: "All entries are approved and ready for dean submission.",
  },
};

const COMPANY_PIPELINE = [
  { key: "idle", label: "No Submission" },
  { key: "awaiting_review", label: "Company Review" },
  { key: "needs_student", label: "Sent Back" },
  { key: "ready_for_dean", label: "Ready for Dean" },
];

const deriveCompanyState = (entries = []) => {
  if (!entries.length) return "idle";
  const statuses = entries.map((entry) => entry.status);
  if (statuses.some((status) => status === "company_declined")) {
    return "needs_student";
  }
  if (statuses.some((status) => status === "submitted_to_company")) {
    return "awaiting_review";
  }
  if (statuses.length > 0 && statuses.every((status) => status === "company_approved")) {
    return "ready_for_dean";
  }
  return "idle";
};

const buildStudentSummary = (entries = []) => {
  const counts = entries.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] || 0) + 1;
    return acc;
  }, {});
  const pendingEntries = entries.filter((entry) => entry.status === "submitted_to_company");
  const hoursPending = pendingEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
  const lastSubmitted = pendingEntries.reduce((latest, entry) => {
    const date = new Date(entry.updatedAt || entry.date);
    return date > latest ? date : latest;
  }, new Date(0));
  const state = deriveCompanyState(entries);
  const meta = COMPANY_STATE_META[state] || COMPANY_STATE_META.idle;

  return {
    counts,
    hoursPending,
    pendingEntries: pendingEntries.length,
    totalEntries: entries.length,
    lastSubmitted: lastSubmitted.getTime() ? lastSubmitted : null,
    state,
    badgeClass: meta.badge,
    statusLabel: meta.label,
    description: meta.description,
  };
};

function CompanyApprovals() {
  const { api } = useAuth();
  const [pendingStudents, setPendingStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rows, setRows] = useState([]);
  const [totalPendingEntries, setTotalPendingEntries] = useState(0);
  const [statusFilter, setStatusFilter] = useState("pending");
  const studentSummary = useMemo(() => buildStudentSummary(rows), [rows]);
  const filteredRows = useMemo(() => {
    if (statusFilter === "pending") {
      return rows.filter((row) => row.status === "submitted_to_company");
    }
    if (statusFilter === "declined") {
      return rows.filter((row) => row.status === "company_declined");
    }
    return rows;
  }, [rows, statusFilter]);
  const activePipelineIndex = useMemo(
    () => COMPANY_PIPELINE.findIndex(({ key }) => key === studentSummary.state),
    [studentSummary.state],
  );
  const lastSubmittedText = useMemo(() => {
    if (!studentSummary.lastSubmitted) return "—";
    return studentSummary.lastSubmitted.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [studentSummary.lastSubmitted]);

  // 1. Fetch students who have 'submitted_to_company' timesheets
  const fetchPending = async () => {
    try {
      const res = await api.get("/company/pending-approvals");
      setPendingStudents(res.data);

      // Calculate total pending entries across all students
      const total = res.data.reduce(
        (sum, student) => sum + (student.submittedCount || 0),
        0,
      );
      setTotalPendingEntries(total);
    } catch (err) {
      console.error("Failed to fetch pending approvals:", err);
      toast.error("Failed to load pending approvals");
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // 2. Fetch specific student's timesheet when selected
  const handleViewStudent = async (student) => {
    try {
      const res = await api.get(`/company/student/${student._id}/timesheets`);
      setRows(res.data);
      setSelectedStudent(student);
      setStatusFilter("pending");
    } catch (err) {
      console.error("Failed to load timesheet:", err);
      toast.error(
        err.response?.data?.message || "Could not load timesheet details",
      );
    }
  };

  // 3. Bulk approve all entries for selected student
  const handleBulkApprove = async () => {
    if (!selectedStudent) return;

    if (
      !window.confirm(
        `Approve all submitted entries for ${selectedStudent.name}?`,
      )
    ) {
      return;
    }

    try {
      await api.put(`/company/approve-all/${selectedStudent._id}`);
      toast.success("All entries approved!");

      // Refresh the timesheet
      await handleViewStudent(selectedStudent);

      // Refresh pending list
      await fetchPending();
    } catch (err) {
      console.error("Bulk approval failed:", err);
      toast.error(err.response?.data?.message || "Bulk approval failed");
    }
  };

  return (
    <div className="space-y-8 pb-8 min-h-screen">
      {/* Header Section */}
      <div className="bg-emerald-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CalendarCheck size={32} />
              <h1 className="text-3xl font-bold">Timesheet Approvals</h1>
            </div>
            <p className="text-emerald-100 text-lg">
              Review and verify intern training hours efficiently.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center min-w-30">
              <div className="flex items-center justify-center gap-2 text-emerald-100 text-xs uppercase tracking-wider font-semibold mb-1">
                <Clock size={14} /> Pending Review
              </div>
              <p className="text-3xl font-bold text-white">
                {pendingStudents.length}
              </p>
              <p className="text-xs text-emerald-100 mt-1">Students</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center min-w-30">
              <div className="flex items-center justify-center gap-2 text-emerald-100 text-xs uppercase tracking-wider font-semibold mb-1">
                <History size={14} /> Total Entries
              </div>
              <p className="text-3xl font-bold text-white">
                {totalPendingEntries}
              </p>
              <p className="text-xs text-emerald-100 mt-1">Need Approval</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Student List */}
        <div className="lg:col-span-4 space-y-6">
          <Card
            elevated
            className="h-full border-t-4 border-t-emerald-500 overflow-hidden flex flex-col"
          >
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <Clock className="text-emerald-600" size={20} />
                Awaiting Review
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                Select a student to view their timesheet
              </p>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-150">
              {pendingStudents.length === 0 ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center h-full min-h-75">
                  <CheckCircle
                    size={48}
                    className="text-emerald-200 mb-4"
                    strokeWidth={1.5}
                  />
                  <p className="text-lg font-medium text-gray-600">
                    All caught up!
                  </p>
                  <p className="text-sm">No pending approvals at the moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pendingStudents.map((student) => (
                    <div
                      key={student._id}
                      onClick={() => handleViewStudent(student)}
                      className={`group cursor-pointer p-5 transition-all hover:bg-emerald-50 relative ${
                        selectedStudent?._id === student._id
                          ? "bg-emerald-50 border-emerald-500"
                          : "bg-white"
                      } ${selectedStudent?._id === student._id ? "border-l-4" : "border-l-4 border-transparent"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${
                              selectedStudent?._id === student._id
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-100 text-gray-600 group-hover:bg-emerald-200 group-hover:text-emerald-800 transition-colors"
                            }`}
                          >
                            {student.name?.[0]?.toUpperCase() || "S"}
                          </div>
                          <div>
                            <p
                              className={`font-bold text-base ${selectedStudent?._id === student._id ? "text-emerald-800" : "text-gray-800"}`}
                            >
                              {student.name}
                            </p>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                {student.student_admission_number || "No ID"}
                              </p>
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold py-0.5 px-2 rounded-full w-fit mt-1 ${
                                  selectedStudent?._id === student._id
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                                }`}
                              >
                                <AlertCircle size={10} />
                                {student.submittedCount} entries pending
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight
                          size={20}
                          className={`text-emerald-600 transition-all duration-300 ${
                            selectedStudent?._id === student._id
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Detailed Spreadsheet View */}
        <div className="lg:col-span-8">
          {selectedStudent ? (
            <Card
              elevated
              className="border-t-4 border-t-blue-500 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <div className="p-6 bg-white border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {selectedStudent.name}
                    <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {selectedStudent.student_course}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <Info size={14} /> Review daily hours. Approved hours will
                    be added to student's total.
                  </p>
                </div>
                <Button
                  onClick={handleBulkApprove}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:shadow-lg w-full md:w-auto"
                >
                  <CheckCheck size={18} className="mr-2" /> Approve All Pending
                </Button>
              </div>

              <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${studentSummary.badgeClass}`}
                    >
                      {studentSummary.statusLabel}
                    </span>
                    <p className="text-sm text-gray-600">
                      {studentSummary.description}
                    </p>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {studentSummary.totalEntries} total entries
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-xs font-semibold text-gray-500 flex items-center gap-1 uppercase">
                      <Clock size={12} /> Pending Entries
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {studentSummary.pendingEntries}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-xs font-semibold text-gray-500 flex items-center gap-1 uppercase">
                      <ShieldCheck size={12} /> Hours Awaiting Approval
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {studentSummary.hoursPending.toFixed(1)}h
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-xs font-semibold text-gray-500 flex items-center gap-1 uppercase">
                      <RefreshCw size={12} /> Last Submission
                    </div>
                    <p className="text-base font-semibold text-gray-900 mt-2">
                      {lastSubmittedText}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {COMPANY_PIPELINE.map((stage, index) => {
                    const isActive =
                      activePipelineIndex === -1
                        ? stage.key === "idle"
                        : index <= activePipelineIndex;
                    return (
                      <div key={stage.key} className="flex items-center">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                            isActive
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-400 border-gray-200"
                          }`}
                        >
                          {stage.label}
                        </span>
                        {index < COMPANY_PIPELINE.length - 1 && (
                          <div className="w-6 h-0.5 bg-gray-200 mx-2" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: "pending", label: "Awaiting Review", icon: Clock },
                    { key: "declined", label: "Declined", icon: AlertCircle },
                    { key: "all", label: "All Entries", icon: Filter },
                  ].map(({ key, label, icon: Icon }) => {
                    const isActive = statusFilter === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <Icon size={12} /> {label}
                      </button>
                    );
                  })}
                  <span className="text-xs text-gray-400">
                    {filteredRows.length} entries shown
                  </span>
                </div>

                {rows.length > 0 && filteredRows.length === 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                    No entries match the selected filter.
                  </p>
                )}
              </div>

              <CardContent className="p-0">
                <div className="bg-gray-50/50 p-1">
                  {/* Pass down student ID if needed by grid for individual updates */}
                  <CompanyTimesheetGrid
                    isEditable={true}
                    studentId={selectedStudent._id}
                    rows={rows}
                    displayRows={filteredRows}
                    setRows={setRows}
                    onUpdate={() => {
                      // Optional: Refresh parent data if needed after single row update
                      fetchPending();
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-125 flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 p-8 text-center animate-in fade-in duration-500">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <User size={48} className="text-gray-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Student Selected
              </h3>
              <p className="max-w-md mx-auto text-gray-500">
                Select a student from the list on the left to review their
                pending timesheet submissions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Internal Helper Component
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
          {label}
        </p>
        <p className="text-2xl font-black text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default CompanyApprovals;
