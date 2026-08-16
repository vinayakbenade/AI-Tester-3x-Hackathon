"""_compute_time_saved.py — manual baseline vs measured AI wall-clock time.

Deterministic. No LLM call. Pure arithmetic.
Output shape matches gemini.md schema.
"""

import os


def compute_time_saved(entry_count: int, ai_elapsed_seconds: float) -> dict:
    """Compute the time-saved comparison string.

    Args:
        entry_count: Number of log entries analyzed.
        ai_elapsed_seconds: Wall-clock time of the AI triage run in seconds.

    Returns:
        {
            "entryCount": int,
            "manualBaselineMinutes": float,
            "aiElapsedSeconds": float,
            "displayString": "Manual triage: ~{X} min → LogPilot: ~{Y} sec"
        }
    """
    manual_baseline_minutes = float(
        os.environ.get("MANUAL_BASELINE_MINUTES", "15")
    )

    manual_total_minutes = manual_baseline_minutes * entry_count
    ai_seconds = round(ai_elapsed_seconds, 1)

    display_string = (
        f"Manual triage: ~{manual_total_minutes:.0f} min → "
        f"LogPilot: ~{ai_seconds:.0f} sec"
    )

    return {
        "entryCount": entry_count,
        "manualBaselineMinutes": manual_total_minutes,
        "aiElapsedSeconds": ai_seconds,
        "displayString": display_string,
    }
