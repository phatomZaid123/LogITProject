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
  Building2,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

function DashboardHome() {
  /* KPI Stats */
  const stats = [
    {
      title: "Registered Interns",
      value: "248",
      change: "+12%",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      trend: "up",
    },
    {
      title: "Partner Industries",
      value: "35",
      change: "+5%",
      icon: Building2,
      color: "bg-green-100 text-green-600",
      trend: "up",
    },
    {
      title: "Training Hours Logged",
      value: "3,240",
      change: "+8%",
      icon: Clock,
      color: "bg-purple-100 text-purple-600",
      trend: "up",
    },
    {
      title: "Verified Logbooks",
      value: "1,025",
      change: "-2%",
      icon: CheckCircle2,
      color: "bg-orange-100 text-orange-600",
      trend: "down",
    },
  ];

  /* Activities */
  const recentActivities = [
    {
      type: "Student",
      action: "Submitted final OJT report",
      name: "John Smith",
      time: "2 hours ago",
      status: "pending",
    },
    {
      type: "Company",
      action: "Uploaded performance evaluation",
      name: "TechCorp Ltd",
      time: "4 hours ago",
      status: "completed",
    },
    {
      type: "Student",
      action: "Completed required training hours",
      name: "Sarah Johnson",
      time: "6 hours ago",
      status: "completed",
    },
    {
      type: "Complaint",
      action: "Policy violation reported",
      name: "Attendance Issue",
      time: "8 hours ago",
      status: "urgent",
    },
  ];

  /* Approvals */
  const pendingApprovals = [
    {
      id: 1,
      student: "Alex Chen",
      date: "Jan 15, 2024",
      type: "Logbook",
      hours: 8,
    },
    {
      id: 2,
      student: "Emma Wilson",
      date: "Jan 16, 2024",
      type: "Evaluation",
      hours: 8,
    },
    {
      id: 3,
      student: "Michael Brown",
      date: "Jan 17, 2024",
      type: "Final Report",
      hours: 6,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dean Dashboard</h1>

        <p className="text-gray-600">
          On-the-Job Training (OJT) Program Monitoring System
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Academic Year: 2024 / 2025 | 2nd Semester
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === "up";

          return (
            <Card key={index} elevated className="hover:shadow-md transition">
              <CardContent padding="lg">
                <div className="flex justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>

                  <div
                    className={`flex items-center gap-1 text-sm font-semibold
                    ${isPositive ? "text-green-600" : "text-red-600"}`}
                  >
                    {stat.change}

                    {isPositive ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600">{stat.title}</p>

                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activities */}
        <div className="lg:col-span-2">
          <Card elevated>
            <CardHeader withBorder>
              <CardTitle>Recent Academic Activities</CardTitle>

              <CardDescription>
                Latest updates from students and partner companies
              </CardDescription>
            </CardHeader>

            <CardContent padding="none">
              <div className="divide-y">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex gap-3">
                      <span
                        className={`w-2.5 h-2.5 rounded-full mt-2
                        ${
                          activity.status === "urgent"
                            ? "bg-red-500"
                            : activity.status === "pending"
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                      />

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">
                            {activity.type}: {activity.action}
                          </p>

                          <span className="text-xs text-gray-500">
                            {activity.time}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">{activity.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Column */}
        <div className="space-y-6">
          {/* Pending */}
          <Card elevated>
            <CardHeader withBorder>
              <CardTitle variant="h4">Pending Academic Reviews</CardTitle>
            </CardHeader>

            <CardContent padding="lg">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-600">Awaiting Approval</span>

                <span
                  className="bg-amber-100 text-amber-700
                px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {pendingApprovals.length}
                </span>
              </div>

              <Button variant="outline" fullWidth size="sm">
                Review Submissions
              </Button>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card elevated>
            <CardHeader withBorder>
              <CardTitle variant="h4">Program Compliance</CardTitle>
            </CardHeader>

            <CardContent padding="lg">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-semibold">78%</span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: "78%" }}
                  />
                </div>

                <div className="flex justify-between text-sm mt-3">
                  <span>Report Submission</span>
                  <span className="font-semibold">85%</span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approval Table */}
      <Card elevated>
        <CardHeader withBorder>
          <CardTitle>Pending Academic Approvals</CardTitle>

          <CardDescription>
            Review and validate student submissions
          </CardDescription>
        </CardHeader>

        <CardContent padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-left">
                    Student
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold text-left">
                    Submission Type
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold text-left">
                    Date
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold text-left">
                    Hours
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold text-left">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {pendingApprovals.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{item.student}</td>

                    <td className="px-6 py-4 text-sm">{item.type}</td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.date}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className="bg-blue-100 text-blue-800
                        px-3 py-1 rounded-full text-sm"
                      >
                        {item.hours}h
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Button size="sm" variant="primary">
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardHome;
