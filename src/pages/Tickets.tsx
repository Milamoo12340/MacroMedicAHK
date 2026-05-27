import { useEffect, useState } from "react";
import {
  Send,
  Bot,
  UserCircle2,
  Shield,
  Image as ImageIcon,
  ArrowUpRight,
  Filter,
  Ticket as TicketIcon,
} from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import TicketRow from "@/components/features/TicketRow";
import EmptyState from "@/components/features/EmptyState";
import { useStore, StorageKeys } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type {
  Ticket,
  TicketMessage,
  TicketStatus,
  AIConfig,
  KnowledgeFile,
  TrainedResponse,
  DiscordConfig,
} from "@/types";
import { generateAIResponse, DEFAULT_AI_CONFIG } from "@/lib/ai";
import { DEFAULT_DISCORD_CONFIG, sendWebhookMessage } from "@/lib/discord";

const filters: { key: TicketStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ai-handling", label: "AI handling" },
  { key: "awaiting-user", label: "Awaiting user" },
  { key: "escalated", label: "Escalated" },
  { key: "resolved", label: "Resolved" },
];

export default function Tickets() {
  const [tickets, setTickets] = useStore<Ticket[]>(StorageKeys.tickets, []);
  const [aiConfig] = useStore<AIConfig>(StorageKeys.aiConfig, DEFAULT_AI_CONFIG);
  const [files] = useStore<KnowledgeFile[]>(StorageKeys.knowledgeFiles, []);
  const [trained] = useStore<TrainedResponse[]>(StorageKeys.trainedResponses, []);
  const [discord] = useStore<DiscordConfig>(
    StorageKeys.discordConfig,
    DEFAULT_DISCORD_CONFIG,
  );

  const [selectedId, setSelectedId] = useState<string | null>(tickets[0]?.id ?? null);
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [reply, setReply] = useState("");
  const [aiBusy, setAIBusy] = useState(false);

  useEffect(() => {
    if (!selectedId && tickets.length > 0) setSelectedId(tickets[0].id);
    if (selectedId && !tickets.find((t) => t.id === selectedId)) {
      setSelectedId(tickets[0]?.id ?? null);
    }
  }, [tickets, selectedId]);

  const selected = tickets.find((t) => t.id === selectedId) ?? null;
  const filtered = tickets.filter((t) => filter === "all" || t.status === filter);

  const sendStaffReply = async () => {
    if (!reply.trim() || !selected) return;
    const msg: TicketMessage = {
      id: `m-${Date.now()}`,
      author: "human",
      content: reply,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? { ...t, messages: [...t.messages, msg], lastMessage: reply }
          : t,
      ),
    );
    const replyText = reply;
    setReply("");

    if (discord.webhookUrl) {
      const r = await sendWebhookMessage(
        discord.webhookUrl,
        `**Staff reply on ${selected.id}**\n${replyText}`,
      );
      if (r.ok) toast.success("Reply posted to Discord webhook");
      else toast.error(`Saved locally; webhook failed: ${r.error}`);
    } else {
      toast.success("Reply saved locally (configure webhook to post to Discord)");
    }
  };

  const askAI = async () => {
    if (!selected) return;
    const lastUser = [...selected.messages].reverse().find((m) => m.author === "user");
    if (!lastUser) {
      toast.error("No user message to respond to");
      return;
    }
    setAIBusy(true);
    const history = selected.messages.map((m) => ({
      role: (m.author === "ai" ? "assistant" : "user") as "user" | "assistant",
      content: m.content,
    }));
    const res = await generateAIResponse({
      message: lastUser.content,
      history: history.slice(0, -1),
      config: aiConfig,
      knowledgeFiles: files,
      trainedResponses: trained,
    });
    setAIBusy(false);

    const msg: TicketMessage = {
      id: `m-${Date.now()}`,
      author: "ai",
      content: res.content,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? { ...t, messages: [...t.messages, msg], lastMessage: res.content }
          : t,
      ),
    );
    if (res.error) toast.error(`AI fallback: ${res.error}`);
    else toast.success(`Reply from ${res.provider}${res.fallback ? " (fallback)" : ""}`);
  };

  const escalate = () => {
    if (!selected) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id ? { ...t, status: "escalated" as TicketStatus } : t,
      ),
    );
    toast("Ticket escalated to staff");
    if (discord.webhookUrl) {
      sendWebhookMessage(
        discord.webhookUrl,
        `🚨 ${selected.id} escalated to staff — ${selected.subject}`,
      );
    }
  };

  const resolve = () => {
    if (!selected) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id ? { ...t, status: "resolved" as TicketStatus } : t,
      ),
    );
    toast.success("Ticket marked resolved");
  };

  const newManualTicket = () => {
    const id = `TKT-${Math.floor(Math.random() * 9000 + 1000)}`;
    const t: Ticket = {
      id,
      user: "manual_entry",
      avatar: "https://i.pravatar.cc/80?img=" + Math.floor(Math.random() * 70 + 1),
      subject: "New manual ticket",
      category: "Other",
      status: "ai-handling",
      createdAt: new Date().toISOString(),
      lastMessage: "(empty)",
      macro: "—",
      messages: [],
    };
    setTickets((prev) => [t, ...prev]);
    setSelectedId(id);
    toast.success(`Created ${id}`);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        kicker="LIVE FEED"
        title="Tickets"
        subtitle="AI handles incoming tickets autonomously. Jump in with a staff reply, escalate, or resolve."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={newManualTicket} className="btn-secondary">
              + Manual ticket
            </button>
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
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No tickets in the feed"
          description="When users open tickets in your Discord server, they appear here. You can also create a manual ticket above to test."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 space-y-3 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto pr-1">
            {filtered.map((t) => (
              <TicketRow
                key={t.id}
                ticket={t}
                onClick={() => setSelectedId(t.id)}
                selected={t.id === selectedId}
              />
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-6">
                No tickets match this filter.
              </div>
            )}
          </div>

          <div className="lg:col-span-3 card-surface flex flex-col lg:max-h-[calc(100vh-220px)]">
            {selected ? (
              <>
                <div className="p-5 border-b border-border flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {selected.id}
                      </span>
                      <span className="chip">{selected.category}</span>
                      <span className="chip">{selected.macro}</span>
                      {selected.isDemo && <span className="chip">demo</span>}
                    </div>
                    <div className="mt-1 font-semibold truncate">{selected.subject}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      {selected.user}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={askAI}
                      disabled={aiBusy}
                      className="btn-secondary h-9 py-0 disabled:opacity-50"
                    >
                      <Bot className="w-4 h-4" />
                      <span className="hidden sm:inline">{aiBusy ? "…" : "AI reply"}</span>
                    </button>
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
                  {selected.messages.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-10">
                      No messages yet — type below to start the conversation.
                    </div>
                  )}
                  {selected.messages.map((m) => (
                    <MessageBubble key={m.id} message={m} />
                  ))}
                  {selected.status === "escalated" && (
                    <div className="text-center text-xs font-mono text-[hsl(var(--warning))] border-t border-dashed border-[hsl(var(--warning))]/40 pt-3">
                      Conversation moved to staff thread #ticket-help-{selected.id.split("-")[1]}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-border">
                  <div className="flex items-end gap-2">
                    <button
                      className="btn-ghost h-10 px-2.5"
                      onClick={() => toast("Drag screenshots into the chat input to attach")}
                    >
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
                    {discord.webhookUrl
                      ? "Replies post to your configured Discord webhook + saved locally."
                      : "Replies are saved locally. Configure a webhook to forward them to Discord."}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-10 text-center text-muted-foreground">
                Select a ticket to view the conversation.
              </div>
            )}
          </div>
        </div>
      )}
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
          message.author === "human" && "bg-accent/5 border-accent/30",
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
            isAI ? "bg-primary/10 border-primary/30" : "bg-accent/10 border-accent/30",
          )}
        >
          {isAI ? (
            <Bot className="w-4 h-4 text-primary" />
          ) : (
            <Shield className="w-4 h-4 text-accent" />
          )}
        </div>
      )}
    </div>
  );
}
