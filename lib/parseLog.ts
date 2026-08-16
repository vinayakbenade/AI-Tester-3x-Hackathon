const MAX_LOG_LENGTH = 50000;

export function cleanText(text: string): string {
  if (!text) return "";

  let result = text.normalize("NFKC");
  result = result.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
  result = result.replace(/\n{3,}/g, "\n\n");
  result = result.trim();

  if (result.length > MAX_LOG_LENGTH) {
    result = result.slice(0, MAX_LOG_LENGTH);
  }

  return result;
}

export function parseLog(entries: LogEntryInput[]): LogEntry[] {
  const cleaned: LogEntry[] = [];
  for (const entry of entries) {
    const cleanedText = cleanText(entry.rawText || "");
    if (!cleanedText) continue;
    cleaned.push({
      id: entry.id || "",
      source: entry.source || "paste",
      filename: entry.filename ?? null,
      timestamp: entry.timestamp ?? null,
      rawText: cleanedText,
    });
  }
  return cleaned;
}

export interface LogEntryInput {
  id: string;
  source?: string;
  filename?: string | null;
  timestamp?: string | null;
  rawText: string;
}

export interface LogEntry {
  id: string;
  source: string;
  filename: string | null;
  timestamp: string | null;
  rawText: string;
}
