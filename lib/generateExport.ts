import type { TriageResult, ExportData } from "./types";

export function generateJiraText(result: TriageResult): string {
  const bug = result.bugReport;
  if (!bug) return "";

  const lines = [
    `h1. ${bug.title || "Untitled Bug"}`,
    "",
    `*Summary:* ${bug.summary || ""}`,
    "",
    `*Steps to Reproduce:*`,
    `${bug.stepsToReproduce || "N/A"}`,
    "",
    `*Expected vs Actual:*`,
    `${bug.expectedVsActual || "N/A"}`,
    "",
    `*Severity:* ${bug.severity || result.severity || "Unknown"}`,
    `*Suggested Assignee Area:* ${bug.suggestedAssigneeArea || "N/A"}`,
    "",
    `*Root Cause:* ${result.rootCause || "N/A"}`,
    `*Affected Component:* ${result.affectedComponent || "N/A"}`,
    `*Confidence:* ${result.confidence || "Unknown"}`,
  ];

  const evidence = result.evidence || [];
  if (evidence.length > 0) {
    lines.push("");
    lines.push("*Evidence:*");
    for (const line of evidence) {
      lines.push(`{quote}${line}{quote}`);
    }
  }

  return lines.join("\n");
}

function generateCsv(results: TriageResult[]): string {
  const headers = [
    "ID",
    "Timestamp",
    "Severity",
    "Category",
    "Affected Component",
    "Confidence",
    "Root Cause",
    "Evidence",
    "Next Steps",
  ];

  const rows: string[] = [
    headers.map(csvEscape).join(","),
  ];

  for (const r of results) {
    const evidence = (r.evidence || []).join(" | ");
    const nextSteps = (r.nextSteps || []).join(" | ");
    rows.push(
      [
        r.id || "",
        r.timestamp || "",
        r.severity || "",
        r.categoryTag || "",
        r.affectedComponent || "",
        r.confidence || "",
        r.rootCause || "",
        evidence,
        nextSteps,
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  return rows.join("\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generatePdfSummary(results: TriageResult[]): string {
  const lines: string[] = ["LogPilot Triage Summary", "=".repeat(40), ""];

  for (const r of results) {
    lines.push(`[${r.severity || "?"}] ${r.rootCause || "N/A"}`);
    lines.push(`  Category: ${r.categoryTag || "Unknown"}`);
    lines.push(`  Component: ${r.affectedComponent || "Unknown"}`);
    lines.push(`  Confidence: ${r.confidence || "Unknown"}`);
    lines.push("");
  }

  const content = lines.join("\n");

  // Build PDF with proper structure and byte offsets
  const objects: { [key: number]: string } = {};

  // Object 1: Catalog
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";

  // Object 2: Pages
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";

  // Object 3: Page
  objects[3] =
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>";

  // Object 4: Content stream - properly formatted
  const textLines = content.split("\n");
  let streamData = "BT /F1 12 Tf 50 750 Td 14 TL\n";
  for (const line of textLines) {
    // Properly escape special characters
    const escaped = line
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
    streamData += `(${escaped}) Tj\nT*\n`;
  }
  streamData += "ET";

  const streamObj = `<< /Length ${streamData.length} >>\nstream\n${streamData}\nendstream`;
  objects[4] = streamObj;

  // Object 5: Font
  objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";

  // Build PDF
  let pdf = "%PDF-1.4\n";
  const offsets: { [key: number]: number } = {};

  // Add each object and track offset
  for (let i = 1; i <= 5; i++) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  // Build xref table
  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += "0 6\n";
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i <= 5; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += "trailer\n";
  pdf += "<< /Size 6 /Root 1 0 R >>\n";
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF";

  return pdf;
}

export function generateExport(results: TriageResult[]): ExportData {
  const jiraExports: Record<string, string> = {};
  for (const r of results) {
    const jiraText = generateJiraText(r);
    if (jiraText) jiraExports[r.id] = jiraText;
  }

  return {
    jira: jiraExports,
    csv: generateCsv(results),
    pdf: generatePdfSummary(results),
  };
}
