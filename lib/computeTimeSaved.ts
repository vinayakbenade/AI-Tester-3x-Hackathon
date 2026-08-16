import type { TimeSaved } from "./types";

export function computeTimeSaved(
  entryCount: number,
  aiElapsedSeconds: number
): TimeSaved {
  const manualBaselineMinutes = parseFloat(
    process.env.MANUAL_BASELINE_MINUTES || "15"
  );

  const manualTotalMinutes = manualBaselineMinutes * entryCount;
  const aiSeconds = Math.round(aiElapsedSeconds * 10) / 10;

  const displayString = `Manual triage: ~${Math.round(
    manualTotalMinutes
  )} min → LogPilot: ~${Math.round(aiSeconds)} sec`;

  return {
    entryCount,
    manualBaselineMinutes: manualTotalMinutes,
    aiElapsedSeconds: aiSeconds,
    displayString,
  };
}
