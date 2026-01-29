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

function CompanyReports() {
  const reports = [
    {
      id: 1,
      title: "Student Progress Report",
      date: "Jan 2024",
      status: "available",
      type: "Monthly",
    },
    {
      id: 2,
      title: "Performance Metrics",
      date: "Jan 2024",
      status: "available",
      type: "Analytics",
    },
    {
      id: 3,
      title: "Attendance Summary",
      date: "In Progress",
      status: "pending",
      type: "Attendance",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">
          View student performance and company analytics.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Button variant="outline">
          <Filter size={18} className="mr-2" /> Filter
        </Button>
      </div>

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

export default CompanyReports;
