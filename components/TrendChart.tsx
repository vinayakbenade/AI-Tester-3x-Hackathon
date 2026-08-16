import type { TrendSummary } from "@/lib/types";

interface Props {
  trend: TrendSummary;
}

export default function TrendChart({ trend }: Props) {
  const maxCategoryCount = Math.max(...(trend.byCategory || []).map((c) => c.count), 1);
  const maxComponentCount = Math.max(...(trend.byComponent || []).map((c) => c.count), 1);

  return (
    <div className="rounded-lg bg-base-900 border border-base-700 p-4 space-y-6">
      {/* Category Trends */}
      <div>
        <div className="text-xs text-primary-muted mb-3 font-semibold">Trend — Category Distribution</div>
        <div className="space-y-2">
          {trend.byCategory.map((item) => (
            <div key={item.categoryTag} className="flex items-center gap-3">
              <span className="font-mono text-xs text-primary-secondary w-40 truncate">
                {item.categoryTag}
              </span>
              <div className="flex-1 bg-base-800 rounded h-5 overflow-hidden">
                <div
                  className="h-full bg-accent rounded transition-all"
                  style={{ width: `${(item.count / maxCategoryCount) * 100}%` }}
                />
              </div>
              <span className="font-mono text-xs text-primary-muted w-6 text-right">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Component Trends */}
      {trend.byComponent.length > 0 && (
        <div>
          <div className="text-xs text-primary-muted mb-3 font-semibold">Affected Components</div>
          <div className="space-y-2">
            {trend.byComponent.map((item) => (
              <div key={item.component} className="flex items-center gap-3">
                <span className="font-mono text-xs text-primary-secondary w-40 truncate">
                  {item.component}
                </span>
                <div className="flex-1 bg-base-800 rounded h-5 overflow-hidden">
                  <div
                    className="h-full bg-severity-medium rounded transition-all"
                    style={{ width: `${(item.count / maxComponentCount) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-primary-muted w-6 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date buckets with categories */}
      {trend.byDateBucket.length > 0 && (
        <div>
          <div className="text-xs text-primary-muted mb-2 font-semibold">
            Category Timeline
          </div>
          <div className="space-y-1">
            {trend.byDateBucket.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-xs font-mono text-primary-secondary"
              >
                <span className="w-24 text-primary-muted">{item.date}</span>
                <span className="w-40 truncate">{item.categoryTag}</span>
                <span className="text-primary-muted">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date buckets with components */}
      {trend.byDateComponent.length > 0 && (
        <div>
          <div className="text-xs text-primary-muted mb-2 font-semibold">
            Component Timeline
          </div>
          <div className="space-y-1">
            {trend.byDateComponent.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-xs font-mono text-primary-secondary"
              >
                <span className="w-24 text-primary-muted">{item.date}</span>
                <span className="w-40 truncate">{item.component}</span>
                <span className="text-primary-muted">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
