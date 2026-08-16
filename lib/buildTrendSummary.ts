import type { TriageResult, TrendSummary } from "./types";

export function buildTrendSummary(results: TriageResult[]): TrendSummary {
  const categoryCounter = new Map<string, number>();
  const componentCounter = new Map<string, number>();

  for (const result of results) {
    const tag = result.categoryTag || "Unknown";
    categoryCounter.set(tag, (categoryCounter.get(tag) || 0) + 1);

    const component = result.affectedComponent || "Unknown";
    componentCounter.set(component, (componentCounter.get(component) || 0) + 1);
  }

  const byCategory = [...categoryCounter.entries()]
    .map(([categoryTag, count]) => ({ categoryTag, count }))
    .sort((a, b) => b.count - a.count);

  const byComponent = [...componentCounter.entries()]
    .map(([component, count]) => ({ component, count }))
    .sort((a, b) => b.count - a.count);

  const dateCategoryCounter = new Map<string, number>();
  const dateComponentCounter = new Map<string, number>();

  for (const result of results) {
    const timestamp = result.timestamp;
    if (!timestamp) continue;
    const dateStr = extractDate(timestamp);
    if (!dateStr) continue;

    const tag = result.categoryTag || "Unknown";
    const categoryKey = `${dateStr}|${tag}`;
    dateCategoryCounter.set(categoryKey, (dateCategoryCounter.get(categoryKey) || 0) + 1);

    const component = result.affectedComponent || "Unknown";
    const componentKey = `${dateStr}|${component}`;
    dateComponentCounter.set(componentKey, (dateComponentCounter.get(componentKey) || 0) + 1);
  }

  const byDateBucket = [...dateCategoryCounter.entries()]
    .map(([key, count]) => {
      const [date, categoryTag] = key.split("|");
      return { date, categoryTag, count };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const byDateComponent = [...dateComponentCounter.entries()]
    .map(([key, count]) => {
      const [date, component] = key.split("|");
      return { date, component, count };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return { byCategory, byComponent, byDateBucket, byDateComponent };
}

function extractDate(timestamp: string): string | null {
  try {
    const normalized = timestamp.replace("Z", "+00:00");
    const dt = new Date(normalized);
    if (isNaN(dt.getTime())) return null;
    return dt.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}
