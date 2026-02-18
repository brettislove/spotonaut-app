"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Users,
  MousePointerClick,
  TrendingUp,
  Globe,
  QrCode,
  Loader2,
} from "lucide-react";

// --- Types ---

interface TrafficData {
  summary: {
    totalVisits: number;
    totalUtmVisits: number;
    totalRegistrations: number;
    totalUtmRegistrations: number;
    uniqueSessions: number;
    days: number;
  };
  visitsByCampaign: { campaign: string; visits: number }[];
  visitsBySource: { source: string; visits: number }[];
  visitsByMedium: { medium: string; visits: number }[];
  registrationsBySource: { source: string; registrations: number }[];
  dailyTrend: { date: string; total: number; withUtm: number }[];
  funnelData: {
    campaign: string;
    visits: number;
    registrations: number;
    conversionRate: number;
  }[];
}

// --- Color palette ---

const COLORS = [
  "hsl(262, 83%, 58%)", // purple (primary)
  "hsl(199, 89%, 48%)", // blue
  "hsl(142, 71%, 45%)", // green
  "hsl(38, 92%, 50%)", // amber
  "hsl(346, 77%, 49%)", // rose
  "hsl(172, 66%, 50%)", // teal
  "hsl(280, 65%, 60%)", // violet
  "hsl(24, 85%, 55%)", // orange
];

// --- Source icon helper ---

function getSourceIcon(source: string) {
  const s = source.toLowerCase();
  if (s.includes("qr")) return <QrCode className="w-4 h-4" />;
  if (s.includes("google")) return <Globe className="w-4 h-4" />;
  if (s.includes("instagram") || s.includes("social"))
    return <MousePointerClick className="w-4 h-4" />;
  return <TrendingUp className="w-4 h-4" />;
}

// --- Main Component ---

