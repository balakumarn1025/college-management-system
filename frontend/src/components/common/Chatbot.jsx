import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { sendMessage, getChatHistory } from "../../api/chatbot.api";
import { useAuth } from "../../context/useAuth";

const GREETINGS = {
  student:
    "Hi! I'm your AI assistant. Ask me things like:\n• What is my attendance percentage?\n• Which subjects are below 75%?",
  teacher:
    "Hi! I'm your AI assistant. You can ask about attendance stats and student data.",
  admin:
    "Hi! I'm your AI assistant. Ask me about attendance, students, or system data.",
};

const SUGGESTIONS = {
  student: [
    "What is my attendance percentage?",
    "Which subjects are below 75%?",
  ],
  teacher: ["Show today's attendance"],
  admin: ["How many students were absent today?"],
};

export default function Chatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const role = user?.role || "student";

  // Load history once when opened
  useEffect(() => {
    if (!open) return;

    getChatHistory()
      .then((history) => {
        if (Array.isArray(history) && history.length > 0) {
          setMessages(
            history.map((h) => ({
              role: h.role,
              text: h.message,
            }))
          );
        } else {
          setMessages([
            { role: "assistant", text: GREETINGS[role] || GREETINGS.student },
          ]);
        }
      })
      .catch(() => {
        setMessages([
          { role: "assistant", text: GREETINGS[role] || GREETINGS.student },
        ]);
      });
  }, [open, role]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, messages.length]);

  const onSend = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendMessage(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.reply || "No reply." },
      ]);
    } catch (err) {
      const errorText =
        err.response?.data?.detail ||
        "Sorry, I couldn't reach the server. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", text: errorText }]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    onSend();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition"
        aria-label="Open chatbot"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-[520px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <div>
                <div className="font-semibold text-sm">AI Assistant</div>
                <div className="text-xs opacity-80">
                  {loading ? "Typing..." : "Online"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="hover:bg-white/20 rounded p-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-white border text-slate-800 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={14} className="text-slate-700" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white border px-3 py-2 rounded-2xl text-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && SUGGESTIONS[role] && (
            <div className="px-3 py-2 border-t bg-white flex flex-wrap gap-1">
              {SUGGESTIONS[role].map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSend(s)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-full"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={onSubmit}
            className="border-t p-2 flex items-center gap-2 bg-white"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-primary hover:bg-blue-700 disabled:opacity-50 text-white rounded-md p-2"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}