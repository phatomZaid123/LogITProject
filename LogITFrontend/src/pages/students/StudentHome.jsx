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
  Clock,
  TrendingUp,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";

function StudentHome() {
  // Mock data
  const stats = [
    {
      title: "Total Hours",
      value: "120",
      target: "480",
      percent: "25%",
      icon: Clock,
      color: "bg-blue-100 text-blue-600",
      trend: "up",
      change: "+12h",
    },
    {
      title: "Approved Entries",
      value: "13",
      target: "60",
      percent: "22%",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
      trend: "up",
      change: "+2",
    },
    {
      title: "Pending Approval",
      value: "2",
      target: "0",
      percent: "Complete",
      icon: AlertCircle,
      color: "bg-amber-100 text-amber-600",
      trend: "down",
      change: "-1",
    },
    {
      title: "Tasks Completed",
      value: "8",
      target: "15",
      percent: "53%",
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
      trend: "up",
      change: "+3",
    },
  ];

  const recentActivities = [
    {
      type: "Logbook",
      action: "Submitted new entry",
      details: "Backend optimization work",
      time: "2 hours ago",
      status: "pending",
    },
    {
      type: "Task",
      action: "Completed assigned task",
      details: "API integration testing",
      time: "1 day ago",
      status: "completed",
    },
    {
      type: "Feedback",
      action: "Received feedback",
      details: "From mentor: Great work on the database design",
      time: "2 days ago",
      status: "completed",
    },
    {
      type: "Logbook",
      action: "Approved logbook entry",
      details: "Frontend development - 8 hours",
      time: "3 days ago",
      status: "completed",
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: "Complete API Documentation",
      dueDate: "Jan 22, 2024",
      priority: "high",
      status: "in-progress",
    },
    {
      id: 2,
      title: "Submit Weekly Timesheet",
      dueDate: "Jan 19, 2024",
      priority: "high",
      status: "pending",
    },
    {
      id: 3,
      title: "Mid-term Performance Review",
      dueDate: "Jan 28, 2024",
      priority: "medium",
      status: "pending",
    },
  ];

  const companyInfo = {
    name: "Tech Corp Solutions",
    mentor: "John Smith",
    startDate: "Jan 1, 2024",
    endDate: "Apr 1, 2024",
    status: "active",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600">
          You're doing great! Keep up with your OJT progress.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === "up";

          return (
            <Card
              key={index}
              elevated
              className="hover:shadow-lg transition-all duration-300"
            >
              <CardContent padding="lg">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}
                  >
                    {stat.change}
                    {isPositive ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: stat.percent }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {stat.percent} completed
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card elevated>
            <CardHeader withBorder>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your latest OJT activities</CardDescription>
            </CardHeader>
            <CardContent padding="none">
              <div className="divide-y divide-gray-200">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                          activity.status === "completed"
                            ? "bg-green-500"
                            : "bg-amber-500"
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {activity.type}: {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {activity.time}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {activity.details}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Company Info & Upcoming Deadlines */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card elevated>
            <CardHeader withBorder>
              <CardTitle variant="h4">Company Info</CardTitle>
            </CardHeader>
            <CardContent padding="lg">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Company</p>
                  <p className="font-semibold text-gray-900">
                    {companyInfo.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Mentor</p>
                  <p className="font-semibold text-gray-900">
                    {companyInfo.mentor}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Duration</p>
                  <p className="text-sm text-gray-700">
                    {companyInfo.startDate} - {companyInfo.endDate}
                  </p>
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {companyInfo.status}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card elevated>
            <CardHeader withBorder>
              <CardTitle variant="h4">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent padding="lg">
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="pb-3 border-b border-gray-200 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <Calendar size={14} className="text-gray-400 mt-0.5" />
                      <p className="text-sm font-medium text-gray-900 flex-1">
                        {deadline.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      {deadline.dueDate}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card elevated>
        <CardHeader withBorder>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Complete these to stay on track with your OJT
          </CardDescription>
        </CardHeader>
        <CardContent padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" fullWidth>
              Submit Logbook Entry
            </Button>
            <Button variant="outline" fullWidth>
              View Tasks
            </Button>
            <Button variant="outline" fullWidth>
              Download Reports
            </Button>
            <Button variant="outline" fullWidth>
              Contact Mentor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentHome;
