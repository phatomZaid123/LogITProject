import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  Clock,
  Send,
  CheckCircle,
  Download,
  Calendar,
  BarChart3,
  AlertCircle,
  List,
  Plus,
} from "lucide-react";
import WeekSelector from "../../components/WeekSelector";
import WeeklyTimesheetGrid from "../../components/WeeklyTimesheetGrid";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const WEEK_STATE_META = {
  draft: {
    label: "Draft",
    badge: "bg-gray-100 text-gray-700 border border-gray-200",
    description:
      "Student can still add or edit logs before sending to company.",
  },
  company_review: {
    label: "Company Review",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    description: "Waiting for the company supervisor to review this week.",
  },
  company_returned: {
    label: "Needs Revision",
    badge: "bg-red-100 text-red-700 border border-red-200",
    description:
      "Company requested adjustments. Update the declined days and resubmit.",
  },
  ready_for_dean: {
    label: "Ready for Dean",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    description:
      "Company approved every log. Submit to the dean for final review.",
  },
  dean_review: {
    label: "Dean Review",
    badge: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    description: "Dean is reviewing the week. No edits allowed.",
  },
  locked: {
    label: "Locked",
    badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    description: "Dean approved the week. Record is permanently locked.",
  },
};

const WEEK_STEP_SEQUENCE = [
  { key: "draft", label: "Student Draft" },
  { key: "company_review", label: "Company Review" },
  { key: "ready_for_dean", label: "Ready for Dean" },
  { key: "dean_review", label: "Dean Review" },
  { key: "locked", label: "Locked" },
];

const deriveWeekState = (entries = []) => {
  if (!entries.length) return "draft";

  const statuses = entries.map((entry) => entry.status);

  if (statuses.every((status) => status === "dean_approved")) {
    return "locked";
  }

  if (
    statuses.some((status) =>
      ["dean_declined", "submitted_to_dean"].includes(status),
    )
  ) {
    return "dean_review";
  }

  if (statuses.every((status) => status === "company_approved")) {
    return "ready_for_dean";
  }

  if (statuses.some((status) => status === "company_declined")) {
    return "company_returned";
  }

  if (
    statuses.some((status) =>
      ["submitted_to_company", "edited_by_company"].includes(status),
    )
  ) {
    return "company_review";
  }

  return "draft";
};

const buildWeekSummary = (entries = []) => {
  const counts = entries.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] || 0) + 1;
    return acc;
  }, {});

  const state = deriveWeekState(entries);
  const meta = WEEK_STATE_META[state] || WEEK_STATE_META.draft;
  const hasIncompleteFields = entries.some(
    (entry) => !entry.timeIn || !entry.timeOut,
  );
  const allPending =
    entries.length > 0 && entries.every((entry) => entry.status === "pending");
  const studentCanEdit = ["draft", "company_returned"].includes(state);
  const canSubmitToCompany =
    studentCanEdit && allPending && !hasIncompleteFields;
  const canSubmitToDean = state === "ready_for_dean";

  const statusNotes = [];
  if (!entries.length) {
    statusNotes.push("Add at least one log before submitting.");
  }
  if (hasIncompleteFields) {
    statusNotes.push("Fill in both time in and time out for every log.");
  }
  if (state === "company_returned") {
    statusNotes.push(
      "Company requested changes. Update declined entries and resubmit.",
    );
  }
  if (state === "company_review") {
    statusNotes.push("Waiting for company reviewer.");
  }
  if (state === "dean_review") {
    statusNotes.push("Waiting for dean decision.");
  }
  if (state === "locked") {
    statusNotes.push("Dean approved — this week is locked.");
  }

  return {
    state,
    statusLabel: meta.label,
    badgeClass: meta.badge,
    description: meta.description,
    counts,
    studentCanEdit,
    companyCanEdit: state === "company_review",
    canSubmitToCompany,
    canSubmitToDean,
    statusNotes,
  };
};