export default function TrafficDashboard() {
  const [data, setData] = React.useState<TrafficData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [days, setDays] = React.useState("30");

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/traffic?days=${days}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-20">
        Nepodařilo se načíst data.
      </div>
    );
  }

  const { summary } = data;

  // --- Chart configs ---
  const dailyChartConfig: ChartConfig = {
    total: { label: "Celkem návštěv", color: "hsl(262, 83%, 58%)" },
    withUtm: { label: "S UTM parametry", color: "hsl(142, 71%, 45%)" },
  };

  const campaignChartConfig: ChartConfig = data.visitsByCampaign.reduce(
    (acc, item, i) => {
      acc[item.campaign] = {
        label: item.campaign,
        color: COLORS[i % COLORS.length],
      };
      return acc;
    },
    {} as ChartConfig,
  );

  const sourceChartConfig: ChartConfig = data.visitsBySource.reduce(
    (acc, item, i) => {
      acc[item.source] = {
        label: item.source,
        color: COLORS[i % COLORS.length],
      };
      return acc;
    },
    {} as ChartConfig,
  );

  const mediumChartConfig: ChartConfig = data.visitsByMedium.reduce(
    (acc, item, i) => {
      acc[item.medium] = {
        label: item.medium,
        color: COLORS[i % COLORS.length],
      };
      return acc;
    },
    {} as ChartConfig,
  );

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">UTM Traffic & Kampaně</h2>
          <p className="text-sm text-muted-foreground">
            Přehled návštěvnosti a konverzí dle zdroje
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Posledních 7 dní</SelectItem>
            <SelectItem value="14">Posledních 14 dní</SelectItem>
            <SelectItem value="30">Posledních 30 dní</SelectItem>
            <SelectItem value="90">Posledních 90 dní</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Celkem návštěv
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.totalVisits.toLocaleString("cs-CZ")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.uniqueSessions.toLocaleString("cs-CZ")} unikátních
              sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Návštěvy s UTM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.totalUtmVisits.toLocaleString("cs-CZ")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalVisits > 0
                ? Math.round(
                    (summary.totalUtmVisits / summary.totalVisits) * 100,
                  )
                : 0}
              % všech návštěv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Registrace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.totalRegistrations.toLocaleString("cs-CZ")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              za posledních {summary.days} dní
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              UTM registrace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.totalUtmRegistrations.toLocaleString("cs-CZ")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalRegistrations > 0
                ? Math.round(
                    (summary.totalUtmRegistrations /
                      summary.totalRegistrations) *
                      100,
                  )
                : 0}
              % registrací atribuováno
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily visits trend - Area chart */}
      <Card>
        <CardHeader>
          <CardTitle>Denní návštěvnost</CardTitle>
          <CardDescription>
            Trend celkových návštěv vs. návštěv s UTM parametry
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.dailyTrend.length > 0 ? (
            <ChartContainer
              config={dailyChartConfig}
              className="h-[300px] w-full"
            >
              <AreaChart data={data.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getDate()}.${d.getMonth() + 1}.`;
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(val) => {
                        const d = new Date(val);
                        return d.toLocaleDateString("cs-CZ");
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-total)"
                  fill="var(--color-total)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="withUtm"
                  stroke="var(--color-withUtm)"
                  fill="var(--color-withUtm)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>

      {/* Two-column: Campaign bar chart + Source pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits by campaign - Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Návštěvy dle kampaně</CardTitle>
            <CardDescription>
              Top kampaně podle počtu návštěv s UTM
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.visitsByCampaign.length > 0 ? (
              <ChartContainer
                config={campaignChartConfig}
                className="h-[300px] w-full"
              >
                <BarChart
                  data={data.visitsByCampaign}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="campaign"
                    tick={{ fontSize: 11 }}
                    width={140}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="visits" radius={[0, 4, 4, 0]}>
                    {data.visitsByCampaign.map((entry, i) => (
                      <Cell
                        key={entry.campaign}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                    <LabelList
                      dataKey="visits"
                      position="right"
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>

        {/* Visits by source - Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Zdroje návštěv</CardTitle>
            <CardDescription>Rozložení dle utm_source</CardDescription>
          </CardHeader>
          <CardContent>
            {data.visitsBySource.length > 0 ? (
              <ChartContainer
                config={sourceChartConfig}
                className="h-[300px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="source" />}
                  />
                  <Pie
                    data={data.visitsBySource}
                    dataKey="visits"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {data.visitsBySource.map((entry, i) => (
                      <Cell
                        key={entry.source}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                    <LabelList
                      dataKey="source"
                      position="outside"
                      className="fill-foreground"
                      fontSize={11}
                    />
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="source" />}
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <EmptyState />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medium distribution - horizontal bar */}
      <Card>
        <CardHeader>
          <CardTitle>Rozdělení dle média</CardTitle>
          <CardDescription>
            Typ kanálu (social, print, cpc, organic...)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.visitsByMedium.length > 0 ? (
            <ChartContainer
              config={mediumChartConfig}
              className="h-[200px] w-full"
            >
              <BarChart data={data.visitsByMedium}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="medium" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="visits" radius={[4, 4, 0, 0]}>
                  {data.visitsByMedium.map((entry, i) => (
                    <Cell key={entry.medium} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>

      {/* Conversion funnel table */}
      <Card>
        <CardHeader>
          <CardTitle>Konverzní trychtýř dle kampaně</CardTitle>
          <CardDescription>
            Porovnání návštěv → registrací a konverzních poměrů pro každou
            kampaň
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.funnelData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kampaň</TableHead>
                  <TableHead className="text-right">Návštěvy</TableHead>
                  <TableHead className="text-right">Registrace</TableHead>
                  <TableHead className="text-right">Konverze</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.funnelData.map((row) => (
                  <TableRow key={row.campaign}>
                    <TableCell className="font-medium">
                      {row.campaign}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.visits.toLocaleString("cs-CZ")}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.registrations.toLocaleString("cs-CZ")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          row.conversionRate >= 5
                            ? "default"
                            : row.conversionRate > 0
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {row.conversionRate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>

      {/* Registrations by source breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Registrace dle zdroje</CardTitle>
          <CardDescription>
            Odkud se registrovaní uživatelé k vám dostali
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.registrationsBySource.length > 0 ? (
            <div className="space-y-3">
              {data.registrationsBySource.map((item) => {
                const maxRegs = Math.max(
                  ...data.registrationsBySource.map((r) => r.registrations),
                );
                const pct =
                  maxRegs > 0
                    ? Math.round((item.registrations / maxRegs) * 100)
                    : 0;
                return (
                  <div key={item.source} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(item.source)}
                        <span className="font-medium">{item.source}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {item.registrations} registrací
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
      Žádná data pro vybrané období
    </div>
  );
}
