import { useState } from "react";
import { Upload, FileCode2, FolderPlus, Search, Trash2, RefreshCw, CheckCircle2, CircleSlash } from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import { mockKnowledgeFiles } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { KnowledgeFile } from "@/types";

export default function KnowledgeBase() {
  const [files, setFiles] = useState<KnowledgeFile[]>(mockKnowledgeFiles);
  const [query, setQuery] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const filtered = files.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.macro.toLowerCase().includes(query.toLowerCase())
  );

  const handleFakeUpload = (names: string[]) => {
    const newFiles: KnowledgeFile[] = names.map((n, i) => ({
      id: `new-${Date.now()}-${i}`,
      name: n,
      path: "/macros/new/",
      size: `${(Math.random() * 60 + 2).toFixed(1)} KB`,
      macro: "Uncategorized",
      language: n.endsWith(".json") ? "JSON" : n.endsWith(".md") ? "MD" : n.endsWith(".txt") || n.endsWith(".ini") ? "TXT" : "AHK2",
      indexed: false,
      updatedAt: new Date().toISOString().slice(0, 10),
    }));
    setFiles((prev) => [...newFiles, ...prev]);
    toast.success(`${newFiles.length} file(s) queued for indexing`);
    setTimeout(() => {
      setFiles((prev) => prev.map((f) => (newFiles.find((n) => n.id === f.id) ? { ...f, indexed: true } : f)));
      toast.success("AI finished reading new files");
    }, 1600);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const names = Array.from(e.dataTransfer.files).map((f) => f.name);
    if (names.length) handleFakeUpload(names);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast("File removed from knowledge base");
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="AI CONTEXT"
        title="Knowledge base"
        subtitle="Upload your AutoHotkey v2 scripts, INIs, and docs. The AI reads them directly when answering user tickets."
        actions={
          <>
            <button onClick={() => handleFakeUpload(["new_macro.ahk"])} className="btn-secondary">
              <FolderPlus className="w-4 h-4" />
              New folder
            </button>
            <button onClick={() => handleFakeUpload(["combat_v6.ahk", "combat_utils.ahk"])} className="btn-primary">
              <Upload className="w-4 h-4" />
              Upload files
            </button>
          </>
        }
      />

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "card-surface border-dashed p-10 text-center transition-all",
          dragOver ? "border-primary bg-primary/5 glow-primary" : "border-border"
        )}
      >
        <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div className="mt-4 font-semibold">Drop .ahk, .ini, .json, .md files or entire folders</div>
        <div className="text-sm text-muted-foreground mt-1 font-mono">
          The AI will index content and reference exact line numbers in replies.
        </div>
      </div>

      {/* File list */}
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
            <div key={f.id} className="grid grid-cols-12 items-center px-5 py-3 text-sm hover:bg-secondary/50">
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                  <FileCode2 className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[13px] truncate">{f.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono truncate">{f.path}</div>
                </div>
              </div>
              <div className="col-span-2">
                <span className="chip">{f.macro}</span>
              </div>
              <div className="col-span-2 text-muted-foreground font-mono text-[13px]">{f.size}</div>
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
                  onClick={() => toast("Re-index queued")}
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
    </div>
  );
}
