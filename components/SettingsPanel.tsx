"use client";

import { useState, useEffect } from "react";
import {
  getSettings,
  saveSettings,
  clearProviderSettings,
  PROVIDER_CONFIGS,
  type LlmSettings,
  type LlmProvider,
} from "@/lib/settings";

export default function SettingsPanel() {
  const [settings, setSettings] = useState<LlmSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState<LlmProvider | null>(null);

  useEffect(() => {
    const loaded = getSettings();
    setSettings(loaded);
    setExpandedProvider(loaded.provider);
  }, []);

  if (!settings) return <div>Loading...</div>;

  const handleProviderChange = (provider: LlmProvider) => {
    setSettings((prev) => prev ? { ...prev, provider } : null);
    setExpandedProvider(provider);
  };

  const handleApiKeyChange = (provider: LlmProvider, value: string) => {
    setSettings((prev) =>
      prev
        ? { ...prev, apiKeys: { ...prev.apiKeys, [provider]: value } }
        : null
    );
  };

  const handleModelChange = (provider: LlmProvider, value: string) => {
    setSettings((prev) =>
      prev
        ? { ...prev, models: { ...prev.models, [provider]: value } }
        : null
    );
  };

  const handleSave = () => {
    if (settings) {
      saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleClearProvider = (provider: LlmProvider) => {
    clearProviderSettings(provider);
    setSettings((prev) =>
      prev
        ? { ...prev, apiKeys: { ...prev.apiKeys, [provider]: "" } }
        : null
    );
  };

  const currentProvider = PROVIDER_CONFIGS[settings.provider];
  const currentApiKey = settings.apiKeys[settings.provider];
  const currentModel = settings.models[settings.provider];
  const hasCurrentKey = !!currentApiKey;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-primary mb-1">LLM API Settings</h2>
        <p className="text-sm text-primary-muted">
          Configure your API keys to run triage with your preferred LLM provider. Keys are stored
          locally in your browser and never sent anywhere except to the selected API provider.
        </p>
      </div>

      {/* Provider Selector */}
      <div className="rounded-lg border border-base-700 bg-base-900 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-primary">Select Provider</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.values(PROVIDER_CONFIGS) as typeof PROVIDER_CONFIGS[keyof typeof PROVIDER_CONFIGS][]).map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleProviderChange(provider.id as LlmProvider)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                settings.provider === provider.id
                  ? "border-accent bg-accent/10"
                  : "border-base-700 bg-base-950 hover:border-base-600"
              }`}
            >
              <div className="font-medium text-primary">{provider.name}</div>
              <div className="text-xs text-primary-muted mt-1">{provider.description}</div>
              {settings.apiKeys[provider.id as LlmProvider] && (
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-severity-low">
                  ✓ Configured
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Current Provider Configuration */}
      <div className="rounded-lg border border-base-700 bg-base-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary">{currentProvider.name} Configuration</h3>
          <span className="text-xs text-primary-muted">
            {hasCurrentKey ? "✓ Key set" : "No key set"}
          </span>
        </div>

        {/* API Key Input */}
        <div>
          <label className="block text-sm font-medium text-primary-secondary mb-2">
            {currentProvider.name} API Key
          </label>
          <input
            type="password"
            className="w-full rounded-lg bg-base-950 px-3 py-2 text-sm text-primary border border-base-700 focus:border-accent focus:outline-none font-mono"
            placeholder={currentProvider.keyPlaceholder}
            value={currentApiKey}
            onChange={(e) => handleApiKeyChange(settings.provider, e.target.value)}
          />
          <p className="text-xs text-primary-muted mt-2">
            Get your free API key at{" "}
            <a
              href={currentProvider.keysUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 underline"
            >
              {currentProvider.keysUrl.replace("https://", "")}
            </a>
            {" "}or read the{" "}
            <a
              href={currentProvider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 underline"
            >
              documentation
            </a>
            .
          </p>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-primary-secondary mb-2">
            Model
          </label>
          <select
            className="w-full rounded-lg bg-base-950 px-3 py-2 text-sm text-primary border border-base-700 focus:border-accent focus:outline-none"
            value={currentModel}
            onChange={(e) => handleModelChange(settings.provider, e.target.value)}
          >
            {currentProvider.models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-primary-muted mt-1">
            Models available for {currentProvider.name}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80 transition-colors"
            onClick={handleSave}
          >
            Save Settings
          </button>
          {hasCurrentKey && (
            <button
              className="rounded-lg border border-severity-critical/50 px-4 py-2 text-sm text-severity-critical hover:bg-severity-critical/10 transition-colors"
              onClick={() => handleClearProvider(settings.provider)}
            >
              Clear Key
            </button>
          )}
          {saved && (
            <span className="text-sm text-severity-low animate-pulse">✓ Saved!</span>
          )}
        </div>
      </div>

      {/* Other Providers Summary */}
      <div className="rounded-lg border border-base-700 bg-base-900 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-primary">Other Providers</h3>
        <div className="space-y-2">
          {(Object.values(PROVIDER_CONFIGS) as typeof PROVIDER_CONFIGS[keyof typeof PROVIDER_CONFIGS][]).map((provider) => {
            if (provider.id === settings.provider) return null;
            const hasKey = !!settings.apiKeys[provider.id as LlmProvider];
            return (
              <div key={provider.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-primary">{provider.name}</span>
                  <span className="text-primary-muted ml-2">
                    {hasKey ? "✓ Key configured" : "No key set"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="rounded-lg border border-base-700 bg-base-900 p-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              hasCurrentKey ? "bg-severity-low" : "bg-severity-critical"
            }`}
          />
          <span className="text-sm text-primary-secondary">
            {hasCurrentKey
              ? `${currentProvider.name} API key configured`
              : `No ${currentProvider.name} API key set`}
          </span>
        </div>
        <p className="text-xs text-primary-muted mt-2">
          {hasCurrentKey
            ? `Your ${currentProvider.name} key will be used for all triage requests from this browser. It's never stored on any server.`
            : `Without an API key, triage will not work. Set your ${currentProvider.name} key above or switch to another provider.`}
        </p>
      </div>
    </div>
  );
}
