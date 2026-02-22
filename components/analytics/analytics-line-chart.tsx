"use client";

import { XAxis, CartesianGrid, AreaChart, Area } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { ChartConfig } from "../ui/chart";

interface LineChartDataItem {
  date: string;
  totalAnalyses: number;
  anonymousAnalyses: number;
  registeredAnalyses: number;
  uniqueVisitors: number;
}

interface AnalyticsLineChartProps {
  chartConfig: ChartConfig;
  lineChartData: LineChartDataItem[];
}

export default function AnalyticsLineChart({
  chartConfig,
  lineChartData,
}: AnalyticsLineChartProps) {
  console.log("Rendering AnalyticsLineChart with data:", lineChartData);
  const [timeRange, setTimeRange] = useState("90d");
  const filteredData = lineChartData.filter((item: LineChartDataItem) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    console.log(
      `Filtering data for time range: ${timeRange}, startDate: ${startDate.toISOString()}, item date: ${date.toISOString()}, isIncluded: ${date >= startDate}`,
    );
    return date >= startDate;
  });
  console.log("Filtered data for chart:", filteredData);
  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Analýzy</CardTitle>
          <CardDescription>Počet analýz a návštěvníků v čase.</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Poslední 3 měsíce
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Posledních 30 dní
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Posledních 7 dní
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient
                id="fillTotalAnalyses"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillAnonymousAnalyses"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillRegisteredAnalyses"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-3)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-3)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="fillUniqueVisitors"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--chart-4)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-4)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("cs-CZ", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("cs-CZ", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="uniqueVisitors"
              type="natural"
              fill="url(#fillUniqueVisitors)"
              stroke="var(--chart-4)"
              stackId="a"
            />
            <Area
              dataKey="registeredAnalyses"
              type="natural"
              fill="url(#fillRegisteredAnalyses)"
              stroke="var(--chart-3)"
              stackId="a"
            />
            <Area
              dataKey="anonymousAnalyses"
              type="natural"
              fill="url(#fillAnonymousAnalyses)"
              stroke="var(--chart-2)"
              stackId="a"
            />
            <Area
              dataKey="totalAnalyses"
              type="natural"
              fill="url(#fillTotalAnalyses)"
              stroke="var(--chart-1)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
