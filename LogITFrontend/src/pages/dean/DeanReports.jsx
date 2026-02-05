import React, { useState, useEffect } from "react";

import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  FileSpreadsheet,
  Timer,
  Building2,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function DeanReviewDashboard() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState(true);
  const [timesheets, setTimesheets] = useState([]);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [timesheetNotes, setTimesheetNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const { api } = useAuth();

  useEffect(() => {
    fetchReviewQueues();
  }, [api]);

  const fetchReviewQueues = async () => {
    try {
      setLoading(true);
      const [logsRes, timesheetsRes] = await Promise.all([
        api.get("/dean/logs/pending"),
        api.get("/dean/timesheets/pending"),
      ]);
      setLogs(logsRes.data);
      setTimesheets(timesheetsRes.data);
    } catch (error) {
      toast.error("Failed to fetch pending reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedTimesheet) {
      setTimesheetNotes("");
      return;
    }
    setTimesheetNotes(selectedTimesheet.deanNotes || "");
  }, [selectedTimesheet]);

  const handleAction = async (status) => {
    try {
      await api.put(`/dean/logs/${selectedLog._id}/review`, {
        status,
        feedback,
      });

      toast.success(
        `Log ${status === "approved" ? "approved" : "declined"} successfully`,
      );

      // Remove reviewed log from list and close modal
      setLogs(logs.filter((l) => l._id !== selectedLog._id));
      setSelectedLog(null);
      setFeedback("");
    } catch (err) {
      toast.error("Error updating log status");
    }
  };

  const handleTimesheetAction = async (status) => {
    if (!selectedTimesheet) return;

    try {
      await api.put(`/dean/timesheets/${selectedTimesheet._id}/review`, {
        status,
        deanNotes: timesheetNotes,
      });

      toast.success(
        `Timesheet ${status === "dean_approved" ? "approved" : "declined"} successfully`,
      );

      setTimesheets((prev) =>
        prev.filter((entry) => entry._id !== selectedTimesheet._id),
      );
      setSelectedTimesheet(null);
      setTimesheetNotes("");
    } catch (err) {
      toast.error("Error updating timesheet status");
    }
  };

  const logbookQuestions = [
    { label: "Duties and Responsibilities", key: "dutiesAndResponsibilities" },
    { label: "New Things Learned", key: "newThingsLearned" },
    { label: "Problems Encountered", key: "problemsEncountered" },
    { label: "Solutions Implemented", key: "solutionsImplemented" },
    {
      label: "Accomplishments and Deliverables",
      key: "accomplishmentsAndDeliverables",
    },
    { label: "Goals for Next Week", key: "goalsForNextWeek" },
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen size={32} />
          <div>
            <h1 className="text-3xl font-bold">Dean Review Center</h1>
            <p className="text-purple-100">
              Monitor weekly logbooks and daily timesheets awaiting final
              approval
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 backdrop-blur">
            <div className="bg-white/20 rounded-full p-2">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-purple-100">
                Logbooks Pending
              </p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 backdrop-blur">
            <div className="bg-white/20 rounded-full p-2">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-purple-100">
                Timesheets Pending
              </p>
              <p className="text-2xl font-bold">{timesheets.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Review List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-10 text-center text-gray-400 animate-pulse">
              Loading pending logbooks...
            </CardContent>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="p-10 text-center">
              <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-500">
                No pending logbook submissions at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card
              key={log._id}
              className="hover:shadow-lg transition-shadow border-none"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
                  {/* Student Avatar/Initials */}
                  <div className="h-14 w-14 bg-linear-to-br from-purple-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                    {log.created_by?.name?.[0] || "?"}
                  </div>

                  {/* Log Summary */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">
                        {log.created_by?.name || "Unknown Student"}
                      </h3>
                      <span className="text-xs text-gray-400">
                        • {log.created_by?.student_admission_number || "N/A"}
                      </span>
                      {log.weekNumber && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full w-fit">
                          Week {log.weekNumber}
                        </span>
                      )}
                    </div>

                    {log.weekStartDate && log.weekEndDate && (
                      <p className="text-sm text-gray-600 mb-2">
                        Period: {formatDate(log.weekStartDate)} -{" "}
                        {formatDate(log.weekEndDate)}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> Submitted{" "}
                        {formatDate(log.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} /> Pending Review
                      </span>
                      {log.attachments && log.attachments.length > 0 && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <FileText size={14} /> {log.attachments.length}{" "}
                          attachment(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  <Button
                    onClick={() => setSelectedLog(log)}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                  >
                    <Eye size={18} /> Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Timesheet Review Queue */}
      <section className="space-y-4 mt-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="text-indigo-600" size={22} /> Daily Timesheet
              Approvals
            </h2>
            <p className="text-sm text-gray-500">
              Review company-approved entries forwarded for dean validation.
            </p>
          </div>
          <div className="text-sm text-gray-600 bg-gray-100 rounded-full px-4 py-1 font-semibold w-fit">
            {timesheets.length} pending entries
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <Card className="border-none shadow-md">
              <CardContent className="p-8 text-center text-gray-400 animate-pulse">
                Loading pending timesheets...
              </CardContent>
            </Card>
          ) : timesheets.length === 0 ? (
            <Card className="border-none shadow-md">
              <CardContent className="p-10 text-center">
                <CheckCircle
                  className="mx-auto mb-4 text-green-500"
                  size={64}
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Timesheets in Queue
                </h3>
                <p className="text-gray-500">
                  All company-approved logs have been finalized.
                </p>
              </CardContent>
            </Card>
          ) : (
            timesheets.map((sheet) => (
              <Card
                key={sheet._id}
                className="border border-gray-100 shadow-sm hover:shadow-lg transition"
              >
                <CardContent className="p-6 flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="h-14 w-14 bg-linear-to-br from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                    {sheet.student?.name?.[0] || "?"}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-900">
                        {sheet.student?.name || "Unknown Student"}
                      </h3>
                      <span className="text-xs text-gray-400">
                        • {sheet.student?.student_admission_number || "N/A"}
                      </span>
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                        {sheet.company?.name || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} /> {formatDate(sheet.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer size={14} /> {sheet.timeIn} – {sheet.timeOut}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />{" "}
                        {Number(sheet.totalHours ?? 0).toFixed(2)}h rendered
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} /> {sheet.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedTimesheet(sheet)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                  >
                    <Eye size={18} /> Review Entry
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* REVIEW MODAL - Updated for New Format */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-purple-600 to-indigo-600 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {selectedLog.created_by?.name || "Student"}'s Weekly Logbook
                </h2>
                <p className="text-purple-100 text-sm">
                  {selectedLog.weekNumber &&
                    `Week ${selectedLog.weekNumber} • `}
                  {selectedLog.weekStartDate &&
                    selectedLog.weekEndDate &&
                    `${formatDate(selectedLog.weekStartDate)} - ${formatDate(selectedLog.weekEndDate)}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedLog(null);
                  setFeedback("");
                }}
                className="text-white hover:text-red-200 transition"
              >
                <XCircle size={28} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
              {/* Left Side: Logbook Responses */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Toggle Button for Questions */}
                <button
                  onClick={() => setExpandedQuestions(!expandedQuestions)}
                  className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                >
                  <span className="font-bold text-purple-900">
                    Weekly Logbook Responses
                  </span>
                  {expandedQuestions ? (
                    <ChevronUp className="text-purple-600" />
                  ) : (
                    <ChevronDown className="text-purple-600" />
                  )}
                </button>

                {/* Questions and Answers */}
                {expandedQuestions && (
                  <div className="space-y-5">
                    {logbookQuestions.map((question, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-purple-400 pl-4 bg-white p-4 rounded-lg shadow-sm"
                      >
                        <h4 className="text-sm font-bold text-purple-800 mb-3">
                          {index + 1}. {question.label}
                        </h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {selectedLog[question.key] || (
                            <span className="text-gray-400 italic">
                              No response provided
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Attachments Section */}
                {selectedLog.attachments &&
                  selectedLog.attachments.length > 0 && (
                    <div className="border-t pt-6">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="text-purple-600" size={20} />
                        Attachments ({selectedLog.attachments.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedLog.attachments.map((file, i) => (
                          <a
                            key={i}
                            href={`http://localhost:5000${file.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center p-3 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors group"
                          >
                            <div className="truncate flex-1">
                              <p className="text-sm font-medium truncate">
                                {file.originalName}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">
                                {file.fileType?.split("/")[1] || "file"}
                              </p>
                            </div>
                            <ExternalLink
                              size={16}
                              className="text-gray-300 group-hover:text-purple-600 ml-2"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Right Side: Decision Panel */}
              <div className="w-full lg:w-96 bg-gray-50 p-6 flex flex-col border-t lg:border-t-0 lg:border-l">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Review Decision
                </h3>

                <label className="text-sm font-medium text-gray-700 mb-2">
                  Feedback to Student (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none"
                  placeholder="Provide constructive feedback..."
                />

                <div className="space-y-3 mt-auto">
                  <Button
                    onClick={() => handleAction("approved")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 flex items-center justify-center gap-2 font-semibold"
                  >
                    <CheckCircle size={20} /> Approve Logbook
                  </Button>
                  <Button
                    onClick={() => handleAction("declined")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 flex items-center justify-center gap-2 font-semibold"
                  >
                    <XCircle size={20} /> Decline Logbook
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedLog(null);
                      setFeedback("");
                    }}
                    variant="outline"
                    className="w-full py-4 font-semibold"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TIMESHEET REVIEW MODAL */}
      {selectedTimesheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-linear-to-r from-indigo-600 to-blue-600 text-white p-6 flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-blue-100 mb-1">
                  Daily Timesheet Review
                </p>
                <h2 className="text-2xl font-bold">
                  {selectedTimesheet.student?.name || "Student"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {formatDate(selectedTimesheet.date)} •{" "}
                  {selectedTimesheet.company?.name || "Unassigned Company"}
                </p>
              </div>
              <button
                onClick={() => setSelectedTimesheet(null)}
                className="text-white hover:text-red-200 transition"
              >
                <XCircle size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Rendered Date",
                      value: selectedTimesheet.date
                        ? formatDate(selectedTimesheet.date)
                        : "N/A",
                      icon: CalendarDays,
                    },
                    {
                      label: "Company",
                      value: selectedTimesheet.company?.name || "Unassigned",
                      icon: Building2,
                    },
                    {
                      label: "Total Hours",
                      value: `${Number(selectedTimesheet.totalHours ?? 0).toFixed(2)}h`,
                      icon: Clock,
                    },
                    {
                      label: "Current Status",
                      value:
                        selectedTimesheet.status?.replace(/_/g, " ") || "N/A",
                      icon: CheckCircle,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="border border-gray-100 rounded-xl p-4 bg-gray-50"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <item.icon size={14} className="text-indigo-500" />
                        {item.label}
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Captured Time
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Time In</p>
                      <p className="font-semibold text-gray-900">
                        {selectedTimesheet.timeIn}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Time Out</p>
                      <p className="font-semibold text-gray-900">
                        {selectedTimesheet.timeOut}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Break</p>
                      <p className="font-semibold text-gray-900">
                        {selectedTimesheet.breakMinutes || 0} minutes
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Company Notes</p>
                      <p className="font-semibold text-gray-900">
                        {selectedTimesheet.companyNotes?.trim()
                          ? selectedTimesheet.companyNotes
                          : "No notes provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 flex flex-col border-t lg:border-t-0 lg:border-l">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Dean Decision
                </h3>

                <label className="text-sm font-medium text-gray-700 mb-2">
                  Feedback to Student (Optional)
                </label>
                <textarea
                  value={timesheetNotes}
                  onChange={(e) => setTimesheetNotes(e.target.value)}
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  placeholder="Share context for your decision..."
                />

                <div className="space-y-3 mt-auto">
                  <Button
                    onClick={() => handleTimesheetAction("dean_approved")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 flex items-center justify-center gap-2 font-semibold"
                  >
                    <CheckCircle size={20} /> Approve Entry
                  </Button>
                  <Button
                    onClick={() => handleTimesheetAction("dean_declined")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-4 flex items-center justify-center gap-2 font-semibold"
                  >
                    <XCircle size={20} /> Decline Entry
                  </Button>
                  <Button
                    onClick={() => setSelectedTimesheet(null)}
                    variant="outline"
                    className="w-full py-4 font-semibold"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeanReviewDashboard;
