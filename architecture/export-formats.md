# export-formats.md — Export Format SOP

## Purpose
`_generate_export.py` formats triage results as JIRA plaintext, CSV, and
PDF. Pure formatting — no LLM call.

## JIRA Plaintext
Generated per-entry from the `bugReport` object. Format:
```
h1. {title}

*Summary:* {summary}

*Steps to Reproduce:*
{stepsToReproduce}

*Expected vs Actual:*
{expectedVsActual}

*Severity:* {severity}
*Suggested Assignee Area:* {suggestedAssigneeArea}

*Root Cause:* {rootCause}
*Affected Component:* {affectedComponent}
*Confidence:* {confidence}

*Evidence:*
{quote}{evidence line 1}{quote}
{quote}{evidence line 2}{quote}
```
Triggered by the "Copy as bug report" button on each result card.

## CSV
Column order:
1. ID
2. Timestamp
3. Severity
4. Category
5. Affected Component
6. Confidence
7. Root Cause
8. Evidence (pipe-separated)
9. Next Steps (pipe-separated)

All results in a single CSV file. Triggered by the "Export CSV" button.

## PDF
A simple text-based PDF summary with one row per result:
- Severity
- Category
- Root Cause
- Component
- Confidence

Generated as a minimal valid PDF structure (no external dependencies).
Triggered by the "Export PDF" button.
