import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Download, Filter } from "lucide-react";
import { BarChart3, TrendingUp } from "lucide-react";

function StudentReports() {
  const reports = [
    {
      id: 1,
      title: "Performance Summary",
      date: "Jan 2024",
      status: "available",
      type: "Monthly",
    },
    {
      id: 2,
      title: "Skills Assessment",
      date: "Jan 2024",
      status: "available",
      type: "Assessment",
    },
    {
      id: 3,
      title: "Hours Breakdown",
      date: "In Progress",
      status: "pending",
      type: "Analytics",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">
          View your OJT progress and performance reports.
        </p>
      </div>

      {/* Progress Card */}
      <Card elevated>
        <CardHeader withBorder>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent padding="lg">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Required Hours: 480
                </span>
                <span className="text-sm font-bold text-gray-900">480/480</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} elevated>
            <CardHeader withBorder>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription>{report.type}</CardDescription>
            </CardHeader>
            <CardContent padding="lg">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{report.date}</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    report.status === "available"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {report.status}
                </span>
                <Button
                  variant="outline"
                  fullWidth
                  disabled={report.status !== "available"}
                >
                  <Download size={16} className="mr-2" /> Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default StudentReports;
