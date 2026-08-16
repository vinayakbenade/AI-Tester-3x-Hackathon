# taste.md — LogPilot Design & Engineering Taste Guide

This file is read by the coding agent alongside `gemini.md` and the
`architecture/` SOPs. `gemini.md` defines *what* to build (schemas,
rules). This file defines *how it should feel and read* — the taste bar
for anything the agent generates without being told line-by-line.

If a choice isn't specified elsewhere, default to what's written here.

---

## 1. Visual identity

**Subject:** LogPilot is a cockpit for triaging failures, not a chat app
and not a generic admin dashboard. The visual language should feel like
instrumentation — precise, legible under pressure, built for someone
scanning many entries fast during an incident, not admiring the UI.

**Reject the default AI-app look.** Do not reach for: cream background +
warm terracotta accent, or near-black + single neon accent, or a
broadsheet/newspaper layout. Pick a palette that reads as "diagnostic
tooling" — think flight-instrument panels, oscilloscopes, WinDbg/terminal
aesthetics — not a marketing landing page.

**Palette direction (adapt, don't copy blindly):**
- A cool, dark-neutral base (deep slate/graphite, not pure black) so
  severity colors pop without competing with a bright background.
- Severity colors carry real meaning, not decoration:
  - Critical → red
  - High → orange
  - Medium → amber/yellow
  - Low → gray/muted blue
- One accent color for interactive elements (buttons, links, active
  states) — pick something that doesn't collide with the severity colors
  above (avoid another red/orange/yellow as the UI accent).

**Typography:** A monospace or semi-monospace face for log evidence,
timestamps, and category tags (this is data — it should look like data).
A clean grotesk/sans for headings, labels, and body copy. Don't use the
same face for both — the contrast between "instrument readout" and
"interface label" is part of the identity.

**Density over whitespace.** This tool's users are triaging 10-50 logs at
once. Favor a compact, scannable card/table layout over generous
marketing-style spacing. Whitespace should be used to separate severity
tiers, not to make the page feel airy.

---

## 2. Signature element

Pick ONE thing this UI is remembered for and execute it well — don't
spread effort across five small flourishes. Strong candidates for
LogPilot:
- The **evidence line** rendered inline with the diagnosis, monospace,
  visually distinct — like a debugger highlighting the exact stack frame.
- The **confidence badge** as a real visual signal (not just a text
  label) — e.g., a filled/half-filled/outline indicator — so "Low
  confidence, recommend manual review" is impossible to miss at a glance.

Do not add both as equally-weighted features. Pick the one that best
serves a QA engineer scanning fast, build it with care, and keep
everything else quiet.

---

## 3. Voice and copy

- Write from the engineer's side of the screen. Say what they can do
  ("Copy as bug report," "Export CSV"), not how the system works
  ("Serialize to JIRA format").
- Active voice, present tense, no filler. "3 logs analyzed" not "Your
  logs have been successfully analyzed."
- Confidence and uncertainty are stated plainly, never softened or
  hedged into vagueness. "Low confidence — evidence is insufficient to
  confirm root cause" beats "This might possibly be related to..."
- Empty states are instructions, not apologies. "Paste a log or drop a
  .log/.txt file to triage" — not "No logs found."
- Errors say what happened and what to do next, in LogPilot's voice, not
  a stack trace dumped raw at the user (save the raw trace for a
  collapsible "details" section).
- Never invent a diagnosis for the sake of always having an answer — an
  honest "insufficient evidence" is more valuable than false confidence,
  and the copy should treat it that way, not as a failure state.

---

## 4. Interaction & motion

- Motion should serve legibility, not decoration: a card expanding to
  show full evidence, a severity badge that briefly pulses when a new
  batch result lands — that's it. No page-load animation sequences, no
  scroll-triggered reveals. This is a working tool, not a portfolio piece.
- Keyboard-navigable: engineers triaging a batch should be able to move
  between result cards without reaching for the mouse.
- Respect `prefers-reduced-motion`.

---

## 5. Engineering defaults (for the coding agent specifically)

- Follow B.L.A.S.T.'s Architect rule strictly: the LLM call only ever
  returns the JSON shape defined in `gemini.md`. Time-saved math, CSV/PDF
  generation, and trend aggregation are deterministic Python in `tools/`
  — never re-implemented as a prompt ask. If you're tempted to have the
  LLM "just calculate" something, stop and write a tool instead.
- Every `tools/` script is atomic and independently testable — one job
  per script, matching the file structure in `gemini.md`.
- Validate LLM output against the schema before it ever reaches the UI
  layer. Malformed JSON is a Self-Annealing case (see B.L.A.S.T. Phase
  "Repair Loop"), not a silent failure the UI has to guard against ad hoc.
- No hardcoded severity colors scattered across components — define them
  once (e.g., a `severityTheme` map) and reference it everywhere, so the
  palette in Section 1 stays a single source of truth.
- Before calling any UI "done," take a screenshot and self-critique
  against Sections 1-4 of this file. If it looks like a generic AI-app
  template, it's not done.
