import { Bell, Search, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCurrentUser, logout } from "@/lib/auth";
import ModeBadge from "@/components/features/ModeBadge";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const navigate = useNavigate();
  const me = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    toast("Signed out");
    navigate("/login");
  };

  const initial = (me?.displayName || me?.username || "?").charAt(0).toUpperCase();

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
        <div className="hidden lg:block">
          <ModeBadge />
        </div>
        <button
          onClick={() => toast("No new notifications")}
          className="btn-ghost h-9 py-0 relative"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "flex items-center gap-2 pl-2 pr-3 py-1 ml-1 border-l border-border h-9 rounded-md transition-colors",
              menuOpen && "bg-secondary",
            )}
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary/40 to-accent/40 border border-border flex items-center justify-center text-xs font-mono font-semibold">
              {initial}
            </div>
            <div className="hidden md:block leading-tight text-left">
              <div className="text-[13px] font-medium">{me?.displayName ?? "Guest"}</div>
              <div className="text-[11px] text-muted-foreground font-mono">{me?.role ?? "—"}</div>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-56 card-surface p-1.5 z-40 shadow-xl">
              <div className="px-3 py-2.5 border-b border-border mb-1">
                <div className="text-sm font-medium truncate">
                  {me?.displayName ?? "—"}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground truncate">
                  @{me?.username ?? "guest"}
                </div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/dashboard/settings");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <SettingsIcon className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
