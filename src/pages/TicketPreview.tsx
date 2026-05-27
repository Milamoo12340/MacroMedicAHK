import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Bot,
  UserCircle2,
  Shield,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useStore, StorageKeys } from "@/lib/storage";
import { quickFixes } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  generateAIResponse,
  DEFAULT_AI_CONFIG,
} from "@/lib/ai";
import type {
  AIConfig,
  KnowledgeFile,
  TrainedResponse,
  BotConfig,
} from "@/types";

interface Msg {
  id: string;
  author: "user" | "ai";
  content: string;
}

export default function TicketPreview() {
  const navigate = useNavigate();
  const [aiConfig] = useStore<AIConfig>(StorageKeys.aiConfig, DEFAULT_AI_CONFIG);
  const [files] = useStore<KnowledgeFile[]>(StorageKeys.knowledgeFiles, []);
  const [trained] = useStore<TrainedResponse[]>(StorageKeys.trainedResponses, []);
  const [botConfig] = useStore<BotConfig>(StorageKeys.botConfig, {
    tone: "Friendly debugger",
    escalateKeyword: "/human",
    staffRolePing: "@TicketHelpers",
    quickFixFirst: true,
    autoTranslate: false,
    rateLimit: 20,
  });

  const [started, setStarted] = useState(!botConfig.quickFixFirst);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "w",
      author: "ai",
      content:
        "Hey, I'm MacroMedic. I've read every macro in this server's codebase. Tell me what's going wrong — screenshots welcome.",
    },
  ]);
  const [input, setInput] = useState("");
  const [escalated, setEscalated] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async (text: string) => {
    const userMsg: Msg = { id: `u-${Date.now()}`, author: "user", content: text };
    const lower = text.toLowerCase();
    const escapeKey = botConfig.escalateKeyword.toLowerCase();

    if (lower.includes(escapeKey) || lower.includes("/human") || lower.includes("/escalate")) {
      setMessages((m) => [
        ...m,
        userMsg,
        {
          id: `a-${Date.now()}`,
          author: "ai",
          content: `Got it — pinging ${botConfig.staffRolePing}. A human will join shortly.`,
        },
      ]);
      setEscalated(true);
      return;
    }

    setMessages((m) => [...m, userMsg]);
    setBusy(true);

    const history = messages
      .filter((m) => m.id !== "w")
      .map((m) => ({
        role: (m.author === "ai" ? "assistant" : "user") as "user" | "assistant",
        content: m.content,
      }));

    const res = await generateAIResponse({
      message: text,
      history,
      config: aiConfig,
      knowledgeFiles: files,
      trainedResponses: trained,
    });

    setBusy(false);
    setMessages((m) => [
      ...m,
      { id: `a-${Date.now()}`, author: "ai", content: res.content },
    ]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    send(input.trim());
    setInput("");
  };

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>

        <div className="card-surface overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-3 bg-[hsl(var(--sidebar-background))]">
            <div className="w-10 h-10 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">MacroMedic</div>
              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary status-dot" />
                online • {aiConfig.provider} / {aiConfig.model}
              </div>
            </div>
          </div>

          {!started ? (
            <div className="p-6 space-y-5">
              <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-primary">
                QUICK-FIX CHECKLIST
              </div>
              <div className="text-sm text-muted-foreground">
                Before chatting, run through these — they resolve ~70% of macro tickets:
              </div>
              <div className="space-y-2.5">
                {quickFixes.map((q, i) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-3 rounded-md border border-border bg-background/40"
                  >
                    <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono text-xs shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{q.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{q.desc}</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <button onClick={() => setStarted(true)} className="btn-primary w-full">
                Still having issues — start AI chat
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 h-[420px] overflow-y-auto space-y-3 bg-background/30">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-2.5",
                      m.author === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {m.author === "ai" && (
                      <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-md px-3.5 py-2.5 text-sm leading-relaxed border whitespace-pre-wrap",
                        m.author === "user"
                          ? "bg-secondary border-border"
                          : "bg-primary/5 border-primary/30",
                      )}
                    >
                      {m.content}
                    </div>
                    {m.author === "user" && (
                      <div className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center shrink-0">
                        <UserCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {busy && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary animate-pulse" />
                    </div>
                    <div className="bg-primary/5 border border-primary/30 rounded-md px-3.5 py-2.5 text-sm text-muted-foreground">
                      Reading your codebase…
                    </div>
                  </div>
                )}
                {escalated && (
                  <div className="flex items-center gap-2 text-xs font-mono text-accent border border-dashed border-accent/40 rounded-md p-3 bg-accent/5">
                    <Shield className="w-4 h-4" />
                    Staff thread opened. A human will respond here shortly.
                  </div>
                )}
              </div>

              <form onSubmit={submit} className="p-4 border-t border-border flex items-end gap-2">
                <button
                  type="button"
                  className="btn-ghost h-10 px-2.5"
                  aria-label="Attach image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Describe your issue… (try ${botConfig.escalateKeyword} to escalate)`}
                  className="input-base text-sm"
                  disabled={busy}
                />
                <button type="submit" disabled={busy} className="btn-primary h-10 py-0 disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-4 text-center text-[11px] font-mono text-muted-foreground">
          Live preview — uses your real AI provider, knowledge base and trained responses.
        </div>
      </div>
    </div>
  );
}
