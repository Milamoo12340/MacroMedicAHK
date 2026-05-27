import { useState } from "react";
import {
  Save,
  KeyRound,
  Webhook,
  ServerCog,
  ShieldCheck,
  Hash,
  Send,
  Download,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import { useStore, StorageKeys } from "@/lib/storage";
import {
  DEFAULT_DISCORD_CONFIG,
  validateBotToken,
  sendWebhookMessage,
  getInviteUrl,
  buildConfigBundle,
  downloadJSON,
} from "@/lib/discord";
import { DEFAULT_AI_CONFIG } from "@/lib/ai";
import type {
  AIConfig,
  BotCommand,
  DiscordConfig,
  KnowledgeFile,
  TrainedResponse,
} from "@/types";
import { toast } from "sonner";

export default function DiscordIntegration() {
  const [config, setConfig] = useStore<DiscordConfig>(
    StorageKeys.discordConfig,
    DEFAULT_DISCORD_CONFIG,
  );
  const [draft, setDraft] = useState<DiscordConfig>(config);
  const [aiConfig] = useStore<AIConfig>(StorageKeys.aiConfig, DEFAULT_AI_CONFIG);
  const [files] = useStore<KnowledgeFile[]>(StorageKeys.knowledgeFiles, []);
  const [commands] = useStore<BotCommand[]>(StorageKeys.commands, []);
  const [trained] = useStore<TrainedResponse[]>(StorageKeys.trainedResponses, []);

  const [testingToken, setTestingToken] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);

  const set = <K extends keyof DiscordConfig>(k: K, v: DiscordConfig[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    setConfig(draft);
    toast.success("Discord configuration saved");
  };

  const validate = async () => {
    setTestingToken(true);
    const r = await validateBotToken(draft.botToken);
    setTestingToken(false);
    if (r.valid) {
      const updated = {
        ...draft,
        validated: true,
        validatedAt: new Date().toISOString(),
        botName: r.botName,
      };
      setDraft(updated);
      setConfig(updated);
      toast.success(`Connected as ${r.botName}`);
    } else if (r.corsBlocked) {
      const updated = { ...draft, validated: false };
      setDraft(updated);
      toast(r.error ?? "Cannot validate from browser");
    } else {
      toast.error(r.error ?? "Token invalid");
    }
  };

  const testWebhook = async () => {
    setTestingWebhook(true);
    const r = await sendWebhookMessage(
      draft.webhookUrl,
      "MacroMedic webhook test — if you see this in your channel, it works.",
    );
    setTestingWebhook(false);
    if (r.ok) toast.success("Webhook test message sent");
    else toast.error(r.error ?? "Webhook failed");
  };

  const downloadConfig = () => {
    const bundle = buildConfigBundle({ discord: draft, ai: aiConfig, files, commands, trained });
    downloadJSON(`macromedic-config-${Date.now()}.json`, bundle);
    toast.success("Config bundle downloaded");
  };

  const copyInvite = () => {
    const url = getInviteUrl(draft.applicationId);
    if (!url) return toast.error("Set Application ID first");
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied");
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="INTEGRATION"
        title="Discord"
        subtitle="Connect your real Discord bot, server, and channels. Settings save the moment you press Save and persist across sessions."
        actions={
          <div className="flex gap-2 flex-wrap">
            <button onClick={downloadConfig} className="btn-secondary">
              <Download className="w-4 h-4" />
              Export config
            </button>
            <button onClick={save} className="btn-primary">
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        }
      />

      {/* Status */}
      <div className="card-surface p-5 flex items-start gap-4 flex-wrap">
        <div
          className={`w-11 h-11 rounded-md border flex items-center justify-center shrink-0 ${
            config.validated
              ? "bg-primary/10 border-primary/40 text-primary"
              : "bg-secondary border-border text-muted-foreground"
          }`}
        >
          {config.validated ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold">
            {config.validated ? `Connected as ${config.botName ?? "bot"}` : "Not connected"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {config.validated && config.validatedAt
              ? `Last validated ${new Date(config.validatedAt).toLocaleString()}`
              : "Save your bot token below and click Validate."}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={copyInvite} className="btn-secondary">
            <Copy className="w-4 h-4" />
            Copy invite link
          </button>
          <a
            href="https://discord.com/developers/applications"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            <ExternalLink className="w-4 h-4" />
            Discord dev portal
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card icon={KeyRound} title="Bot credentials" desc="From the Discord developer portal.">
          <Field label="Bot token (kept private, never sent off-device)">
            <input
              type="password"
              placeholder="MTIzNDU2…"
              className="input-base font-mono"
              value={draft.botToken}
              onChange={(e) => set("botToken", e.target.value)}
            />
          </Field>
          <Field label="Application (Client) ID">
            <input
              placeholder="123456789012345678"
              className="input-base font-mono"
              value={draft.applicationId}
              onChange={(e) => set("applicationId", e.target.value)}
            />
          </Field>
          <button onClick={validate} disabled={testingToken} className="btn-secondary w-full disabled:opacity-50">
            <ShieldCheck className="w-4 h-4" />
            {testingToken ? "Validating…" : "Validate token"}
          </button>
          <div className="text-[11px] font-mono text-muted-foreground p-3 rounded-md bg-secondary/50 border border-dashed border-border flex gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Discord blocks bot-token API calls from browsers (CORS). The token still saves locally — your bot runtime validates it on connect.
          </div>
        </Card>

        <Card icon={ServerCog} title="Server & channels" desc="Where the bot listens for tickets.">
          <Field label="Server (Guild) ID">
            <input
              placeholder="123456789012345678"
              className="input-base font-mono"
              value={draft.guildId}
              onChange={(e) => set("guildId", e.target.value)}
            />
          </Field>
          <Field label="Ticket category ID">
            <input
              placeholder="(category that contains ticket channels)"
              className="input-base font-mono"
              value={draft.ticketCategoryId}
              onChange={(e) => set("ticketCategoryId", e.target.value)}
            />
          </Field>
          <Field label="Ticket channel name patterns (comma-separated)">
            <input
              className="input-base font-mono"
              value={draft.ticketChannelNames}
              onChange={(e) => set("ticketChannelNames", e.target.value)}
            />
          </Field>
          <div className="text-[11px] font-mono text-muted-foreground">
            Enable Discord Developer Mode → right-click any server/channel → Copy ID.
          </div>
        </Card>

        <Card icon={ShieldCheck} title="Staff & escalation" desc="Who gets pinged when humans are needed.">
          <Field label="Staff channel ID (where escalations land)">
            <input
              placeholder="(text channel ID)"
              className="input-base font-mono"
              value={draft.staffChannelId}
              onChange={(e) => set("staffChannelId", e.target.value)}
            />
          </Field>
          <Field label="Staff role ID (the @role to ping)">
            <input
              placeholder="(role ID)"
              className="input-base font-mono"
              value={draft.staffRoleId}
              onChange={(e) => set("staffRoleId", e.target.value)}
            />
          </Field>
        </Card>

        <Card icon={Webhook} title="Webhook" desc="Used for outbound posts (works directly from this dashboard).">
          <Field label="Webhook URL">
            <input
              placeholder="https://discord.com/api/webhooks/…"
              className="input-base font-mono"
              value={draft.webhookUrl}
              onChange={(e) => set("webhookUrl", e.target.value)}
            />
          </Field>
          <button onClick={testWebhook} disabled={testingWebhook} className="btn-secondary w-full disabled:opacity-50">
            <Send className="w-4 h-4" />
            {testingWebhook ? "Posting…" : "Send test message"}
          </button>
          <div className="text-[11px] font-mono text-muted-foreground">
            Server Settings → Integrations → Webhooks → New Webhook → Copy URL.
          </div>
        </Card>
      </div>

      {/* Setup guide */}
      <div className="card-surface p-5">
        <div className="font-mono text-[11px] tracking-widest uppercase text-primary mb-3 flex items-center gap-1.5">
          <Hash className="w-3 h-3" />
          QUICK SETUP
        </div>
        <ol className="space-y-3 text-sm">
          {[
            "Open the Discord Developer Portal and create (or pick) your application.",
            "Inside the application, go to the Bot tab → Reset Token → copy the token here.",
            "Copy the Application ID from the General Information tab.",
            "In Discord client, enable Developer Mode (Settings → Advanced) so you can right-click and Copy ID for guilds, channels and roles.",
            "Paste each ID above. Use the Webhook URL for the dashboard's test message — webhooks work cross-origin even without the bot running.",
            "Click Export config to download a JSON bundle for the Node.js bot runtime that consumes these settings.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono text-[11px] shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
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
