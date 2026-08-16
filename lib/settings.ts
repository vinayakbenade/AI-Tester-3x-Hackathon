export type LlmProvider = "groq" | "openai" | "gemini" | "claude";

export interface ProviderConfig {
  id: LlmProvider;
  name: string;
  description: string;
  docsUrl: string;
  keysUrl: string;
  keyPlaceholder: string;
  keyPrefix?: string;
  defaultModel: string;
  models: { id: string; label: string }[];
}

export interface LlmSettings {
  provider: LlmProvider;
  apiKeys: Record<LlmProvider, string>;
  models: Record<LlmProvider, string>;
}

const STORAGE_KEY = "logpilot-llm-settings";

const DEFAULT_PROVIDER: LlmProvider = "groq";

export const PROVIDER_CONFIGS: Record<LlmProvider, ProviderConfig> = {
  groq: {
    id: "groq",
    name: "Groq",
    description: "Free & fastest inference. Great for testing.",
    docsUrl: "https://console.groq.com/docs/speech-text",
    keysUrl: "https://console.groq.com/keys",
    keyPlaceholder: "gsk_...",
    keyPrefix: "gsk_",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Versatile)" },
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Instant)" },
      { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    ],
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4o, GPT-4 Turbo. Premium quality.",
    docsUrl: "https://platform.openai.com/docs/guides/gpt",
    keysUrl: "https://platform.openai.com/api-keys",
    keyPlaceholder: "sk-...",
    keyPrefix: "sk-",
    defaultModel: "gpt-4o",
    models: [
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
      { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Fast & Cheap)" },
    ],
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    description: "Gemini 2.0, 1.5. Free tier available.",
    docsUrl: "https://ai.google.dev/docs",
    keysUrl: "https://aistudio.google.com/app/apikey",
    keyPlaceholder: "AIzaSy...",
    defaultModel: "gemini-2.0-flash",
    models: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
      { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    ],
  },
  claude: {
    id: "claude",
    name: "Anthropic Claude",
    description: "Claude 3.5 Sonnet. High reasoning capability.",
    docsUrl: "https://docs.anthropic.com/",
    keysUrl: "https://console.anthropic.com/account/keys",
    keyPlaceholder: "sk-ant-...",
    keyPrefix: "sk-ant-",
    defaultModel: "claude-3-5-sonnet-20241022",
    models: [
      { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
      { id: "claude-3-opus-20240229", label: "Claude 3 Opus" },
      { id: "claude-3-haiku-20240307", label: "Claude 3 Haiku (Fast & Cheap)" },
    ],
  },
};

export const AVAILABLE_MODELS = PROVIDER_CONFIGS.groq.models; // For backwards compatibility

function getDefaultSettings(): LlmSettings {
  return {
    provider: DEFAULT_PROVIDER,
    apiKeys: {
      groq: "",
      openai: "",
      gemini: "",
      claude: "",
    },
    models: {
      groq: PROVIDER_CONFIGS.groq.defaultModel,
      openai: PROVIDER_CONFIGS.openai.defaultModel,
      gemini: PROVIDER_CONFIGS.gemini.defaultModel,
      claude: PROVIDER_CONFIGS.claude.defaultModel,
    },
  };
}

export function getSettings(): LlmSettings {
  if (typeof window === "undefined") {
    return getDefaultSettings();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSettings();
    const parsed = JSON.parse(raw);
    
    // Ensure all providers are present
    const settings: LlmSettings = {
      provider: parsed.provider || DEFAULT_PROVIDER,
      apiKeys: {
        groq: parsed.apiKeys?.groq || "",
        openai: parsed.apiKeys?.openai || "",
        gemini: parsed.apiKeys?.gemini || "",
        claude: parsed.apiKeys?.claude || "",
      },
      models: {
        groq: parsed.models?.groq || PROVIDER_CONFIGS.groq.defaultModel,
        openai: parsed.models?.openai || PROVIDER_CONFIGS.openai.defaultModel,
        gemini: parsed.models?.gemini || PROVIDER_CONFIGS.gemini.defaultModel,
        claude: parsed.models?.claude || PROVIDER_CONFIGS.claude.defaultModel,
      },
    };
    return settings;
  } catch {
    return getDefaultSettings();
  }
}

export function saveSettings(settings: LlmSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function clearSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function clearProviderSettings(provider: LlmProvider): void {
  const settings = getSettings();
  settings.apiKeys[provider] = "";
  saveSettings(settings);
}

export function hasApiKey(provider?: LlmProvider): boolean {
  const settings = getSettings();
  if (provider) {
    return !!settings.apiKeys[provider];
  }
  return !!settings.apiKeys[settings.provider];
}

export function getProviderConfig(provider: LlmProvider): ProviderConfig {
  return PROVIDER_CONFIGS[provider];
}
