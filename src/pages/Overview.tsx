import { useNavigate } from "react-router-dom";
import { Ticket as TicketIcon, Bot, ShieldCheck, Clock3, ArrowRight, Sparkles, FileCode2, Terminal, Zap } from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import StatCard from "@/components/features/StatCard";
import TicketRow from "@/components/features/TicketRow";
import { mockTickets, quickFixes } from "@/lib/mockData";
import { toast } from "sonner";

export default function Overview() {
  const navigate = useNavigate();
  const recent = mockTickets.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative card-surface overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 scanlines pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-10 bottom-0 w-60 h-60 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative p-8 md:p-10">
          <div className="chip chip-primary mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary status-dot" />
            LIVE • AI autoresponder engaged
          </div>
          <h1 className="text-[28px] md:text-[38px] font-semibold leading-[1.1] tracking-tight max-w-2xl">
            Your AHK ticket queue,{" "}
            <span className="text-primary">triaged by an AI that reads your code.</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl">
            MacroMedic watches your Discord ticket channels, debugs macros against the exact files you&apos;ve uploaded, and escalates to humans on demand.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => navigate("/dashboard/tickets")}>
              <TicketIcon className="w-4 h-4" />
              Open live ticket feed
            </button>
            <button className="btn-secondary" onClick={() => navigate("/dashboard/knowledge")}>
              <FileCode2 className="w-4 h-4" />
              Upload macro code
            </button>
            <button
              className="btn-ghost"
              onClick={() => toast.success("Invite URL copied to clipboard")}
            >
              <Sparkles className="w-4 h-4" />
              Copy bot invite link
            </button>
          </div>

          {/* Feature signature strip */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            {[
              { icon: FileCode2, label: "Reads your code" },
              { icon: Bot, label: "Autonomous AI" },
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

      {/* Stats */}
      <div>
        <SectionHeader
          kicker="LAST 24H"
          title="Bot performance"
          subtitle="Snapshot of how the AI is handling incoming tickets across your server."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TicketIcon} label="Open tickets" value="12" delta="+3 since yesterday" tone="primary" />
          <StatCard icon={Bot} label="AI resolved" value="87%" delta="214 / 246" tone="accent" />
          <StatCard icon={ShieldCheck} label="Escalated" value="9" delta="to human staff" tone="warning" />
          <StatCard icon={Clock3} label="Avg first reply" value="2.4s" delta="p95 &lt; 5s" tone="muted" />
        </div>
      </div>

      {/* Two col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent tickets */}
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
          <div className="space-y-3">
            {recent.map((t) => (
              <TicketRow key={t.id} ticket={t} onClick={() => navigate("/dashboard/tickets")} />
            ))}
          </div>
        </div>

        {/* Quick fix playbook */}
        <div>
          <SectionHeader title="Quick-fix playbook" subtitle="Shown to users the moment they open a ticket." />
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
