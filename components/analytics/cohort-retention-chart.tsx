"use client";

interface CohortData {
  cohortMonth: string;
  cohortSize: number;
  retentionRates: number[]; // Array of retention rates for each month after cohort creation
}

interface CohortRetentionChartProps {
  cohorts: CohortData[];
  title?: string;
}

export default function CohortRetentionChart({
  cohorts,
  title,
}: CohortRetentionChartProps) {
  const maxMonths = Math.max(...cohorts.map((c) => c.retentionRates.length));

  const getColorForRate = (rate: number) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-green-400";
    if (rate >= 40) return "bg-yellow-400";
    if (rate >= 20) return "bg-orange-400";
    if (rate > 0) return "bg-red-400";
    return "bg-slate-700";
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
      {title && <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>}

      {/* Cohort Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-slate-400 text-sm font-medium p-3 border-b border-slate-800">
                Cohort
              </th>
              <th className="text-right text-slate-400 text-sm font-medium p-3 border-b border-slate-800">
                Velikost
              </th>
              {Array.from({ length: maxMonths }).map((_, i) => (
                <th
                  key={i}
                  className="text-center text-slate-400 text-sm font-medium p-3 border-b border-slate-800"
                >
                  M{i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cohorts.map((cohort) => (
              <tr
                key={cohort.cohortMonth}
                className="border-b border-slate-800/50"
              >
                <td className="text-white text-sm p-3">{cohort.cohortMonth}</td>
                <td className="text-white text-sm text-right p-3">
                  {cohort.cohortSize}
                </td>
                {Array.from({ length: maxMonths }).map((_, i) => {
                  const rate = cohort.retentionRates[i];
                  return (
                    <td key={i} className="p-1">
                      {rate !== undefined ? (
                        <div
                          className={`${getColorForRate(
                            rate
                          )} rounded p-2 text-center text-xs font-semibold text-white`}
                          title={`${rate.toFixed(1)}%`}
                        >
                          {rate.toFixed(0)}%
                        </div>
                      ) : (
                        <div className="bg-slate-700/30 rounded p-2 text-center text-xs text-slate-600">
                          -
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-xs">
        <span className="text-slate-400">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="bg-green-500 w-4 h-4 rounded" />
          <span className="text-slate-400">80%+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-400 w-4 h-4 rounded" />
          <span className="text-slate-400">60-80%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 w-4 h-4 rounded" />
          <span className="text-slate-400">40-60%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-orange-400 w-4 h-4 rounded" />
          <span className="text-slate-400">20-40%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-400 w-4 h-4 rounded" />
          <span className="text-slate-400">&lt;20%</span>
        </div>
      </div>
    </div>
  );
}
