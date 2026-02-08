import { useCallback, useEffect, useMemo, useState } from "react";
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

const categories = [
  "Timesheet",
  "Policy",
  "Attendance",
  "System Access",
  "Tasks",
];

const statusTokens = {
  open: {
    label: "Waiting on dean",
    className: "bg-amber-100 text-amber-700",
  },
  responded: {
    label: "Dean replied",
    className: "bg-sky-100 text-sky-700",
  },
};

const createBlankComposer = () => ({
  subject: "",
  category: categories[0],
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
  const { user, api } = useAuth();
  const [composer, setComposer] = useState(createBlankComposer);
  const [complaints, setComplaints] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const loadComplaints = useCallback(async () => {
    if (!api) return;
    setIsFetching(true);
    try {
      const response = await api.get("/complaints/mine");
      setComplaints(response.data?.complaints || []);
    } catch (error) {
      console.error("Unable to load complaints", error);
      toast.error("Unable to load complaints right now.");
    } finally {
      setIsFetching(false);
    }
  }, [api]);

  useEffect(() => {
    if (user?.role === "company") {
      loadComplaints();
    }
  }, [loadComplaints, user]);

  useEffect(() => {
    if (!complaints.length) {
      setSelectedComplaintId(null);
      return;
    }

    if (!selectedComplaintId) {
      setSelectedComplaintId(complaints[0]._id);
      return;
    }

    const stillExists = complaints.some(
      (complaint) => complaint._id === selectedComplaintId,
    );

    if (!stillExists) {
      setSelectedComplaintId(complaints[0]._id);
    }
  }, [complaints, selectedComplaintId]);

  const handleComposerChange = (field, value) => {
    setComposer((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!composer.subject.trim() || !composer.details.trim()) {
      toast.error("Please add a subject and describe the concern.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/complaints", {
        subject: composer.subject.trim(),
        details: composer.details.trim(),
        category: composer.category,
      });

      toast.success("Complaint submitted to the dean desk.");
      setComplaints((prev) => [response.data.complaint, ...prev]);
      setSelectedComplaintId(response.data.complaint._id);
      setComposer(createBlankComposer());
    } catch (error) {
      console.error("Submit complaint failed", error);
      const message =
        error.response?.data?.message || "Unable to submit complaint.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedComplaints = useMemo(() => {
    return [...complaints].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [complaints]);

  const selectedComplaint = useMemo(() => {
    if (!selectedComplaintId) return displayedComplaints[0] || null;
    return (
      displayedComplaints.find(
        (complaint) => complaint._id === selectedComplaintId,
      ) ||
      displayedComplaints[0] ||
      null
    );
  }, [displayedComplaints, selectedComplaintId]);

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
              <Button
                type="submit"
                className="flex items-center gap-2"
                isLoading={isSubmitting}
              >
                Submit complaint
                {!isSubmitting && <Send size={16} />}
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
          {isFetching && (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              Loading complaints...
            </div>
          )}

          {!isFetching && displayedComplaints.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No complaints yet. Submit one using the form above.
            </div>
          )}

          {!isFetching &&
            displayedComplaints.map((complaint) => {
              const token = statusTokens[complaint.status] || {
                label: complaint.status,
                className: "bg-slate-100 text-slate-600",
              };
              const firstMessage =
                complaint.messages?.[0]?.body || complaint.details;

              return (
                <button
                  type="button"
                  key={complaint._id}
                  onClick={() => setSelectedComplaintId(complaint._id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selectedComplaint?._id === complaint._id
                      ? "border-purple-500 bg-purple-50"
                      : "border-slate-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-slate-900">
                      {complaint.subject}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${token.className}`}
                    >
                      {token.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {complaint.category} • Logged{" "}
                    {formatDateTime(complaint.createdAt)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {firstMessage?.length > 140
                      ? `${firstMessage.slice(0, 140)}…`
                      : firstMessage}
                  </p>
                </button>
              );
            })}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-lg">
        {selectedComplaint ? (
          <>
            <CardHeader className="border-b border-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Complaint thread
                  </p>
                  <CardTitle className="mt-1 text-2xl">
                    {selectedComplaint.subject}
                  </CardTitle>
                  <CardDescription>
                    {selectedComplaint.category} • Opened{" "}
                    {formatDateTime(selectedComplaint.createdAt)}
                  </CardDescription>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Status</p>
                  <p className="font-semibold text-slate-700">
                    {statusTokens[selectedComplaint.status]?.label ||
                      selectedComplaint.status}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">
                  Dean desk replies
                </p>
                <p className="text-xs text-slate-500">
                  You&apos;ll see every message you and the dean exchange below.
                </p>
              </div>
              <div className="space-y-3">
                {selectedComplaint.messages?.map((message) => (
                  <div
                    key={message._id}
                    className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                      message.authorRole === "company"
                        ? "border-slate-200 bg-white"
                        : "border-indigo-100 bg-indigo-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {message.authorName}
                      </span>
                      <span>{formatDateTime(message.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-slate-800">{message.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent>
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              Submit a complaint to see the message history here.
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default ComplainToDean;
