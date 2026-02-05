import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  Plus,
  ImageIcon,
  MessageCircle,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import WeeklyLogModal from "../../components/WeeklyLogModal";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function StudentLogbook() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const { api } = useAuth();

  // FETCH DATA FROM BACKEND
  const fetchLogs = async () => {
    try {
      const res = await api.get("/student/logs");
      setEntries(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
      toast.error("Failed to load logbook entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleEntry = (id) => {
    setExpandedEntry(expandedEntry === id ? null : id);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const exportToPDF = () => {
    toast.info("PDF export feature coming soon!");
    // TODO: Implement PDF export functionality
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* 1. MODAL COMPONENT */}
      <WeeklyLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        refreshData={fetchLogs}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-purple-600" size={32} />
            My OJT Logbook
          </h1>
          <p className="text-gray-500 mt-1">
            Document your weekly OJT progress and receive Dean's feedback.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            <Plus size={18} className="mr-2" /> New Weekly Log
          </Button>
          <Button
            variant="outline"
            className="border-gray-300"
            onClick={exportToPDF}
          >
            <Download size={18} className="mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* 2. STATS SECTION */}
      <Card
        elevated
        className="bg-linear-to-r from-purple-50 to-white border-none shadow-sm"
      >
        <CardContent padding="lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <StatItem
              label="Total Weeks"
              value={entries.length}
              color="text-gray-900"
            />
            <StatItem
              label="Approved"
              value={entries.filter((e) => e.status === "approved").length}
              color="text-green-600"
            />
            <StatItem
              label="Pending Review"
              value={entries.filter((e) => e.status === "pending").length}
              color="text-amber-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. LOGBOOK ENTRIES */}
      <div className="space-y-4">
        {loading ? (
          <Card elevated className="border-none shadow-md">
            <CardContent>
              <div className="p-10 text-center animate-pulse text-gray-400">
                Loading logbook entries...
              </div>
            </CardContent>
          </Card>
        ) : entries.length === 0 ? (
          <Card elevated className="border-none shadow-md">
            <CardContent>
              <div className="p-10 text-center text-gray-500">
                <BookOpen className="mx-auto mb-4 text-gray-300" size={48} />
                <p className="text-lg font-medium">No entries yet</p>
                <p className="text-sm mt-2">
                  Click "New Weekly Log" to start documenting your journey.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <LogbookEntry
              key={entry._id}
              entry={entry}
              isExpanded={expandedEntry === entry._id}
              onToggle={() => toggleEntry(entry._id)}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Logbook Entry Component
const LogbookEntry = ({ entry, isExpanded, onToggle, formatDate }) => {
  const questions = [
    { label: "Duties and Responsibilities", key: "dutiesAndResponsibilities" },
    { label: "New Things Learned", key: "newThingsLearned" },
    { label: "Problems Encountered", key: "problemsEncountered" },
    { label: "Solutions Implemented", key: "solutionsImplemented" },
    {
      label: "Accomplishments and Deliverables",
      key: "accomplishmentsAndDeliverables",
    },
    { label: "Goals for Next Week", key: "goalsForNextWeek" },
  ];

  return (
    <Card
      elevated
      className="border-none shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div
        className="bg-linear-to-r from-purple-100 to-blue-50 px-6 py-4 cursor-pointer flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
            W{entry.weekNumber || "?"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Week {entry.weekNumber || "N/A"}
              {entry.weekStartDate && entry.weekEndDate && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({formatDate(entry.weekStartDate)} -{" "}
                  {formatDate(entry.weekEndDate)})
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Calendar size={12} />
              Submitted on {formatDate(entry.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={entry.status} />
          {isExpanded ? (
            <ChevronUp className="text-gray-600" size={24} />
          ) : (
            <ChevronDown className="text-gray-600" size={24} />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <CardContent className="p-6 bg-white">
          <div className="space-y-6">
            {questions.map((q, index) => (
              <div key={index} className="border-l-4 border-purple-300 pl-4">
                <h4 className="text-sm font-bold text-purple-800 mb-2">
                  {index + 1}. {q.label}
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {entry[q.key] || "No response provided"}
                </p>
              </div>
            ))}

            {/* Attachments */}
            {entry.attachments && entry.attachments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <ImageIcon size={16} className="text-purple-600" />
                  Attachments ({entry.attachments.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {entry.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={`http://localhost:5000${file.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 flex items-center gap-1"
                    >
                      <FileText size={14} />
                      {file.originalName}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Dean Feedback */}
            {entry.deanFeedback && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <MessageCircle size={16} />
                  Dean's Feedback
                </h4>
                <p className="text-sm text-blue-800">{entry.deanFeedback}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Sub-components for cleaner code
const StatItem = ({ label, value, color }) => (
  <div className="text-center sm:text-left">
    <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    approved: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    declined: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-tighter ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default StudentLogbook;
