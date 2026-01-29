import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";

import Button from "../../components/ui/Button";

import {
  Users,
  CheckCircle2,
  Clock,
  Star,
  ArrowUpRight,
  Calendar,
  ClipboardList,
  Bell,
} from "lucide-react";

function CompanyHome() {
  /* ===== DASHBOARD STATS ===== */
  const stats = [
    {
      title: "Active Students",
      value: "12",
      icon: Users,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Tasks Assigned",
      value: "28",
      icon: ClipboardList,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Hours Tracked",
      value: "1,440",
      icon: Clock,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Avg Rating",
      value: "4.8",
      icon: Star,
      color: "bg-yellow-100 text-yellow-700",
    },
  ];

  /* ===== STUDENT DATA ===== */
  const students = [
    {
      id: 1,
      name: "John Smith",
      progress: 85,
      hours: 408,
      tasks: 12,
      status: "Excellent",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      progress: 72,
      hours: 346,
      tasks: 10,
      status: "Good",
    },
    {
      id: 3,
      name: "Michael Brown",
      progress: 65,
      hours: 312,
      tasks: 8,
      status: "Average",
    },
  ];

  /* ===== PENDING ITEMS ===== */
  const pending = [
    {
      student: "John Smith",
      task: "Logbook Review",
      due: "Jan 20",
    },
    {
      student: "Sarah Johnson",
      task: "Evaluation",
      due: "Jan 22",
    },
  ];

  /* ===== ACTIVITIES ===== */
  const activities = [
    {
      text: "John submitted logbook",
      time: "2h ago",
    },
    {
      text: "Sarah completed task",
      time: "5h ago",
    },
    {
      text: "Michael logged hours",
      time: "1 day ago",
    },
  ];

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Company Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            OJT Monitoring & Evaluation System
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar size={18} className="mr-2" />
            View Reports
          </Button>

          <Button variant="primary">Assign Task</Button>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;

          return (
            <Card key={i} elevated>
              <CardContent padding="lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>

                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>

                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== STUDENT TABLE ===== */}
        <div className="lg:col-span-2">
          <Card elevated>
            <CardHeader withBorder>
              <CardTitle>Student Performance</CardTitle>

              <CardDescription>
                OJT progress and compliance tracking
              </CardDescription>
            </CardHeader>

            <CardContent padding="none">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">Student</th>
                    <th className="px-6 py-3 text-left">Progress</th>
                    <th className="px-6 py-3 text-left">Hours</th>
                    <th className="px-6 py-3 text-left">Tasks</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{s.name}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 h-2 rounded-full">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${s.progress}%` }}
                            />
                          </div>

                          <span>{s.progress}%</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">{s.hours}h</td>

                      <td className="px-6 py-4">{s.tasks}</td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                          {s.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* ===== RIGHT PANEL ===== */}
        <div className="space-y-6">
          {/* Pending */}
          <Card elevated>
            <CardHeader withBorder>
              <CardTitle>Pending Actions</CardTitle>
            </CardHeader>

            <CardContent padding="lg">
              <div className="space-y-3">
                {pending.map((p, i) => (
                  <div key={i} className="border-b pb-2 last:border-0">
                    <p className="font-medium">{p.student}</p>

                    <p className="text-xs text-gray-600">{p.task}</p>

                    <p className="text-xs text-red-500">Due: {p.due}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activities */}
          <Card elevated>
            <CardHeader withBorder>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Bell size={18} />
                  Recent Activity
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent padding="lg">
              <div className="space-y-3">
                {activities.map((a, i) => (
                  <div key={i} className="text-sm border-b pb-2 last:border-0">
                    <p>{a.text}</p>

                    <p className="text-xs text-gray-400">{a.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CompanyHome;
