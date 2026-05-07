import { useEffect, useState } from "react";
import { Bot, Image as ImageIcon, Globe2, Shield, KeyRound, Webhook, Save, Users } from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import { loadJSON, saveJSON } from "@/lib/storage";
import { toast } from "sonner";

interface BotConfig {
  model: string;
  tone: string;
  readImages: boolean;
  webAccess: boolean;
  escalateKeyword: string;
  staffRole: string;
  channelBinding: string;
  quickFixFirst: boolean;
  autoTranslate: boolean;
  rateLimit: number;
  discordToken: string;
}

const DEFAULT: BotConfig = {
  model: "gpt-5-macro",
  tone: "Friendly debugger",
  readImages: true,
  webAccess: true,
  escalateKeyword: "/human",
  staffRole: "@TicketHelpers",
  channelBinding: "tickets, support, help",
  quickFixFirst: true,
  autoTranslate: false,
  rateLimit: 20,
  discordToken: "",
};

export default function Settings() {
  const [config, setConfig] = useState<BotConfig>(DEFAULT);

  useEffect(() => {
    setConfig(loadJSON("botConfig", DEFAULT));
  }, []);

  const save = () => {
    saveJSON("botConfig", config);
    toast.success("Bot configuration saved");
  };

  const set = <K extends keyof BotConfig>(k: K, v: BotConfig[K]) =>
    setConfig((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="CONFIGURATION"
        title="Bot settings"
        subtitle="Tune behavior, permissions, escalation rules, and integrations. Changes apply to the bot live."
        actions={
          <button onClick={save} className="btn-primary">
            <Save className="w-4 h-4" />
            Save changes
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card icon={Bot} title="AI brain" desc="Control the model and personality.">
          <Field label="Model">
            <select className="input-base" value={config.model} onChange={(e) => set("model", e.target.value)}>
              <option value="gpt-5-macro">GPT-5 Macro (recommended)</option>
              <option value="gpt-5-fast">GPT-5 Fast</option>
              <option value="claude-opus">Claude Opus</option>
              <option value="gemini-3">Gemini 3</option>
            </select>
          </Field>
          <Field label="Tone">
            <select className="input-base" value={config.tone} onChange={(e) => set("tone", e.target.value)}>
              <option>Friendly debugger</option>
              <option>Blunt &amp; technical</option>
              <option>Supportive newcomer</option>
              <option>Gamer peer</option>
            </select>
          </Field>
          <ToggleRow
            label="Read images sent by users"
            desc="Analyze screenshots (resolution, errors, coords) when diagnosing."
            icon={ImageIcon}
            value={config.readImages}
            onChange={(v) => set("readImages", v)}
          />
          <ToggleRow
            label="Web browsing fallback"
            desc="Let the bot search the web when knowledge base lacks context."
            icon={Globe2}
            value={config.webAccess}
            onChange={(v) => set("webAccess", v)}
          />
        </Card>

        <Card icon={Shield} title="Escalation rules" desc="Define when a ticket becomes human-owned.">
          <Field label="Escalation command">
            <input
              className="input-base font-mono"
              value={config.escalateKeyword}
              onChange={(e) => set("escalateKeyword", e.target.value)}
            />
          </Field>
          <Field label="Staff role to ping">
            <input
              className="input-base font-mono"
              value={config.staffRole}
              onChange={(e) => set("staffRole", e.target.value)}
            />
          </Field>
          <ToggleRow
            label="Show quick-fix checklist first"
            desc="Present common causes before opening AI chat."
            icon={Users}
            value={config.quickFixFirst}
            onChange={(v) => set("quickFixFirst", v)}
          />
        </Card>

        <Card icon={Webhook} title="Discord integration" desc="Channels and permissions the bot listens to.">
          <Field label="Ticket channel names (comma-separated)">
            <input
              className="input-base font-mono"
              value={config.channelBinding}
              onChange={(e) => set("channelBinding", e.target.value)}
            />
          </Field>
          <Field label="Rate limit (replies per minute per user)">
            <input
              type="number"
              className="input-base font-mono"
              value={config.rateLimit}
              onChange={(e) => set("rateLimit", Number(e.target.value))}
            />
          </Field>
          <ToggleRow
            label="Auto-translate non-English tickets"
            desc="Translate incoming messages to English before reasoning."
            icon={Globe2}
            value={config.autoTranslate}
            onChange={(v) => set("autoTranslate", v)}
          />
        </Card>

        <Card icon={KeyRound} title="Credentials" desc="Discord bot token &amp; webhook secrets.">
          <Field label="Discord bot token">
            <input
              type="password"
              className="input-base font-mono"
              placeholder="MTIzNDU2Nzg5…"
              value={config.discordToken}
              onChange={(e) => set("discordToken", e.target.value)}
            />
          </Field>
          <div className="mt-2 p-3 rounded-md border border-dashed border-border text-[12px] text-muted-foreground font-mono leading-relaxed">
            Tokens are stored encrypted at rest. Rotate in the Discord developer portal any time — paste the new one here and we reconnect automatically.
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-surface p-5 space-y-4">
      <div className="flex items-start gap-3 pb-3 border-b border-border">
        <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Icon className="w-[18px] h-[18px] text-primary" />
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
        </div>
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
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
          value ? "bg-primary" : "bg-secondary border border-border"
        }`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
            value ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
