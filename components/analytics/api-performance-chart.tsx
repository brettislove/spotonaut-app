"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PerformanceData {
  date: string;
  avgResponseTime: number;
  errorRate: number;
  totalRequests: number;
}

interface ApiPerformanceChartProps {
  data: PerformanceData[];
  title?: string;
}

export default function ApiPerformanceChart({
  data,
  title,
}: ApiPerformanceChartProps) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
      {title && <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8" }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis
            yAxisId="left"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8" }}
            label={{
              value: "Response Time (ms)",
              angle: -90,
              position: "insideLeft",
              fill: "#94a3b8",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8" }}
            label={{
              value: "Error Rate (%)",
              angle: 90,
              position: "insideRight",
              fill: "#94a3b8",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "0.5rem",
              color: "#f1f5f9",
            }}
            labelStyle={{ color: "#cbd5e1" }}
            formatter={(value: number | undefined, name?: string) => {
              if (!value) return ["0", name || ""];
              if (name === "Error Rate") {
                return [`${value.toFixed(2)}%`, name];
              }
              if (name === "Avg Response Time") {
                return [`${value.toFixed(0)} ms`, name];
              }
              return [value, name || ""];
            }}
          />
          <Legend
            wrapperStyle={{ color: "#94a3b8" }}
            iconType="line"
            iconSize={16}
          />
          <Bar
            yAxisId="left"
            dataKey="totalRequests"
            name="Total Requests"
            fill="#3b82f6"
            opacity={0.3}
            radius={[8, 8, 0, 0]}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgResponseTime"
            name="Avg Response Time"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="errorRate"
            name="Error Rate"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Performance Alerts */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.length > 0 && (
          <>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Průměrná odezva</div>
              <div
                className={`text-lg font-bold ${
                  (data[data.length - 1]?.avgResponseTime || 0) > 2000
                    ? "text-red-400"
                    : (data[data.length - 1]?.avgResponseTime || 0) > 1000
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {data[data.length - 1]?.avgResponseTime.toFixed(0)} ms
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">Error Rate</div>
              <div
                className={`text-lg font-bold ${
                  (data[data.length - 1]?.errorRate || 0) > 5
                    ? "text-red-400"
                    : (data[data.length - 1]?.errorRate || 0) > 2
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {data[data.length - 1]?.errorRate.toFixed(2)}%
              </div>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-400 mb-1">
                Celkové požadavky
              </div>
              <div className="text-lg font-bold text-white">
                {data[data.length - 1]?.totalRequests.toLocaleString()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