function StudentTimesheet() {
  const { api, user } = useAuth();
  const studentId = user?._id || user?.id;
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({
    totalRendered: 0,
    totalRequired: 500,
    remainingHours: 500,
    progressPercentage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Fetch Real Data
  const fetchData = async () => {
    if (!studentId) {
      console.log("User not loaded yet, skipping fetch");
      return;
    }

    try {
      setLoading(true);
      const [entriesRes, statsRes] = await Promise.all([
        api.get(`/student/timesheets/student/${studentId}`),
        api.get(`/student/ojt-progress/${studentId}`),
      ]);
      setEntries(entriesRes.data);
      setStats((prev) => ({ ...prev, ...statsRes.data }));
    } catch (err) {
      toast.error("Failed to load timesheet data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  // Generate all weeks from oldest entry to current week
  const allWeeks = useMemo(() => {
    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current week
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() + mondayOffset);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Find oldest entry date
    let oldestDate = currentWeekStart;
    if (entries.length > 0) {
      const dates = entries.map((e) => new Date(e.date));
      oldestDate = new Date(Math.min(...dates, currentWeekStart));
      const oldestDayOfWeek = oldestDate.getDay();
      const oldestMondayOffset =
        oldestDayOfWeek === 0 ? -6 : 1 - oldestDayOfWeek;
      oldestDate.setDate(oldestDate.getDate() + oldestMondayOffset);
      oldestDate.setHours(0, 0, 0, 0);
    }

    // Generate weeks from oldest to current
    let weekStart = new Date(oldestDate);
    let weekNumber = 1;

    while (weekStart <= currentWeekStart) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Get entries for this week
      const weekEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      const totalHours = weekEntries.reduce(
        (sum, e) => sum + (e.totalHours || 0),
        0,
      );
      const summary = buildWeekSummary(weekEntries);

      weeks.push({
        number: weekNumber,
        start: new Date(weekStart),
        end: new Date(weekEnd),
        entries: weekEntries,
        totalHours,
        allApproved: summary.state === "locked",
        summary,
        weekStatus: summary.statusLabel,
      });

      weekStart.setDate(weekStart.getDate() + 7);
      weekNumber++;
    }

    return weeks.reverse(); // Most recent first
  }, [entries]);

  const currentWeek = allWeeks[currentWeekIndex] || null;
  const currentWeekSummary = useMemo(
    () => currentWeek?.summary ?? buildWeekSummary(),
    [currentWeek],
  );
  const permissions = useMemo(
    () => ({
      studentCanEdit: currentWeekSummary.studentCanEdit,
      companyCanEdit: currentWeekSummary.companyCanEdit,
      canSubmitToCompany: currentWeekSummary.canSubmitToCompany,
      canSubmitToDean: currentWeekSummary.canSubmitToDean,
    }),
    [currentWeekSummary],
  );
  const submissionMessage = useMemo(() => {
    if (permissions.studentCanEdit) {
      return "You can still add or edit logs before submitting.";
    }
    switch (currentWeekSummary.state) {
      case "company_review":
        return "Awaiting company review.";
      case "ready_for_dean":
        return "Company approved every log. Submit to the dean next.";
      case "dean_review":
        return "Awaiting dean final review.";
      case "locked":
        return "Dean approved — this week is locked.";
      case "company_returned":
        return "Company requested changes. Update the flagged days.";
      default:
        return "";
    }
  }, [currentWeekSummary.state, permissions.studentCanEdit]);
  const activeStepIndex = useMemo(
    () =>
      WEEK_STEP_SEQUENCE.findIndex(
        ({ key }) => key === currentWeekSummary.state,
      ),
    [currentWeekSummary.state],
  );

  const requiredHours = Number(stats.totalRequired || 500);
  const approvedHours = Number(stats.totalRendered || 0);
  const remainingHours = Number(
    stats.remainingHours ?? Math.max(0, requiredHours - approvedHours),
  );
  const progressPercent =
    stats.progressPercentage !== undefined
      ? Number(stats.progressPercentage)
      : requiredHours
        ? Number(((approvedHours / requiredHours) * 100).toFixed(1))
        : 0;

  // Handle entry updates
  const handleEntryUpdate = (entryId, updatedEntry) => {
    if (entryId) {
      // Update existing entry
      setEntries((prev) =>
        prev.map((e) => (e._id === entryId ? updatedEntry : e)),
      );
    } else {
      // Add new entry
      setEntries((prev) => [updatedEntry, ...prev]);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!currentWeek) return;

    const csvHeaders = [
      "Date",
      "Day",
      "Time In",
      "Time Out",
      "Break (min)",
      "Total Hours",
      "Status",
    ];
    const csvRows = currentWeek.entries
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((entry) => {
        const date = new Date(entry.date);
        return [
          date.toLocaleDateString(),
          date.toLocaleDateString("en-US", { weekday: "long" }),
          entry.timeIn,
          entry.timeOut,
          entry.breakMinutes,
          entry.totalHours || 0,
          entry.status,
        ];
      });

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheet_week${currentWeek.number}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Week ${currentWeek.number} exported successfully!`);
  };

  // Handle Bulk Submission to Company
  const handleSubmitToCompany = async () => {
    if (!currentWeek || !permissions.canSubmitToCompany) {
      toast.error("This week is not ready to submit to the company yet.");
      return;
    }

    if (
      window.confirm(
        "Submit your weekly logs to company? You won't be able to edit them after this.",
      )
    ) {
      try {
        await api.put("/student/timesheets/submit-week", {
          weekStart: currentWeek.start.toISOString(),
          weekEnd: currentWeek.end.toISOString(),
        });
        toast.success("Week submitted to company supervisor!");
        fetchData(); // Refresh the grid
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to submit");
      }
    }
  };

  // Handle Bulk Submission to Dean
  const handleSubmitToDean = async () => {
    if (!currentWeek || !permissions.canSubmitToDean) {
      toast.error("Only company-approved weeks can be submitted to the dean.");
      return;
    }
    if (
      window.confirm(
        "Submit company-approved timesheets to dean for final review?",
      )
    ) {
      try {
        await api.put("/student/timesheets/submit-to-dean", {
          weekStart: currentWeek.start.toISOString(),
          weekEnd: currentWeek.end.toISOString(),
        });
        toast.success("Timesheets submitted to dean!");
        fetchData(); // Refresh the grid
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to submit to dean");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock
            className="mx-auto text-purple-600 animate-spin mb-4"
            size={48}
          />
          <p className="text-gray-600">Loading Timesheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 bg-linear-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            OJT Timesheet
          </h1>
          <p className="text-gray-600 mt-2">
            Track your daily training hours and manage submissions
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setShowStats(!showStats)}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <BarChart3 size={18} className="mr-2" />
            {showStats ? "Hide" : "Show"} Stats
          </Button>
          <Button
            onClick={() => setShowAllWeeks(!showAllWeeks)}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <List size={18} className="mr-2" />
            {showAllWeeks ? "Hide" : "All"} Weeks
          </Button>
          <Button
            onClick={handleExportCSV}
            disabled={!currentWeek}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Download size={18} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white shadow-lg border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Required Hours
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {requiredHours.toFixed(1)}h
                  </p>
                </div>
                <Clock className="text-purple-200" size={40} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-500 to-green-600 text-white shadow-lg border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Dean Approved
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {approvedHours.toFixed(1)}h
                  </p>
                </div>
                <CheckCircle className="text-green-200" size={40} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-amber-500 to-amber-600 text-white shadow-lg border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">
                    Remaining Hours
                  </p>
                  <p className="text-3xl font-bold mt-1">
                    {remainingHours.toFixed(1)}h
                  </p>
                </div>
                <AlertCircle className="text-amber-200" size={40} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Progress</p>
                  <p className="text-3xl font-bold mt-1">
                    {progressPercent.toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-100 mt-1">
                    Based on dean-approved hours
                  </p>
                </div>
                <BarChart3 className="text-blue-200" size={40} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Weeks Overview */}
      {showAllWeeks && allWeeks.length > 0 && (
        <Card className="bg-white shadow-lg border-none">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="text-purple-600" size={20} />
              All Weeks Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allWeeks.map((week, index) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isCurrentWeek = today >= week.start && today <= week.end;

                return (
                  <div
                    key={week.number}
                    onClick={() => setCurrentWeekIndex(index)}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      index === currentWeekIndex
                        ? "bg-linear-to-br from-purple-100 to-blue-100 border-2 border-purple-500 shadow-lg scale-105"
                        : isCurrentWeek
                          ? "bg-linear-to-br from-blue-50 to-purple-50 border-2 border-blue-400 shadow-md"
                          : "bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    {isCurrentWeek && (
                      <div className="absolute -top-2 -right-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                        NOW
                      </div>
                    )}
                    {week.allApproved && (
                      <CheckCircle
                        className="absolute -top-2 -left-2 text-green-500 bg-white rounded-full"
                        size={24}
                      />
                    )}

                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Week {week.number}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full mb-2 ${week.summary?.badgeClass || "bg-gray-100 text-gray-600"}`}
                    >
                      {week.weekStatus}
                    </span>
                    <p className="text-xs text-gray-600 mb-3">
                      {week.start.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -
                      {week.end.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Days:</span>
                        <span className="font-semibold text-purple-600">
                          {week.entries.length}/7
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hours:</span>
                        <span className="font-semibold text-purple-600">
                          {week.totalHours.toFixed(1)}h
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          week.entries.length === 7
                            ? "bg-green-500"
                            : isCurrentWeek
                              ? "bg-blue-500"
                              : "bg-purple-500"
                        }`}
                        style={{ width: `${(week.entries.length / 7) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week Selector */}
      {allWeeks.length > 0 && (
        <WeekSelector
          weeks={allWeeks}
          currentWeekIndex={currentWeekIndex}
          onChange={setCurrentWeekIndex}
        />
      )}

      {/* Week Status Overview */}
      {currentWeek && (
        <Card className="bg-white shadow-lg border border-gray-100">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${currentWeekSummary.badgeClass}`}
                >
                  {currentWeekSummary.statusLabel}
                </span>
                <p className="text-sm text-gray-600">
                  {currentWeekSummary.description}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {currentWeek.entries.length}/7 days logged •{" "}
                {currentWeek.totalHours.toFixed(1)}h
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-700 font-semibold">
                Pending: {currentWeekSummary.counts.pending || 0}
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-700 font-semibold">
                Company Approved:{" "}
                {currentWeekSummary.counts.company_approved || 0}
              </div>
              <div className="p-3 rounded-lg bg-amber-50 text-amber-700 font-semibold">
                Awaiting Dean:{" "}
                {currentWeekSummary.counts.submitted_to_dean || 0}
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">
                Dean Approved: {currentWeekSummary.counts.dean_approved || 0}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {WEEK_STEP_SEQUENCE.map((step, index) => {
                const isActive =
                  activeStepIndex === -1
                    ? index === 0
                    : index <= activeStepIndex;
                return (
                  <div key={step.key} className="flex items-center">
                    <div
                      className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border ${
                        isActive
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      }`}
                    >
                      {isActive ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Clock size={14} />
                      )}
                      {step.label}
                    </div>
                    {index < WEEK_STEP_SEQUENCE.length - 1 && (
                      <div className="w-6 h-0.5 bg-gray-200 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>

            {currentWeekSummary.statusNotes.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Attention
                </p>
                <ul className="text-xs text-amber-700 list-disc pl-5 space-y-1">
                  {currentWeekSummary.statusNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weekly Timesheet Grid */}
      {currentWeek ? (
        <Card className="bg-white shadow-xl border-none overflow-hidden">
          <CardHeader className="bg-linear-to-r from-purple-50 to-blue-50 border-b-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Daily Timesheet</CardTitle>
                <CardDescription className="mt-1">
                  Click on any day to add or edit entries •{" "}
                  {currentWeek.entries.length}/7 days logged
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Week Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {currentWeek.totalHours.toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <WeeklyTimesheetGrid
              week={currentWeek}
              entries={currentWeek.entries}
              onUpdate={handleEntryUpdate}
              permissions={permissions}
            />
          </CardContent>

          {/* Submission Actions */}
          <div className="p-6 bg-gray-50 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              {permissions.studentCanEdit ? (
                <Clock className="text-green-600" size={16} />
              ) : currentWeekSummary.state === "locked" ? (
                <CheckCircle className="text-emerald-600" size={16} />
              ) : currentWeekSummary.state === "company_returned" ? (
                <AlertCircle className="text-red-500" size={16} />
              ) : (
                <Clock className="text-blue-600" size={16} />
              )}
              {submissionMessage}
            </p>

            <div className="flex gap-2 flex-wrap justify-end">
              {permissions.studentCanEdit && (
                <Button
                  onClick={handleSubmitToCompany}
                  disabled={!permissions.canSubmitToCompany}
                  className={`text-white ${
                    permissions.canSubmitToCompany
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  <Send size={16} className="mr-2" />
                  Submit to Company
                </Button>
              )}

              {permissions.canSubmitToDean && (
                <Button
                  onClick={handleSubmitToDean}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send size={16} className="mr-2" />
                  Submit to Dean
                </Button>
              )}

              {currentWeekSummary.state === "company_review" && (
                <Button disabled className="bg-amber-100 text-amber-700">
                  <Clock size={16} className="mr-2" /> Waiting for Company
                </Button>
              )}

              {currentWeekSummary.state === "dean_review" && (
                <Button disabled className="bg-blue-100 text-blue-700">
                  <Clock size={16} className="mr-2" /> Dean Review in Progress
                </Button>
              )}

              {currentWeekSummary.state === "locked" && (
                <Button disabled className="bg-emerald-100 text-emerald-700">
                  <CheckCircle size={16} className="mr-2" /> Approved
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-white shadow-lg border-none p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            No Timesheet Data Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start logging your daily work hours to track your OJT progress
          </p>
          <Button
            onClick={() => {
              // Trigger fetch to ensure we have current week
              fetchData();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus size={18} className="mr-2" />
            Start Logging Hours
          </Button>
        </Card>
      )}
    </div>
  );
}

export default StudentTimesheet;
