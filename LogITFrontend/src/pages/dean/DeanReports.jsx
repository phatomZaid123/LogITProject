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

function DeanReports() {
  const reports = [
    {
      id: 1,
      title: "OJT Compliance Report",
      description: "Summary of students who met required training hours",
      period: "January 2024",
      totalStudents: 248,
      completed: 212,
      pending: 36,
      status: "completed",
    },

    {
      id: 2,
      title: "Student Performance Report",
      description: "Evaluation of student tasks, ratings, and progress",
      period: "January 2024",
      totalStudents: 248,
      averageScore: "87%",
      status: "completed",
    },

    {
      id: 3,
      title: "Company Evaluation Report",
      description: "Assessment of partner companies and supervisors",
      period: "January 2024",
      totalCompanies: 35,
      rating: "4.5 / 5",
      status: "completed",
    },

    {
      id: 4,
      title: "Logbook Submission Report",
      description: "Status of submitted and approved digital logbooks",
      period: "January 2024",
      approved: 198,
      pending: 32,
      rejected: 18,
      status: "completed",
    },

    {
      id: 5,
      title: "Attendance & Hours Report",
      description: "Total and average OJT hours rendered",
      period: "January 2024",
      averageHours: "162 hrs",
      maxHours: "184 hrs",
      status: "completed",
    },

    {
      id: 6,
      title: "Overdue & Deadline Report",
      description: "List of students with missed tasks or logs",
      period: "February 2024",
      overdue: 21,
      status: "pending",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">View and generate OJT program reports.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline">
          <Filter size={18} className="mr-2" /> Filter
        </Button>
        <Button variant="primary">
          <Download size={18} className="mr-2" /> Generate Report
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} elevated>
            <CardHeader withBorder>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent padding="lg">
              <div className="space-y-3">
                {/* Description */}
                <p className="text-sm text-gray-600">{report.description}</p>

                {/* Period */}
                <div>
                  <p className="text-xs text-gray-500">Reporting Period</p>
                  <p className="font-medium">{report.period}</p>
                </div>

                {/* Dynamic Info */}
                <div className="text-sm space-y-1 text-gray-700">
                  {report.totalStudents && (
                    <p>Total Students: {report.totalStudents}</p>
                  )}

                  {report.totalCompanies && (
                    <p>Total Companies: {report.totalCompanies}</p>
                  )}

                  {report.completed && <p>Completed: {report.completed}</p>}

                  {report.pending && <p>Pending: {report.pending}</p>}

                  {report.approved && <p>Approved Logs: {report.approved}</p>}

                  {report.rejected && <p>Rejected Logs: {report.rejected}</p>}

                  {report.averageScore && (
                    <p>Average Score: {report.averageScore}</p>
                  )}

                  {report.averageHours && (
                    <p>Average Hours: {report.averageHours}</p>
                  )}

                  {report.rating && <p>Company Rating: {report.rating}</p>}

                  {report.overdue && <p>Overdue Students: {report.overdue}</p>}
                </div>

                {/* Status */}
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium w-fit
      ${
        report.status === "completed"
          ? "bg-green-100 text-green-700"
          : "bg-amber-100 text-amber-700"
      }`}
                >
                  {report.status}
                </span>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" fullWidth>
                    View
                  </Button>

                  <Button variant="primary" fullWidth>
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DeanReports;
