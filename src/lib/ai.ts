import type {
  AIConfig,
  AIProviderId,
  KnowledgeFile,
  TrainedResponse,
} from "@/types";

export interface AIProviderInfo {
  id: AIProviderId;
  name: string;
  free: boolean;
  requiresKey: boolean;
  description: string;
  signupUrl?: string;
  keyHelp?: string;
}

export const AI_PROVIDERS: AIProviderInfo[] = [
  {
    id: "pollinations",
    name: "Pollinations AI",
    free: true,
    requiresKey: false,
    description: "Free, no API key, works 24/7 directly from the browser. Recommended default.",
  },
  {
    id: "groq",
    name: "Groq",
    free: true,
    requiresKey: true,
    description: "Free tier with very high rate limits and fast Llama 3.3 inference.",
    signupUrl: "https://console.groq.com/keys",
    keyHelp: "Sign up at console.groq.com → API Keys → Create",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    free: true,
    requiresKey: true,
    description: "Access to Llama, Gemini, Qwen and DeepSeek free tiers via one key.",
    signupUrl: "https://openrouter.ai/keys",
    keyHelp: "Use any model ending in :free for no cost",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    free: true,
    requiresKey: true,
    description: "Generous free tier from Google AI Studio.",
    signupUrl: "https://aistudio.google.com/app/apikey",
    keyHelp: "Free tier includes Gemini 2.0 Flash and 1.5 Flash",
  },
  {
    id: "custom",
    name: "Custom OpenAI-compatible",
    free: false,
    requiresKey: true,
    description: "Plug in any OpenAI-compatible endpoint (Ollama, LM Studio, vLLM, OpenAI…).",
    keyHelp: "Provide endpoint URL and key. Useful for self-hosted models.",
  },
  {
    id: "local",
    name: "Local rule-based",
    free: true,
    requiresKey: false,
    description: "Uses ONLY your trained responses + quick fixes. Zero network calls. Always works offline.",
  },
];

