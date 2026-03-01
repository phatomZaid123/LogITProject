import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, SendHorizontal, User, X } from "lucide-react";
import Button from "./ui/Button";
import { useAuth } from "../context/AuthContext";

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
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const quickPrompts = useMemo(
    () => [
      'Summary for student "Zaid Mustapha"',
      "Student admission: 12345",
      'Summary for company "LogIT"',
      "Company details for LogIT",
    ],
    [],
  );

  if (!isOpen) return null;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
    };
    const assistantId = `${Date.now().toString()}-reply`;
    const assistantMessage = {
      id: assistantId,
      role: "assistant",
      text: "Fetching summary...",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await api.post("/dean/chatbot/ask", {
        message: trimmed,
      });

      const resolvedText = response.data?.summary || "No summary available.";
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId ? { ...message, text: resolvedText } : message,
        ),
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                text:
                  error.response?.data?.message ||
                  "Sorry, I couldn't fetch that summary. Please try again.",
              }
            : message,
        ),
      );
    } finally {
      setSending(false);
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
            disabled={sending}
          />
          <Button variant="primary" size="md" onClick={handleSend} disabled={sending}>
            <span className="flex items-center gap-2">
              {sending ? "Sending..." : "Send"}
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
