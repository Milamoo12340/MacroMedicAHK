import type { Ticket } from "@/types";
import { cn } from "@/lib/utils";
import { Bot, UserCircle2, AlertTriangle, CheckCircle2 } from "lucide-react";

const statusMap = {
  "ai-handling": { chip: "chip-primary", icon: Bot, label: "AI handling" },
  "awaiting-user": { chip: "chip-accent", icon: UserCircle2, label: "Awaiting user" },
  "escalated": { chip: "chip-warning", icon: AlertTriangle, label: "Escalated" },
  "resolved": { chip: "chip", icon: CheckCircle2, label: "Resolved" },
} as const;

interface TicketRowProps {
  ticket: Ticket;
  onClick?: () => void;
  selected?: boolean;
}

export default function TicketRow({ ticket, onClick, selected }: TicketRowProps) {
  const s = statusMap[ticket.status];
  const Icon = s.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left card-surface p-4 transition-all hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40",
        selected && "border-primary/60 bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        <img src={ticket.avatar} alt="" className="w-9 h-9 rounded-md border border-border shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[11px] text-muted-foreground shrink-0">{ticket.id}</span>
              <span className="font-medium text-sm truncate">{ticket.subject}</span>
            </div>
            <span className={cn(s.chip, "shrink-0")}>
              <Icon className="w-3 h-3" />
              {s.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{ticket.user}</span>
            <span className="opacity-40">•</span>
            <span className="font-mono">{ticket.macro}</span>
            <span className="opacity-40">•</span>
            <span>{ticket.category}</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground line-clamp-1">{ticket.lastMessage}</div>
        </div>
      </div>
    </button>
  );
}
