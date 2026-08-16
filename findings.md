# findings.md — LogPilot Research & Discoveries

## Constraints
- LLM API key must never reach the browser — all calls go through `api/triage.py` server-side.
- Python tools deployed as Vercel Python Serverless Functions (`@vercel/python` runtime).
- `.tmp/` writes on Vercel must use `/tmp` (only writable path in serverless functions).
- Timestamps are user-supplied pass-through only — LLM never infers dates from log bodies.

## Discoveries
_(populated during build)_

## Reference Research
_(Sentry-style crash grouping, Socorro/crash-stats, structured-JSON LLM extraction patterns, WinDbg `!analyze -v` conventions — to research before finalizing dedupe logic)_
