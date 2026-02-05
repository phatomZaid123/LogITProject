import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  Bell,
  Calendar,
  ClipboardList,
  Clock,
  LineChart,
  RefreshCcw,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};


const getRelativeTime = (value) => {
  const date = parseDate(value);
  if (!date) return "Unknown";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getStatusBadge = (progress) => {
  if (progress >= 85)
    return { label: "Excellent", styles: "bg-emerald-100 text-emerald-700" };
  if (progress >= 65)
    return { label: "On Track", styles: "bg-blue-100 text-blue-700" };
  return { label: "Needs Attention", styles: "bg-amber-100 text-amber-700" };
};

function CompanyHome() {
  const { api } = useAuth();
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, taskRes, pendingRes] = await Promise.all([
        api.get("/company/assignedInterns"),
        api.get("/company/tasks"),
        api.get("/company/pending-approvals"),
      ]);
      setStudents(studentsRes.data || []);
      setTasks(taskRes.data?.tasks || []);
      setPending(pendingRes.data || []);
    } catch (error) {
      console.error("Company dashboard fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const taskCountByStudent = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const studentId = task.assigned_to?._id?.toString();
      if (!studentId) return acc;
      acc[studentId] = (acc[studentId] || 0) + 1;
      return acc;
    }, {});
  }, [tasks]);

  const summary = useMemo(() => {
    const totalStudents = students.length;
    const totalTasks = tasks.length;
    const hoursTracked = students.reduce(
      (sum, student) => sum + (student.ojt_hours_completed || 0),
      0,
    );
    const avgProgress = totalStudents
      ? Math.round(
          (students.reduce((sum, student) => {
            const required = student.ojt_hours_required || 500;
            const completed = student.ojt_hours_completed || 0;
            return sum + (completed / required) * 100;
          }, 0) /
            totalStudents) *
            10,
        ) / 10
      : 0;
    const pendingCount = pending.length;
    const dueSoon = tasks.filter((task) => {
      const due = parseDate(task.dueDate);
      if (!due || task.status === "completed") return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAhead = new Date(today);
      weekAhead.setDate(weekAhead.getDate() + 7);
      return due >= today && due <= weekAhead;
    }).length;

    return {
      totalStudents,
      totalTasks,
      hoursTracked,
      avgProgress: Number.isFinite(avgProgress) ? avgProgress : 0,
      pendingCount,
      dueSoon,
    };
  }, [students, tasks, pending]);

  const recentActivity = useMemo(() => {
    return tasks
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((task) => ({
        title: task.title,
        student: task.assigned_to?.name || "Intern",
        status: task.status,
        timestamp: getRelativeTime(task.createdAt),
      }));
  }, [tasks]);

  const statCards = [
    {
      title: "Assigned Interns",
      value: summary.totalStudents,
      subtext: `${summary.avgProgress}% avg progress`,
      icon: Users,
      gradient: "from-sky-500 to-blue-600",
    },
    {
      title: "Tasks Assigned",
      value: summary.totalTasks,
      subtext: `${summary.dueSoon} due this week`,
      icon: ClipboardList,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      title: "Approved Hours",
      value: `${summary.hoursTracked.toFixed(1)}h`,
      subtext: "Dean-approved to date",
      icon: Clock,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Pending Reviews",
      value: summary.pendingCount,
      subtext: "Awaiting company approval",
      icon: Bell,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="space-y-8 p-6 bg-linear-to-b from-gray-50 via-white to-blue-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-purple-400 font-semibold">
            Company Mission Control
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            OJT Performance Dashboard
          </h1>
          <p className="text-gray-600 max-w-2xl mt-2">
            Get a live snapshot of every intern, their approved hours, pending submissions, and the tasks driving their outcomes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={fetchDashboard}
            className="border-blue-200 text-blue-700"
            disabled={loading}
          >
            <RefreshCcw size={18} className="mr-2" />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => (window.location.href = "/company/tasks")}> 
            Assign Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-none shadow-lg overflow-hidden">
              <CardContent className={`bg-linear-to-br ${card.gradient} text-white p-6`}> 
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/70">{card.title}</p>
                    <p className="text-3xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-white/80 mt-1">{card.subtext}</p>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <Icon size={28} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card elevated>
            <CardHeader withBorder>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Intern Progress Monitor</CardTitle>
                  <CardDescription>Dean-approved hours versus requirements</CardDescription>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                  <LineChart size={16} />
                  Live data
                </div>
              </div>
            </CardHeader>
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">Student</th>
                      <th className="px-6 py-3 text-left">Progress</th>
                      <th className="px-6 py-3 text-left">Approved Hours</th>
                      <th className="px-6 py-3 text-left">Tasks</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                          Fetching students...
                        </td>
                      </tr>
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                          No interns are assigned to your company yet.
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => {
                        const required = student.ojt_hours_required || 500;
                        const completed = student.ojt_hours_completed || 0;
                        const progress = Math.min(
                          100,
                          Math.round((completed / required) * 100) || 0,
                        );
                        const badge = getStatusBadge(progress);
                        const taskCount = taskCountByStudent[student._id?.toString()] || 0;

                        return (
                          <tr key={student._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">{student.name}</div>
                              <p className="text-xs text-gray-500">
                                {student.student_course || "Program"}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-28 bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-linear-to-r from-blue-500 to-purple-500 h-2"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span>{progress}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-900 font-medium">
                                {completed.toFixed(1)}h
                              </div>
                              <p className="text-xs text-gray-500">
                                {required}h required
                              </p>
                            </td>
                            <td className="px-6 py-4">{taskCount}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.styles}`}>
                                {badge.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card elevated>
            <CardHeader withBorder>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Students awaiting company review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-gray-500">Loading queue...</p>
              ) : pending.length === 0 ? (
                <p className="text-sm text-gray-500">Nothing pending. Nice work!</p>
              ) : (
                pending.map((item) => (
                  <div
                    key={item._id}
                    className="border border-gray-200 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.email}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-600">
                      {item.submittedCount} entries
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card elevated>
            <CardHeader withBorder>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Bell size={18} /> Recent Activity
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-gray-500">Gathering updates...</p>
              ) : recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500">No task activity just yet.</p>
              ) : (
                recentActivity.map((activity, idx) => (
                  <div key={`${activity.title}-${idx}`} className="border-b pb-2 last:border-0">
                    <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {activity.student} • {activity.status.replace("-", " ")}
                    </p>
                    <p className="text-xs text-gray-400">{activity.timestamp}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CompanyHome;
