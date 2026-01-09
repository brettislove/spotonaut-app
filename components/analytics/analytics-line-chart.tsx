"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

interface AnalyticsLineChartProps {
  data: DataPoint[];
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  title?: string;
}

export default function AnalyticsLineChart({
  data,
  lines,
  title,
}: AnalyticsLineChartProps) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
      {title && <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8" }}
            tickFormatter={(value) => {
              // Format date to show only day and month
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
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
            iconType="line"
            iconSize={16}
          />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ fill: line.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
