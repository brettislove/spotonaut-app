"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface AnalyticsBarChartProps {
  data: DataPoint[];
  bars: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  title?: string;
}

export default function AnalyticsBarChart({
  data,
  bars,
  title,
}: AnalyticsBarChartProps) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
      {title && <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
          <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "0.5rem",
              color: "#f1f5f9",
            }}
            labelStyle={{ color: "#cbd5e1" }}
          />
          <Legend
            wrapperStyle={{ color: "#94a3b8" }}
            iconType="rect"
            iconSize={12}
          />
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
