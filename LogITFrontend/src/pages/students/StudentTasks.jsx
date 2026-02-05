import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  Paperclip,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const statusStyles = {
  assigned: {
    label: "Assigned",
    pill: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  "in-progress": {
    label: "In progress",
    pill: "bg-blue-50 text-blue-700 border border-blue-100",
  },
  submitted: {
    label: "Submitted",
    pill: "bg-amber-50 text-amber-700 border border-amber-100",
  },
  completed: {
    label: "Completed",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  },
};

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Assigned", value: "assigned" },
  { label: "In Progress", value: "in-progress" },
  { label: "Submitted", value: "submitted" },
  { label: "Completed", value: "completed" },
];

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = parseDate(value);
  if (!date) return "No date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDueInsight = (value, status) => {
  if (status === "completed") {
    return { label: "Delivered", tone: "text-emerald-600" };
  }

  const date = parseDate(value);
  if (!date) return { label: "No due date", tone: "text-gray-500" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)} day(s) overdue`, tone: "text-red-600" };
  }
  if (diffDays === 0) {
    return { label: "Due today", tone: "text-amber-600" };
  }
  if (diffDays === 1) {
    return { label: "Due tomorrow", tone: "text-blue-600" };
  }
  return { label: `Due in ${diffDays} days`, tone: "text-blue-600" };
};

function StudentTasks() {
  const { api } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/student/tasks");
      setTasks(response.data?.tasks || []);
    } catch (error) {
      console.error("Student task fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const summary = useMemo(() => {
    const counters = tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;

        const due = parseDate(task.dueDate);
        if (due && task.status !== "completed") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const weekAhead = new Date(today);
          weekAhead.setDate(weekAhead.getDate() + 7);
          if (due < today) acc.overdue += 1;
          else if (due <= weekAhead) acc.dueSoon += 1;
        }
        return acc;
      },
      { overdue: 0, dueSoon: 0 },
    );

    return {
      total: tasks.length,
      active: tasks.filter((task) => task.status !== "completed").length,
      completed: counters.completed || 0,
      overdue: counters.overdue,
      dueSoon: counters.dueSoon,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      const haystack = `${task.title} ${task.created_by_company?.name || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(search.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tasks, statusFilter, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-purple-400 font-semibold">
            Student Taskline
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Assigned Tasks
          </h1>
          <p className="text-gray-600 max-w-2xl mt-2">
            Every assignment you receive from your company supervisor lands here. Track due dates, resources, and progress in one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={fetchTasks}
            className="border-blue-200 text-blue-700"
            disabled={loading}
          >
            <RefreshCcw size={18} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-purple-600 to-indigo-600 text-white border-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total tasks</p>
              <p className="text-3xl font-bold mt-1">{summary.total}</p>
            </div>
            <ClipboardList size={36} className="opacity-80" />
          </CardContent>
        </Card>
        <Card className="bg-linear-to-br from-blue-500 to-cyan-500 text-white border-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">Active now</p>
              <p className="text-3xl font-bold mt-1">{summary.active}</p>
            </div>
            <Clock size={36} className="opacity-80" />
          </CardContent>
        </Card>
        <Card className="bg-linear-to-br from-amber-500 to-orange-500 text-white border-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Due soon</p>
              <p className="text-3xl font-bold mt-1">{summary.dueSoon}</p>
            </div>
            <Calendar size={36} className="opacity-80" />
          </CardContent>
        </Card>
        <Card className="bg-linear-to-br from-emerald-500 to-teal-500 text-white border-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Completed</p>
              <p className="text-3xl font-bold mt-1">{summary.completed}</p>
            </div>
            <CheckCircle2 size={36} className="opacity-80" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-100">
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or company"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const isActive = option.value === statusFilter;
              return (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    isActive
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <Card className="border-dashed border-purple-200">
            <CardContent className="flex items-center justify-center py-12 text-gray-500 gap-3">
              <Loader2 className="animate-spin" size={24} />
              Syncing with your supervisor...
            </CardContent>
          </Card>
        ) : filteredTasks.length === 0 ? (
          <Card className="border-dashed border-gray-200">
            <CardContent className="text-center py-12 space-y-2">
              <p className="text-lg font-semibold text-gray-800">
                No tasks to show.
              </p>
              <p className="text-sm text-gray-500">
                You’re all caught up, or your company hasn’t assigned anything yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const status = statusStyles[task.status] || statusStyles.assigned;
            const due = getDueInsight(task.dueDate, task.status);
            return (
              <Card key={task._id} elevated className="border border-gray-100">
                <CardContent className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                        {task.created_by_company?.name || "Company Supervisor"}
                      </p>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {task.title}
                      </h3>
                      <p className="text-gray-600 max-w-3xl">{task.description}</p>
                    </div>

                    <div className="text-right space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Due</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(task.dueDate)}
                      </p>
                      <p className={`text-sm font-medium ${due.tone}`}>{due.label}</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${status.pill}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {task.companyAttachments?.length > 0 && (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-3 flex flex-wrap gap-3 text-sm">
                      {task.companyAttachments.map((file, idx) => (
                        <a
                          key={`${task._id}-attachment-${idx}`}
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 font-medium hover:underline"
                        >
                          <Paperclip size={14} />
                          {file.originalName || `Resource ${idx + 1}`}
                          <ExternalLink size={14} />
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} /> Assigned {formatDate(task.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} /> Due {formatDate(task.dueDate)}
                    </div>
                    {task.created_by_company?.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} /> {task.created_by_company.email}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default StudentTasks;
