import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileCode2, Terminal, Ticket, Settings as SettingsIcon, ExternalLink, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/knowledge", label: "Knowledge Base", icon: FileCode2 },
  { to: "/dashboard/commands", label: "Commands & Training", icon: Terminal },
  { to: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { to: "/dashboard/settings", label: "Bot Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-border bg-[hsl(var(--sidebar-background))]">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center glow-primary">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-mono text-[15px] font-semibold tracking-tight leading-tight">
              MacroMedic
            </div>
            <div className="font-mono text-[11px] text-muted-foreground leading-tight">
              v1.0 • ahk-tickets
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
              )
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={() => navigate("/preview")}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary border border-dashed border-border transition-colors"
        >
          <span>Preview user chat</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <div className="mt-3 px-3 py-2 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary status-dot" />
          Bot online • 4ms
        </div>
      </div>
    </aside>
  );
}
