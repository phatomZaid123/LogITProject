import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Edit2, Save, X, CheckCircle } from "lucide-react";

const CompanyTimesheetGrid = ({ isEditable, rows, displayRows, setRows }) => {
  const { api, user } = useAuth();
  const userRole = user?.role;
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const visibleRows =
    Array.isArray(displayRows) && displayRows.length >= 0 ? displayRows : rows;

  // Start editing a row
  const handleEdit = (row) => {
    setEditingId(row._id);
    setEditData({
      timeIn: row.timeIn,
      timeOut: row.timeOut,
      breakMinutes: row.breakMinutes,
    });
  };

  // Save edited row
  const handleSave = async (rowId) => {
    try {
      const response = await api.put(`/student/timesheets/${rowId}`, editData);

      // Update local state
      setRows((prev) => prev.map((r) => (r._id === rowId ? response.data : r)));

      setEditingId(null);
      setEditData({});
      toast.success("Entry updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // Handle status change (company only)
  const handleStatusChange = async (rowId, newStatus) => {
    try {
      const response = await api.put(`/company/timesheets/${rowId}/approve`, {
        status: newStatus,
      });

      // Update local state
      setRows((prev) => prev.map((r) => (r._id === rowId ? response.data : r)));

      toast.success(
        `Entry ${newStatus === "company_approved" ? "approved" : "declined"}`,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  // Update edit data
  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        label: "Pending",
      },
      submitted_to_company: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        label: "With Company",
      },
      company_approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Company Approved",
      },
      company_declined: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Declined",
      },
      submitted_to_dean: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "With Dean",
      },
      dean_approved: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Approved ✓",
      },
      dean_declined: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Dean Declined",
      },
      edited_by_company: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        label: "Edited",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  // Check if row can be edited
  const canEdit = (row) => {
    if (userRole === "company") return true;
    return row.status === "pending" && isEditable;
  };

  if (!rows || rows.length === 0) {
    return (
      <div className="p-12 text-center bg-gray-50">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Timesheet Entries Yet
          </h3>
          <p className="text-gray-500">
            Click the "Add New Daily Log" button above to create your first
            timesheet entry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-linear-to-r from-purple-50 to-blue-50 border-b-2 border-purple-200">
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Time In
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Time Out
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Break (min)
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Total Hours
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {visibleRows && visibleRows.length > 0 ? (
            visibleRows.map((row) => {
              const isEditing = editingId === row._id;
              const editable = canEdit(row);

              return (
                <tr
                  key={row._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Date */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {new Date(row.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  {/* Time In */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="time"
                        value={editData.timeIn}
                        onChange={(e) => handleChange("timeIn", e.target.value)}
                        className="px-2 py-1 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {row.timeIn}
                      </span>
                    )}
                  </td>

                  {/* Time Out */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="time"
                        value={editData.timeOut}
                        onChange={(e) =>
                          handleChange("timeOut", e.target.value)
                        }
                        className="px-2 py-1 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {row.timeOut}
                      </span>
                    )}
                  </td>

                  {/* Break Minutes */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editData.breakMinutes}
                        onChange={(e) =>
                          handleChange("breakMinutes", parseInt(e.target.value))
                        }
                        className="w-20 px-2 py-1 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="0"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {row.breakMinutes} min
                      </span>
                    )}
                  </td>

                  {/* Total Hours */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-purple-600">
                      {row.totalHours || 0}h
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(row.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {isEditing ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleSave(row._id)}
                          className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                          title="Save"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(row)}
                          disabled={!editable}
                          className={`p-2 rounded-md transition-colors ${
                            editable
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          title={editable ? "Edit" : "Cannot edit"}
                        >
                          <Edit2 size={16} />
                        </button>

                        {/* Company-only approve/decline buttons */}
                        {userRole === "company" &&
                          row.status === "submitted_to_company" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    row._id,
                                    "company_approved",
                                  )
                                }
                                className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    row._id,
                                    "company_declined",
                                  )
                                }
                                className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                title="Decline"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                No entries match the selected filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Summary Footer */}
      <div className="bg-gray-50 border-t-2 border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{rows.length}</span> total entries
        </div>
        <div className="text-sm text-gray-600">
          Total Hours:{" "}
          <span className="font-bold text-purple-600 text-lg">
            {rows
              .reduce((sum, row) => sum + (row.totalHours || 0), 0)
              .toFixed(1)}
            h
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompanyTimesheetGrid;
