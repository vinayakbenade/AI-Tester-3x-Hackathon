import type { TriageResult } from "./types";
import type { LlmProvider } from "./settings";

// API Endpoints
const API_ENDPOINTS = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  openai: "https://api.openai.com/v1/chat/completions",
  gemini: "https://generativelanguage.googleapis.com/v1beta/models",
  claude: "https://api.anthropic.com/v1/messages",
};

const MAX_TOKENS = 8192;

const SYSTEM_PROMPT = `You are LogPilot's Log & Crash Triage Assistant. Read raw log content and return a structured triage report. Be precise, evidence-based, and conservative — never invent details not supported by the log.

For EACH entry, extract:
1. ROOT CAUSE — 1-2 sentence explanation based ONLY on log evidence.
2. EVIDENCE — exact lines/codes from the log, quoted verbatim.
3. SEVERITY — Critical (crash/data loss/hang) | High (broken, no workaround) | Medium (degraded, workaround) | Low (cosmetic).
4. AFFECTED COMPONENT — best-guess subsystem or "Unknown".
5. CONFIDENCE — High | Medium | Low. If Low, explain what's missing in confidenceNote.
6. NEXT STEPS — 2-4 concrete diagnostic steps for a QA engineer.
7. CATEGORY TAG — one of: "Driver Crash", "Memory Leak", "Rendering Glitch", "Timeout", "Hardware Fault", "Race Condition", "Configuration Error", "Unknown".
8. TIMESTAMP — echo back the input timestamp field, or null if none. Never guess from log body.

For multiple entries: analyze each independently, then flag duplicates/related issues (same root cause/component + similar error) in "relatedTo" listing matching entry IDs.

For Medium+ severity, generate a bugReport with: title, summary, stepsToReproduce, expectedVsActual, severity, suggestedAssigneeArea.

Return ONLY valid JSON (no markdown fences, no commentary) matching:
{"results":[{"id":"string","timestamp":"ISO-8601 or null","rootCause":"string","evidence":["string"],"severity":"Critical|High|Medium|Low","affectedComponent":"string","confidence":"High|Medium|Low","confidenceNote":"string or null","nextSteps":["string"],"categoryTag":"string","relatedTo":["id"],"bugReport":{"title":"string","summary":"string","stepsToReproduce":"string","expectedVsActual":"string","severity":"string","suggestedAssigneeArea":"string"}|null}]}

Rules: Never fabricate log content. If a log is too sparse, return confidence "Low" with a note — don't skip entries. No marketing tone, no filler.`;

const VALID_SEVERITIES = new Set(["Critical", "High", "Medium", "Low"]);
const VALID_CONFIDENCES = new Set(["High", "Medium", "Low"]);

function validateResult(result: any): boolean {
  const requiredFields = [
    "id",
    "rootCause",
    "evidence",
    "severity",
    "affectedComponent",
    "confidence",
    "nextSteps",
    "categoryTag",
    "relatedTo",
  ];
  for (const field of requiredFields) {
    if (!(field in result)) return false;
  }
  if (!VALID_SEVERITIES.has(result.severity)) return false;
  if (!VALID_CONFIDENCES.has(result.confidence)) return false;
  if (!Array.isArray(result.evidence)) return false;
  if (!Array.isArray(result.nextSteps)) return false;
  if (!Array.isArray(result.relatedTo)) return false;
  if ("bugReport" in result && result.bugReport !== null) {
    if (typeof result.bugReport !== "object") return false;
  }
  return true;
}

function validateResponse(data: any): boolean {
  if (!data || !("results" in data) || !Array.isArray(data.results)) {
    return false;
  }
  for (const result of data.results) {
    if (!validateResult(result)) return false;
  }
  return true;
}

async function callGroq(entries: any[], apiKey: string, model: string): Promise<any> {
  if (!apiKey) throw new Error("No Groq API key configured. Set one in Settings.");

  const body = JSON.stringify({
    model: model,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ entries }) },
    ],
  });

  const resp = await fetch(API_ENDPOINTS.groq, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  if (!resp.ok) {
    const errorBody = await resp.text();
    throw new Error(`Groq API error ${resp.status}: ${errorBody}`);
  }

  const responseData = await resp.json();
  const choices = responseData.choices || [];
  if (choices.length === 0) throw new Error("Groq API returned empty choices");
  let text = choices[0].message?.content || "";
  if (!text) throw new Error("Groq API returned empty text");

  text = text.trim();
  if (text.startsWith("```")) {
    text = text
      .split("\n")
      .filter((l: string) => !l.trim().startsWith("```"))
      .join("\n");
  }

  return JSON.parse(text);
}

