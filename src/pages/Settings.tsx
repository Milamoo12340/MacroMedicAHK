import { useNavigate } from "react-router-dom";
import {
  Bot,
  Image as ImageIcon,
  Globe2,
  Shield,
  Save,
  Users,
  Beaker,
  Wifi,
  Trash2,
  RefreshCw,
  ArrowRight,
  Webhook,
  Brain,
  ShieldAlert,
  Database,
} from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import { useStore, StorageKeys, clearAllStorage } from "@/lib/storage";
import { seedDemoData, clearDemoData, clearAllUserData } from "@/lib/mockData";
import type { AppMode, BotConfig, DiscordConfig, AIConfig } from "@/types";
import { useCurrentUser, logout } from "@/lib/auth";
import { DEFAULT_DISCORD_CONFIG } from "@/lib/discord";
import { DEFAULT_AI_CONFIG } from "@/lib/ai";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DEFAULT_BOT_CONFIG: BotConfig = {
  tone: "Friendly debugger",
  escalateKeyword: "/human",
  staffRolePing: "@TicketHelpers",
  quickFixFirst: true,
  autoTranslate: false,
  rateLimit: 20,
};

export default function Settings() {
  const navigate = useNavigate();
  const me = useCurrentUser();
  const [mode, setMode] = useStore<AppMode>(StorageKeys.appMode, "demo");
  const [config, setConfig] = useStore<BotConfig>(StorageKeys.botConfig, DEFAULT_BOT_CONFIG);
  const [discord] = useStore<DiscordConfig>(StorageKeys.discordConfig, DEFAULT_DISCORD_CONFIG);
  const [ai] = useStore<AIConfig>(StorageKeys.aiConfig, DEFAULT_AI_CONFIG);

  const set = <K extends keyof BotConfig>(k: K, v: BotConfig[K]) =>
    setConfig({ ...config, [k]: v });

  const setLive = () => {
    setMode("live");
    toast.success("Switched to Live mode");
  };

  const setDemo = () => {
    setMode("demo");
    seedDemoData();
    toast.success("Switched to Demo mode (sample data restored)");
  };

  const removeDemoOnly = () => {
    if (!confirm("Remove all demo tickets, files, commands and trained responses? Your own additions stay.")) return;
    clearDemoData();
    toast.success("Demo data cleared");
  };

  const wipeAllData = () => {
    if (!confirm("Wipe ALL tickets, files, commands and trained responses? This cannot be undone.")) return;
    clearAllUserData();
    toast.success("All data wiped");
  };

  const factoryReset = () => {
    if (!confirm("Factory reset everything (accounts, integrations, knowledge)? You'll be signed out and need to create a new owner.")) return;
    clearAllStorage();
    toast.success("Factory reset complete");
    setTimeout(() => window.location.assign("/login"), 600);
  };

  const handleLogout = () => {
    logout();
    toast("Signed out");
    navigate("/login");
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="CONFIGURATION"
        title="Settings"
        subtitle="Switch between demo and live modes, manage your data, and tune bot behavior."
        actions={
          <button onClick={() => toast.success("Bot behavior saved")} className="btn-primary">
            <Save className="w-4 h-4" />
            Save behavior
          </button>
        }
      />

      {/* Mode switcher */}
      <div className="card-surface p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[11px] tracking-widest uppercase text-primary mb-1">
              APP MODE
            </div>
            <div className="font-semibold">
              {mode === "live" ? "Running on real integrations" : "Running on demo data"}
            </div>
            <div className="text-sm text-muted-foreground mt-1 max-w-xl">
              {mode === "live"
                ? "All tickets, knowledge files and replies are yours. AI calls go to your configured provider."
                : "Sample tickets and macros are loaded so you can explore. Switch to Live when you're ready to use your real bot."}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-md border border-border bg-secondary/40">
            <ModeBtn active={mode === "demo"} onClick={setDemo} label="Demo" icon={Beaker} />
            <ModeBtn active={mode === "live"} onClick={setLive} label="Live" icon={Wifi} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={removeDemoOnly}
            className="card-surface p-4 text-left hover:border-primary/40 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-primary mb-2" />
            <div className="text-sm font-semibold">Clear demo data</div>
            <div className="text-xs text-muted-foreground mt-1">
              Remove sample tickets, files, commands & trained responses. Keeps your own.
            </div>
          </button>
          <button
            onClick={() => {
              seedDemoData();
              toast.success("Demo data restored");
            }}
            className="card-surface p-4 text-left hover:border-primary/40 transition-colors"
          >
            <Database className="w-4 h-4 text-primary mb-2" />
            <div className="text-sm font-semibold">Restore demo data</div>
            <div className="text-xs text-muted-foreground mt-1">
              Re-add sample data without touching your own additions.
            </div>
          </button>
          <button
            onClick={wipeAllData}
            className="card-surface p-4 text-left hover:border-destructive/40 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-destructive mb-2" />
            <div className="text-sm font-semibold">Wipe all data</div>
            <div className="text-xs text-muted-foreground mt-1">
              Remove every ticket, file, command and response (yours + demo).
            </div>
          </button>
        </div>
      </div>

      {/* Integration shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ShortcutCard
          icon={Webhook}
          title="Discord integration"
          desc={
            discord.validated
              ? `Connected as ${discord.botName ?? "bot"}`
              : "Not configured yet — add bot token, server ID, channels."
          }
          status={discord.validated || !!discord.botToken}
          onClick={() => navigate("/dashboard/discord")}
        />
        <ShortcutCard
          icon={Brain}
          title="AI provider"
          desc={`${ai.provider} • ${ai.model}`}
          status={!!ai.provider}
          onClick={() => navigate("/dashboard/ai")}
        />
        <ShortcutCard
          icon={Users}
          title="Staff accounts"
          desc="Manage who can sign in to this dashboard."
          status
          onClick={() => navigate("/dashboard/staff")}
        />
      </div>

      {/* Bot behavior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card icon={Bot} title="Conversation tone">
          <Field label="Tone preset">
            <select
              className="input-base"
              value={config.tone}
              onChange={(e) => set("tone", e.target.value)}
            >
              <option>Friendly debugger</option>
              <option>Blunt &amp; technical</option>
              <option>Supportive newcomer</option>
              <option>Gamer peer</option>
            </select>
          </Field>
          <ToggleRow
            label="Show quick-fix checklist first"
            desc="Present the 4 common causes before opening AI chat."
            icon={Users}
            value={config.quickFixFirst}
            onChange={(v) => set("quickFixFirst", v)}
          />
          <ToggleRow
            label="Auto-translate non-English tickets"
            desc="Translate incoming messages to English before reasoning."
            icon={Globe2}
            value={config.autoTranslate}
            onChange={(v) => set("autoTranslate", v)}
          />
        </Card>

        <Card icon={Shield} title="Escalation rules">
          <Field label="Escalation command">
            <input
              className="input-base font-mono"
              value={config.escalateKeyword}
              onChange={(e) => set("escalateKeyword", e.target.value)}
            />
          </Field>
          <Field label="Staff role to ping (display only)">
            <input
              className="input-base font-mono"
              value={config.staffRolePing}
              onChange={(e) => set("staffRolePing", e.target.value)}
            />
          </Field>
          <Field label="Rate limit (replies per minute per user)">
            <input
              type="number"
              min={1}
              max={120}
              className="input-base font-mono"
              value={config.rateLimit}
              onChange={(e) => set("rateLimit", Number(e.target.value))}
            />
          </Field>
        </Card>
      </div>

      {/* Account / danger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card-surface p-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border mb-4">
            <div className="w-9 h-9 rounded-md bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Users className="w-[18px] h-[18px] text-accent" />
            </div>
            <div className="font-semibold">Your session</div>
          </div>
          {me ? (
            <div className="text-sm">
              <div className="font-mono">{me.username}</div>
              <div className="text-muted-foreground text-xs mt-1">
                Role: <span className="chip ml-1">{me.role}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary mt-4 w-full">
                Sign out
              </button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Not signed in.</div>
          )}
        </div>

        <div className="card-surface p-5 border-destructive/30">
          <div className="flex items-center gap-3 pb-3 border-b border-border mb-4">
            <div className="w-9 h-9 rounded-md bg-destructive/10 border border-destructive/30 flex items-center justify-center">
              <ShieldAlert className="w-[18px] h-[18px] text-destructive" />
            </div>
            <div className="font-semibold">Danger zone</div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Factory reset wipes accounts, integrations, knowledge and all settings on this device.
          </p>
          <button onClick={factoryReset} className="btn-secondary w-full hover:text-destructive">
            <Trash2 className="w-4 h-4" />
            Factory reset
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[110px]",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function ShortcutCard({
  icon: Icon,
  title,
  desc,
  status,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  status: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card-surface p-5 text-left hover:border-primary/40 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-primary" />
        </div>
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            status ? "bg-primary status-dot" : "bg-muted-foreground/40",
          )}
        />
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground mt-1 truncate">{desc}</div>
      <div className="mt-3 text-xs text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
        Open <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-surface p-5 space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-primary" />
        </div>
        <div className="font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] uppercase font-mono tracking-widest text-muted-foreground mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-md border border-border bg-background/40 hover:bg-secondary/50 transition-colors cursor-pointer">
      <div className="w-8 h-8 rounded-md bg-secondary border border-border flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          "relative w-10 h-6 rounded-full transition-colors shrink-0",
          value ? "bg-primary" : "bg-secondary border border-border",
        )}
        aria-pressed={value}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform",
            value ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}
