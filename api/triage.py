"""triage.py — Vercel Python Serverless Function. The orchestrator endpoint.

This is Layer 2 (Navigation): it sequences the Layer 3 tools correctly.
The browser POSTs entries here; this function orchestrates the pipeline
and returns the fully assembled payload. The browser never talks to the
LLM API directly.

Pipeline: parse → LLM triage → dedupe → trend summary + time saved (parallel) → export
"""

from http.server import BaseHTTPRequestHandler
import json
import time
import sys
import os

# Allow importing sibling modules
sys.path.insert(0, os.path.dirname(__file__))

from _parse_log import parse_log
from _call_llm_triage import call_llm_triage
from _dedupe_logs import dedupe_logs
from _build_trend_summary import build_trend_summary
from _compute_time_saved import compute_time_saved
from _generate_export import generate_export


def handler(req):
    """Main entry point for Vercel Python serverless function.

    Expects POST body: {"entries": [...]}
    Returns: {"results": [...], "trend": {...}, "timeSaved": {...}, "exports": {...}}
    """
    try:
        body = req.get("body", {})
        entries = body.get("entries", [])

        if not entries or not isinstance(entries, list):
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No entries provided. Paste a log or upload a .log/.txt file to triage."})
            }

        # Layer 3: Parse and clean
        parsed_entries = parse_log(entries)
        if not parsed_entries:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "All entries were empty after cleaning. Paste a log or upload a .log/.txt file to triage."})
            }

        # Start timing the AI triage
        start_time = time.time()

        # Layer 3: LLM triage (the only probabilistic step)
        triage_response = call_llm_triage(parsed_entries)
        results = triage_response.get("results", [])

        # Layer 3: Dedupe / related grouping
        results = dedupe_logs(results)

        # Layer 3: Deterministic post-processing
        trend = build_trend_summary(results)
        ai_elapsed = time.time() - start_time
        time_saved = compute_time_saved(len(results), ai_elapsed)
        exports = generate_export(results)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "results": results,
                "trend": trend,
                "timeSaved": time_saved,
                "exports": exports,
            })
        }

    except RuntimeError as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"Unexpected error during triage: {str(e)}"})
        }


# Vercel Python runtime entry point
def handler_vercel(request):
    """Adapter for Vercel's Python runtime."""
    try:
        body = json.loads(request.body) if request.body else {}
    except (json.JSONDecodeError, AttributeError):
        body = {}

    result = handler({"body": body})

    from http.server import BaseHTTPRequestHandler
    class Response(BaseHTTPRequestHandler):
        def __init__(self):
            self.status = result["statusCode"]
            self.headers = {"Content-Type": "application/json"}
            self.body = result["body"]

    return Response()
