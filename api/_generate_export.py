"""_generate_export.py — format triage results as JIRA plaintext, CSV, and PDF.

Deterministic. No LLM call. Pure formatting.
"""

import csv
import io


def generate_jira_text(result: dict) -> str:
    """Format a single result's bugReport as JIRA-ready plaintext."""
    bug = result.get("bugReport")
    if not bug:
        return ""

    lines = [
        f"h1. {bug.get('title', 'Untitled Bug')}",
        "",
        f"*Summary:* {bug.get('summary', '')}",
        "",
        f"*Steps to Reproduce:*",
        f"{bug.get('stepsToReproduce', 'N/A')}",
        "",
        f"*Expected vs Actual:*",
        f"{bug.get('expectedVsActual', 'N/A')}",
        "",
        f"*Severity:* {bug.get('severity', result.get('severity', 'Unknown'))}",
        f"*Suggested Assignee Area:* {bug.get('suggestedAssigneeArea', 'N/A')}",
        "",
        f"*Root Cause:* {result.get('rootCause', 'N/A')}",
        f"*Affected Component:* {result.get('affectedComponent', 'N/A')}",
        f"*Confidence:* {result.get('confidence', 'Unknown')}",
    ]

    evidence = result.get("evidence", [])
    if evidence:
        lines.append("")
        lines.append("*Evidence:*")
        for line in evidence:
            lines.append(f"{{quote}}{line}{{quote}}")

    return "\n".join(lines)


def generate_csv(results: list[dict]) -> str:
    """Format all results as CSV string."""
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "ID", "Timestamp", "Severity", "Category", "Affected Component",
        "Confidence", "Root Cause", "Evidence", "Next Steps",
    ])

    for r in results:
        writer.writerow([
            r.get("id", ""),
            r.get("timestamp", ""),
            r.get("severity", ""),
            r.get("categoryTag", ""),
            r.get("affectedComponent", ""),
            r.get("confidence", ""),
            r.get("rootCause", ""),
            " | ".join(r.get("evidence", [])),
            " | ".join(r.get("nextSteps", [])),
        ])

    return output.getvalue()


def generate_pdf_summary(results: list[dict]) -> str:
    """Generate a simple text-based PDF summary.

    Since we can't depend on external PDF libraries in a serverless function,
    we generate a minimal valid PDF with the summary content.
    """
    lines = []
    lines.append("LogPilot Triage Summary")
    lines.append("=" * 40)
    lines.append("")

    for r in results:
        lines.append(f"[{r.get('severity', '?')}] {r.get('rootCause', 'N/A')}")
        lines.append(f"  Category: {r.get('categoryTag', 'Unknown')}")
        lines.append(f"  Component: {r.get('affectedComponent', 'Unknown')}")
        lines.append(f"  Confidence: {r.get('confidence', 'Unknown')}")
        lines.append("")

    content = "\n".join(lines)

    # Minimal PDF structure
    pdf_lines = []
    pdf_lines.append("%PDF-1.4")
    pdf_lines.append("1 0 obj")
    pdf_lines.append("<< /Type /Catalog /Pages 2 0 R >>")
    pdf_lines.append("endobj")
    pdf_lines.append("2 0 obj")
    pdf_lines.append("<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    pdf_lines.append("endobj")
    pdf_lines.append("3 0 obj")
    pdf_lines.append("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>")
    pdf_lines.append("endobj")

    # Content stream
    text_content = content.replace("(", "\\(").replace(")", "\\)")
    text_lines = text_content.split("\n")
    text_obj = "BT /F1 10 Tf 50 750 Td 12 TL"
    for line in text_lines:
        escaped = line.replace("(", "\\(").replace(")", "\\)")
        text_obj += f" ({escaped}) T*"
    text_obj += " ET"

    pdf_lines.append("4 0 obj")
    pdf_lines.append(f"<< /Length {len(text_obj)} >>")
    pdf_lines.append("stream")
    pdf_lines.append(text_obj)
    pdf_lines.append("endstream")
    pdf_lines.append("endobj")
    pdf_lines.append("5 0 obj")
    pdf_lines.append("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")
    pdf_lines.append("endobj")

    pdf_lines.append("xref")
    pdf_lines.append("0 6")
    pdf_lines.append("0000000000 65535 f ")
    for i in range(1, 6):
        pdf_lines.append(f"{i:010d} 00000 n ")
    pdf_lines.append("trailer")
    pdf_lines.append("<< /Size 6 /Root 1 0 R >>")
    pdf_lines.append("startxref")
    pdf_lines.append("0")
    pdf_lines.append("%%EOF")

    return "\n".join(pdf_lines)


def generate_export(results: list[dict]) -> dict:
    """Generate all export formats.

    Returns:
        {
            "jira": {result_id: jira_text, ...},
            "csv": csv_string,
            "pdf": pdf_string
        }
    """
    jira_exports = {}
    for r in results:
        jira_text = generate_jira_text(r)
        if jira_text:
            jira_exports[r["id"]] = jira_text

    return {
        "jira": jira_exports,
        "csv": generate_csv(results),
        "pdf": generate_pdf_summary(results),
    }
