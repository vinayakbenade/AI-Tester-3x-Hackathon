import type { TriageResult } from "./types";

export function dedupeLogs(results: TriageResult[]): TriageResult[] {
  const byId = new Map<string, TriageResult>();
  for (const r of results) byId.set(r.id, r);
  const idSet = byId;

  for (const result of results) {
    let related = (result.relatedTo || []).filter(
      (rid) => idSet.has(rid) && rid !== result.id
    );
    result.relatedTo = [...new Set(related)].sort();
  }

  for (const result of results) {
    for (const relatedId of result.relatedTo) {
      const other = byId.get(relatedId);
      if (other && !other.relatedTo.includes(result.id)) {
        other.relatedTo.push(result.id);
        other.relatedTo = [...new Set(other.relatedTo)].sort();
      }
    }
  }

  const parent = new Map<string, string>();
  for (const r of results) parent.set(r.id, r.id);

  function find(x: string): string {
    let root = x;
    while (parent.get(root) !== root) {
      root = parent.get(root)!;
    }
    let curr = x;
    while (parent.get(curr) !== root) {
      const next = parent.get(curr)!;
      parent.set(curr, root);
      curr = next;
    }
    return root;
  }

  function union(x: string, y: string): void {
    const px = find(x);
    const py = find(y);
    if (px !== py) parent.set(px, py);
  }

  for (const result of results) {
    for (const relatedId of result.relatedTo) {
      union(result.id, relatedId);
    }
  }

  for (const result of results) {
    result.groupId = `group-${find(result.id)}`;
  }

  return results;
}
