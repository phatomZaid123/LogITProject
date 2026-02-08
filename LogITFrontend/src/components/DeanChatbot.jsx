import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, SendHorizontal, User, X } from "lucide-react";
import Button from "./ui/Button";
import { useAuth } from "../context/AuthContext";

const buildStudentSummary = (details) => {
  const hours = Number(details.hours || 0);
  const logs = Number(details.logs || 0);
  let performance = "Needs attention";

  if (hours >= 400) {
    performance = "Excellent progress";
  } else if (hours >= 250) {
    performance = "On track";
  } else if (hours >= 120) {
    performance = "Progressing";
  }

  return (
    `Student Summary\n` +
    `Name: ${details.name}\n` +
    `Admission No.: ${details.admission}\n` +
    `Course: ${details.course}\n` +
    `Assigned Company: ${details.company}\n` +
    `Approved Hours: ${details.hours}\n` +
    `Logs Submitted: ${details.logs}\n` +
    `Performance: ${performance}\n` +
    `Insight: ${details.name} is ${performance.toLowerCase()} with ${hours} approved hours and ${logs} log submissions.`
  );
};

const buildCompanySummary = (companyName, studentRows, stats) => {
  if (!studentRows.length) {
    return (
      `Company Summary\n` +
      `Company: ${companyName}\n` +
      `Please share the student list with approved hours and log counts so I can summarize performance.`
    );
  }

  const hours = studentRows
    .map((row) => row.hours)
    .filter((value) => Number.isFinite(value));

  const totalHours = hours.reduce((sum, value) => sum + value, 0);
  const averageHours = hours.length ? Math.round(totalHours / hours.length) : 0;
  const logs = studentRows
    .map((row) => row.logs)
    .filter((value) => Number.isFinite(value));
  const totalLogs = logs.reduce((sum, value) => sum + value, 0);
  const averageLogs = logs.length ? Math.round(totalLogs / logs.length) : 0;

  const statsLines = stats
    ? [
        `Total Students: ${stats.totalStudents}`,
        `Completed: ${stats.completedStudents}`,
        `In Progress: ${stats.inProgressStudents}`,
        `Total Hours Logged: ${stats.totalHoursLogged}`,
        `Average Progress: ${stats.averageProgress}%`,
      ]
    : [];

  return (
    `Company Summary\n` +
    `Company: ${companyName}\n` +
    `Assigned Students: ${studentRows.length}\n` +
    `Average Approved Hours: ${averageHours}\n` +
    `Average Logs Submitted: ${averageLogs}` +
    (statsLines.length ? `\n${statsLines.join("\n")}` : "") +
    `\nStudent Performance:\n` +
    studentRows
      .map(
        (row) =>
          `• ${row.name} — ${row.hours}h, ${row.logs} logs (${row.status})`,
      )
      .join("\n")
  );
};

const parseValue = (message, label) => {
  const pattern = new RegExp(`${label}\\s*[:=-]\\s*([^,\n;]+)`, "i");
  const match = message.match(pattern);
  return match ? match[1].trim() : "";
};

const extractQuotedValue = (message) => {
  const quoteMatch = message.match(/"([^"]+)"|'([^']+)'/);
  return quoteMatch ? (quoteMatch[1] || quoteMatch[2]).trim() : "";
};

const extractStudentName = (message) => {
  const quoted = extractQuotedValue(message);
  if (quoted) return quoted;
  const byKey =
    parseValue(message, "student name") ||
    parseValue(message, "student") ||
    parseValue(message, "name");
  if (byKey) return byKey;
  const summaryMatch = message.match(/summary of\s+student\s+(.+)/i);
  return summaryMatch ? summaryMatch[1].trim() : "";
};

const extractCompanyName = (message) => {
  const quoted = extractQuotedValue(message);
  if (quoted) return quoted;
  const byKey =
    parseValue(message, "company name") || parseValue(message, "company");
  if (byKey) return byKey;
  const summaryMatch = message.match(/summary of\s+company\s+(.+)/i);
  return summaryMatch ? summaryMatch[1].trim() : "";
};

const parseStudentsList = (message) => {
  const listPattern = /students?\s*[:=-]\s*([\s\S]+)/i;
  const match = message.match(listPattern);
  if (!match) return [];

  return match[1]
    .split(/\n|;/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [namePart, hoursPart] = row.split(/-|—/).map((part) => part.trim());
      const hoursMatch = (hoursPart || row).match(/(\d+)\s*h/i);
      const logsMatch = (hoursPart || row).match(/(\d+)\s*logs?/i);
      const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
      const logs = logsMatch ? Number(logsMatch[1]) : 0;

      let status = "Needs attention";
      if (hours >= 400) {
        status = "Excellent";
      } else if (hours >= 250) {
        status = "On track";
      } else if (hours >= 120) {
        status = "Progressing";
      }

      return {
        name: namePart || row,
        hours,
        logs,
        status,
      };
    });
};

const getAssistantReply = (message) => {
  const text = message.toLowerCase();
  const keywordHit =
    /(summary|summaries|report|details|performance|hours|logs)/i.test(message);
  const isStudent = /\bstudent\b/.test(text) || /student name/.test(text);
  const isCompany = /\bcompany\b/.test(text) || /company name/.test(text);

  if (isStudent || (keywordHit && /student/i.test(message))) {
    const name = extractStudentName(message);
    if (!name) {
      return (
        `Please provide a student name. You can quote it.\n` +
        `Example: give me summary of student name "Zaid Mustapha".`
      );
    }
    return `Looking up student details for ${name}...`;
  }

  if (isCompany || (keywordHit && /company/i.test(message))) {
    const companyName = extractCompanyName(message);
    if (!companyName) {
      return (
        `Please share the company name. You can quote it too.\n` +
        `Example: give me company summary of "LogIT".`
      );
    }
    return `Looking up company details for ${companyName}...`;
  }

  return (
    `I can generate summaries for students or companies.\n` +
    `Try: give me summary of student name "Zaid Mustapha".\n` +
    `Or: give me company summary of "LogIT".`
  );
};

