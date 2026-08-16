"use client";

import { useState } from "react";
import type { TriageResult } from "@/lib/types";
import { severityTheme } from "@/lib/severityTheme";
import ConfidenceBadge from "./ConfidenceBadge";

interface Props {
  result: TriageResult;
  index: number;
  jiraText: string | null;
}

export default function ResultCard({ result, index, jiraText }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const theme = severityTheme[result.severity];

  const handleCopyJira = () => {
    if (jiraText) {
      navigator.clipboard.writeText(jiraText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`rounded-lg border-l-4 ${theme.border} ${theme.bg} bg-base-900 p-4`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") setExpanded(!expanded);
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase ${theme.text}`}>
              {result.severity}
            </span>
            <span className="text-primary-muted text-xs">·</span>
            <span className="font-mono text-xs text-primary-secondary">
              {result.categoryTag}
            </span>
            {result.timestamp && (
              <>
                <span className="text-primary-muted text-xs">·</span>
                <span className="font-mono text-xs text-primary-muted">
                  {result.timestamp}
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-primary">{result.rootCause}</p>
        </div>
        <div className="flex-shrink-0">
          <ConfidenceBadge confidence={result.confidence} />
        </div>
      </div>

      {/* Confidence note */}
      {result.confidenceNote && (
        <p className="mt-2 text-xs text-primary-muted italic">
          {result.confidenceNote}
        </p>
      )}

      {/* Evidence — monospace, instrument readout style */}
      {result.evidence.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-primary-muted mb-1">Evidence</div>
          <div className="rounded bg-base-950 border border-base-700 p-3 font-mono text-xs text-primary-secondary overflow-x-auto">
            {result.evidence.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable details */}
      <button
        className="mt-3 text-xs text-accent hover:text-accent/80"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Hide details" : "Show details"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Affected component */}
          <div>
            <div className="text-xs text-primary-muted mb-1">Affected Component</div>
            <p className="text-sm text-primary-secondary">{result.affectedComponent}</p>
          </div>

          {/* Next steps */}
          {result.nextSteps.length > 0 && (
            <div>
              <div className="text-xs text-primary-muted mb-1">Next Steps</div>
              <ul className="list-disc list-inside text-sm text-primary-secondary space-y-1">
                {result.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Related entries */}
          {result.relatedTo.length > 0 && (
            <div>
              <div className="text-xs text-primary-muted mb-1">Related Entries</div>
              <div className="flex flex-wrap gap-2">
                {result.relatedTo.map((id) => (
                  <span
                    key={id}
                    className="rounded bg-base-800 px-2 py-1 font-mono text-xs text-primary-secondary border border-base-700"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bug report */}
          {result.bugReport && (
            <div className="rounded border border-base-700 p-3 bg-base-800">
              <div className="text-xs text-primary-muted mb-2">Bug Report Draft</div>
              <div className="space-y-1 text-sm text-primary-secondary">
                <p>
                  <span className="text-primary-muted">Title:</span>{" "}
                  {result.bugReport.title}
                </p>
                <p>
                  <span className="text-primary-muted">Summary:</span>{" "}
                  {result.bugReport.summary}
                </p>
                <p>
                  <span className="text-primary-muted">Steps:</span>{" "}
                  {result.bugReport.stepsToReproduce}
                </p>
                <p>
                  <span className="text-primary-muted">Expected vs Actual:</span>{" "}
                  {result.bugReport.expectedVsActual}
                </p>
                <p>
                  <span className="text-primary-muted">Assignee Area:</span>{" "}
                  {result.bugReport.suggestedAssigneeArea}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export actions */}
      {result.bugReport && (
        <div className="mt-3 flex gap-2">
          <button
            className="rounded border border-base-700 px-3 py-1 text-xs text-primary-secondary hover:bg-base-800 transition-colors"
            onClick={handleCopyJira}
          >
            {copied ? "Copied!" : "Copy as bug report"}
          </button>
        </div>
      )}
    </div>
  );
}
