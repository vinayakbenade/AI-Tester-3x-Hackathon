"""_build_trend_summary.py — group results by categoryTag and by timestamp date bucket.

Deterministic. No LLM call. Pure aggregation.
Output shape matches gemini.md schema.
"""

from collections import Counter
from datetime import datetime


def build_trend_summary(results: list[dict]) -> dict:
    """Aggregate results by categoryTag and by date bucket.

    Args:
        results: List of triage result dicts with 'categoryTag' and optional 'timestamp'.

    Returns:
        {
            "byCategory": [{"categoryTag": str, "count": int}, ...],
            "byDateBucket": [{"date": "YYYY-MM-DD", "categoryTag": str, "count": int}, ...]
        }
    """
    # Count by category
    category_counter = Counter()
    for result in results:
        tag = result.get("categoryTag", "Unknown")
        category_counter[tag] += 1

    by_category = [
        {"categoryTag": tag, "count": count}
        for tag, count in category_counter.most_common()
    ]

    # Count by date bucket (only when timestamps present)
    date_category_counter = Counter()
    for result in results:
        timestamp = result.get("timestamp")
        if not timestamp:
            continue
        date_str = _extract_date(timestamp)
        if date_str:
            tag = result.get("categoryTag", "Unknown")
            date_category_counter[(date_str, tag)] += 1

    by_date_bucket = [
        {"date": date, "categoryTag": tag, "count": count}
        for (date, tag), count in sorted(date_category_counter.items())
    ]

    return {
        "byCategory": by_category,
        "byDateBucket": by_date_bucket,
    }


def _extract_date(timestamp: str) -> str | None:
    """Extract YYYY-MM-DD from an ISO-8601 timestamp string."""
    try:
        dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d")
    except (ValueError, AttributeError):
        return None
