"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  FormEvent,
} from "react";
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  X,
  ChevronDown,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  queryType?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggested prompts
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "What are my top expense categories this month?",
  "Show me all unpaid invoices",
  "How much was I paid this year?",
  "What is my net cashflow?",
];

// ─────────────────────────────────────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <span className="ai-typing-dots">
      <span style={{ animationDelay: "0ms" }} />
      <span style={{ animationDelay: "180ms" }} />
      <span style={{ animationDelay: "360ms" }} />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Query-type badge labels
// ─────────────────────────────────────────────────────────────────────────────

const QUERY_TYPE_LABELS: Record<string, string> = {
  structured_db: "DB",
  document_rag: "RAG",
  general_ai: "AI",
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: `u_${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/chat", { credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage: trimmed,
            ...(sessionId ? { sessionId } : {}),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Something went wrong");

        if (!sessionId && data.sessionId) setSessionId(data.sessionId);

        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: "assistant",
            content: data.answer,
            timestamp: new Date(),
            queryType: data.meta?.queryType,
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleNewChat = async () => {
    if (sessionId) {
      fetch("/api/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }
    setMessages([]);
    setSessionId(null);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      <button
        id="ai-chat-fab"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        className="ai-fab"
      >
        {isOpen ? (
          <ChevronDown size={18} strokeWidth={2.5} />
        ) : (
          <>
            <Sparkles size={16} strokeWidth={2} />
            <span>Ask AI</span>
          </>
        )}
        {/* Pulse ring when closed */}
        {!isOpen && <span className="ai-fab-ring" />}
      </button>

      {/* ── Chat Panel ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="ai-panel"
          role="dialog"
          aria-label="cashFlo AI Financial Assistant"
        >
          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-left">
              <div className="ai-avatar">
                <Bot size={16} strokeWidth={2} />
              </div>
              <div className="ai-header-text">
                <span className="ai-header-title">cashFlo AI</span>
                <span className="ai-header-sub">Financial Assistant · Groq</span>
              </div>
            </div>
            <div className="ai-header-actions">
              {messages.length > 0 && (
                <button
                  onClick={handleNewChat}
                  className="ai-icon-btn"
                  title="Clear conversation"
                  aria-label="Start new chat"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="ai-icon-btn"
                title="Close"
                aria-label="Close chat"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="ai-body" ref={bodyRef} id="ai-chat-body">
            {/* Empty state */}
            {messages.length === 0 && !isLoading && (
              <div className="ai-welcome">
                <div className="ai-welcome-icon">
                  <Sparkles size={22} strokeWidth={1.5} />
                </div>
                <p className="ai-welcome-title">Ask me anything</p>
                <p className="ai-welcome-sub">
                  I can look up your expenses, invoices, payments, and cashflow in real-time.
                </p>
                <div className="ai-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      className="ai-suggestion"
                      onClick={() => sendMessage(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`ai-msg ai-msg--${msg.role}`}
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                {msg.role === "assistant" && (
                  <div className="ai-bot-dot" aria-hidden="true">
                    <Bot size={13} strokeWidth={2} />
                  </div>
                )}

                <div className="ai-bubble-col">
                  <div className={`ai-bubble ai-bubble--${msg.role}`}>
                    {msg.role === "assistant" ? (
                      <div className="ai-bubble-markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="ai-bubble-text">{msg.content}</p>
                    )}
                  </div>
                  <div className="ai-bubble-meta">
                    <span className="ai-time">{fmt(msg.timestamp)}</span>
                    {msg.queryType && msg.role === "assistant" && (
                      <span className="badge badge-primary" style={{ fontSize: "9px", padding: "1px 6px" }}>
                        {QUERY_TYPE_LABELS[msg.queryType] ?? msg.queryType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="ai-msg ai-msg--assistant">
                <div className="ai-bot-dot" aria-hidden="true">
                  <Bot size={13} strokeWidth={2} />
                </div>
                <div className="ai-bubble-col">
                  <div className="ai-bubble ai-bubble--assistant ai-bubble--loading">
                    <TypingDots />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="ai-error" role="alert">
                <TriangleAlert size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer / input */}
          <form className="ai-footer" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              id="ai-chat-input"
              className="ai-input field-input"
              placeholder="Ask about your finances…"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
              aria-label="Chat message"
            />
            <button
              id="ai-chat-send"
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn btn-primary ai-send"
              aria-label="Send"
            >
              {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} strokeWidth={2.5} />
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── Scoped CSS ───────────────────────────────────────────────────── */}
      <style>{`
        /* FAB ─────────────────────────────────────────────────────────── */
        .ai-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 11px 18px;
          border: none;
          border-radius: 999px;
          background: var(--primary);
          color: var(--primary-foreground);
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 8px 28px -4px color-mix(in oklch, var(--primary) 55%, transparent),
                      0 2px 8px -2px color-mix(in oklch, var(--primary) 30%, transparent);
          transition: transform 200ms cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 200ms ease,
                      background 150ms ease;
        }
        .ai-fab:hover {
          background: color-mix(in oklch, var(--primary) 92%, white);
          transform: translateY(-3px);
          box-shadow: 0 14px 40px -6px color-mix(in oklch, var(--primary) 65%, transparent),
                      0 4px 12px -4px color-mix(in oklch, var(--primary) 40%, transparent);
        }
        .ai-fab:active { transform: scale(0.96); }

        /* Pulse ring on FAB */
        .ai-fab-ring {
          position: absolute;
          inset: -4px;
          border-radius: 999px;
          border: 2px solid color-mix(in oklch, var(--primary) 40%, transparent);
          animation: aiFabPulse 2.4s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes aiFabPulse {
          0%, 100% { transform: scale(1);    opacity: 0.7; }
          50%       { transform: scale(1.18); opacity: 0; }
        }

        /* Panel ───────────────────────────────────────────────────────── */
        .ai-panel {
          position: fixed;
          bottom: 90px;
          right: 28px;
          z-index: 999;
          width: 400px;
          max-width: calc(100vw - 40px);
          height: 580px;
          max-height: calc(100svh - 120px);
          display: flex;
          flex-direction: column;
          border-radius: calc(var(--radius) + 0.5rem);
          border: 1px solid var(--border);
          background: var(--card);
          box-shadow: var(--shadow-xl),
                      0 0 0 1px color-mix(in oklch, var(--primary) 8%, transparent);
          overflow: hidden;
          animation: aiSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          font-family: inherit;
        }
        @keyframes aiSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        /* Header ──────────────────────────────────────────────────────── */
        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          background: color-mix(in oklch, var(--primary) 6%, var(--card));
          flex-shrink: 0;
        }
        .ai-header-left { display: flex; align-items: center; gap: 10px; }
        .ai-avatar {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: color-mix(in oklch, var(--primary) 14%, transparent);
          border: 1px solid color-mix(in oklch, var(--primary) 22%, transparent);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ai-header-text { display: flex; flex-direction: column; gap: 1px; }
        .ai-header-title { font-size: 13.5px; font-weight: 700; color: var(--foreground); line-height: 1.2; }
        .ai-header-sub { font-size: 10.5px; color: var(--muted-foreground); line-height: 1.2; }
        .ai-header-actions { display: flex; align-items: center; gap: 4px; }
        .ai-icon-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--muted-foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 150ms, color 150ms;
          font-family: inherit;
        }
        .ai-icon-btn:hover {
          background: var(--muted);
          color: var(--foreground);
        }

        /* Body ────────────────────────────────────────────────────────── */
        .ai-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .ai-body::-webkit-scrollbar { width: 4px; }
        .ai-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

        /* Welcome ─────────────────────────────────────────────────────── */
        .ai-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          padding: 20px 12px 6px;
          animation: fadeIn 0.35s ease both;
        }
        .ai-welcome-icon {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          background: color-mix(in oklch, var(--primary) 10%, transparent);
          border: 1px solid color-mix(in oklch, var(--primary) 18%, transparent);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          box-shadow: 0 4px 24px -4px color-mix(in oklch, var(--primary) 25%, transparent);
        }
        .ai-welcome-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--foreground);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .ai-welcome-sub {
          font-size: 12.5px;
          color: var(--muted-foreground);
          margin: 0;
          line-height: 1.6;
          max-width: 280px;
        }
        .ai-suggestions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          margin-top: 10px;
        }
        .ai-suggestion {
          text-align: left;
          padding: 9px 13px;
          border-radius: calc(var(--radius) - 0.125rem);
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--foreground);
          font-size: 12.5px;
          cursor: pointer;
          font-family: inherit;
          transition: background 150ms, border-color 150ms, color 150ms, transform 120ms;
          line-height: 1.4;
        }
        .ai-suggestion:hover {
          background: color-mix(in oklch, var(--primary) 7%, var(--card));
          border-color: color-mix(in oklch, var(--primary) 30%, transparent);
          color: var(--primary);
          transform: translateX(3px);
        }

        /* Messages ────────────────────────────────────────────────────── */
        .ai-msg {
          display: flex;
          gap: 8px;
          align-items: flex-end;
          animation: fadeUp 0.25s ease both;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .ai-msg--user { flex-direction: row-reverse; }

        .ai-bot-dot {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: color-mix(in oklch, var(--primary) 12%, transparent);
          border: 1px solid color-mix(in oklch, var(--primary) 20%, transparent);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          align-self: flex-end;
        }

        .ai-bubble-col {
          display: flex;
          flex-direction: column;
          gap: 3px;
          max-width: 80%;
        }
        .ai-msg--user .ai-bubble-col { align-items: flex-end; }

        .ai-bubble {
          padding: 10px 14px;
          border-radius: calc(var(--radius) + 0.125rem);
          font-size: 13.5px;
          line-height: 1.6;
          word-break: break-word;
        }
        .ai-bubble--user {
          background: var(--primary);
          color: var(--primary-foreground);
          border-bottom-right-radius: 4px;
        }
        .ai-bubble--assistant {
          background: var(--muted);
          color: var(--foreground);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
        }
        .ai-bubble--loading {
          padding: 14px 18px;
        }
        .ai-bubble-text { margin: 0; white-space: pre-wrap; }
        .ai-bubble-markdown { margin: 0; color: inherit; }
        .ai-bubble-markdown p {
          margin: 0 0 0.45rem;
          white-space: pre-wrap;
        }
        .ai-bubble-markdown p:last-child { margin-bottom: 0; }
        .ai-bubble-markdown ul,
        .ai-bubble-markdown ol {
          margin: 0.25rem 0 0.45rem 1rem;
          padding: 0;
        }
        .ai-bubble-markdown li { margin: 0.18rem 0; }
        .ai-bubble-markdown strong { font-weight: 700; }
        .ai-bubble-markdown em { font-style: italic; }
        .ai-bubble-markdown a {
          color: inherit;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .ai-bubble-markdown code {
          background: color-mix(in oklch, var(--foreground) 8%, transparent);
          border-radius: 0.35rem;
          padding: 1px 4px;
          font-size: 12px;
          font-family: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .ai-bubble-meta {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .ai-time {
          font-size: 10px;
          color: var(--muted-foreground);
          line-height: 1;
        }

        /* Typing dots ─────────────────────────────────────────────────── */
        .ai-typing-dots {
          display: flex;
          gap: 5px;
          align-items: center;
          height: 14px;
        }
        .ai-typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--muted-foreground);
          display: inline-block;
          animation: aiDot 1.1s infinite ease-in-out;
        }
        @keyframes aiDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1.1); opacity: 1; }
        }

        /* Error ───────────────────────────────────────────────────────── */
        .ai-error {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          font-size: 12.5px;
          color: var(--destructive);
          background: color-mix(in oklch, var(--destructive) 8%, transparent);
          border: 1px solid color-mix(in oklch, var(--destructive) 20%, transparent);
          border-radius: var(--radius);
          padding: 9px 12px;
        }

        /* Footer ──────────────────────────────────────────────────────── */
        .ai-footer {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 12px 14px;
          border-top: 1px solid var(--border);
          background: var(--card);
          flex-shrink: 0;
        }
        .ai-input {
          flex: 1;
          resize: none;
          min-height: 40px;
          max-height: 120px;
          padding: 9px 13px !important;
          font-size: 13.5px !important;
          line-height: 1.5;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .ai-input::-webkit-scrollbar { display: none; }
        .ai-send {
          height: 40px;
          width: 40px;
          padding: 0 !important;
          border-radius: var(--radius) !important;
          flex-shrink: 0;
          transition: transform 150ms, opacity 200ms !important;
        }
        .ai-send:not(:disabled):hover { transform: scale(1.06) !important; }
        .ai-send:not(:disabled):active { transform: scale(0.95) !important; }
      `}</style>
    </>
  );
}
