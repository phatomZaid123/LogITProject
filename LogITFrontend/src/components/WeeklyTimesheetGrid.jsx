import React, { useState } from "react";
import {
  Clock,
  Edit2,
  Save,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const WeeklyTimesheetGrid = ({ week, entries, onUpdate, permissions = {} }) => {
  const { api, user } = useAuth();
  const role = user?.role || "student";
  const { studentCanEdit = false, companyCanEdit = false } = permissions;
  const [editingDay, setEditingDay] = useState(null);
  const [editData, setEditData] = useState({});
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

    return {
      dayName,
      date,
      entry,
      isToday,
      isPast,
      isFuture,
      dateStr: date.toISOString().split("T")[0],
    };
  });

  const handleEdit = (day) => {
    // If entry exists, edit it
    if (day.entry) {
      setEditingDay(day.dateStr);
      setEditData({
        timeIn: day.entry.timeIn,
        timeOut: day.entry.timeOut,
        breakMinutes: day.entry.breakMinutes,
      });
    } else {
      // If no entry, start creating a new one
      setEditingDay(day.dateStr);
      setEditData({
        timeIn: "08:00",
        timeOut: "17:00",
        breakMinutes: 60,
      });
    }
  };

  const handleSave = async (day) => {
    if (!editData.timeIn || !editData.timeOut) {
      toast.error("Please fill in all time fields");
      return;
    }

    setLoading(true);
    try {
      if (day.entry) {
        // Update existing entry
        const response = await api.put(
          `/student/timesheets/${day.entry._id}`,
          editData,
        );
        onUpdate(day.entry._id, response.data);
        toast.success("Entry updated successfully!");
      } else {
        // Create new entry
        const newEntryData = {
          date: day.date.toISOString(),
          ...editData,
        };
        const response = await api.post("/student/timesheets", newEntryData);
        onUpdate(null, response.data);
        toast.success("Entry added successfully!");
      }
      setEditingDay(null);
      setEditData({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save entry");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingDay(null);
    setEditData({});
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
      submitted_to_dean: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "Dean",
      },
      dean_approved: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "✓ Done",
      },
      dean_declined: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Declined",
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

  const canEdit = (day) => {
    if (role === "company") {
      if (!companyCanEdit) return false;
      return (
        day.entry &&
        ["submitted_to_company", "edited_by_company"].includes(day.entry.status)
      );
    }

    if (!studentCanEdit) return false;
    if (!day.entry) {
      return !day.isFuture;
    }

    return ["pending", "company_declined"].includes(day.entry.status);
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
              Break
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
            const isEditing = editingDay === day.dateStr;
            const editable = canEdit(day);

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
                  {isEditing ? (
                    <input
                      type="time"
                      value={editData.timeIn}
                      onChange={(e) =>
                        setEditData({ ...editData, timeIn: e.target.value })
                      }
                      className="w-full max-w-25 px-2 py-1 border border-purple-300 rounded text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : day.entry ? (
                    <span className="text-xs font-medium text-gray-800">
                      {day.entry.timeIn}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">--:--</span>
                  )}
                </td>

                {/* Time Out */}
                <td className="px-2 py-2">
                  {isEditing ? (
                    <input
                      type="time"
                      value={editData.timeOut}
                      onChange={(e) =>
                        setEditData({ ...editData, timeOut: e.target.value })
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
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editData.breakMinutes}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            breakMinutes: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full max-w-15 px-2 py-1 border border-purple-300 rounded text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="0"
                      />
                      <span className="text-[10px] text-gray-500">min</span>
                    </div>
                  ) : day.entry ? (
                    <span className="text-xs font-medium text-gray-800">
                      {day.entry.breakMinutes} min
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
                        {day.entry.totalHours || 0}h
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">--</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-2 py-2">
                  {day.entry ? (
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
                  {isEditing ? (
                    <div className="flex gap-1 justify-center flex-wrap">
                      <button
                        onClick={() => handleSave(day)}
                        disabled={loading}
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs font-semibold disabled:opacity-50 flex items-center gap-1"
                      >
                        <Save size={12} />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs font-semibold flex items-center gap-1"
                      >
                        <X size={12} />
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      {day.entry ? (
                        <button
                          onClick={() => handleEdit(day)}
                          disabled={!editable || loading}
                          className={`px-2 py-1 rounded transition-colors text-xs font-semibold flex items-center gap-1 ${
                            editable
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Edit2 size={12} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      ) : !day.isFuture && studentCanEdit ? (
                        <button
                          onClick={() => handleEdit(day)}
                          disabled={loading}
                          className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          <Plus size={12} />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">--</span>
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
