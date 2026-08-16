"use client";

import { useState, useRef } from "react";

interface Props {
  onTriage: (entries: { rawText: string; timestamp: string | null }[]) => void;
  isLoading: boolean;
  mode: "single" | "compare";
}

const MAX_DUMP_BYTES = 500 * 1024;
const MAX_TEXT_BYTES = 1 * 1024 * 1024;

export default function InputPanel({ onTriage, isLoading, mode }: Props) {
  const [text, setText] = useState("");
  const [text2, setText2] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [dragOver2, setDragOver2] = useState(false);
  const [fileWarning, setFileWarning] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriage = () => {
    if (mode === "compare") {
      const entries: { rawText: string; timestamp: string | null }[] = [];
      if (text.trim()) {
        entries.push({ rawText: text.trim(), timestamp: timestamp.trim() || null });
      }
      if (text2.trim()) {
        entries.push({ rawText: text2.trim(), timestamp: timestamp.trim() || null });
      }
      if (entries.length === 0) return;
      onTriage(entries);
    } else {
      if (!text.trim()) return;
      const entries = text
        .split(/\n={3,}\n/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => ({
          rawText: t,
          timestamp: timestamp.trim() || null,
        }));
      onTriage(entries);
    }
  };

  const handleFile = async (file: File, target: 1 | 2) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const isDump = extension === "dmp";

    if (isDump) {
      setFileWarning("Processing crash dump on the server to extract the meaningful crash summary...");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/dump-analyze", {
          method: "POST",
          body: formData,
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Dump analysis failed.");
        }

        const summary = String(payload.summary || "");
        const analyzedText = `Crash dump analysis for ${file.name}\n\n${summary}`;

        if (target === 1) {
          setText(analyzedText);
        } else {
          setText2(analyzedText);
        }
        setFileWarning("");
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown dump processing error.";
        setFileWarning(message);
        return;
      }
    }

    const maxBytes = MAX_TEXT_BYTES;
    if (file.size > maxBytes) {
      const limitMb = (maxBytes / (1024 * 1024)).toFixed(1);
      setFileWarning(`Selected file is too large. Please keep it under ${limitMb} MB.`);
      const slicedFile = file.slice(0, maxBytes);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (target === 1) {
          setText(content);
        } else {
          setText2(content);
        }
      };
      reader.readAsText(slicedFile);
      return;
    }

    setFileWarning("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (target === 1) {
        setText(content);
      } else {
        setText2(content);
      }
    };
    reader.onerror = () => {
      setFileWarning("This file could not be read in the browser. Try pasting excerpts instead.");
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setText("");
    setText2("");
    setTimestamp("");
  };

  const handleClearLog1 = () => setText("");
  const handleClearLog2 = () => setText2("");

  const hasContent = mode === "compare" ? text.trim() || text2.trim() : text.trim();

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          className="rounded-lg bg-base-900 px-3 py-2 text-sm text-primary-secondary placeholder-primary-muted border border-base-700 focus:border-accent focus:outline-none"
          placeholder="Timestamp (ISO-8601, optional)"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          disabled={isLoading}
        />
        <button
          className="rounded-lg bg-base-800 px-3 py-2 text-sm text-primary-secondary border border-base-700 hover:bg-base-700 transition-colors disabled:opacity-50"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          Upload .log/.txt/.dmp
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".log,.txt,.dmp,.DMP"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file, 1);
          }}
        />
        <button
          className="rounded-lg border border-severity-critical/50 px-3 py-2 text-sm text-severity-critical hover:bg-severity-critical/10 transition-colors disabled:opacity-50"
          onClick={handleClear}
          disabled={isLoading || !hasContent}
        >
          Clear All
        </button>
      </div>

      {fileWarning && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {fileWarning}
        </div>
      )}

      {mode === "compare" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Log 1 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-primary-muted font-medium">Log 1</label>
              {text && (
                <button
                  className="text-xs text-severity-critical hover:text-severity-critical/80"
                  onClick={handleClearLog1}
                  disabled={isLoading}
                >
                  Clear
                </button>
              )}
            </div>
            <div
              className={`rounded-lg border-2 border-dashed transition-colors ${
                dragOver ? "border-accent bg-accent/5" : "border-base-700"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const files = e.dataTransfer.files;
                if (files.length > 0) void handleFile(files[0], 1);
              }}
            >
              <textarea
                className="w-full rounded-lg bg-base-900 p-4 font-mono text-sm text-primary-secondary placeholder-primary-muted resize-y min-h-[200px] focus:outline-none"
                placeholder="Paste or drop Log 1 here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Log 2 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-primary-muted font-medium">Log 2</label>
              {text2 && (
                <button
                  className="text-xs text-severity-critical hover:text-severity-critical/80"
                  onClick={handleClearLog2}
                  disabled={isLoading}
                >
                  Clear
                </button>
              )}
            </div>
            <div
              className={`rounded-lg border-2 border-dashed transition-colors ${
                dragOver2 ? "border-accent bg-accent/5" : "border-base-700"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver2(true);
              }}
              onDragLeave={() => setDragOver2(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver2(false);
                const files = e.dataTransfer.files;
                if (files.length > 0) void handleFile(files[0], 2);
              }}
            >
              <textarea
                className="w-full rounded-lg bg-base-900 p-4 font-mono text-sm text-primary-secondary placeholder-primary-muted resize-y min-h-[200px] focus:outline-none"
                placeholder="Paste or drop Log 2 here..."
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`rounded-lg border-2 border-dashed transition-colors ${
            dragOver ? "border-accent bg-accent/5" : "border-base-700"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const files = e.dataTransfer.files;
            if (files.length > 0) void handleFile(files[0], 1);
          }}
        >
          <textarea
            className="w-full rounded-lg bg-base-900 p-4 font-mono text-sm text-primary-secondary placeholder-primary-muted resize-y min-h-[200px] focus:outline-none"
            placeholder="Paste a log, crash dump, or drop a .log/.txt/.dmp file to triage. Separate multiple entries with === on its own line."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white hover:bg-accent/80 transition-colors disabled:opacity-50"
          onClick={handleTriage}
          disabled={isLoading || !hasContent}
        >
          {isLoading ? "Triaging..." : "Triage"}
        </button>
      </div>
    </div>
  );
}
