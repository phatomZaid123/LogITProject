import { useMemo, useState } from "react";
import { ClipboardList, Send } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { useComplaints } from "../../context/ComplaintsContext";

const categories = [
  "Timesheet",
  "Policy",
  "Attendance",
  "System Access",
  "Tasks",
];

const statusTokens = {
  "awaiting-dean": {
    label: "Waiting on dean",
    className: "bg-amber-100 text-amber-700",
  },
  "awaiting-company": {
    label: "Dean replied",
    className: "bg-sky-100 text-sky-700",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-100 text-emerald-700",
  },
};

const createBlankComposer = () => ({
  subject: "",
  category: categories[0],
  priority: "medium",
  details: "",
});

const formatDateTime = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

function ComplainToDean() {
  const { user } = useAuth();
  const { threads, createComplaint } = useComplaints();
  const [composer, setComposer] = useState(createBlankComposer);

  const companyThreads = useMemo(() => {
    if (user?.role !== "company") return threads;
    return threads.filter((thread) => {
      if (!user) return true;
      return (
        thread.company?.id === user?._id ||
        thread.company?.name === user?.company_name ||
        thread.company?.email === user?.email
      );
    });
  }, [threads, user]);

  const handleComposerChange = (field, value) => {
    setComposer((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!composer.subject.trim() || !composer.details.trim()) {
      toast.error("Please add a subject and describe the concern.");
      return;
    }

    const companyInfo = {
      id: user?._id || "company-draft",
      name: user?.company_name || user?.name || "Company",
      contact: user?.name || user?.company_name || "Company Representative",
      email: user?.email,
    };

    createComplaint({
      subject: composer.subject.trim(),
      details: composer.details.trim(),
      category: composer.category,
      priority: composer.priority,
      channel: "Portal",
      company: companyInfo,
    });

    toast.success("Complaint submitted to the dean desk.");
    setComposer(createBlankComposer());
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--logit-sans)" }}>
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList size={18} className="text-purple-600" />
            Log a complaint
          </CardTitle>
          <CardDescription>
            Share the issue and the dean will acknowledge it shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Subject
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                placeholder="e.g., Timesheet approvals stuck"
                value={composer.subject}
                onChange={(event) =>
                  handleComposerChange("subject", event.target.value)
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Category
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  value={composer.category}
                  onChange={(event) =>
                    handleComposerChange("category", event.target.value)
                  }
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  Priority
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  value={composer.priority}
                  onChange={(event) =>
                    handleComposerChange("priority", event.target.value)
                  }
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Details
              </label>
              <textarea
                rows={5}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                placeholder="Share what happened, who is affected, and when it started."
                value={composer.details}
                onChange={(event) =>
                  handleComposerChange("details", event.target.value)
                }
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>The dean office receives an email instantly.</span>
              <Button type="submit" className="flex items-center gap-2">
                Submit complaint
                <Send size={16} />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Submitted complaints</CardTitle>
          <CardDescription>
            Track every concern you have already raised.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {companyThreads.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No complaints yet. Submit one using the form above.
            </div>
          )}

          {companyThreads.map((thread) => {
            const token = statusTokens[thread.status] || {
              label: thread.status,
              className: "bg-slate-100 text-slate-600",
            };
            const firstMessage = thread.messages?.[0]?.body || "";

            return (
              <div
                key={thread.id}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-900">
                    {thread.subject}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-medium ${token.className}`}
                  >
                    {token.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {thread.category} • Logged {formatDateTime(thread.createdAt)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {firstMessage.length > 140
                    ? `${firstMessage.slice(0, 140)}…`
                    : firstMessage}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default ComplainToDean;
