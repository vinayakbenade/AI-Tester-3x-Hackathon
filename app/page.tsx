"use client";

import { useState, useCallback } from "react";
import type { TriageResponse } from "@/lib/types";
import InputPanel from "@/components/InputPanel";
import ResultCard from "@/components/ResultCard";
import TrendChart from "@/components/TrendChart";
import TimeSaved from "@/components/TimeSaved";
import Sidebar, { type ViewName } from "@/components/Sidebar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import SettingsPanel from "@/components/SettingsPanel";
import { getSettings } from "@/lib/settings";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TriageResponse | null>(null);
  const [activeView, setActiveView] = useState<ViewName>("log-details");

  const handleTriage = useCallback(
    async (entries: { rawText: string; timestamp: string | null }[]) => {
      setIsLoading(true);
      setError(null);
      try {
        const payload = {
          entries: entries.map((e, i) => ({
            id: `entry-${i}`,
            source: "paste",
            filename: null,
            timestamp: e.timestamp,
            rawText: e.rawText,
          })),
        };
        const settings = getSettings();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (settings.apiKeys[settings.provider]) {
          headers["X-LLM-Provider"] = settings.provider;
          headers["X-LLM-Key"] = settings.apiKeys[settings.provider];
          headers["X-LLM-Model"] = settings.models[settings.provider];
        }
        const res = await fetch("/api/triage", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Triage failed. Check your input and try again.");
        } else {
          setData(json);
        }
      } catch {
        setError("Network error. Check your connection and try again.");
      }
      setIsLoading(false);
    },
    []
  );

  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputMode = activeView === "compare" ? "compare" : "single";

  const renderView = () => {
    switch (activeView) {
      case "log-details":
      case "compare":
        return (
          <>
            <section className="mb-6">
              <InputPanel onTriage={handleTriage} isLoading={isLoading} mode={inputMode} />
            </section>

            {error && (
              <div className="mb-6 rounded-lg border border-severity-critical/50 bg-severity-critical/10 p-4">
                <p className="text-sm text-severity-critical">{error}</p>
              </div>
            )}

            {isLoading && (
              <div className="mb-6 rounded-lg border border-base-700 bg-base-900 p-8 text-center">
                <p className="text-sm text-primary-muted">Analyzing logs...</p>
              </div>
            )}

            {data && !isLoading && (
              <>
                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <span className="text-sm text-primary-secondary">
                    {data.results.length} {data.results.length === 1 ? "log" : "logs"} analyzed
                  </span>
                  {data.timeSaved && <TimeSaved timeSaved={data.timeSaved} />}
                  <div className="flex gap-2 ml-auto">
                    <button
                      className="rounded border border-base-700 px-3 py-1 text-xs text-primary-secondary hover:bg-base-800 transition-colors"
                      onClick={() => handleDownload(data.exports.csv, "logpilot-triage.csv", "text/csv")}
                    >
                      Export CSV
                    </button>
                    <button
                      className="rounded border border-base-700 px-3 py-1 text-xs text-primary-secondary hover:bg-base-800 transition-colors"
                      onClick={() => handleDownload(data.exports.pdf, "logpilot-summary.pdf", "application/pdf")}
                    >
                      Export PDF
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {data.results.map((result, i) => (
                    <ResultCard
                      key={result.id}
                      result={result}
                      index={i}
                      jiraText={data.exports.jira[result.id] || null}
                    />
                  ))}
                </div>
              </>
            )}

            {!data && !isLoading && !error && (
              <div className="rounded-lg border border-base-700 bg-base-900 p-12 text-center">
                <p className="text-sm text-primary-muted">
                  {activeView === "compare"
                    ? "Paste or drop two logs or crash dumps to compare and triage."
                    : "Paste a log, crash dump, or drop a .log/.txt/.dmp file to triage."}
                </p>
              </div>
            )}
          </>
        );

      case "trend-graphs":
        return (
          <>
            <h2 className="text-lg font-semibold text-primary mb-4">Trend Graphs</h2>
            {data && data.trend && data.trend.byCategory.length > 0 ? (
              <TrendChart trend={data.trend} />
            ) : (
              <div className="rounded-lg border border-base-700 bg-base-900 p-12 text-center">
                <p className="text-sm text-primary-muted">
                  No trend data yet. Run a triage first to see category trends and date breakdowns.
                </p>
              </div>
            )}
          </>
        );

      case "batch-mode":
        return (
          <>
            <h2 className="text-lg font-semibold text-primary mb-4">Batch Mode</h2>
            <p className="text-sm text-primary-muted mb-4">
              Paste multiple log entries separated by <code className="font-mono text-accent">===</code> on its own line.
              Each block will be triaged independently, then compared for duplicates and related issues.
            </p>
            <section className="mb-6">
              <InputPanel onTriage={handleTriage} isLoading={isLoading} mode="single" />
            </section>

            {error && (
              <div className="mb-6 rounded-lg border border-severity-critical/50 bg-severity-critical/10 p-4">
                <p className="text-sm text-severity-critical">{error}</p>
              </div>
            )}

            {isLoading && (
              <div className="mb-6 rounded-lg border border-base-700 bg-base-900 p-8 text-center">
                <p className="text-sm text-primary-muted">Analyzing logs...</p>
              </div>
            )}

            {data && !isLoading && (
              <div className="space-y-3">
                  {data.results.map((result, i) => (
                    <ResultCard
                      key={result.id}
                      result={result}
                      index={i}
                      jiraText={data.exports.jira[result.id] || null}
                    />
                  ))}
                </div>
            )}
          </>
        );

      case "diagnostic-steps":
        return (
          <>
            <h2 className="text-lg font-semibold text-primary mb-4">Diagnostic Steps</h2>
            {data && data.results.length > 0 ? (
              <div className="space-y-4">
                {data.results.map((result, i) => (
                  <div key={result.id} className="rounded-lg border border-base-700 bg-base-900 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase text-severity-critical">
                        {result.severity}
                      </span>
                      <span className="font-mono text-xs text-primary-secondary">{result.categoryTag}</span>
                    </div>
                    <p className="text-sm text-primary mb-3">{result.rootCause}</p>
                    <div className="text-xs text-primary-muted mb-1">Next Steps</div>
                    <ul className="list-disc list-inside text-sm text-primary-secondary space-y-1">
                      {result.nextSteps.map((step, j) => (
                        <li key={j}>{step}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-base-700 bg-base-900 p-12 text-center">
                <p className="text-sm text-primary-muted">
                  No diagnostic steps yet. Run a triage first to see suggested next steps.
                </p>
              </div>
            )}
          </>
        );

      case "settings":
        return <SettingsPanel />;

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-base-950">
      {/* Fixed sidebar — flush to left edge */}
      <aside className="w-56 flex-shrink-0 border-r border-base-700 bg-base-900 h-screen sticky top-0">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          hasResults={!!data}
        />
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="border-b border-base-700 bg-base-900 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-primary">LogPilot</h1>
            <p className="text-xs text-primary-muted mt-0.5">Log &amp; Crash Triage Assistant</p>
          </div>
          <ThemeSwitcher />
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-5xl mx-auto">
            {renderView()}
          </div>
        </div>
      </div>
    </div>
  );
}
