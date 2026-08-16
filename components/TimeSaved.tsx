import type { TimeSaved as TimeSavedType } from "@/lib/types";

interface Props {
  timeSaved: TimeSavedType;
}

export default function TimeSaved({ timeSaved }: Props) {
  return (
    <div className="rounded-lg bg-base-900 border border-base-700 p-4">
      <div className="text-xs text-primary-muted mb-1">Time Saved</div>
      <p className="font-mono text-sm text-primary-secondary">
        {timeSaved.displayString}
      </p>
      <div className="mt-2 flex gap-4 text-xs text-primary-muted">
        <span>{timeSaved.entryCount} entries analyzed</span>
        <span>·</span>
        <span>{timeSaved.aiElapsedSeconds}s AI elapsed</span>
      </div>
    </div>
  );
}
