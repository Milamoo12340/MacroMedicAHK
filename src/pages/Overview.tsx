import { useNavigate } from "react-router-dom";
import {
  Ticket as TicketIcon,
  Bot,
  ShieldCheck,
  Clock3,
  ArrowRight,
  Sparkles,
  FileCode2,
  Terminal,
  Zap,
  Webhook,
  Brain,
  Beaker,
} from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import StatCard from "@/components/features/StatCard";
import TicketRow from "@/components/features/TicketRow";
import EmptyState from "@/components/features/EmptyState";
import { useStore, StorageKeys } from "@/lib/storage";
import { quickFixes } from "@/lib/mockData";
import { useCurrentUser } from "@/lib/auth";
import type { Ticket, AppMode, AIConfig, DiscordConfig } from "@/types";
import { DEFAULT_AI_CONFIG } from "@/lib/ai";
import { DEFAULT_DISCORD_CONFIG, getInviteUrl } from "@/lib/discord";
import { toast } from "sonner";

export default function Overview() {
  const navigate = useNavigate();
  const me = useCurrentUser();
  const [tickets] = useStore<Ticket[]>(StorageKeys.tickets, []);
  const [mode] = useStore<AppMode>(StorageKeys.appMode, "demo");
  const [ai] = useStore<AIConfig>(StorageKeys.aiConfig, DEFAULT_AI_CONFIG);
  const [discord] = useStore<DiscordConfig>(
    StorageKeys.discordConfig,
    DEFAULT_DISCORD_CONFIG,
  );

  const recent = tickets.slice(0, 3);
  const open = tickets.filter((t) => t.status !== "resolved").length;
  const escalated = tickets.filter((t) => t.status === "escalated").length;
  const aiHandling = tickets.filter((t) => t.status === "ai-handling").length;
  const total = tickets.length;
  const resolvedPct = total > 0
    ? Math.round((tickets.filter((t) => t.status === "resolved").length / total) * 100)
    : 0;

  const copyInvite = () => {
    const url = getInviteUrl(discord.applicationId);
    if (!url) {
      toast.error("Set Application ID in Discord settings first");
      navigate("/dashboard/discord");
      return;
    }
    navigator.clipboard.writeText(url);
    toast.success("Bot invite link copied to clipboard");
  };

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative card-surface overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 scanlines pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-10 bottom-0 w-60 h-60 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <div className="chip chip-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary status-dot" />
              {mode === "live" ? "LIVE • real Discord integration" : "DEMO • sample data loaded"}
            </div>
            {me && (
              <div className="chip">
                Signed in as <span className="text-foreground ml-1">{me.displayName}</span>
              </div>
            )}
          </div>
          <h1 className="text-[28px] md:text-[38px] font-semibold leading-[1.1] tracking-tight max-w-2xl">
            Your AHK ticket queue,{" "}
            <span className="text-primary">triaged by an AI that reads your code.</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl">
            MacroMedic watches your Discord ticket channels, debugs macros against the exact files you uploaded, and escalates to humans on demand. Everything saved on this device — works without OnSpace credits.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => navigate("/dashboard/tickets")}>
              <TicketIcon className="w-4 h-4" />
              Open ticket feed
            </button>
            <button className="btn-secondary" onClick={() => navigate("/dashboard/knowledge")}>
              <FileCode2 className="w-4 h-4" />
              Upload macro code
            </button>
            <button className="btn-ghost" onClick={copyInvite}>
              <Sparkles className="w-4 h-4" />
              Copy bot invite link
            </button>
          </div>

          {/* Feature signature strip */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            {[
              { icon: FileCode2, label: "Reads your code" },
              { icon: Bot, label: "Free AI 24/7" },
              { icon: Terminal, label: "Custom commands" },
              { icon: Zap, label: "Human escalation" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-border bg-background/60 backdrop-blur"
              >
                <f.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-mono text-muted-foreground truncate">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Setup checklist (only when not configured) */}
      {(mode === "demo" || !discord.botToken) && (
        <SetupChecklist
          mode={mode}
          discordReady={!!discord.botToken}
          aiReady={ai.provider !== "local" || !!ai.apiKey || ai.provider === "pollinations"}
          onNav={navigate}
        />
      )}

      {/* Stats */}
      <div>
        <SectionHeader
          kicker={mode === "live" ? "LIVE FEED" : "DEMO DATA"}
          title="Bot performance"
          subtitle="Snapshot of how the bot is handling incoming tickets right now."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TicketIcon}
            label="Open tickets"
            value={String(open)}
            delta={`${total} total`}
            tone="primary"
          />
          <StatCard
            icon={Bot}
            label="AI handling"
            value={String(aiHandling)}
            delta={`${resolvedPct}% resolved`}
            tone="accent"
          />
          <StatCard
            icon={ShieldCheck}
            label="Escalated"
            value={String(escalated)}
            delta="to human staff"
            tone="warning"
          />
          <StatCard
            icon={Clock3}
            label="AI provider"
            value={ai.provider}
            delta={ai.model.slice(0, 22)}
            tone="muted"
          />
        </div>
      </div>

      {/* Two col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionHeader
            title="Recent tickets"
            subtitle="Latest conversations the AI is handling."
            actions={
              <button onClick={() => navigate("/dashboard/tickets")} className="btn-ghost">
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            }
          />
          {recent.length > 0 ? (
            <div className="space-y-3">
              {recent.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  onClick={() => navigate("/dashboard/tickets")}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TicketIcon}
              title="No tickets yet"
              description={
                mode === "live"
                  ? "When users open tickets in your Discord server, they'll appear here."
                  : "Switch to Demo mode in Settings to load sample tickets."
              }
            />
          )}
        </div>

        <div>
          <SectionHeader
            title="Quick-fix playbook"
            subtitle="Shown to users the moment they open a ticket."
          />
          <div className="card-surface p-5 space-y-3">
            {quickFixes.map((q, i) => (
              <div key={q.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-primary/10 text-primary border border-primary/30 flex items-center justify-center font-mono text-xs shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="text-sm font-medium leading-snug">{q.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{q.desc}</div>
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate("/preview")}
              className="btn-secondary w-full mt-2"
            >
              Preview user experience
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupChecklist({
  mode,
  discordReady,
  aiReady,
  onNav,
}: {
  mode: AppMode;
  discordReady: boolean;
  aiReady: boolean;
  onNav: (p: string) => void;
}) {
  const items = [
    {
      done: aiReady,
      title: "AI provider chosen",
      desc: "Pollinations works free out-of-the-box, no API key needed.",
      to: "/dashboard/ai",
      icon: Brain,
    },
    {
      done: discordReady,
      title: "Discord bot connected",
      desc: "Add your bot token, server ID and channel IDs.",
      to: "/dashboard/discord",
      icon: Webhook,
    },
    {
      done: mode === "live",
      title: "Switch to Live mode",
      desc: "Drop demo data once you've added your real macros.",
      to: "/dashboard/settings",
      icon: Beaker,
    },
  ];

  return (
    <div className="card-surface p-5">
      <div className="font-mono text-[11px] tracking-widest uppercase text-primary mb-3">
        SETUP CHECKLIST
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((it) => (
          <button
            key={it.title}
            onClick={() => onNav(it.to)}
            className="card-surface p-4 text-left hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                  it.done
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                <it.icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-mono uppercase tracking-widest ${
                  it.done ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {it.done ? "done" : "todo"}
              </span>
            </div>
            <div className="mt-2.5 text-sm font-semibold">{it.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{it.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
