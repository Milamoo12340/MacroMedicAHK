import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card-surface p-10 text-center">
      <div className="mx-auto w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="mt-4 font-semibold">{title}</div>
      {description && (
        <div className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">
          {description}
        </div>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
