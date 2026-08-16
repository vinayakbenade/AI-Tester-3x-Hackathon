"""_parse_log.py — normalize/clean raw log text, split multi-entry uploads.

Deterministic. No LLM call. Part of Layer 3 tools.
Input: list of raw entry dicts with rawText.
Output: list of cleaned entry dicts with normalized rawText.
"""

import re
import unicodedata


MAX_LOG_LENGTH = 50000  # per-entry cap to keep LLM context manageable


def clean_text(text: str) -> str:
    """Normalize unicode, strip control chars, collapse excessive blank lines."""
    if not text:
        return ""

    text = unicodedata.normalize("NFKC", text)

    # Remove control chars except newline, tab, carriage return
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # Collapse 3+ consecutive newlines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Collapse trailing/leading whitespace per line but preserve indentation
    text = text.strip()

    if len(text) > MAX_LOG_LENGTH:
        text = text[:MAX_LOG_LENGTH]

    return text


def parse_log(entries: list[dict]) -> list[dict]:
    """Normalize and clean a list of entry dicts.

    Each entry must have: id, source, filename, timestamp, rawText.
    Returns the same list with rawText cleaned and validated.
    """
    cleaned = []
    for entry in entries:
        raw = entry.get("rawText", "")
        cleaned_text = clean_text(raw)

        if not cleaned_text:
            continue

        cleaned.append({
            "id": entry.get("id", ""),
            "source": entry.get("source", "paste"),
            "filename": entry.get("filename"),
            "timestamp": entry.get("timestamp"),
            "rawText": cleaned_text,
        })

    return cleaned
