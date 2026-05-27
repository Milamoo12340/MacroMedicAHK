import { useStore, StorageKeys } from "@/lib/storage";
import type { AppMode } from "@/types";
import { cn } from "@/lib/utils";
import { Beaker, Wifi } from "lucide-react";

export default function ModeBadge({ className }: { className?: string }) {
  const [mode] = useStore<AppMode>(StorageKeys.appMode, "demo");
  const isLive = mode === "live";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] uppercase tracking-widest border",
        isLive
          ? "bg-primary/10 border-primary/40 text-primary"
          : "bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/40 text-[hsl(var(--warning))]",
        className,
      )}
    >
      {isLive ? <Wifi className="w-3 h-3" /> : <Beaker className="w-3 h-3" />}
      {isLive ? "Live mode" : "Demo mode"}
    </span>
  );
}
