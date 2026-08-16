# time-saved-calc.md — Time Saved Calculation SOP

## Purpose
`_compute_time_saved.py` compares manual triage baseline time against
actual AI wall-clock time. Pure arithmetic — no LLM call.

## Formula
```
manualBaselineMinutes = MANUAL_BASELINE_MINUTES × entryCount
aiElapsedSeconds = measured wall-clock time of the AI triage run
displayString = "Manual triage: ~{X} min → LogPilot: ~{Y} sec"
```

## Constants
- `MANUAL_BASELINE_MINUTES` = 15 (default, configurable via env var)
- AI elapsed time is measured from the start of the LLM call to the
  completion of all post-processing

## Output Shape
```json
{
  "entryCount": number,
  "manualBaselineMinutes": number,
  "aiElapsedSeconds": number,
  "displayString": "Manual triage: ~{X} min → LogPilot: ~{Y} sec"
}
```

## Notes
- The comparison string is the primary UI output — it should render
  with plausible numbers, never `NaN` or `undefined`
- The baseline is per-entry, so a batch of 10 logs = 150 min manual baseline
