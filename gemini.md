# gemini.md — LogPilot Project Constitution

> `gemini.md` is law. Schemas, rules, and architectural invariants live here.
> Planning files (`task_plan.md`, `findings.md`, `progress.md`) are memory.

---

## Project Identity

**LogPilot** — AI Log & Crash Triage Assistant. A single-page web app that
ingests QA logs, crash dumps, and stack traces, and returns a structured
AI triage report (root cause, severity, next steps, duplicate detection,
JIRA-style bug drafts) plus a trend dashboard, confidence flagging, a
time-saved estimate, and multi-format export.

**Golden Rule:** LLMs reason, tools compute. All arithmetic, aggregation,
and formatting is deterministic Python in `tools/` / `api/`. The LLM
call only ever returns the JSON shape defined below.

---

## Data Schemas

### Input shape (one or many entries per batch, `timestamp` optional)

```json
{
  "entries": [
    {
      "id": "string",
      "source": "paste | upload",
      "filename": "string | null",
      "timestamp": "ISO-8601 string | null",
      "rawText": "string"
    }
  ]
}
```

### LLM output shape (returned by `call_llm_triage.py`, validated before UI)

```json
{
  "results": [
    {
      "id": "string",
      "timestamp": "ISO-8601 string | null",
      "rootCause": "string",
      "evidence": ["string", "..."],
      "severity": "Critical | High | Medium | Low",
      "affectedComponent": "string",
      "confidence": "High | Medium | Low",
      "confidenceNote": "string | null",
      "nextSteps": ["string", "..."],
      "categoryTag": "string",
      "relatedTo": ["id", "..."],
      "bugReport": {
        "title": "string",
        "summary": "string",
        "stepsToReproduce": "string",
        "expectedVsActual": "string",
        "severity": "string",
        "suggestedAssigneeArea": "string"
      } | null
    }
  ]
}
```

### Deterministic post-processing shapes

**build_trend_summary.py output:**

```json
{
  "byCategory": [{ "categoryTag": "string", "count": "number" }],
  "byDateBucket": [{ "date": "YYYY-MM-DD", "categoryTag": "string", "count": "number" }]
}
```

**compute_time_saved.py output:**

```json
{
  "entryCount": "number",
  "manualBaselineMinutes": "number",
  "aiElapsedSeconds": "number",
  "displayString": "Manual triage: ~{X} min → LogPilot: ~{Y} sec"
}
```

---

## Behavioral Rules

1. **Never fabricate.** Every diagnosis must cite specific evidence from the log text.
2. **Confidence is first-class.** Low-confidence diagnoses are labeled prominently — "Low confidence — recommend manual review" — never hidden in fine print.
3. **LLM output is strict JSON only.** No markdown fences, no commentary.
4. **Timestamps are pass-through.** The LLM echoes the input `timestamp` unchanged; it never infers or extracts dates from log bodies.
5. **Bug reports** are generated for Medium severity or higher only.
6. **Category tags** use a stable, limited vocabulary (Driver Crash, Memory Leak, Rendering Glitch, Timeout, Hardware Fault, Race Condition, Configuration Error, Unknown) so downstream trend tooling can count accurately.
7. **Plain, engineer-facing language.** No marketing tone, no filler.

---

## Architectural Invariants

- **3-layer architecture:** `architecture/` (SOPs) → navigation (orchestration) → `tools/` / `api/` (deterministic Python).
- **Layer 3 tools stay Python**, deployed as Vercel Python Serverless Functions (`api/*.py`, `@vercel/python` runtime). The Next.js frontend calls these via relative `fetch('/api/...')`.
- **The browser never talks to the LLM API directly.** All LLM calls go through `api/triage.py` server-side. The API key lives only in Vercel Environment Variables, never in a `NEXT_PUBLIC_*` variable.
- **Self-Annealing:** Malformed LLM JSON → analyze, patch prompt/validation, test against `.tmp/` samples, update the relevant `architecture/*.md` file.
- **Severity colors** are defined once in a `severityTheme` map and referenced everywhere — no scattered hardcoded colors.

---

## Constants

- `MANUAL_BASELINE_MINUTES` = 15 (per entry, configurable via env var)
- Python runtime version: 3.12 (declared in `vercel.json`)

---

## Deployment

- Hosted on **Vercel**. Live URL recorded here after go-live.
- Env vars: `GROQ_API_KEY` (scoped to Preview + Production), `MANUAL_BASELINE_MINUTES` (optional).
- Promote checklist and rollback procedure: see `architecture_deployment.md`.
- **Production URL:** _TBD — record after `vercel --prod`._
