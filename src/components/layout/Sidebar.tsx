import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileCode2,
  Terminal,
  Ticket,
  Settings as SettingsIcon,
  ExternalLink,
  Activity,
  Webhook,
  Brain,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ModeBadge from "@/components/features/ModeBadge";
import { useStore, StorageKeys } from "@/lib/storage";
import type { DiscordConfig } from "@/types";
import { DEFAULT_DISCORD_CONFIG } from "@/lib/discord";

interface NavGroup {
  label?: string;
  items: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/dashboard/knowledge", label: "Knowledge Base", icon: FileCode2 },
      { to: "/dashboard/commands", label: "Commands & Training", icon: Terminal },
      { to: "/dashboard/tickets", label: "Tickets", icon: Ticket },
    ],
  },
  {
    label: "INTEGRATIONS",
    items: [
      { to: "/dashboard/discord", label: "Discord", icon: Webhook },
      { to: "/dashboard/ai", label: "AI Engine", icon: Brain },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { to: "/dashboard/staff", label: "Staff Accounts", icon: Users },
      { to: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [discord] = useStore<DiscordConfig>(
    StorageKeys.discordConfig,
    DEFAULT_DISCORD_CONFIG,
  );
  const isOnline = discord.validated || !!discord.webhookUrl;

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-border bg-[hsl(var(--sidebar-background))]">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center glow-primary">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[15px] font-semibold tracking-tight leading-tight">
              MacroMedic
            </div>
            <div className="font-mono text-[11px] text-muted-foreground leading-tight">
              v1.0 • ahk-tickets
            </div>
          </div>
        </div>
        <div className="mt-3">
          <ModeBadge />
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="px-3 pt-2 pb-1.5 text-[10px] font-mono tracking-[0.2em] text-muted-foreground/70 uppercase">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent",
                    )
                  }
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
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
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isOnline ? "bg-primary status-dot" : "bg-muted-foreground/40",
            )}
          />
          {isOnline ? "Discord linked" : "Discord not configured"}
        </div>
      </div>
    </aside>
  );
}
