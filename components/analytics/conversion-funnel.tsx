"use client";

interface FunnelStage {
  name: string;
  value: number;
  color: string;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
  title?: string;
}

export default function ConversionFunnel({
  stages,
  title,
}: ConversionFunnelProps) {
  const maxValue = stages[0]?.value || 1;

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
      {title && <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const percentage = (stage.value / maxValue) * 100;
          const conversionRate =
            index > 0 ? (stage.value / stages[index - 1].value) * 100 : 100;

          return (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-medium">{stage.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold">
                    {stage.value.toLocaleString()}
                  </span>
                  {index > 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        conversionRate >= 50
                          ? "bg-green-500/20 text-green-400"
                          : conversionRate >= 30
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {conversionRate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-16 flex items-center justify-center">
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center justify-center"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: stage.color,
                    opacity: 0.8,
                  }}
                >
                  <span className="text-white font-semibold">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Celková konverze</span>
          <span className="text-2xl font-bold text-white">
            {(
              ((stages[stages.length - 1]?.value || 0) / maxValue) *
              100
            ).toFixed(1)}
            %
          </span>
        </div>
      </div>
    </div>
  );
}
