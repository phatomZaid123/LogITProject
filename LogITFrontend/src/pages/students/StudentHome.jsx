import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";

import { Clock, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function StudentHome() {
  const { api } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get("/student/dashboard/stats");
        setDashboard(response.data);
      } catch (error) {
        console.error("Error loading student dashboard:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [api]);

  const stats = useMemo(() => {
    const hours = dashboard?.stats?.hours;
    const logs = dashboard?.stats?.logs;
    const timesheets = dashboard?.stats?.timesheets;
    const toCount = (value) => Number(value || 0);
    const hoursPercent = Number(hours?.percent || 0);
    const boundedHoursPercent = Math.min(100, Math.max(0, hoursPercent));

    return [
      {
        title: "Total Hours",
        value: `${Number(hours?.total || 0).toFixed(1)}h`,
        caption: `${boundedHoursPercent.toFixed(0)}% completed`,
        progressWidth: `${boundedHoursPercent.toFixed(0)}%`,
        showProgress: true,
        icon: Clock,
        color: "bg-blue-100 text-blue-600",
      },
      {
        title: "Pending Logbook Entries",
        value: String(toCount(logs?.pending)),
        caption: "In review",
        showProgress: false,
        icon: AlertCircle,
        color: "bg-amber-100 text-amber-600",
      },
      {
        title: "Approved Logbook Entries",
        value: String(toCount(logs?.approved)),
        caption: "Approved",
        showProgress: false,
        icon: CheckCircle2,
        color: "bg-green-100 text-green-600",
      },

      {
        title: "Pending Timesheets",
        value: String(toCount(timesheets?.pending)),
        caption: "In review",
        showProgress: false,
        icon: AlertCircle,
        color: "bg-amber-100 text-amber-600",
      },
      {
        title: "Approved Timesheets",
        value: String(toCount(timesheets?.approved)),
        caption: "Approved",
        showProgress: false,
        icon: FileText,
        color: "bg-purple-100 text-purple-600",
      },
    ];
  }, [dashboard]);

  const recentActivities = useMemo(() => {
    if (!dashboard?.recentActivity) return [];
    const formatDate = (value) =>
      new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    const logs = (dashboard.recentActivity.logs || []).map((log) => ({
      id: log._id,
      type: "Logbook",
      action:
        log.status === "approved"
          ? "Approved logbook entry"
          : log.status === "declined"
            ? "Declined logbook entry"
            : "Submitted logbook entry",
      details: `Week ${log.weekNumber || "N/A"}`,
      time: formatDate(log.createdAt),
      status: log.status === "approved" ? "completed" : "pending",
    }));

    const timesheets = (dashboard.recentActivity.timesheets || []).map(
      (timesheet) => ({
        id: timesheet._id,
        type: "Timesheet",
        action:
          timesheet.status === "company_approved"
            ? "Approved timesheet"
            : timesheet.status === "company_declined"
              ? "Declined timesheet"
              : "Submitted timesheet",
        details: `${Number(timesheet.totalHours || 0).toFixed(1)} hours`,
        time: formatDate(timesheet.date || timesheet.createdAt),
        status:
          timesheet.status === "company_approved" ? "completed" : "pending",
      }),
    );

    const tasks = (dashboard.recentActivity.tasks || []).map((task) => ({
      id: task._id,
      type: "Task",
      action: task.status === "completed" ? "Completed task" : "Updated task",
      details: task.title,
      time: formatDate(task.updatedAt || task.dueDate),
      status: task.status === "completed" ? "completed" : "pending",
    }));

    return [...logs, ...timesheets, ...tasks].slice(0, 8);
  }, [dashboard]);

  const companyInfo = dashboard?.companyInfo || null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-gray-600">
          You're doing great! Keep up with your OJT progress.
        </p>
      </div>

      {/* Statistics Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} elevated className="animate-pulse">
              <CardContent padding="md">
                <div className="h-20 bg-gray-200 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <Card
                key={index}
                elevated
                className="hover:shadow-lg transition-all duration-300"
              >
                <CardContent padding="md">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`rounded-lg p-2 ${stat.color}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <h3 className="text-gray-600 text-xs font-medium mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </p>
                  {stat.showProgress ? (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: stat.progressWidth }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {stat.caption}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">{stat.caption}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
              {loading ? (
                <div className="p-8 text-center text-gray-400 animate-pulse">
                  Loading recent activity...
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No recent activity yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
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
              )}
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
              {loading ? (
                <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ) : companyInfo ? (
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
                    <p className="text-xs text-gray-500 mt-1">
                      {companyInfo.mentorEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Role</p>
                    <p className="text-sm text-gray-700">
                      {companyInfo.jobTitle}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Address</p>
                    <p className="text-sm text-gray-700">
                      {companyInfo.address}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      companyInfo.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {companyInfo.status}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No company assigned yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
