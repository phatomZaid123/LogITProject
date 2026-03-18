import React, { useState } from "react";
import {
  Clock,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  LogIn,
  LogOut,
  Send,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const WeeklyTimesheetGrid = ({ week, entries, onUpdate, permissions = {} }) => {
  const { api } = useAuth();
  const { studentCanEdit = false } = permissions;
  const [timingOutDay, setTimingOutDay] = useState(null);
  const [timeoutData, setTimeoutData] = useState({
    timeOut: "",
    dailyLog: "",
    breakMinutes: 0,
  });
  const [loading, setLoading] = useState(false);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Generate all 7 days for the week
  const weekDays = daysOfWeek.map((dayName, index) => {
    const date = new Date(week.start);
    date.setDate(week.start.getDate() + index);
    date.setHours(0, 0, 0, 0);

    // Find entry for this day
    const entry = entries.find((e) => {
      const entryDate = new Date(e.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === date.getTime();
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    const isFuture = date > today;
    const isAbsent =
      entry?.status === "absent" ||
      (isPast && (!entry || !entry.timeIn || !entry.timeOut));

    return {
      dayName,
      date,
      entry,
      isToday,
      isPast,
      isFuture,
      dateStr: date.toISOString().split("T")[0],
      isAbsent,
    };
  });

  const formatNow = () =>
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const handleTimeIn = async (day) => {
    setLoading(true);
    try {
      const response = await api.post("/student/timesheets", {
        date: day.date.toISOString(),
        timeIn: formatNow(),
      });
      onUpdate(null, response.data);
      toast.success("Time in recorded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record time in");
    } finally {
      setLoading(false);
    }
  };

  const openTimeOutForm = (day) => {
    setTimingOutDay(day.dateStr);
    setTimeoutData({
      timeOut: formatNow(),
      dailyLog: day.entry?.dailyLog || "",
      breakMinutes: day.entry?.breakMinutes ?? 0,
    });
  };

  const handleTimeOutSave = async (day) => {
    if (!timeoutData.timeOut) {
      toast.error("Please provide time out");
      return;
    }

    if (!timeoutData.dailyLog?.trim()) {
      toast.error("Please enter accomplished tasks for today");
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/student/timesheets/${day.entry._id}`, {
        timeOut: timeoutData.timeOut,
        dailyLog: timeoutData.dailyLog,
        breakMinutes: Number(timeoutData.breakMinutes || 0),
      });
      onUpdate(day.entry._id, response.data);
      toast.success("Time out saved");
      setTimingOutDay(null);
      setTimeoutData({ timeOut: "", dailyLog: "", breakMinutes: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save time out");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTimeOut = () => {
    setTimingOutDay(null);
    setTimeoutData({ timeOut: "", dailyLog: "", breakMinutes: 0 });
  };

  const handleSubmitEntry = async (day) => {
    if (!day?.entry?._id) return;

    setLoading(true);
    try {
      const response = await api.put(
        `/student/timesheets/${day.entry._id}/submit-company`,
      );

      onUpdate(day.entry._id, response?.data?.data || response?.data);
      toast.success("Entry submitted to company");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit entry");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
      submitted_to_company: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        label: "Company",
      },
      company_approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Approved",
      },
      company_declined: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Declined",
      },
      edited_by_company: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "Edited",
      },
      absent: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Absent",
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${config.bg} ${config.text} whitespace-nowrap`}
      >
        {config.label}
      </span>
    );
  };

  const canClockIn = (day) => {
    if (!studentCanEdit) return false;
    if (!day.isToday) return false;
    return !day.entry;
  };

  const canClockOut = (day) => {
    if (!studentCanEdit || !day.entry) return false;
    if (!day.isToday) return false;
    if (day.entry.timeOut) return false;
    return ["pending", "company_declined"].includes(day.entry.status);
  };

  const isLocked = (day) => {
    if (!day.entry) return false;
    return !["pending", "company_declined"].includes(day.entry.status);
  };

  const canSubmitEntry = (day) => {
    if (!studentCanEdit || !day.entry) return false;
    if (!["pending", "company_declined"].includes(day.entry.status)) {
      return false;
    }
    if (!day.entry.timeOut) return false;
    if (!day.entry.dailyLog?.trim()) return false;
    return true;
  };

  return (
    <div className="overflow-x-auto shadow-sm rounded-lg">
      <table className="w-full border-collapse min-w-200">
        <thead>
          <tr className="bg-linear-to-r from-purple-50 to-blue-50">
            <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 border-b-2 border-purple-200">
              Date
            </th>
            <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 border-b-2 border-purple-200">
              Day
            </th>
            <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 border-b-2 border-purple-200">
              Time In
            </th>
            <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 border-b-2 border-purple-200">
              Time Out
            </th>
            <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 border-b-2 border-purple-200">
              Break (min)
            </th>
            <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 border-b-2 border-purple-200">
              Daily Tasks
            </th>
            <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 border-b-2 border-purple-200">
              Hours
            </th>
            <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 border-b-2 border-purple-200">
              Status
            </th>
            <th className="px-2 py-2 text-center text-xs font-bold text-gray-700 border-b-2 border-purple-200">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {weekDays.map((day) => {
            const isTimingOut = timingOutDay === day.dateStr;
            const isAbsent = day.isAbsent;

            return (
              <tr
                key={day.dateStr}
                className={`border-b transition-colors ${
                  day.isToday
                    ? "bg-blue-50 hover:bg-blue-100"
                    : day.entry
                      ? "hover:bg-gray-50"
                      : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {/* Date */}
                <td className="px-2 py-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <div
                      className={`text-xs font-semibold whitespace-nowrap ${day.isToday ? "text-blue-700" : "text-gray-700"}`}
                    >
                      {day.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    {day.isToday && (
                      <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full w-fit">
                        TODAY
                      </span>
                    )}
                  </div>
                </td>

                {/* Day Name */}
                <td className="px-2 py-2">
                  <span
                    className={`text-xs font-medium ${day.isToday ? "text-blue-700" : "text-gray-600"}`}
                  >
                    {day.dayName}
                  </span>
                </td>

                {/* Time In */}
                <td className="px-2 py-2">
                  {day.entry ? (
                    <span className="text-xs font-medium text-gray-800">
                      {day.entry.timeIn}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">--:--</span>
                  )}
                </td>

                {/* Time Out */}
                <td className="px-2 py-2">
                  {isTimingOut ? (
                    <input
                      type="time"
                      value={timeoutData.timeOut}
                      onChange={(e) =>
                        setTimeoutData((prev) => ({
                          ...prev,
                          timeOut: e.target.value,
                        }))
                      }
                      className="w-full max-w-25 px-2 py-1 border border-purple-300 rounded text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : day.entry ? (
                    <span className="text-xs font-medium text-gray-800">
                      {day.entry.timeOut}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">--:--</span>
                  )}
                </td>

                {/* Break Minutes */}
                <td className="px-2 py-2">
                  {isTimingOut ? (
                    <input
                      type="number"
                      min="0"
                      value={timeoutData.breakMinutes}
                      onChange={(e) =>
                        setTimeoutData((prev) => ({
                          ...prev,
                          breakMinutes: e.target.value,
                        }))
                      }
                      className="w-full max-w-18 px-2 py-1 border border-purple-300 rounded text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : day.entry ? (
                    <span className="text-xs font-medium text-gray-800">
                      {Number(day.entry.breakMinutes || 0)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">--</span>
                  )}
                </td>

                {/* Daily Tasks */}
                <td className="px-2 py-2">
                  {isTimingOut ? (
                    <textarea
                      value={timeoutData.dailyLog}
                      onChange={(e) =>
                        setTimeoutData((prev) => ({
                          ...prev,
                          dailyLog: e.target.value,
                        }))
                      }
                      rows={2}
                      placeholder="What tasks did you accomplish today?"
                      className="w-full min-w-36 px-2 py-1 border border-purple-300 rounded text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : day.entry ? (
                    <span className="text-xs text-gray-700 line-clamp-2">
                      {day.entry.dailyLog?.trim() ? day.entry.dailyLog : "--"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">--</span>
                  )}
                </td>

                {/* Total Hours */}
                <td className="px-2 py-2">
                  {day.entry ? (
                    <div className="flex items-center gap-1">
                      <Clock className="text-purple-600" size={14} />
                      <span className="text-xs font-bold text-purple-600">
                        {Number(day.entry.totalHours || 0).toFixed(2)}h
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">--</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-2 py-2">
                  {isAbsent ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 whitespace-nowrap">
                      Absent
                    </span>
                  ) : day.entry ? (
                    getStatusBadge(day.entry.status)
                  ) : day.isFuture ? (
                    <span className="text-[10px] text-gray-400 italic">
                      Future
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 italic">
                      No entry
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-2 py-2">
                  {isAbsent ? (
                    <span className="text-red-600 text-xs font-semibold inline-flex items-center gap-1">
                      <AlertCircle size={12} /> Absent
                    </span>
                  ) : isTimingOut ? (
                    <div className="flex gap-1 justify-center flex-wrap">
                      <button
                        onClick={() => handleTimeOutSave(day)}
                        disabled={loading}
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs font-semibold disabled:opacity-50 flex items-center gap-1"
                      >
                        <Save size={12} />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                      <button
                        onClick={handleCancelTimeOut}
                        disabled={loading}
                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs font-semibold flex items-center gap-1"
                      >
                        <X size={12} />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-1 flex-wrap">
                      {canSubmitEntry(day) && (
                        <button
                          onClick={() => handleSubmitEntry(day)}
                          disabled={loading}
                          className="px-2 py-1 rounded transition-colors text-xs font-semibold flex items-center gap-1 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                        >
                          <Send size={12} />
                          <span className="hidden sm:inline">Submit</span>
                        </button>
                      )}

                      {canClockOut(day) ? (
                        <button
                          onClick={() => openTimeOutForm(day)}
                          disabled={loading}
                          className="px-2 py-1 rounded transition-colors text-xs font-semibold flex items-center gap-1 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                        >
                          <LogOut size={12} />
                          <span className="hidden sm:inline">Time Out</span>
                        </button>
                      ) : canClockIn(day) ? (
                        <button
                          onClick={() => handleTimeIn(day)}
                          disabled={loading}
                          className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          <LogIn size={12} />
                          <span className="hidden sm:inline">Time In</span>
                        </button>
                      ) : isLocked(day) ? (
                        <span className="text-green-600 text-xs font-semibold inline-flex items-center gap-1">
                          <CheckCircle size={12} /> Locked
                        </span>
                      ) : (
                        <span className="text-amber-600 text-xs inline-flex items-center gap-1">
                          <AlertCircle size={12} /> Waiting
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyTimesheetGrid;