const DeanChatbot = ({ isOpen, onClose }) => {
  const { api } = useAuth();
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "assistant",
      text: "Hi Dean! Ask for a student or company summary and I will fetch the details for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  const studentsCacheRef = useRef(null);
  const companiesCacheRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const quickPrompts = useMemo(
    () => [
      'Give me summary of student name "Zaid Mustapha"',
      'Give me company summary of "LogIT"',
      "Show me student performance for Zaid Mustapha",
      "Company details for LogIT",
    ],
    [],
  );

  if (!isOpen) return null;

  const resolveStudentSummary = async (name) => {
    if (!studentsCacheRef.current) {
      const res = await api.get("/dean/getAllStudents");
      studentsCacheRef.current = res.data?.students || [];
    }

    const normalized = name.toLowerCase();
    const matches = studentsCacheRef.current.filter((student) =>
      student.name?.toLowerCase().includes(normalized),
    );

    if (!matches.length) {
      return `No student found for "${name}". Try the full name or admission number.`;
    }

    if (matches.length > 1) {
      return (
        `I found multiple students for "${name}":\n` +
        matches
          .slice(0, 5)
          .map(
            (student) =>
              `• ${student.name} (${student.student_admission_number || "N/A"})`,
          )
          .join("\n") +
        "\nPlease specify which one you mean or include the admission number."
      );
    }

    const studentId = matches[0]._id;
    const detailRes = await api.get(`/dean/student/${studentId}`);
    const student = detailRes.data;

    const logsCount = student.logs?.length || 0;
    const approvedHours = student.ojt_hours_completed || 0;

    return buildStudentSummary({
      name: student.name,
      admission: student.student_admission_number || "N/A",
      course: student.student_course || "N/A",
      company: student.assigned_company?.name || "Unassigned",
      hours: approvedHours,
      logs: logsCount,
    });
  };

  const resolveCompanySummary = async (name) => {
    if (!companiesCacheRef.current) {
      const res = await api.get("/dean/getAllCompany");
      companiesCacheRef.current = res.data?.company || [];
    }

    const normalized = name.toLowerCase();
    const matches = companiesCacheRef.current.filter((company) =>
      company.name?.toLowerCase().includes(normalized),
    );

    if (!matches.length) {
      return `No company found for "${name}". Try the full company name.`;
    }

    if (matches.length > 1) {
      return (
        `I found multiple companies for "${name}":\n` +
        matches
          .slice(0, 5)
          .map((company) => `• ${company.name}`)
          .join("\n") +
        "\nPlease specify which one you mean."
      );
    }

    const companyId = matches[0]._id;
    const detailRes = await api.get(`/dean/company/${companyId}/profile`);
    const profile = detailRes.data;
    const students = profile.students || [];

    const studentRows = students.map((student) => {
      const hours = Number(student.renderedHours || 0);
      let status = "Needs attention";
      if (hours >= 400) {
        status = "Excellent";
      } else if (hours >= 250) {
        status = "On track";
      } else if (hours >= 120) {
        status = "Progressing";
      }

      return {
        name: student.name,
        hours,
        logs: Number(student.logCount || student.logsCount || 0),
        status,
      };
    });

    return buildCompanySummary(matches[0].name, studentRows, profile.stats);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
    };
    const assistantId = `${Date.now().toString()}-reply`;
    const assistantMessage = {
      id: assistantId,
      role: "assistant",
      text: getAssistantReply(trimmed),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");

    try {
      const text = trimmed.toLowerCase();
      const keywordHit =
        /(summary|summaries|report|details|performance|hours|logs)/i.test(
          trimmed,
        );
      const isStudent = /\bstudent\b/.test(text) || /student name/.test(text);
      const isCompany = /\bcompany\b/.test(text) || /company name/.test(text);

      let resolvedText = null;
      if (isStudent || (keywordHit && /student/i.test(trimmed))) {
        const name = extractStudentName(trimmed);
        if (name) {
          resolvedText = await resolveStudentSummary(name);
        }
      } else if (isCompany || (keywordHit && /company/i.test(trimmed))) {
        const name = extractCompanyName(trimmed);
        if (name) {
          resolvedText = await resolveCompanySummary(name);
        }
      }

      if (resolvedText) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? { ...message, text: resolvedText }
              : message,
          ),
        );
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                text: "Sorry, I couldn't fetch that summary. Please try again.",
              }
            : message,
        ),
      );
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
        <div>
          <p className="text-sm text-gray-500">Dean Insights</p>
          <h2 className="text-xl font-bold text-gray-900">
            Summaries Assistant
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

          <div className="px-6 py-4 bg-white border-b">
            <p className="text-sm text-gray-600 mb-2">
              Quick prompts (edit and press Enter):
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Tip: You can just provide the name and I will fetch the rest.
            </p>
          </div>

          <div className="h-90 overflow-y-auto px-6 py-4 space-y-4 bg-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Bot size={18} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line shadow-sm ${
                    message.role === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
                {message.role === "user" && (
                  <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="px-6 py-4 border-t bg-white">
            <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for a student or company summary..."
            className="flex-1 min-h-12 max-h-32 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
              <Button variant="primary" size="md" onClick={handleSend}>
                <span className="flex items-center gap-2">
                  Send
                  <SendHorizontal size={16} />
                </span>
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Tip: Press Enter to send, Shift+Enter for a new line.
            </p>
          </div>
    </div>
  );
};
export default DeanChatbot;
