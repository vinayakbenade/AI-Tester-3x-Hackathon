import type { Severity, Confidence } from "./types";

export const severityTheme: Record<
  Severity,
  { bg: string; border: string; text: string; label: string }
> = {
  Critical: {
    bg: "bg-severity-critical/20",
    border: "border-severity-critical",
    text: "text-severity-critical",
    label: "Critical",
  },
  High: {
    bg: "bg-severity-high/20",
    border: "border-severity-high",
    text: "text-severity-high",
    label: "High",
  },
  Medium: {
    bg: "bg-severity-medium/20",
    border: "border-severity-medium",
    text: "text-severity-medium",
    label: "Medium",
  },
  Low: {
    bg: "bg-severity-low/20",
    border: "border-severity-low",
    text: "text-severity-low",
    label: "Low",
  },
};

export const confidenceTheme: Record<
  Confidence,
  { fill: number; label: string; description: string }
> = {
  High: {
    fill: 3,
    label: "High confidence",
    description: "Evidence is strong and specific.",
  },
  Medium: {
    fill: 2,
    label: "Medium confidence",
    description: "Some evidence supports this diagnosis.",
  },
  Low: {
    fill: 1,
    label: "Low confidence — recommend manual review",
    description: "Evidence is insufficient to confirm root cause.",
  },
};

export const severityOrder: Severity[] = ["Critical", "High", "Medium", "Low"];
