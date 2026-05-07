import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Bot, UserCircle2, Shield, ImageIcon, ArrowLeft, CheckCircle2 } from "lucide-react";
import { quickFixes } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface Msg {
  id: string;
  author: "user" | "ai";
  content: string;
}

const AI_FALLBACK =
  "I don't see that issue in the knowledge base yet. Can you share: (1) macro name, (2) Windows version, (3) any error text? Or run /human to bring in a staff member.";

const CANNED: Record<string, string> = {
  launch:
    "Looks like a launch issue. Try: right-click `.ahk` → Run as administrator. Also make sure AutoHotkey v2 (NOT v1) is installed from autohotkey.com. Still stuck?",
  resolution:
    "Your coords are probably off because your screen isn't 1920×1080. Open `settings.ini`, set `AutoScale=1`, save, relaunch. Reply `done` when ready to test.",
  admin:
    "Windows blocks input simulation without admin rights. Right-click the macro → Properties → Compatibility tab → check 'Run this program as administrator' → Apply.",
  position:
    "Most macros need your character at a known starting zone. Check the macro's README for the spawn point. Teleport there, face north, then relaunch.",
};

export default function TicketPreview() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
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

  const send = (text: string) => {
    const userMsg: Msg = { id: `u-${Date.now()}`, author: "user", content: text };
    const lower = text.toLowerCase();

    if (lower.includes("/human") || lower.includes("/escalate")) {
      setMessages((m) => [
        ...m,
        userMsg,
        { id: `a-${Date.now()}`, author: "ai", content: "Got it — pinging staff now. A human will join shortly." },
      ]);
      setEscalated(true);
      return;
    }

    let reply = AI_FALLBACK;
    if (/launch|open|won.?t start|nothing happens/.test(lower)) reply = CANNED.launch;
    else if (/resolution|ultrawide|1440|2560|scale|wrong spot|miss/.test(lower)) reply = CANNED.resolution;
    else if (/admin|permission|blocked|elevate/.test(lower)) reply = CANNED.admin;
    else if (/position|spawn|location|zone|character/.test(lower)) reply = CANNED.position;

    setMessages((m) => [...m, userMsg]);
    setTimeout(() => {
      setMessages((m) => [...m, { id: `a-${Date.now()}`, author: "ai", content: reply }]);
    }, 600);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
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
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center gap-3 bg-[hsl(var(--sidebar-background))]">
            <div className="w-10 h-10 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">MacroMedic</div>
              <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary status-dot" />
                online • reading your ticket
              </div>
            </div>
          </div>

          {!started ? (
            <div className="p-6 space-y-5">
              <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-primary">QUICK-FIX CHECKLIST</div>
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
                Still having issues → start AI chat
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 h-[420px] overflow-y-auto space-y-3 bg-background/30">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex gap-2.5", m.author === "user" ? "justify-end" : "justify-start")}>
                    {m.author === "ai" && (
                      <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-md px-3.5 py-2.5 text-sm leading-relaxed border",
                        m.author === "user"
                          ? "bg-secondary border-border"
                          : "bg-primary/5 border-primary/30"
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
                {escalated && (
                  <div className="flex items-center gap-2 text-xs font-mono text-accent border border-dashed border-accent/40 rounded-md p-3 bg-accent/5">
                    <Shield className="w-4 h-4" />
                    Staff thread opened. A human will respond here shortly.
                  </div>
                )}
              </div>

              <form onSubmit={submit} className="p-4 border-t border-border flex items-end gap-2">
                <button type="button" className="btn-ghost h-10 px-2.5" aria-label="Attach image">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your issue… (try /human to escalate)"
                  className="input-base text-sm"
                />
                <button type="submit" className="btn-primary h-10 py-0">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-4 text-center text-[11px] font-mono text-muted-foreground">
          This is a preview of what your Discord members see when opening a ticket.
        </div>
      </div>
    </div>
  );
}
