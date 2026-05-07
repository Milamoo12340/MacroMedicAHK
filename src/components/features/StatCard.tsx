import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  tone?: "primary" | "accent" | "warning" | "muted";
}

const toneRing: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "from-primary/15 to-transparent border-primary/25",
  accent: "from-accent/15 to-transparent border-accent/25",
  warning: "from-[hsl(var(--warning))]/15 to-transparent border-[hsl(var(--warning))]/25",
  muted: "from-secondary to-transparent border-border",
};

const toneIcon: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "text-primary bg-primary/10 border-primary/30",
  accent: "text-accent bg-accent/10 border-accent/30",
  warning: "text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30",
  muted: "text-muted-foreground bg-secondary border-border",
};

export default function StatCard({ icon: Icon, label, value, delta, tone = "muted" }: StatCardProps) {
  return (
    <div className={cn("card-surface relative overflow-hidden p-5 bg-gradient-to-br", toneRing[tone])}>
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-md border flex items-center justify-center", toneIcon[tone])}>
          <Icon className="w-5 h-5" />
        </div>
        {delta && (
          <span className="font-mono text-[11px] text-muted-foreground">{delta}</span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">{label}</div>
        <div className="mt-1 text-2xl font-semibold font-mono">{value}</div>
      </div>
    </div>
  );
}
