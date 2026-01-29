import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";

import Button from "../../components/ui/Button";

import { Clock, CheckCircle, Send } from "lucide-react";

function StudentTimesheet() {
  /* Sample Week Template */
  const initialWeek = {
    week: "Week 1 (Jan 22 - Jan 26)",
    status: "draft", // draft | submitted | approved
    days: [
      { day: "Monday", hours: "", task: "" },
      { day: "Tuesday", hours: "", task: "" },
      { day: "Wednesday", hours: "", task: "" },
      { day: "Thursday", hours: "", task: "" },
      { day: "Friday", hours: "", task: "" },
    ],
  };

  const [timesheet, setTimesheet] = useState(initialWeek);

  /* Handle Input */
  const handleChange = (index, field, value) => {
    const updatedDays = [...timesheet.days];

    updatedDays[index][field] = value;

    setTimesheet({
      ...timesheet,
      days: updatedDays,
    });
  };

  /* Calculate Total */
  const totalHours = timesheet.days.reduce(
    (sum, day) => sum + Number(day.hours || 0),
    0,
  );

  /* Submit */
  const handleSubmit = () => {
    setTimesheet({
      ...timesheet,
      status: "submitted",
    });

    alert("Timesheet submitted for approval.");
  };

  /* Status Badge */
  const statusBadge = {
    draft: "bg-gray-100 text-gray-700",
    submitted: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Timesheet</h1>

        <p className="text-gray-600">
          Record your daily working hours and activities
        </p>
      </div>

      {/* Summary */}
      <Card elevated>
        <CardContent padding="lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-gray-600">Current Week</p>
              <p className="text-3xl font-bold">{totalHours}</p>
              <p className="text-xs text-gray-500">hours</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Required</p>
              <p className="text-3xl font-bold">40</p>
              <p className="text-xs text-gray-500">hours</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>

              <span
                className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-medium ${statusBadge[timesheet.status]}`}
              >
                {timesheet.status.toUpperCase()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Entry */}
      <Card elevated>
        <CardHeader withBorder>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{timesheet.week}</CardTitle>

              <CardDescription>Enter your daily work record</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={18} className="text-purple-600" />

              <span className="text-lg font-semibold text-purple-600">
                {totalHours}h
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent padding="lg">
          <div className="space-y-4">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
              <div className="col-span-3">Day</div>
              <div className="col-span-2">Hours</div>
              <div className="col-span-7">Activity / Task Description</div>
            </div>

            {/* Rows */}
            {timesheet.days.map((day, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
              >
                {/* Day */}
                <div className="md:col-span-3 font-medium text-gray-800">
                  {day.day}
                </div>

                {/* Hours */}
                <div className="md:col-span-2">
                  <input
                    type="number"
                    min="0"
                    max="12"
                    disabled={timesheet.status !== "draft"}
                    value={day.hours}
                    onChange={(e) =>
                      handleChange(index, "hours", e.target.value)
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Task */}
                <div className="md:col-span-7">
                  <textarea
                    rows="2"
                    disabled={timesheet.status !== "draft"}
                    value={day.task}
                    onChange={(e) =>
                      handleChange(index, "task", e.target.value)
                    }
                    placeholder="Describe your work..."
                    className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t">
            {/* Info */}
            <p className="text-sm text-gray-500">
              Ensure all entries are accurate before submission.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              {timesheet.status === "draft" && (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  className="flex items-center gap-2"
                >
                  <Send size={16} />
                  Submit Timesheet
                </Button>
              )}

              {timesheet.status === "submitted" && (
                <Button
                  variant="outline"
                  disabled
                  className="flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Awaiting Approval
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentTimesheet;