async function callOpenAI(entries: any[], apiKey: string, model: string): Promise<any> {
  if (!apiKey) throw new Error("No OpenAI API key configured. Set one in Settings.");

  const body = JSON.stringify({
    model: model,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ entries }) },
    ],
  });

  const resp = await fetch(API_ENDPOINTS.openai, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  if (!resp.ok) {
    const errorBody = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${errorBody}`);
  }

  const responseData = await resp.json();
  const choices = responseData.choices || [];
  if (choices.length === 0) throw new Error("OpenAI API returned empty choices");
  let text = choices[0].message?.content || "";
  if (!text) throw new Error("OpenAI API returned empty text");

  text = text.trim();
  if (text.startsWith("```")) {
    text = text
      .split("\n")
      .filter((l: string) => !l.trim().startsWith("```"))
      .join("\n");
  }

  return JSON.parse(text);
}

async function callGemini(entries: any[], apiKey: string, model: string): Promise<any> {
  if (!apiKey) throw new Error("No Google Gemini API key configured. Set one in Settings.");

  const url = `${API_ENDPOINTS.gemini}/${model}:generateContent?key=${apiKey}`;

  const body = JSON.stringify({
    systemInstruction: {
      parts: {
        text: SYSTEM_PROMPT,
      },
    },
    contents: {
      parts: {
        text: JSON.stringify({ entries }),
      },
    },
  });

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  if (!resp.ok) {
    const errorBody = await resp.text();
    throw new Error(`Gemini API error ${resp.status}: ${errorBody}`);
  }

  const responseData = await resp.json();
  const candidates = responseData.candidates || [];
  if (candidates.length === 0) throw new Error("Gemini API returned empty candidates");
  
  const content = candidates[0].content?.parts?.[0]?.text || "";
  if (!content) throw new Error("Gemini API returned empty text");

  let text = content.trim();
  if (text.startsWith("```")) {
    text = text
      .split("\n")
      .filter((l: string) => !l.trim().startsWith("```"))
      .join("\n");
  }

  return JSON.parse(text);
}

async function callClaude(entries: any[], apiKey: string, model: string): Promise<any> {
  if (!apiKey) throw new Error("No Anthropic Claude API key configured. Set one in Settings.");

  const body = JSON.stringify({
    model: model,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: JSON.stringify({ entries }),
      },
    ],
  });

  const resp = await fetch(API_ENDPOINTS.claude, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body,
  });

  if (!resp.ok) {
    const errorBody = await resp.text();
    throw new Error(`Claude API error ${resp.status}: ${errorBody}`);
  }

  const responseData = await resp.json();
  const content = responseData.content || [];
  if (content.length === 0) throw new Error("Claude API returned empty content");
  
  let text = content[0].text || "";
  if (!text) throw new Error("Claude API returned empty text");

  text = text.trim();
  if (text.startsWith("```")) {
    text = text
      .split("\n")
      .filter((l: string) => !l.trim().startsWith("```"))
      .join("\n");
  }

  return JSON.parse(text);
}

export async function callLlmTriage(
  entries: any[],
  options?: { provider?: LlmProvider; apiKey?: string; model?: string }
): Promise<{ results: TriageResult[] }> {
  const provider = options?.provider || "groq";
  const apiKey = options?.apiKey || process.env.GROQ_API_KEY || process.env[`${provider.toUpperCase()}_API_KEY`] || "";
  let model = options?.model;

  // Set default model based on provider if not specified
  if (!model) {
    const defaults: Record<LlmProvider, string> = {
      groq: "llama-3.3-70b-versatile",
      openai: "gpt-4o",
      gemini: "gemini-2.0-flash",
      claude: "claude-3-5-sonnet-20241022",
    };
    model = defaults[provider];
  }

  // Route to appropriate provider
  let callFunction: (entries: any[], apiKey: string, model: string) => Promise<any>;
  switch (provider) {
    case "openai":
      callFunction = callOpenAI;
      break;
    case "gemini":
      callFunction = callGemini;
      break;
    case "claude":
      callFunction = callClaude;
      break;
    case "groq":
    default:
      callFunction = callGroq;
      break;
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await callFunction(entries, apiKey, model);
      if (validateResponse(response)) {
        return response;
      } else {
        if (attempt === 0) continue;
        throw new Error("LLM response failed schema validation after retry");
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        if (attempt === 0) continue;
        throw new Error("LLM returned malformed JSON after retry");
      }
      if (attempt === 0) continue;
      throw e;
    }
  }

  throw new Error("LLM triage failed after retry");
}
