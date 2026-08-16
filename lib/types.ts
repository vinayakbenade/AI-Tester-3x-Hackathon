export type Severity = "Critical" | "High" | "Medium" | "Low";
export type Confidence = "High" | "Medium" | "Low";
export type Source = "paste" | "upload";

export interface LogEntry {
  id: string;
  source: Source;
  filename: string | null;
  timestamp: string | null;
  rawText: string;
}

export interface BugReport {
  title: string;
  summary: string;
  stepsToReproduce: string;
  expectedVsActual: string;
  severity: string;
  suggestedAssigneeArea: string;
}

export interface TriageResult {
  id: string;
  timestamp: string | null;
  rootCause: string;
  evidence: string[];
  severity: Severity;
  affectedComponent: string;
  confidence: Confidence;
  confidenceNote: string | null;
  nextSteps: string[];
  categoryTag: string;
  relatedTo: string[];
  groupId?: string;
  bugReport: BugReport | null;
}

export interface TrendSummary {
  byCategory: { categoryTag: string; count: number }[];
  byComponent: { component: string; count: number }[];
  byDateBucket: { date: string; categoryTag: string; count: number }[];
  byDateComponent: { date: string; component: string; count: number }[];
}

export interface TimeSaved {
  entryCount: number;
  manualBaselineMinutes: number;
  aiElapsedSeconds: number;
  displayString: string;
}

export interface ExportData {
  jira: Record<string, string>;
  csv: string;
  pdf: string;
}

export interface TriageResponse {
  results: TriageResult[];
  trend: TrendSummary;
  timeSaved: TimeSaved;
  exports: ExportData;
}
