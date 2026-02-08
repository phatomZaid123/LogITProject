import { useCallback, useEffect, useMemo, useState } from "react";
import { Inbox, Send } from "lucide-react";
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

const statusPalette = {
  open: {
    label: "Needs action",
    className: "bg-amber-100 text-amber-700",
  },
  responded: {
    label: "Dean replied",
    className: "bg-sky-100 text-sky-700",
  },
};

const formatDateTime = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

function CompanyComplains() {
  const { user, api } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [deanNote, setDeanNote] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const loadComplaints = useCallback(async () => {
    if (!api) return;
    setIsFetching(true);
    try {
      const response = await api.get("/complaints");
      setComplaints(response.data?.complaints || []);
    } catch (error) {
      console.error("Unable to fetch complaints", error);
      toast.error("Unable to load complaints right now.");
    } finally {
      setIsFetching(false);
    }
  }, [api]);

  useEffect(() => {
    if (user?.role === "dean") {
      loadComplaints();
    }
  }, [loadComplaints, user]);

  const orderedComplaints = useMemo(() => {
    return [...complaints].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [complaints]);

  useEffect(() => {
    if (!orderedComplaints.length) {
      setSelectedComplaintId(null);
      return;
    }

    if (!selectedComplaintId) {
      setSelectedComplaintId(orderedComplaints[0]._id);
      return;
    }

    const stillExists = orderedComplaints.some(
      (complaint) => complaint._id === selectedComplaintId,
    );

    if (!stillExists) {
      setSelectedComplaintId(orderedComplaints[0]._id);
    }
  }, [orderedComplaints, selectedComplaintId]);

  const selectedComplaint = useMemo(() => {
    if (!selectedComplaintId) return orderedComplaints[0] || null;
    return (
      orderedComplaints.find(
        (complaint) => complaint._id === selectedComplaintId,
      ) ||
      orderedComplaints[0] ||
      null
    );
  }, [orderedComplaints, selectedComplaintId]);

  const handleAcknowledge = async (event) => {
    event.preventDefault();
    if (!selectedComplaint) return;

    const messageBody =
      deanNote.trim() || "Complaint acknowledged. We'll keep you posted.";

    setIsReplying(true);
    try {
      await api.post(`/complaints/${selectedComplaint._id}/reply`, {
        body: messageBody,
      });
      toast.success("Acknowledgement sent to the company.");
      setDeanNote("");
      await loadComplaints();
    } catch (error) {
      console.error("Reply to complaint failed", error);
      const message = error.response?.data?.message || "Unable to send reply.";
      toast.error(message);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div
      className="grid gap-6 lg:grid-cols-[320px_1fr]"
      style={{ fontFamily: "var(--logit-sans)" }}
    >
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox size={18} className="text-purple-600" />
            Incoming complaints
          </CardTitle>
          <CardDescription>
            Pick a thread to review and acknowledge.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isFetching && (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              Loading complaints...
            </div>
          )}

          {!isFetching && orderedComplaints.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No complaints have been submitted yet.
            </div>
          )}

          {!isFetching &&
            orderedComplaints.map((complaint) => {
              const token = statusPalette[complaint.status] || {
                label: complaint.status,
                className: "bg-slate-100 text-slate-600",
              };

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
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                    <span>{complaint.subject}</span>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${token.className}`}
                    >
                      {token.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {complaint.companyName} • Logged{" "}
                    {formatDateTime(complaint.createdAt)}
                  </p>
                </button>
              );
            })}
        </CardContent>
      </Card>

      <div>
        {selectedComplaint ? (
          <Card className="border-slate-200 shadow-2xl">
            <CardHeader className="border-b border-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Complaint
                  </p>
                  <CardTitle className="mt-1 text-2xl">
                    {selectedComplaint.subject}
                  </CardTitle>
                  <CardDescription>
                    {selectedComplaint.companyName} •{" "}
                    {selectedComplaint.category}
                  </CardDescription>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Created {formatDateTime(selectedComplaint.createdAt)}</p>
                  <p>Updated {formatDateTime(selectedComplaint.updatedAt)}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Company contact</p>
                <p>{selectedComplaint.companyContactName}</p>
                <p className="text-xs text-slate-500">
                  {selectedComplaint.companyEmail}
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

              <form
                onSubmit={handleAcknowledge}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Dean note (optional)
                </label>
                <textarea
                  rows={4}
                  value={deanNote}
                  onChange={(event) => setDeanNote(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  placeholder="Acknowledge the complaint or request quick clarifications."
                />
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    The company receives this reply as an acknowledgement.
                  </span>
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    isLoading={isReplying}
                  >
                    Send acknowledgement
                    {!isReplying && <Send size={16} />}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
            Select a complaint from the list to review it.
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyComplains;