export const PROVIDER_MODELS: Record<AIProviderId, { id: string; label: string }[]> = {
  pollinations: [
    { id: "openai", label: "OpenAI (default, smart)" },
    { id: "mistral", label: "Mistral" },
    { id: "llama", label: "Llama" },
    { id: "searchgpt", label: "SearchGPT (web access)" },
    { id: "claude-hybridspace", label: "Claude (hybrid)" },
  ],
  groq: [
    { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (recommended)" },
    { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B (fast)" },
    { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    { id: "gemma2-9b-it", label: "Gemma 2 9B" },
  ],
  openrouter: [
    { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (free)" },
    { id: "google/gemini-2.0-flash-exp:free", label: "Gemini 2.0 Flash (free)" },
    { id: "qwen/qwen-2.5-72b-instruct:free", label: "Qwen 2.5 72B (free)" },
    { id: "deepseek/deepseek-chat:free", label: "DeepSeek Chat (free)" },
  ],
  gemini: [
    { id: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash" },
    { id: "gemini-1.5-flash-latest", label: "Gemini 1.5 Flash" },
    { id: "gemini-1.5-pro-latest", label: "Gemini 1.5 Pro" },
  ],
  custom: [{ id: "custom", label: "Custom (set in endpoint config)" }],
  local: [{ id: "rule-based", label: "Rule-based (trained responses only)" }],
};

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "pollinations",
  apiKey: "",
  customEndpoint: "",
  model: "openai",
  temperature: 0.5,
  enableImageReading: true,
  enableWebSearch: false,
  fallbackToLocal: true,
  systemPrompt: `You are MacroMedic, a helpful AI in a Discord server for AutoHotkey v2 (AHK2) game macros.

Your job is to triage and resolve common macro support tickets:
- Macros not launching (admin rights, AHK v2 missing, SmartScreen)
- Wrong click positions on non-1920x1080 resolutions (suggest AutoScale=1 in settings.ini)
- Hotkey conflicts (Discord PTT, NVIDIA, Overwolf, Steam overlay)
- Character at wrong starting position / spawn zone
- Common AHK v2 syntax errors

Reference exact filenames and line numbers from the user's uploaded codebase whenever possible.
Be concise (3-5 sentences), friendly, and technical. If unable to help, suggest the user run /human to escalate to staff.`,
};

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequest {
  message: string;
  history: ChatMessage[];
  config: AIConfig;
  knowledgeFiles?: KnowledgeFile[];
  trainedResponses?: TrainedResponse[];
  imageUrl?: string;
}

export interface AIResponse {
  content: string;
  provider: AIProviderId;
  fallback?: boolean;
  error?: string;
}

// --- Public entry --------------------------------------------------------

export async function generateAIResponse(req: AIRequest): Promise<AIResponse> {
  const { config, message, trainedResponses } = req;

  // Always check trained responses first — they're free + instant.
  const local = matchTrainedResponse(message, trainedResponses ?? []);
  if (config.provider === "local") {
    return {
      content:
        local ??
        "I don't have a trained response for that yet. Type /human to escalate to staff, or ask the admin to train me on this issue.",
      provider: "local",
    };
  }

  const sys = buildSystemPrompt(
    config.systemPrompt,
    req.knowledgeFiles,
    trainedResponses,
  );
  const messages: ChatMessage[] = [
    { role: "system", content: sys },
    ...req.history,
    { role: "user", content: message },
  ];

  try {
    let content = "";
    switch (config.provider) {
      case "pollinations":
        content = await callPollinations(messages, config);
        break;
      case "groq":
        content = await callOpenAICompat(
          "https://api.groq.com/openai/v1/chat/completions",
          messages,
          config,
        );
        break;
      case "openrouter":
        content = await callOpenAICompat(
          "https://openrouter.ai/api/v1/chat/completions",
          messages,
          config,
          { "HTTP-Referer": window.location.origin, "X-Title": "MacroMedic" },
        );
        break;
      case "gemini":
        content = await callGemini(messages, config);
        break;
      case "custom":
        if (!config.customEndpoint) throw new Error("Custom endpoint not configured");
        content = await callOpenAICompat(config.customEndpoint, messages, config);
        break;
      default:
        content = local ?? "Provider not configured.";
    }
    return { content: content.trim() || "(empty response)", provider: config.provider };
  } catch (e) {
    const err = e instanceof Error ? e.message : "Unknown error";
    if (config.fallbackToLocal && local) {
      return {
        content: local,
        provider: "local",
        fallback: true,
        error: err,
      };
    }
    return {
      content: `I had trouble reaching the AI service (${err}). Type /human to escalate to staff.`,
      provider: config.provider,
      error: err,
    };
  }
}

// --- Provider implementations -------------------------------------------

async function callPollinations(messages: ChatMessage[], config: AIConfig): Promise<string> {
  const res = await fetch("https://text.pollinations.ai/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model || "openai",
      messages,
      temperature: config.temperature,
      private: true,
    }),
  });
  if (!res.ok) throw new Error(`Pollinations ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callOpenAICompat(
  url: string,
  messages: ChatMessage[],
  config: AIConfig,
  extraHeaders: Record<string, string> = {},
): Promise<string> {
  if (!config.apiKey) throw new Error("API key missing");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(messages: ChatMessage[], config: AIConfig): Promise<string> {
  if (!config.apiKey) throw new Error("Gemini API key missing");
  const sys = messages.find((m) => m.role === "system")?.content ?? "";
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: sys ? { parts: [{ text: sys }] } : undefined,
      contents,
      generationConfig: { temperature: config.temperature },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status} ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// --- Helpers ------------------------------------------------------------

export function matchTrainedResponse(
  message: string,
  trained: TrainedResponse[],
): string | null {
  const lower = message.toLowerCase();
  for (const r of trained) {
    if (!r.active) continue;
    const phrases = r.trigger
      .split(/[,/]/)
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);
    if (phrases.some((p) => p && lower.includes(p))) return r.response;
  }
  return null;
}

function buildSystemPrompt(
  base: string,
  files?: KnowledgeFile[],
  trained?: TrainedResponse[],
): string {
  let prompt = base;
  if (files?.length) {
    const indexed = files.filter((f) => f.indexed && f.content);
    if (indexed.length) {
      prompt += "\n\n=== USER'S MACRO CODEBASE ===\n";
      for (const f of indexed.slice(0, 8)) {
        prompt += `\n--- ${f.path}${f.name} ---\n${(f.content ?? "").slice(0, 2500)}\n`;
      }
      if (indexed.length > 8) {
        prompt += `\n(${indexed.length - 8} more files indexed but truncated for context.)\n`;
      }
    }
  }
  if (trained?.length) {
    const active = trained.filter((r) => r.active);
    if (active.length) {
      prompt += "\n\n=== ADMIN-APPROVED RESPONSES ===\n";
      for (const r of active) {
        prompt += `Trigger: ${r.trigger}\nReply: ${r.response}\n\n`;
      }
    }
  }
  return prompt;
}
