import { useState } from "react";
import {
  Brain,
  Save,
  Zap,
  KeyRound,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  Cpu,
  RotateCcw,
  TestTube2,
} from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import { useStore, StorageKeys } from "@/lib/storage";
import {
  AI_PROVIDERS,
  PROVIDER_MODELS,
  DEFAULT_AI_CONFIG,
  generateAIResponse,
} from "@/lib/ai";
import type { AIConfig, AIProviderId, TrainedResponse } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AIProvider() {
  const [config, setConfig] = useStore<AIConfig>(StorageKeys.aiConfig, DEFAULT_AI_CONFIG);
  const [draft, setDraft] = useState<AIConfig>(config);
  const [trained] = useStore<TrainedResponse[]>(StorageKeys.trainedResponses, []);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const provider = AI_PROVIDERS.find((p) => p.id === draft.provider)!;
  const models = PROVIDER_MODELS[draft.provider];

  const set = <K extends keyof AIConfig>(k: K, v: AIConfig[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    setConfig(draft);
    toast.success("AI provider saved");
  };

  const reset = () => {
    setDraft(DEFAULT_AI_CONFIG);
    setConfig(DEFAULT_AI_CONFIG);
    toast("AI provider reset to defaults");
  };

  const test = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await generateAIResponse({
      message: "Reply with a single sentence: confirm you're online and ready to help with AHK macro tickets.",
      history: [],
      config: draft,
      trainedResponses: trained,
    });
    setTestResult(res.content);
    if (res.error) toast.error(`Test failed: ${res.error}`);
    else toast.success(`Reply received from ${res.provider}${res.fallback ? " (fallback)" : ""}`);
    setTesting(false);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="AI ENGINE"
        title="AI provider"
        subtitle="Choose how the bot generates replies. Free options work without OnSpace credits or any payment."
        actions={
          <div className="flex gap-2 flex-wrap">
            <button onClick={reset} className="btn-secondary">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button onClick={test} disabled={testing} className="btn-secondary disabled:opacity-50">
              <TestTube2 className="w-4 h-4" />
              {testing ? "Testing…" : "Test connection"}
            </button>
            <button onClick={save} className="btn-primary">
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        }
      />

      {/* Provider grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AI_PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              const firstModel = PROVIDER_MODELS[p.id][0]?.id ?? "";
              set("provider", p.id);
              set("model", firstModel);
            }}
            className={cn(
              "card-surface p-4 text-left transition-all hover:border-primary/40",
              draft.provider === p.id && "border-primary/60 bg-primary/5",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-md border flex items-center justify-center shrink-0",
                  p.free
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-accent/10 border-accent/30 text-accent",
                )}
              >
                {p.requiresKey ? <KeyRound className="w-[18px] h-[18px]" /> : <Zap className="w-[18px] h-[18px]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold">{p.name}</div>
                  {p.free && <span className="chip chip-primary">FREE</span>}
                  {!p.requiresKey && <span className="chip">no key</span>}
                  {p.requiresKey && <span className="chip">key required</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {p.description}
                </div>
                {p.signupUrl && (
                  <a
                    href={p.signupUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-primary inline-flex items-center gap-1 mt-2 hover:underline"
                  >
                    Get free key
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card icon={Cpu} title="Model & parameters">
          <Field label="Model">
            <select
              className="input-base font-mono"
              value={draft.model}
              onChange={(e) => set("model", e.target.value)}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={`Temperature: ${draft.temperature.toFixed(2)}`}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={draft.temperature}
              onChange={(e) => set("temperature", Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
              <span>focused</span>
              <span>creative</span>
            </div>
          </Field>
          {provider.requiresKey && (
            <Field label="API key">
              <input
                type="password"
                placeholder="sk-…"
                className="input-base font-mono"
                value={draft.apiKey}
                onChange={(e) => set("apiKey", e.target.value)}
              />
              {provider.keyHelp && (
                <div className="text-[11px] text-muted-foreground font-mono mt-1.5">
                  {provider.keyHelp}
                </div>
              )}
            </Field>
          )}
          {draft.provider === "custom" && (
            <Field label="Endpoint URL (OpenAI compatible)">
              <input
                placeholder="https://your-endpoint.example.com/v1/chat/completions"
                className="input-base font-mono"
                value={draft.customEndpoint}
                onChange={(e) => set("customEndpoint", e.target.value)}
              />
            </Field>
          )}
        </Card>

        <Card icon={Brain} title="Behavior">
          <Field label="System prompt">
            <textarea
              className="input-base font-mono text-xs min-h-[180px] resize-y"
              value={draft.systemPrompt}
              onChange={(e) => set("systemPrompt", e.target.value)}
            />
            <div className="text-[11px] text-muted-foreground mt-1.5">
              Your knowledge base files and trained responses are appended automatically when the AI replies.
            </div>
          </Field>
          <ToggleRow
            icon={ImageIcon}
            label="Image reading"
            desc="Allow the bot to interpret screenshots users send (provider-dependent)."
            value={draft.enableImageReading}
            onChange={(v) => set("enableImageReading", v)}
          />
          <ToggleRow
            icon={Globe2}
            label="Web search fallback"
            desc="Let the bot search the web when knowledge base lacks context (Pollinations searchgpt or your provider's tool support)."
            value={draft.enableWebSearch}
            onChange={(v) => set("enableWebSearch", v)}
          />
          <ToggleRow
            icon={Cpu}
            label="Local fallback if AI fails"
            desc="If the external provider is down, fall back to your trained responses so the bot still answers 24/7."
            value={draft.fallbackToLocal}
            onChange={(v) => set("fallbackToLocal", v)}
          />
        </Card>
      </div>

      {testResult && (
        <div className="card-surface p-5">
          <div className="font-mono text-[11px] tracking-widest uppercase text-primary mb-2">
            TEST RESPONSE
          </div>
          <div className="text-sm whitespace-pre-wrap">{testResult}</div>
        </div>
      )}
    </div>
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
