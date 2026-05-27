import type {
  AIConfig,
  BotCommand,
  DiscordConfig,
  KnowledgeFile,
  TrainedResponse,
} from "@/types";

export const DEFAULT_DISCORD_CONFIG: DiscordConfig = {
  botToken: "",
  applicationId: "",
  guildId: "",
  ticketCategoryId: "",
  ticketChannelNames: "tickets, support, help",
  staffChannelId: "",
  staffRoleId: "",
  webhookUrl: "",
  validated: false,
};

export interface DiscordValidation {
  valid: boolean;
  botName?: string;
  botId?: string;
  guildName?: string;
  error?: string;
  corsBlocked?: boolean;
}

/**
 * Attempts to validate a bot token by calling Discord's /users/@me endpoint.
 * NOTE: Discord does NOT send CORS headers for the Bot-token API, so this will
 * usually fail in the browser with a network error. We treat that case as
 * "browser cannot validate — config saved for the runtime to verify".
 */
export async function validateBotToken(token: string): Promise<DiscordValidation> {
  if (!token || token.length < 24) {
    return { valid: false, error: "Bot token format looks wrong (too short)." };
  }
  try {
    const res = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bot ${token}` },
    });
    if (!res.ok) {
      return { valid: false, error: `Discord returned ${res.status}` };
    }
    const data = await res.json();
    return { valid: true, botName: data.username, botId: data.id };
  } catch {
    return {
      valid: false,
      corsBlocked: true,
      error:
        "Browser cannot reach Discord's bot API directly (CORS). Token saved — your bot runtime will validate it on connect.",
    };
  }
}

/**
 * Sends a test message via webhook URL. Webhook posts work cross-origin.
 */
export async function sendWebhookMessage(
  webhookUrl: string,
  content: string,
  username = "MacroMedic",
): Promise<{ ok: boolean; error?: string }> {
  if (!webhookUrl) return { ok: false, error: "Webhook URL is empty" };
  if (!webhookUrl.includes("discord.com/api/webhooks/")) {
    return { ok: false, error: "URL doesn't look like a Discord webhook" };
  }
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, username }),
    });
    if (res.ok) return { ok: true };
    const text = await res.text().catch(() => "");
    return { ok: false, error: `${res.status} ${text.slice(0, 100)}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

export function getInviteUrl(
  applicationId: string,
  permissions = "274877974528",
): string {
  if (!applicationId) return "";
  return `https://discord.com/oauth2/authorize?client_id=${applicationId}&permissions=${permissions}&scope=bot+applications.commands`;
}

/**
 * Builds a JSON config bundle that a separate Node.js bot runtime can read.
 * The bundle excludes message contents — only configuration and code base.
 */
export function buildConfigBundle(args: {
  discord: DiscordConfig;
  ai: AIConfig;
  files: KnowledgeFile[];
  commands: BotCommand[];
  trained: TrainedResponse[];
}): string {
  const { discord, ai, files, commands, trained } = args;
  return JSON.stringify(
    {
      version: 1,
      generatedAt: new Date().toISOString(),
      discord: { ...discord, botToken: discord.botToken ? "[REDACTED]" : "" },
      ai: { ...ai, apiKey: ai.apiKey ? "[REDACTED]" : "" },
      knowledgeFiles: files.map((f) => ({
        name: f.name,
        path: f.path,
        language: f.language,
        content: f.content,
      })),
      commands,
      trainedResponses: trained,
    },
    null,
    2,
  );
}

export function downloadJSON(filename: string, content: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
