import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { chatAPI, documentAPI } from "../services/api";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import {
  Send,
  ArrowLeft,
  Trash2,
  Bot,
  User,
  Play,
  Clock,
  FileText,
  Music,
  Video,
  Loader,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ChatPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    loadDocument();
    loadHistory();
  }, [documentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadDocument = async () => {
    try {
      const { data } = await documentAPI.getById(documentId);
      setDocument(data);
    } catch {
      navigate("/");
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await chatAPI.getHistory(documentId);
      const formatted = data.map((m) => ({
        id: m.id,
        role: m.role.toLowerCase(),
        content: m.content,
        timestamp: m.createdAt,
        timestampRef: m.timestampRef,
      }));
      setMessages(formatted);
    } catch {
      toast.error("Could not load chat history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await chatAPI.sendMessage({
        question: input,
        documentId: Number(documentId),
      });

      const aiMsg = {
        id: data.messageId,
        role: "assistant",
        content: data.answer,
        timestamp: new Date().toISOString(),
        timestampRef: data.timestampRef,
        relevantTimestamps: data.relevantTimestamps,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      toast.error("Failed to get response");
      setMessages((prev) => prev.slice(0, -1));
      setInput(userMsg.content);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearHistory = async () => {
    if (!window.confirm("Clear all chat history?")) return;
    await chatAPI.clearHistory(documentId);
    setMessages([]);
    toast.success("History cleared");
  };

  const jumpToTimestamp = (seconds) => {
    setCurrentTimestamp(seconds);
    const media = audioRef.current || videoRef.current;
    if (media) {
      media.currentTime = seconds;
      media.play();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loadingHistory) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const mediaUrl = document ? documentAPI.getFileUrl(document.filename) : null;
  const isMedia =
    document?.fileType === "AUDIO" || document?.fileType === "VIDEO";

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <button
          onClick={() => navigate("/")}
          className="btn btn-ghost"
          style={{ padding: "6px 12px" }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={styles.docInfo}>
          {document?.fileType === "PDF" && (
            <FileText size={16} color="#f87171" />
          )}
          {document?.fileType === "AUDIO" && (
            <Music size={16} color="#fbbf24" />
          )}
          {document?.fileType === "VIDEO" && (
            <Video size={16} color="#60a5fa" />
          )}
          <span style={styles.docName}>{document?.originalFilename}</span>
        </div>

        <button
          onClick={clearHistory}
          className="btn btn-ghost"
          style={{ padding: "6px 12px" }}
        >
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <div style={styles.body}>
        {/* Media player */}
        {isMedia && mediaUrl && (
          <div style={styles.mediaPanel}>
            {document.fileType === "AUDIO" ? (
              <audio
                ref={audioRef}
                controls
                src={mediaUrl}
                style={styles.audioPlayer}
              />
            ) : (
              <video
                ref={videoRef}
                controls
                src={mediaUrl}
                style={styles.videoPlayer}
              />
            )}
          </div>
        )}

        {/* Messages */}
        <div style={styles.messages}>
          {messages.length === 0 && (
            <div style={styles.emptyState}>
              <Bot size={40} color="var(--text-muted)" />
              <p style={styles.emptyTitle}>Ask anything about your document</p>
              <div style={styles.suggestions}>
                {[
                  "Summarize the main points",
                  "What are the key topics?",
                  "Explain the introduction",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    style={styles.suggestion}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
              }}
              className="fade-in"
            >
              <div
                style={{
                  ...styles.avatar,
                  background:
                    msg.role === "user"
                      ? "var(--accent-dim)"
                      : "rgba(34,197,94,0.1)",
                  borderColor:
                    msg.role === "user" ? "var(--accent)" : "var(--success)",
                }}
              >
                {msg.role === "user" ? (
                  <User size={14} color="var(--accent)" />
                ) : (
                  <Bot size={14} color="var(--success)" />
                )}
              </div>

              <div
                style={{
                  ...styles.bubble,
                  background:
                    msg.role === "user"
                      ? "var(--accent-dim)"
                      : "var(--bg-card)",
                  borderColor:
                    msg.role === "user"
                      ? "rgba(108,99,255,0.3)"
                      : "var(--border)",
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>

                {/* Timestamp links */}
                {msg.relevantTimestamps?.length > 0 && (
                  <div style={styles.timestamps}>
                    <span style={styles.tsLabel}>
                      <Clock size={12} /> Jump to:
                    </span>
                    {msg.relevantTimestamps.map((ts, ti) => (
                      <button
                        key={ti}
                        onClick={() => jumpToTimestamp(ts.startTime)}
                        style={styles.tsBtn}
                      >
                        <Play size={10} /> {formatTime(ts.startTime)} —{" "}
                        {ts.topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div
              style={{ ...styles.message, flexDirection: "row" }}
              className="fade-in"
            >
              <div
                style={{
                  ...styles.avatar,
                  background: "rgba(34,197,94,0.1)",
                  borderColor: "var(--success)",
                }}
              >
                <Bot size={14} color="var(--success)" />
              </div>
              <div
                style={{
                  ...styles.bubble,
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
              >
                <div style={styles.typing}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={styles.inputArea}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document..."
            style={styles.input}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={styles.sendBtn}
          >
            {loading ? (
              <Loader size={16} className="spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "var(--bg-primary)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-secondary)",
    flexShrink: 0,
  },
  docInfo: { display: "flex", alignItems: "center", gap: 8 },
  docName: {
    fontSize: 14,
    fontWeight: 500,
    maxWidth: 300,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  body: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  mediaPanel: {
    padding: "12px 20px",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-secondary)",
    flexShrink: 0,
  },
  audioPlayer: { width: "100%", height: 48 },
  videoPlayer: { width: "100%", maxHeight: 200, borderRadius: 8 },
  messages: {
    flex: 1,
    overflow: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 40,
  },
  emptyTitle: { color: "var(--text-secondary)", fontSize: 15 },
  suggestions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  suggestion: {
    padding: "8px 14px",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    fontSize: 13,
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
  message: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    maxWidth: "85%",
    alignSelf: "flex-start",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1px solid",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid",
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: "100%",
  },
  timestamps: {
    marginTop: 10,
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  tsLabel: {
    fontSize: 12,
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  tsBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 10px",
    background: "var(--accent-dim)",
    border: "1px solid rgba(108,99,255,0.3)",
    borderRadius: 12,
    fontSize: 12,
    color: "var(--accent)",
    cursor: "pointer",
  },
  typing: {
    display: "flex",
    gap: 4,
    alignItems: "center",
    padding: "4px 0",
  },
  inputArea: {
    display: "flex",
    gap: 10,
    padding: "16px 20px",
    borderTop: "1px solid var(--border)",
    background: "var(--bg-secondary)",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    background: "var(--bg-hover)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    color: "var(--text-primary)",
    fontSize: 14,
  },
  sendBtn: { padding: "12px 16px", flexShrink: 0 },
};

export default ChatPage;
