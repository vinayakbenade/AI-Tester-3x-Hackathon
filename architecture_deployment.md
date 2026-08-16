# architecture/deployment.md — LogPilot on Vercel

## Environment variables
- `ANTHROPIC_API_KEY` (or equivalent LLM key) — set in Vercel Project
  Settings → Environment Variables, scoped to **Preview** and
  **Production**. Never prefix with `NEXT_PUBLIC_` — that exposes it to
  the browser bundle.
- Any tunables (e.g. `MANUAL_BASELINE_MINUTES`, default 15) are also
  Vercel env vars, not hardcoded, so they can be adjusted without a
  redeploy of application logic.

## Runtime
- Layer 3 tools run as **Vercel Python Serverless Functions** under
  `api/`. Confirm the Python runtime version in `vercel.json` matches
  what's used locally.
- Frontend (`app/`) is a standard Next.js app; it calls `/api/triage`
  via relative `fetch`, never an absolute LLM API URL.

## Promote checklist (must pass before `vercel --prod`)
1. Preview deployment's `/api/triage` handshake test passes (see B.L.A.S.T.
   Phase 2, Link).
2. A real single-log triage run on the Preview URL returns correctly
   shaped JSON and renders in the dashboard.
3. A real batch run (3+ logs, at least one intentional duplicate) shows
   correct `relatedTo` grouping and a non-empty trend chart.
4. Time-saved comparison string renders with plausible numbers (not
   `NaN`, not `undefined`).
5. All three export actions (JIRA copy, CSV, PDF) produce non-empty,
   correctly formatted output on the Preview deployment.
6. No secrets present in client-side bundle — check via browser devtools
   Network tab that `/api/triage` requests never contain the API key.

## Rollback
- Vercel keeps prior deployments; if Production breaks, use "Promote to
  Production" on the last known-good deployment from the Vercel
  dashboard rather than reverting code first — restore service, then fix
  forward via the Self-Annealing repair loop.

## Post-deploy
- Record the live Production URL in `gemini.md` under `## Deployment`.
- Any environment variable added/changed after go-live is itself a
  `gemini.md` update (per the Data-First Rule) — env vars are part of
  the project's constitution, not incidental config.
