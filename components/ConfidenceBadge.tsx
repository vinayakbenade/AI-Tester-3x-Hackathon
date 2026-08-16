import type { Confidence } from "@/lib/types";
import { confidenceTheme } from "@/lib/severityTheme";

interface Props {
  confidence: Confidence;
}

export default function ConfidenceBadge({ confidence }: Props) {
  const theme = confidenceTheme[confidence];
  const dots = 3;
  const filled = theme.fill;

  return (
    <div
      className="inline-flex items-center gap-2"
      title={theme.description}
    >
      {/* Filled/half-filled/outline indicator — the signature element (taste.md §2) */}
      <div className="flex items-center gap-1">
        {Array.from({ length: dots }).map((_, i) => {
          const isFilled = i < filled;
          const colorClass =
            confidence === "High"
              ? "bg-severity-low"
              : confidence === "Medium"
                ? "bg-severity-medium"
                : "bg-severity-critical";
          return (
            <span
              key={i}
              className={`inline-block h-2.5 w-2.5 rounded-full border ${
                isFilled
                  ? `${colorClass} border-transparent`
                  : "border-base-600 bg-transparent"
              }`}
            />
          );
        })}
      </div>
      <span
        className={`text-xs font-medium ${
          confidence === "Low"
            ? "text-severity-critical"
            : confidence === "Medium"
              ? "text-severity-medium"
              : "text-severity-low"
        }`}
      >
        {theme.label}
      </span>
    </div>
  );
}
