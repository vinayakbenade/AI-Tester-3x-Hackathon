# LLM API Configuration Guide

This guide explains how to configure and use your own LLM API keys with LogPilot's triage assistant.

## Overview

LogPilot now supports multiple LLM providers:
- **Groq** — Fast, free tier available. Great for testing and prototyping.
- **OpenAI** — GPT-4o and GPT-4 Turbo. Premium quality for demanding analysis.
- **Google Gemini** — Gemini 2.0 and 1.5. Free tier available with generous limits.
- **Anthropic Claude** — Claude 3.5 Sonnet. High reasoning capability.

## How It Works

1. **Local Storage**: Your API keys are stored **locally in your browser** using browser localStorage.
2. **Never Shared with LogPilot Servers**: Your keys are only sent to the respective LLM provider's API.
3. **Client-Side Configuration**: You configure which provider and which API key to use directly in the Settings panel.
4. **Automatic Routing**: When you run a triage, the selected provider and API key are sent to the backend, which routes your request to the correct LLM API.

## Accessing Settings

1. Open the LogPilot web app
2. Click the **Settings** button/icon in the navigation panel
3. The **LLM API Settings** panel will open

## Configuring an API Key

### Step 1: Select a Provider

Click on one of the provider cards:
- **Groq** — Fast inference, free tier
- **OpenAI** — Premium GPT models
- **Google Gemini** — Google's generative AI
- **Anthropic Claude** — Anthropic's latest models

### Step 2: Get Your API Key

For the selected provider, click the link in the settings to create or retrieve your API key:
- **Groq**: https://console.groq.com/keys
- **OpenAI**: https://platform.openai.com/api-keys
- **Google Gemini**: https://aistudio.google.com/app/apikey
- **Anthropic Claude**: https://console.anthropic.com/account/keys

### Step 3: Enter Your API Key

Paste your API key into the input field. The field is masked for security. The key format depends on your provider:
- Groq: starts with `gsk_`
- OpenAI: starts with `sk-`
- Google Gemini: starts with `AIzaSy`
- Anthropic Claude: starts with `sk-ant-`

### Step 4: Select a Model

Choose a model from the dropdown. Available models depend on the selected provider:

**Groq**:
- Llama 3.3 70B (Versatile) — Recommended
- Llama 3.1 8B (Instant) — Faster, lighter
- Mixtral 8x7B

**OpenAI**:
- GPT-4o — Latest and most capable
- GPT-4 Turbo — Excellent quality
- GPT-3.5 Turbo — Fast and economical

**Google Gemini**:
- Gemini 2.0 Flash — Fastest
- Gemini 1.5 Pro — Most capable
- Gemini 1.5 Flash — Efficient

**Anthropic Claude**:
- Claude 3.5 Sonnet — Recommended
- Claude 3 Opus — High reasoning
- Claude 3 Haiku — Fast and economical

### Step 5: Save Settings

Click the **Save Settings** button. You should see a "✓ Saved!" confirmation message.

## Managing Multiple Provider Keys

You can configure API keys for multiple providers simultaneously. The **"Other Providers"** section shows which providers have keys configured. To switch providers, simply:

1. Click on a different provider card
2. Configure its API key and model
3. Click Save Settings
4. The selected provider will be used for the next triage run

## Clearing an API Key

To remove a provider's API key:

1. Select the provider
2. Click the **Clear Key** button
3. The key will be removed from your browser's local storage

## Status Indicator

The status bar shows:
- **Green indicator + "API key configured"** — You're ready to run triage with this provider
- **Red indicator + "No API key set"** — No key configured; set one before running triage

## Using a Different Provider

To switch providers for the next triage run:

1. Open Settings
2. Click on the desired provider card
3. The UI will update to show that provider's configuration
4. If the key is already configured, you're ready to go
5. If not, add the API key, model, and save
6. Close Settings and run triage — your new provider will be used

## API Key Security

- **Stored Locally**: API keys are stored in your browser's localStorage, not on LogPilot servers
- **HTTPS Only**: When you run triage, keys are sent over HTTPS to the LLM provider
- **No Server Logging**: The backend does not log or store your API keys
- **User Control**: You can clear any key at any time

## Troubleshooting

### "No API key configured" Error

**Issue**: Triage fails with this error

**Solution**: 
1. Open Settings
2. Verify you have an API key entered for the selected provider
3. Ensure the key is correct (copy-paste from the provider's console)
4. Save Settings and try again

### "API key not found" Error

**Issue**: The key format is invalid

**Solution**:
1. Double-check the key prefix (e.g., `gsk_`, `sk-`, `AIzaSy`, `sk-ant-`)
2. Ensure you're not using a key from a different provider
3. Regenerate the key in your provider's console if needed
4. Clear the old key and save the new one

### "Model not available" Error

**Issue**: The selected model doesn't exist

**Solution**:
1. Switch to the provider card for that model
2. Select a different model from the dropdown
3. Save Settings and try again

### "Rate limit exceeded" Error

**Issue**: You've made too many API calls

**Solution**:
- Groq: Wait 1-2 minutes, then retry (generous free tier)
- OpenAI: Check your API account for usage/limits
- Google Gemini: Free tier has daily limits
- Claude: Depends on your plan

## Choosing a Provider

### Use Groq If:
- You're testing or prototyping
- You want the fastest inference
- You want a free, generous tier
- You need to keep costs down

### Use OpenAI If:
- You need the highest quality responses
- You have GPT-4 access and budget
- You want the most reliable service
- You're running in production

### Use Google Gemini If:
- You want a free tier with good quality
- You need vision/multimodal support (future)
- You're comfortable with Google's terms

### Use Claude If:
- You need exceptional reasoning capability
- You want Anthropic's focus on safety
- You need longer context windows
- You're willing to pay for premium quality

## Environment Variables (Server-side)

If running locally with a `.env` file, you can also set environment variables for backward compatibility:

```
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIzaSy...
CLAUDE_API_KEY=sk-ant-...
```

The browser-configured keys take precedence over environment variables.

## Best Practices

1. **Keep Keys Private**: Never share your API keys with anyone
2. **Rotate Keys Periodically**: Regenerate keys in your provider's console
3. **Monitor Usage**: Check your provider's console for unexpected usage
4. **Use the Right Model**: Match the model to your needs (faster vs. higher quality)
5. **Test with Free Tiers First**: Try Groq or Gemini free tier before committing to paid plans
6. **Save Settings Before Triaging**: Always click Save Settings after changing configuration

## Support

For issues with specific LLM providers, refer to their official documentation:
- [Groq Documentation](https://console.groq.com/docs/speech-text)
- [OpenAI Documentation](https://platform.openai.com/docs/guides/gpt)
- [Google Gemini Documentation](https://ai.google.dev/docs)
- [Anthropic Claude Documentation](https://docs.anthropic.com/)
