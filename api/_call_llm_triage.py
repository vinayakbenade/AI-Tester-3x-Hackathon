"""_call_llm_triage.py — send entries to Groq LLM API, validate output, retry on malformed JSON.

The ONLY place in the system where probabilistic reasoning happens.
Uses the system prompt from logpilot_triage_prompt.md.
Self-Annealing: retries once on malformed JSON before surfacing an error.
"""

import json
import os
import urllib.request
import urllib.error

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "gpt-oss-120b"
MAX_TOKENS = 8192

SYSTEM_PROMPT = """You are LogPilot's Log & Crash Triage Assistant, used by QA engineers to \
analyze software/driver logs, crash dumps, and stack traces quickly and accurately.

Your job: read the raw log content provided and return a structured triage report. \
Be precise, evidence-based, and conservative — never invent details that aren't supported by the log text.

For EACH log/crash entry provided, analyze it and extract:

1. ROOT CAUSE — A concise (1-2 sentence) explanation of the most likely root cause. \
Base this ONLY on evidence in the log — do not speculate beyond what the text supports.

2. EVIDENCE — The exact line(s) or error codes/strings from the log that led to your \
diagnosis, quoted verbatim so the engineer can jump straight to them.

3. SEVERITY — One of: Critical | High | Medium | Low. \
Critical = crash/data loss/system hang. High = feature broken/no workaround. \
Medium = degraded behavior with workaround. Low = cosmetic or non-blocking.

4. AFFECTED COMPONENT — Best-guess subsystem (e.g., "GPU Driver - Display Pipeline", \
"Memory Management", "Network Stack", "UI Rendering"). If unclear, say "Unknown".

5. CONFIDENCE — High | Medium | Low, reflecting how certain you are given the available evidence. \
If confidence is Low, explicitly say what additional information would help confirm the diagnosis. \
Never present a low-confidence guess as fact. This flag is a first-class feature of LogPilot.

6. SUGGESTED NEXT STEPS — 2-4 concrete, actionable diagnostic steps a QA engineer should take next. \
Tailor these to the error type and component — avoid generic advice.

7. CATEGORY TAG — A short standardized tag for trend tracking. Use a STABLE, LIMITED vocabulary: \
"Driver Crash", "Memory Leak", "Rendering Glitch", "Timeout", "Hardware Fault", \
"Race Condition", "Configuration Error", "Unknown". Reuse the same tag string for the same failure type.

8. TIMESTAMP — If the input entry includes a timestamp field, echo it back unchanged. \
If none was provided, return null. NEVER guess or extract a timestamp from inside the log body.

WHEN MULTIPLE LOGS ARE PROVIDED (batch mode):
- Analyze each independently first.
- Then compare entries against each other and flag likely DUPLICATES or RELATED issues \
(same root cause / same component + similar error signature). Return a "relatedTo" field \
listing the IDs of any matching entries.
- Do not merge distinct issues just because they share a component.

BUG REPORT DRAFT:
- For entries with Medium severity or higher, generate a ready-to-file bug report with: \
title, summary, stepsToReproduce, expectedVsActual, severity, suggestedAssigneeArea.

WHAT YOU DO NOT DO:
- You do not calculate time saved, percentages, or any other arithmetic.
- You do not generate CSV, PDF, or JIRA-formatted text yourself — return structured JSON only.
- You do not aggregate category counts across entries — return per-entry categoryTag only.

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown fences, no commentary) matching this shape:

{
  "results": [
    {
      "id": "string",
      "timestamp": "ISO-8601 string or null",
      "rootCause": "string",
      "evidence": ["string", ...],
      "severity": "Critical | High | Medium | Low",
      "affectedComponent": "string",
      "confidence": "High | Medium | Low",
      "confidenceNote": "string or null",
      "nextSteps": ["string", ...],
      "categoryTag": "string",
      "relatedTo": ["id", ...],
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

RULES:
- Never fabricate log content that wasn't provided.
- If a log is too sparse or garbled to analyze, return confidence "Low" with a confidenceNote \
explaining what's missing — do not skip the entry.
- Keep language plain and engineer-facing — no marketing tone, no filler.
- Do not include markdown, backticks, or explanatory text outside the JSON."""


VALID_SEVERITIES = {"Critical", "High", "Medium", "Low"}
VALID_CONFIDENCES = {"High", "Medium", "Low"}


def _validate_result(result: dict) -> bool:
    """Validate a single triage result against the schema."""
    required_fields = [
        "id", "rootCause", "evidence", "severity", "affectedComponent",
        "confidence", "nextSteps", "categoryTag", "relatedTo",
    ]
    for field in required_fields:
        if field not in result:
            return False

    if result["severity"] not in VALID_SEVERITIES:
        return False
    if result["confidence"] not in VALID_CONFIDENCES:
        return False
    if not isinstance(result["evidence"], list):
        return False
    if not isinstance(result["nextSteps"], list):
        return False
    if not isinstance(result["relatedTo"], list):
        return False

    # bugReport is optional but must be dict or null if present
    if "bugReport" in result and result["bugReport"] is not None:
        if not isinstance(result["bugReport"], dict):
            return False

    return True


def _validate_response(data: dict) -> bool:
    """Validate the full LLM response shape."""
    if "results" not in data or not isinstance(data["results"], list):
        return False
    for result in data["results"]:
        if not _validate_result(result):
            return False
    return True


def _call_groq(entries: list[dict]) -> dict:
    """Make the actual API call to Groq. Returns parsed JSON dict."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY environment variable not set")

    user_content = json.dumps({"entries": entries})

    body = json.dumps({
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]
    }).encode("utf-8")

    req = urllib.request.Request(
        GROQ_API_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=55) as resp:
            response_data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Groq API error {e.code}: {error_body}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Network error calling Groq API: {e.reason}")

    # Extract text from response (OpenAI-compatible format)
    choices = response_data.get("choices", [])
    if not choices:
        raise RuntimeError("Groq API returned empty choices")
    text = choices[0].get("message", {}).get("content", "")
    if not text:
        raise RuntimeError("Groq API returned empty text")

    # Strip markdown fences if present
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)

    return json.loads(text)


def call_llm_triage(entries: list[dict]) -> dict:
    """Send entries to LLM for triage. Retries once on malformed JSON (Self-Annealing).

    Args:
        entries: List of cleaned entry dicts with id, source, rawText, etc.

    Returns:
        Dict with "results" key containing list of triage result dicts.

    Raises:
        RuntimeError if the LLM returns invalid JSON after retry.
    """
    for attempt in range(2):
        try:
            response = _call_groq(entries)
            if _validate_response(response):
                return response
            else:
                if attempt == 0:
                    continue
                raise RuntimeError("LLM response failed schema validation after retry")
        except json.JSONDecodeError:
            if attempt == 0:
                continue
            raise RuntimeError("LLM returned malformed JSON after retry")
        except RuntimeError:
            if attempt == 0:
                continue
            raise

    raise RuntimeError("LLM triage failed after retry")
