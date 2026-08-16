"""test_llm_connection.py — Link-phase handshake script for local verification.

Run: python tools/test_llm_connection.py

Verifies that the GROQ_API_KEY is set and a minimal chat completion call
returns a valid response. Do not proceed to full logic if this fails.
"""

import sys
import os
import json
import urllib.request
import urllib.error

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "gpt-oss-120b"


def main():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("FAIL: GROQ_API_KEY not set in environment.")
        print("Create a .env.local file with GROQ_API_KEY=your-key-here")
        sys.exit(1)

    print(f"Testing connection to Groq API ({MODEL})...")

    body = json.dumps({
        "model": MODEL,
        "max_tokens": 64,
        "messages": [
            {"role": "user", "content": "Reply with the word: OK"}
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
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            print(f"PASS: API responded with: {text.strip()}")
            sys.exit(0)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        print(f"FAIL: API error {e.code}: {error_body}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"FAIL: Network error: {e.reason}")
        sys.exit(1)


if __name__ == "__main__":
    main()
