import { useEffect, useMemo, useState } from "react";
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
  CheckCircle2,
  FileText,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function StudentHome() {
  const { api, user } = useAuth();
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
    const tasks = dashboard?.stats?.tasks;
    const hoursPercent = Number(hours?.percent || 0);

    return [
      {
        title: "Total Hours",
        value: hours ? `${hours.total.toFixed(1)}h` : "0.0h",
        percent: `${Math.min(100, hoursPercent).toFixed(0)}%`,
        icon: Clock,
        color: "bg-blue-100 text-blue-600",
      },
      {
        title: "Approved Entries",
        value: logs ? String(logs.approved) : "0",
        percent:
          logs && logs.approved + (logs.pending || 0) > 0
            ? `${Math.round(
                (logs.approved / (logs.approved + (logs.pending || 0))) * 100,
              )}%`
            : "0%",
        icon: CheckCircle2,
        color: "bg-green-100 text-green-600",
      },
      {
        title: "Pending Approval",
        value: String(dashboard?.stats?.pendingApprovals || 0),
        percent: "In review",
        icon: AlertCircle,
        color: "bg-amber-100 text-amber-600",
      },
      {
        title: "Tasks Completed",
        value: tasks ? String(tasks.completed) : "0",
        percent: tasks && tasks.completed > 0 ? "100%" : "0%",
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

  const upcomingDeadlines = useMemo(
    () => dashboard?.upcomingDeadlines || [],
    [dashboard],
  );

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} elevated className="animate-pulse">
              <CardContent padding="lg">
                <div className="h-24 bg-gray-200 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

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

          {/* Upcoming Deadlines */}
          <Card elevated>
            <CardHeader withBorder>
              <CardTitle variant="h4">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent padding="lg">
              {loading ? (
                <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ) : upcomingDeadlines.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No upcoming deadlines.
                </div>
              ) : (
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
                        <span
                          className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${
                            deadline.priority === "high"
                              ? "bg-rose-100 text-rose-700"
                              : deadline.priority === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {deadline.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">
                        {new Date(deadline.dueDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  ))}
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
