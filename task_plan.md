# task_plan.md — LogPilot Build Plan

## Phase 0: Initialization
- [x] Read B.L.A.S.T. protocol, taste.md, triage prompt, deployment SOP
- [x] Create gemini.md (Project Constitution)
- [ ] Create task_plan.md, findings.md, progress.md

## Phase 1: Blueprint (B)
- [x] Discovery questions answered (in B_L_A_S_T_LogPilot.md)
- [x] Data schemas defined in gemini.md
- [ ] Research reference implementations (Sentry grouping, structured-JSON LLM extraction, WinDbg conventions)

## Phase 2: Link (L)
- [ ] Scaffold Next.js project (package.json, tsconfig, tailwind, .gitignore)
- [ ] Create vercel.json (Python runtime config)
- [ ] Create .env.local.example
- [ ] Build tools/test_llm_connection.py handshake script
- [ ] Verify LLM API key present and minimal call works

## Phase 3: Architect (A)
- [ ] Build Layer 3 Python tools:
  - [ ] api/_parse_log.py — normalize/clean input, split multi-entry
  - [ ] api/_call_llm_triage.py — LLM call, schema validation, retry on malformed JSON
  - [ ] api/_dedupe_logs.py — duplicate/related grouping from relatedTo
  - [ ] api/_build_trend_summary.py — category + date bucket aggregation
  - [ ] api/_compute_time_saved.py — manual baseline vs AI elapsed
  - [ ] api/_generate_export.py — JIRA plaintext, CSV, PDF
- [ ] Build api/triage.py orchestrator endpoint

## Phase 4: Stylize (S)
- [ ] Build Next.js frontend:
  - [ ] Layout + global styles (dark slate base, severity theme map)
  - [ ] Input panel (paste/upload, single or batch)
  - [ ] Result cards (severity-colored, evidence monospace, confidence badge)
  - [ ] Trend chart (category counts)
  - [ ] Time-saved comparison line
  - [ ] Export actions (copy JIRA, download CSV, download PDF)
- [ ] Keyboard navigation between cards
- [ ] Self-critique against taste.md Sections 1-4

## Phase 5: Trigger (T)
- [ ] Verify build (typecheck, lint, dev server)
- [ ] Vercel deployment (manual — user will run vercel commands)
- [ ] Record production URL in gemini.md
