import { Bell, Search, Plug } from "lucide-react";
import { toast } from "sonner";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/80 backdrop-blur flex items-center justify-between px-6 md:px-10">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search tickets, macros, commands…"
            className="input-base pl-9 h-9 py-0 font-mono text-[13px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => toast.success("Reconnected to Discord gateway")}
          className="btn-secondary h-9 py-0"
        >
          <Plug className="w-4 h-4" />
          <span className="hidden sm:inline">Reconnect</span>
        </button>
        <button
          onClick={() => toast("3 unread ticket events")}
          className="btn-ghost h-9 py-0 relative"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
        <div className="flex items-center gap-2 pl-3 ml-1 border-l border-border h-9">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary/40 to-accent/40 border border-border flex items-center justify-center text-xs font-mono font-semibold">
            AH
          </div>
          <div className="hidden md:block leading-tight">
            <div className="text-[13px] font-medium">AHK Haven</div>
            <div className="text-[11px] text-muted-foreground font-mono">owner</div>
          </div>
        </div>
      </div>
    </header>
  );
}
