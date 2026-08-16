# triage-analysis.md — LLM Triage SOP

## Purpose
The LLM system prompt lives in `logpilot_triage_prompt.md`. It is invoked
exclusively from `api/_call_llm_triage.py`, called server-side by
`api/triage.py`. It must never be called from the browser.

## Input
A JSON body with `entries[]`, each containing `id`, `source`, `filename`,
`timestamp`, and `rawText`. Entries are pre-cleaned by `_parse_log.py`.

## Output
Strict JSON matching the `TriageResult` schema in `gemini.md`. No markdown
fences, no commentary.

## Validation Rules
1. `severity` must be one of: Critical, High, Medium, Low
2. `confidence` must be one of: High, Medium, Low
3. `evidence`, `nextSteps`, `relatedTo` must be arrays
4. `bugReport` must be a dict or null
5. `timestamp` is pass-through only — never inferred from log body

## Self-Annealing
If the LLM returns malformed JSON or fails validation:
1. Retry once (attempt 2 of 2)
2. If still invalid, surface a RuntimeError to the orchestrator
3. Update this SOP with any new constraint discovered

## Confidence Flagging
- Low confidence is a first-class UI feature, not a footnote
- Low-confidence diagnoses must include a `confidenceNote` explaining
  what additional information would help confirm the diagnosis
- The UI surfaces this prominently: "Low confidence — recommend manual review"
