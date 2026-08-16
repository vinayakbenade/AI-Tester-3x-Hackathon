"use client";

export type ViewName = "log-details" | "compare" | "trend-graphs" | "batch-mode" | "diagnostic-steps" | "settings";

interface Props {
  activeView: ViewName;
  onViewChange: (view: ViewName) => void;
  hasResults: boolean;
}

const NAV_ITEMS: { id: ViewName; label: string; icon: string; requiresData?: boolean }[] = [
  { id: "log-details", label: "Log Details", icon: "📋" },
  { id: "compare", label: "Compare Logs", icon: "⬄" },
  { id: "batch-mode", label: "Batch Mode", icon: "☰" },
  { id: "trend-graphs", label: "Trend Graphs", icon: "📊", requiresData: true },
  { id: "diagnostic-steps", label: "Diagnostic Steps", icon: "🔍", requiresData: true },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export default function Sidebar({ activeView, onViewChange, hasResults }: Props) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo / brand */}
      <div className="px-5 py-5 border-b border-base-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛩</span>
          <span className="text-sm font-bold text-primary">LogPilot</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-primary-muted">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          const isDisabled = item.requiresData && !hasResults;
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onViewChange(item.id)}
              disabled={isDisabled}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left ${
                isActive
                  ? "bg-accent text-white font-medium"
                  : isDisabled
                    ? "text-primary-muted opacity-50 cursor-not-allowed"
                    : "text-primary-secondary hover:bg-base-800 hover:text-primary"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-base-700 text-xs text-primary-muted">
        AI-powered triage
      </div>
    </div>
  );
}
