import { useState } from "react";
import {
  Plus,
  Terminal,
  Brain,
  Save,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import EmptyState from "@/components/features/EmptyState";
import { useStore, StorageKeys } from "@/lib/storage";
import type { BotCommand, TrainedResponse } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "commands" | "training";

export default function Commands() {
  const [tab, setTab] = useState<Tab>("commands");
  const [commands, setCommands] = useStore<BotCommand[]>(StorageKeys.commands, []);
  const [trained, setTrained] = useStore<TrainedResponse[]>(
    StorageKeys.trainedResponses,
    [],
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="BOT BEHAVIOR"
        title="Commands & training"
        subtitle="Create slash commands for your ticket channels and teach the AI exact phrasing for common issues. All saved on this device."
      />

      <div className="inline-flex p-1 rounded-md border border-border bg-secondary/50">
        <TabButton active={tab === "commands"} onClick={() => setTab("commands")}>
          <Terminal className="w-4 h-4" />
          Slash commands ({commands.length})
        </TabButton>
        <TabButton active={tab === "training"} onClick={() => setTab("training")}>
          <Brain className="w-4 h-4" />
          Trained responses ({trained.length})
        </TabButton>
      </div>

      {tab === "commands" ? (
        <CommandsPanel commands={commands} setCommands={setCommands} />
      ) : (
        <TrainingPanel trained={trained} setTrained={setTrained} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function CommandsPanel({
  commands,
  setCommands,
}: {
  commands: BotCommand[];
  setCommands: (v: BotCommand[] | ((prev: BotCommand[]) => BotCommand[])) => void;
}) {
  const [editing, setEditing] = useState<BotCommand | null>(null);

  const addNew = () => {
    setEditing({
      id: `cmd-${Date.now()}`,
      command: "/new",
      description: "Describe what this command does",
      response: "Response users will see when this is invoked.",
      active: true,
    });
  };

  const saveCmd = () => {
    if (!editing) return;
    if (!editing.command.startsWith("/")) {
      toast.error("Commands must start with /");
      return;
    }
    setCommands((prev) => {
      const exists = prev.find((c) => c.id === editing.id);
      if (exists) return prev.map((c) => (c.id === editing.id ? editing : c));
      return [editing, ...prev];
    });
    setEditing(null);
    toast.success(`${editing.command} saved`);
  };

  const toggle = (id: string) =>
    setCommands((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    );

  const del = (id: string) => {
    if (!confirm("Delete this command?")) return;
    setCommands((prev) => prev.filter((c) => c.id !== id));
    toast("Command removed");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        <div className="flex justify-end">
          <button onClick={addNew} className="btn-primary">
            <Plus className="w-4 h-4" /> New command
          </button>
        </div>
        {commands.length === 0 ? (
          <EmptyState
            icon={Terminal}
            title="No commands yet"
            description="Slash commands give your members quick actions inside Discord ticket channels."
            action={
              <button onClick={addNew} className="btn-primary">
                <Plus className="w-4 h-4" />
                Create first command
              </button>
            }
          />
        ) : (
          commands.map((c) => (
            <div key={c.id} className="card-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-md bg-accent/10 border border-accent/30 flex items-center justify-center shrink-0">
                    <Terminal className="w-[18px] h-[18px] text-accent" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-[14px] text-primary">{c.command}</code>
                      {c.active ? (
                        <span className="chip chip-primary">active</span>
                      ) : (
                        <span className="chip">disabled</span>
                      )}
                      {c.isDemo && <span className="chip">demo</span>}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{c.description}</div>
                    <div className="mt-2 text-[13px] bg-background rounded-md border border-border p-3 font-mono text-muted-foreground whitespace-pre-wrap">
                      {c.response}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="btn-ghost h-8 px-2" onClick={() => toggle(c.id)}>
                    {c.active ? (
                      <ToggleRight className="w-4 h-4 text-primary" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                  </button>
                  <button className="btn-ghost h-8 px-2" onClick={() => setEditing(c)}>
                    Edit
                  </button>
                  <button
                    className="btn-ghost h-8 px-2 hover:text-destructive"
                    onClick={() => del(c.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card-surface p-5 sticky top-20 self-start">
        <div className="font-mono text-[11px] tracking-widest uppercase text-primary mb-3">
          {editing ? "EDITING" : "COMMAND INSPECTOR"}
        </div>
        {editing ? (
          <div className="space-y-4">
            <Field label="Command trigger">
              <input
                className="input-base font-mono text-sm"
                value={editing.command}
                onChange={(e) => setEditing({ ...editing, command: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <input
                className="input-base text-sm"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </Field>
            <Field label="Bot response">
              <textarea
                className="input-base text-sm min-h-[110px] resize-y font-mono"
                value={editing.response}
                onChange={(e) => setEditing({ ...editing, response: e.target.value })}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                className="accent-primary"
              />
              Active in Discord
            </label>
            <div className="flex gap-2">
              <button onClick={saveCmd} className="btn-primary flex-1">
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={() => setEditing(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Select a command from the list or create a new one. Commands appear as native Discord slash options inside ticket channels.
          </div>
        )}
      </div>
    </div>
  );
}

function TrainingPanel({
  trained,
  setTrained,
}: {
  trained: TrainedResponse[];
  setTrained: (v: TrainedResponse[] | ((prev: TrainedResponse[]) => TrainedResponse[])) => void;
}) {
  const [draft, setDraft] = useState<TrainedResponse>({
    id: "",
    trigger: "",
    category: "Launch",
    response: "",
    active: true,
    hits: 0,
  });

  const add = () => {
    if (!draft.trigger || !draft.response) {
      toast.error("Trigger and response required");
      return;
    }
    const entry = { ...draft, id: `r-${Date.now()}` };
    setTrained((prev) => [entry, ...prev]);
    setDraft({ id: "", trigger: "", category: "Launch", response: "", active: true, hits: 0 });
    toast.success("AI trained on new pattern");
  };

  const del = (id: string) => {
    if (!confirm("Delete this trained response?")) return;
    setTrained((prev) => prev.filter((r) => r.id !== id));
    toast("Response deleted");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        {trained.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="No trained responses yet"
            description="Trained responses are matched instantly without calling the AI — perfect for known issues."
          />
        ) : (
          trained.map((r) => (
            <div key={r.id} className="card-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="chip chip-accent">{r.category}</span>
                    <span className="chip">{r.hits} hits</span>
                    {r.active ? (
                      <span className="chip chip-primary">active</span>
                    ) : (
                      <span className="chip">paused</span>
                    )}
                    {r.isDemo && <span className="chip">demo</span>}
                  </div>
                  <div className="mt-2 text-[11px] uppercase font-mono tracking-widest text-muted-foreground">
                    Trigger phrases
                  </div>
                  <div className="text-sm font-mono text-foreground">{r.trigger}</div>
                  <div className="mt-2 text-[11px] uppercase font-mono tracking-widest text-muted-foreground">
                    Reply template
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{r.response}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    className="btn-ghost h-8 px-2"
                    onClick={() =>
                      setTrained((p) =>
                        p.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)),
                      )
                    }
                  >
                    {r.active ? (
                      <ToggleRight className="w-4 h-4 text-primary" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="btn-ghost h-8 px-2 hover:text-destructive"
                    onClick={() => del(r.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card-surface p-5 sticky top-20 self-start">
        <div className="font-mono text-[11px] tracking-widest uppercase text-primary mb-3">
          TRAIN NEW PATTERN
        </div>
        <div className="space-y-4">
          <Field label="Trigger phrases (comma-separated)">
            <input
              className="input-base text-sm font-mono"
              placeholder="not launching, won't open, double-click does nothing"
              value={draft.trigger}
              onChange={(e) => setDraft({ ...draft, trigger: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <select
              className="input-base text-sm"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              {["Launch", "Resolution", "Admin Rights", "In-Game Position", "Debug", "Other"].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field label="Reply template">
            <textarea
              className="input-base text-sm min-h-[110px] resize-y"
              placeholder="Explain the fix step-by-step…"
              value={draft.response}
              onChange={(e) => setDraft({ ...draft, response: e.target.value })}
            />
          </Field>
          <button onClick={add} className="btn-primary w-full">
            <Brain className="w-4 h-4" /> Train the AI
          </button>
        </div>
      </div>
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
