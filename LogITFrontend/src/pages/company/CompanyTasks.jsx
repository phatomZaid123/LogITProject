import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
} from "lucide-react";
import AssignTaskModal from "../../components/AssignTaskModal";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const statusMeta = {
  assigned: {
    label: "Assigned",
    pill: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  "in-progress": {
    label: "In Progress",
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

const formatDueDate = (date) => {
  if (!date) return "No deadline";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "No deadline";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDueMood = (task) => {
  if (task.status === "completed") {
    return { label: "Delivered", tone: "text-emerald-600" };
  }
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) {
    return { label: "No due date", tone: "text-gray-500" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

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

function CompanyTasks() {
  const { api } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [assigningTask, setAssigningTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [taskRes, studentRes] = await Promise.all([
        api.get("/company/tasks"),
        api.get("/company/assignedInterns"),
      ]);

      setTasks(taskRes.data?.tasks || []);
      setStudents(studentRes.data || []);
    } catch (error) {
      console.error("Company task fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const summary = useMemo(() => {
    const now = new Date();
    const weekAhead = new Date();
    weekAhead.setDate(now.getDate() + 7);

    const counts = tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;

        const due = new Date(task.dueDate);
        if (!Number.isNaN(due.getTime()) && task.status !== "completed") {
          if (due < now) acc.overdue += 1;
          else if (due <= weekAhead) acc.dueThisWeek += 1;
        }
        return acc;
      },
      { overdue: 0, dueThisWeek: 0 },
    );

    return {
      total: tasks.length,
      completed: counts.completed || 0,
      dueThisWeek: counts.dueThisWeek || 0,
      overdue: counts.overdue || 0,
      breakdown: counts,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      const haystack = `${task.title} ${task.assigned_to?.name || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(search.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tasks, statusFilter, search]);

  const handleAssignTask = async (payload) => {
    setAssigningTask(true);
    try {
      const response = await api.post("/company/tasks", {
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate,
        studentId: payload.studentId,
        resourceLink: payload.resourceLink || undefined,
      });

      setTasks((prev) => [response.data.task, ...prev]);
      toast.success("Task assigned");
      setOpenModal(false);
    } catch (error) {
      console.error("Assign task error:", error);
      toast.error(error.response?.data?.message || "Failed to assign task");
    } finally {
      setAssigningTask(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    setUpdatingTaskId(taskId);
    try {
      const response = await api.patch(`/company/tasks/${taskId}/status`, {
        status,
      });
      setTasks((prev) =>
        prev.map((task) => (task._id === taskId ? response.data.task : task)),
      );
      toast.success("Status updated");
    } catch (error) {
      console.error("Update task status error:", error);
      toast.error(error.response?.data?.message || "Failed to update task");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-purple-400 font-semibold">
            Company HQ
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Task Orchestration
          </h1>
          <p className="text-gray-500 mt-2 max-w-xl">
            Assign, monitor, and celebrate student deliverables with a single command center.
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
          <Button variant="primary" onClick={() => setOpenModal(true)}>
            <Plus size={18} className="mr-2" />
            Assign Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-linear-to-br from-indigo-500 to-purple-600 text-white border-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Tasks</p>
              <p className="text-3xl font-bold mt-1">{summary.total}</p>
            </div>
            <ClipboardList size={36} className="opacity-80" />
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-blue-500 to-cyan-500 text-white border-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">Due this week</p>
              <p className="text-3xl font-bold mt-1">{summary.dueThisWeek}</p>
            </div>
            <Calendar size={36} className="opacity-80" />
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-amber-500 to-orange-500 text-white border-none">
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Overdue</p>
              <p className="text-3xl font-bold mt-1">{summary.overdue}</p>
            </div>
            <AlertTriangle size={36} className="opacity-80" />
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
                placeholder="Search by title or student"
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
                  {option.value !== "all" && (
                    <span className="ml-2 text-xs">
                      {summary.breakdown[option.value] || 0}
                    </span>
                  )}
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
              Fetching the latest tasks...
            </CardContent>
          </Card>
        ) : filteredTasks.length === 0 ? (
          <Card className="border-dashed border-gray-200">
            <CardContent className="text-center py-12">
              <p className="text-lg font-semibold text-gray-700">
                No tasks match this view.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Try a different status filter or assign a new task to get the momentum going.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const mood = getDueMood(task);
            const resource = task.companyAttachments?.[0]?.fileUrl;
            const statusStyles = statusMeta[task.status] || statusMeta.assigned;

            return (
              <Card key={task._id} elevated className="border border-gray-100">
                <CardContent className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                        {task.assigned_to?.student_admission_number || "Intern"}
                      </p>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {task.title}
                      </h3>
                      <p className="text-gray-600 max-w-2xl">{task.description}</p>
                      <p className="text-sm text-gray-500">
                        Assigned to <span className="text-gray-900 font-medium">{task.assigned_to?.name}</span>
                      </p>
                      {resource && (
                        <a
                          href={resource}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-sm text-purple-600 font-medium hover:underline"
                        >
                          View resource pack
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 ml-1"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5H21m0 0v7.5m0-7.5L10.5 15"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 6.75H3.75v13.5h13.5v-4.5"
                            />
                          </svg>
                        </a>
                      )}
                    </div>

                    <div className="text-right space-y-2">
                      <p className="text-xs text-gray-500">Due date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDueDate(task.dueDate)}
                      </p>
                      <p className={`text-sm font-medium ${mood.tone}`}>{mood.label}</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles.pill}`}>
                        {statusStyles.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="text-sm text-gray-500">
                      Created on {formatDueDate(task.createdAt)}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 font-medium">
                        Update status
                      </label>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        disabled={updatingTaskId === task._id}
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {filterOptions
                          .filter((option) => option.value !== "all")
                          .map((option) => (
                            <option key={option.value} value={option.value}>
                              {statusMeta[option.value]?.label || option.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <AssignTaskModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        students={students}
        onSubmit={handleAssignTask}
        submitting={assigningTask}
      />
    </div>
  );
}

export default CompanyTasks;
