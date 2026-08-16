# batch-comparison.md — Duplicate & Related Issue Detection

## Purpose
When multiple logs are provided in a batch, the LLM compares entries and
flags likely duplicates or related issues. The deterministic `_dedupe_logs.py`
tool then ensures these relationships are bidirectional and assigns group IDs.

## Detection Criteria (LLM-side)
Two entries are related if:
- Same root cause AND same component, OR
- Same error signature (error code, stack trace pattern) in different contexts

Entries are NOT related just because they share a component — the underlying
cause must look the same.

## Deterministic Post-Processing (`_dedupe_logs.py`)
1. Filter `relatedTo` to valid IDs only (no self-references)
2. Make relationships bidirectional (if A lists B, B lists A)
3. Assign `groupId` via connected components (Union-Find)
4. The UI can cluster entries by `groupId`

## Edge Cases
- An entry with no `relatedTo` is its own group
- Circular references are handled by Union-Find
- Invalid ID references in `relatedTo` are silently filtered
