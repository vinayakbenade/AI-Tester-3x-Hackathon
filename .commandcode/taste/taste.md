# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# llm
- For Groq LLM calls in this project, use the `llama-3.3-70b-versatile` model — `gpt-oss-*` models return 404 (need `openai/` prefix) and exceed the free-tier 8K TPM limit with the long system prompt. Confidence: 0.72
- Groq model IDs on this account require the provider prefix (e.g. `openai/gpt-oss-120b`) — bare `gpt-oss-120b` returns 404. Confidence: 0.60

# ui
- Avoid dim/low-contrast text colors in the UI — replace hardcoded `text-gray-*`/`text-base-600` classes with semantic theme-aware text tokens (`text-primary`, `text-primary-secondary`, `text-primary-muted`) driven by CSS variables that adapt to both dark and light themes. Confidence: 0.72
- In the redesign the user wants a full-height fixed left sidebar (flush to the left edge, no padding offset) with its own scrollable main content area. Confidence: 0.75

