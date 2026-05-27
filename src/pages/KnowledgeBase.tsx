import { useState } from "react";
import {
  Upload,
  FileCode2,
  Search,
  Trash2,
  RefreshCw,
  CheckCircle2,
  CircleSlash,
  Eye,
  Plus,
} from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import EmptyState from "@/components/features/EmptyState";
import { useStore, StorageKeys } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { KnowledgeFile } from "@/types";

const langFromName = (name: string): KnowledgeFile["language"] => {
  const lower = name.toLowerCase();
  if (lower.endsWith(".ahk") || lower.endsWith(".ahk2")) return "AHK2";
  if (lower.endsWith(".json")) return "JSON";
  if (lower.endsWith(".md")) return "MD";
  if (lower.endsWith(".txt") || lower.endsWith(".ini")) return "TXT";
  return "Other";
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export default function KnowledgeBase() {
  const [files, setFiles] = useStore<KnowledgeFile[]>(StorageKeys.knowledgeFiles, []);
  const [query, setQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [viewing, setViewing] = useState<KnowledgeFile | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteName, setPasteName] = useState("");
  const [pasteContent, setPasteContent] = useState("");

  const filtered = files.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.macro.toLowerCase().includes(query.toLowerCase()),
  );

  const ingestFiles = async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    const additions: KnowledgeFile[] = [];
    for (const file of arr) {
      const content = await file.text().catch(() => "");
      const lang = langFromName(file.name);
      additions.push({
        id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        path: "/macros/uploaded/",
        size: formatSize(file.size),
        byteSize: file.size,
        macro: lang === "AHK2" ? "Custom" : "Asset",
        language: lang,
        indexed: false,
        updatedAt: new Date().toISOString().slice(0, 10),
        content,
      });
    }
    setFiles((prev) => [...additions, ...prev]);
    toast.success(`${additions.length} file(s) added — indexing…`);
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) =>
          additions.find((a) => a.id === f.id) ? { ...f, indexed: true } : f,
        ),
      );
      toast.success("AI finished reading the new files");
    }, 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) ingestFiles(e.dataTransfer.files);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) ingestFiles(e.target.files);
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast("File removed from knowledge base");
  };

  const reindex = (id: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, indexed: false } : f)));
    setTimeout(() => {
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, indexed: true } : f)));
      toast.success("Re-indexed");
    }, 600);
  };

  const submitPaste = () => {
    if (!pasteName.trim() || !pasteContent.trim()) {
      toast.error("Filename and content required");
      return;
    }
    const lang = langFromName(pasteName);
    const f: KnowledgeFile = {
      id: `f-${Date.now()}`,
      name: pasteName.trim(),
      path: "/macros/pasted/",
      size: formatSize(pasteContent.length),
      byteSize: pasteContent.length,
      macro: "Custom",
      language: lang,
      indexed: true,
      updatedAt: new Date().toISOString().slice(0, 10),
      content: pasteContent,
    };
    setFiles((prev) => [f, ...prev]);
    setPasteName("");
    setPasteContent("");
    setPasteOpen(false);
    toast.success("Macro added to knowledge base");
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="AI CONTEXT"
        title="Knowledge base"
        subtitle="Upload your AutoHotkey v2 scripts, INIs and docs. The AI reads them directly when answering tickets — kept on this device."
        actions={
          <>
            <button onClick={() => setPasteOpen((v) => !v)} className="btn-secondary">
              <Plus className="w-4 h-4" />
              Paste macro
            </button>
            <label className="btn-primary cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload files
              <input
                type="file"
                multiple
                accept=".ahk,.ahk2,.txt,.ini,.json,.md,.cfg,.log"
                onChange={handleInput}
                className="hidden"
              />
            </label>
          </>
        }
      />

      {pasteOpen && (
        <div className="card-surface p-5 space-y-3">
          <div className="font-mono text-[11px] tracking-widest uppercase text-primary">
            ADD MACRO BY PASTE
          </div>
          <input
            placeholder="filename.ahk"
            value={pasteName}
            onChange={(e) => setPasteName(e.target.value)}
            className="input-base font-mono"
          />
          <textarea
            placeholder="Paste your AHK v2 code here…"
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            className="input-base font-mono text-xs min-h-[200px] resize-y"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setPasteOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={submitPaste} className="btn-primary">
              Save to knowledge base
            </button>
          </div>
        </div>
      )}

      {/* Dropzone */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "card-surface border-dashed p-10 text-center transition-all cursor-pointer block",
          dragOver ? "border-primary bg-primary/5 glow-primary" : "border-border",
        )}
      >
        <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div className="mt-4 font-semibold">Drop .ahk, .ini, .json, .md files here</div>
        <div className="text-sm text-muted-foreground mt-1 font-mono">
          The AI references exact filenames when replying. Files persist across sessions.
        </div>
        <input
          type="file"
          multiple
          accept=".ahk,.ahk2,.txt,.ini,.json,.md,.cfg,.log"
          onChange={handleInput}
          className="hidden"
        />
      </label>

      {/* File list */}
      {files.length === 0 ? (
        <EmptyState
          icon={FileCode2}
          title="No files in the knowledge base yet"
          description="Upload macros above so the AI can read them when answering tickets."
        />
      ) : (
        <div className="card-surface">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files…"
                className="input-base pl-9 py-2 h-9 font-mono text-[13px]"
              />
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              {filtered.length} / {files.length} files
            </div>
          </div>

          <div className="grid grid-cols-12 px-5 py-3 border-b border-border text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            <div className="col-span-5">File</div>
            <div className="col-span-2">Macro</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="grid grid-cols-12 items-center px-5 py-3 text-sm hover:bg-secondary/50"
              >
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                    <FileCode2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-[13px] truncate flex items-center gap-2">
                      {f.name}
                      {f.isDemo && <span className="chip text-[9px]">demo</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">
                      {f.path}
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="chip">{f.macro}</span>
                </div>
                <div className="col-span-2 text-muted-foreground font-mono text-[13px]">
                  {f.size}
                </div>
                <div className="col-span-2">
                  {f.indexed ? (
                    <span className="chip chip-primary">
                      <CheckCircle2 className="w-3 h-3" />
                      Indexed
                    </span>
                  ) : (
                    <span className="chip chip-warning">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Indexing…
                    </span>
                  )}
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  <button
                    onClick={() => setViewing(f)}
                    className="btn-ghost h-8 px-2"
                    aria-label="View"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => reindex(f.id)}
                    className="btn-ghost h-8 px-2"
                    aria-label="Re-index"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeFile(f.id)}
                    className="btn-ghost h-8 px-2 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-5 py-10 text-center text-muted-foreground">
                <CircleSlash className="w-6 h-6 mx-auto mb-2 opacity-50" />
                No files match your search.
              </div>
            )}
          </div>
        </div>
      )}

      {viewing && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-center justify-center p-6"
          onClick={() => setViewing(null)}
        >
          <div
            className="card-surface max-w-3xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-mono text-sm">{viewing.name}</div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  {viewing.path} • {viewing.size}
                </div>
              </div>
              <button onClick={() => setViewing(null)} className="btn-ghost h-8 px-3">
                Close
              </button>
            </div>
            <pre className="p-4 overflow-auto flex-1 text-xs font-mono whitespace-pre-wrap">
              {viewing.content || "(empty file)"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
