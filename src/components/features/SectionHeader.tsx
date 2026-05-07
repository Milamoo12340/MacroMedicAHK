import type { ReactNode } from "react";

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function SectionHeader({ kicker, title, subtitle, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        {kicker && (
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-primary mb-2">
            {kicker}
          </div>
        )}
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1.5 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
