# trend-dashboard.md — Trend Aggregation SOP

## Purpose
`_build_trend_summary.py` groups triage results by `categoryTag` and by
timestamp date bucket. Pure aggregation — no LLM call.

## Output Shape
```json
{
  "byCategory": [{ "categoryTag": "string", "count": number }],
  "byDateBucket": [{ "date": "YYYY-MM-DD", "categoryTag": "string", "count": number }]
}
```

## byCategory
- Groups all results by their `categoryTag`
- Sorted by count descending (most frequent first)
- Uses the LLM's category tag verbatim — no normalization

## byDateBucket
- Only computed when `timestamp` is present on the entry
- Date extracted from ISO-8601 timestamp as `YYYY-MM-DD`
- Invalid timestamps are silently skipped
- Sorted chronologically

## "Recurring" Threshold
A category is worth flagging as "recurring" when its count is ≥ 2 in a
single batch. The UI can highlight these in the trend chart.

## Category Vocabulary
The LLM is instructed to use a stable, limited vocabulary:
Driver Crash, Memory Leak, Rendering Glitch, Timeout, Hardware Fault,
Race Condition, Configuration Error, Unknown.
