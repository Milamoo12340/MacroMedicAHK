import { useState } from "react";
import { Send, Bot, UserCircle2, Shield, Image as ImageIcon, ArrowUpRight, Filter } from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import TicketRow from "@/components/features/TicketRow";
import { mockTickets } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Ticket, TicketMessage, TicketStatus } from "@/types";

const filters: { key: TicketStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ai-handling", label: "AI handling" },
  { key: "awaiting-user", label: "Awaiting user" },
  { key: "escalated", label: "Escalated" },
  { key: "resolved", label: "Resolved" },
];

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedId, setSelectedId] = useState<string>(mockTickets[0].id);
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [reply, setReply] = useState("");

  const selected = tickets.find((t) => t.id === selectedId)!;
  const filtered = tickets.filter((t) => filter === "all" || t.status === filter);

  const sendStaffReply = () => {
    if (!reply.trim()) return;
    const msg: TicketMessage = {
      id: `m-${Date.now()}`,
      author: "human",
      content: reply,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, messages: [...t.messages, msg], lastMessage: reply } : t))
    );
    setReply("");
    toast.success("Reply sent to Discord thread");
  };

  const escalate = () => {
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, status: "escalated" as TicketStatus } : t))
    );
    toast("Escalated to #ticket-help staff channel");
  };

  const resolve = () => {
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, status: "resolved" as TicketStatus } : t))
    );
    toast.success("Ticket marked resolved");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        kicker="LIVE FEED"
        title="Tickets"
        subtitle="Watch AI conversations in real time, jump in with a staff reply, or escalate to a human thread."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 rounded-md border border-border bg-secondary/50">
              <Filter className="w-3.5 h-3.5 text-muted-foreground ml-2" />
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-mono rounded transition-colors",
                    filter === f.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-3 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto pr-1">
          {filtered.map((t) => (
            <TicketRow
              key={t.id}
              ticket={t}
              onClick={() => setSelectedId(t.id)}
              selected={t.id === selectedId}
            />
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3 card-surface flex flex-col lg:max-h-[calc(100vh-220px)]">
          <div className="p-5 border-b border-border flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-muted-foreground">{selected.id}</span>
                <span className="chip">{selected.category}</span>
                <span className="chip">{selected.macro}</span>
              </div>
              <div className="mt-1 font-semibold truncate">{selected.subject}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground font-mono">
                {selected.user}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={escalate} className="btn-secondary h-9 py-0">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Escalate</span>
              </button>
              <button onClick={resolve} className="btn-primary h-9 py-0">
                <ArrowUpRight className="w-4 h-4" />
                <span className="hidden sm:inline">Resolve</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/40">
            {selected.messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {selected.status === "escalated" && (
              <div className="text-center text-xs font-mono text-[hsl(var(--warning))] border-t border-dashed border-[hsl(var(--warning))]/40 pt-3">
                ⚠ Conversation moved to staff thread #ticket-help-{selected.id.split("-")[1]}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-end gap-2">
              <button className="btn-ghost h-10 px-2.5" onClick={() => toast("Attach an image")}>
                <ImageIcon className="w-4 h-4" />
              </button>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply as staff…"
                rows={1}
                className="input-base text-sm resize-none min-h-[44px]"
              />
              <button onClick={sendStaffReply} className="btn-primary h-10 py-0 shrink-0">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <div className="mt-2 text-[11px] font-mono text-muted-foreground">
              Your replies post as staff in the live Discord ticket thread.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: TicketMessage }) {
  const isUser = message.author === "user";
  const isAI = message.author === "ai";

  return (
    <div className={cn("flex gap-3", isUser ? "justify-start" : "justify-end")}>
      {isUser && (
        <div className="w-8 h-8 rounded-md bg-secondary border border-border flex items-center justify-center shrink-0">
          <UserCircle2 className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-md p-3 border text-sm",
          isUser && "bg-secondary border-border",
          isAI && "bg-primary/5 border-primary/30",
          message.author === "human" && "bg-accent/5 border-accent/30"
        )}
      >
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
          {isAI && <Bot className="w-3 h-3 text-primary" />}
          {message.author === "human" && <Shield className="w-3 h-3 text-accent" />}
          {isUser ? "user" : isAI ? "macromedic ai" : "staff"}
          <span className="opacity-50">• {message.time}</span>
        </div>
        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
      </div>
      {!isUser && (
        <div
          className={cn(
            "w-8 h-8 rounded-md border flex items-center justify-center shrink-0",
            isAI ? "bg-primary/10 border-primary/30" : "bg-accent/10 border-accent/30"
          )}
        >
          {isAI ? <Bot className="w-4 h-4 text-primary" /> : <Shield className="w-4 h-4 text-accent" />}
        </div>
      )}
    </div>
  );
}
