import { useEffect, useMemo, useState } from "react";
import { Inbox, Send, StickyNote } from "lucide-react";
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

const statusPalette = {
  "awaiting-dean": {
    label: "Needs action",
    className: "bg-amber-100 text-amber-700",
  },
  "in-progress": {
    label: "In progress",
    className: "bg-blue-100 text-blue-700",
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
  const { user } = useAuth();
  const { threads, addMessage } = useComplaints();
  const [selectedThreadId, setSelectedThreadId] = useState(threads[0]?.id || null);
  const [deanNote, setDeanNote] = useState("");

  useEffect(() => {
    if (!threads.length) {
      setSelectedThreadId(null);
      return;
    }

    if (!selectedThreadId) {
      setSelectedThreadId(threads[0].id);
      return;
    }

    const exists = threads.some((thread) => thread.id === selectedThreadId);
    if (!exists) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, selectedThreadId]);

  const orderedThreads = useMemo(() => {
    return [...threads].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [threads]);

  const selectedThread = useMemo(() => {
    return orderedThreads.find((thread) => thread.id === selectedThreadId) || orderedThreads[0] || null;
  }, [orderedThreads, selectedThreadId]);

  const handleAcknowledge = (event) => {
    event.preventDefault();
    if (!selectedThread) return;

    const messageBody = deanNote.trim() || "Complaint acknowledged. We'll keep you posted.";

    addMessage(selectedThread.id, {
      authorRole: "dean",
      authorName: user?.name || "Dean",
      body: messageBody,
    });

    toast.success("Acknowledgement sent to the company.");
    setDeanNote("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]" style={{ fontFamily: "var(--logit-sans)" }}>
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox size={18} className="text-purple-600" />
            Incoming complaints
          </CardTitle>
          <CardDescription>Pick a thread to review and acknowledge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {orderedThreads.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No complaints have been submitted yet.
            </div>
          )}

          {orderedThreads.map((thread) => {
            const token = statusPalette[thread.status] || {
              label: thread.status,
              className: "bg-slate-100 text-slate-600",
            };

            return (
              <button
                type="button"
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  selectedThread?.id === thread.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-slate-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                  <span>{thread.subject}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${token.className}`}>
                    {token.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {thread.company?.name} • Logged {formatDateTime(thread.createdAt)}
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div>
        {selectedThread ? (
          <Card className="border-slate-200 shadow-2xl">
            <CardHeader className="border-b border-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Complaint</p>
                  <CardTitle className="text-2xl mt-1">{selectedThread.subject}</CardTitle>
                  <CardDescription>
                    {selectedThread.company?.name} • {selectedThread.category}
                  </CardDescription>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>Created {formatDateTime(selectedThread.createdAt)}</p>
                  <p>Updated {formatDateTime(selectedThread.updatedAt)}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Company contact</p>
                <p>{selectedThread.company?.contact}</p>
                <p className="text-xs text-slate-500">{selectedThread.company?.email}</p>
              </div>

              <div className="space-y-3">
                {selectedThread.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                      message.authorRole === "company"
                        ? "border-slate-200 bg-white"
                        : "border-indigo-100 bg-indigo-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{message.authorName}</span>
                      <span>{formatDateTime(message.timestamp)}</span>
                    </div>
                    <p className="mt-2 text-slate-800">{message.body}</p>
                    {message.attachments?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        {message.attachments.map((file) => (
                          <span
                            key={file.name}
                            className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2 py-1"
                          >
                            <StickyNote size={12} /> {file.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAcknowledge} className="rounded-2xl border border-slate-200 p-4">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Dean note (optional)</label>
                <textarea
                  rows={4}
                  value={deanNote}
                  onChange={(event) => setDeanNote(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  placeholder="Acknowledge the complaint or request quick clarifications."
                />
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>The company receives this reply as an acknowledgement.</span>
                  <Button type="submit" className="flex items-center gap-2">
                    Send acknowledgement
                    <Send size={16} />
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


