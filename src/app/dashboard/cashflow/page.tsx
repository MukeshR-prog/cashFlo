"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CashFlowDay } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CalendarClock, TrendingDown, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type DashboardMetrics = {
  totalCash: number;
};

async function getDashboardData<T>(userId: string, type: string): Promise<T> {
  const response = await fetch(
    `/api/dashboard-data?userId=${encodeURIComponent(userId)}&type=${encodeURIComponent(type)}`,
    { cache: "no-store" }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load dashboard data");
  }

  return payload.data as T;
}

export default function CashflowPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CashFlowDay[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const [cashRows, m] = await Promise.all([
          getDashboardData<CashFlowDay[]>(user.id, "cashflow"),
          getDashboardData<DashboardMetrics>(user.id, "metrics"),
        ]);
        setRows(cashRows as CashFlowDay[]);
        setMetrics(m as DashboardMetrics);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const overview = useMemo(() => {
    const totalInflow = rows.reduce((sum, row) => sum + (row.inflow || 0), 0);
    const totalOutflow = rows.reduce((sum, row) => sum + (row.outflow || 0), 0);
    const minBalance = rows.reduce((min, row) => Math.min(min, row.endingBalance || 0), Number.POSITIVE_INFINITY);
    const criticalWeeks = rows.filter((row) => row.hasCriticalEvent || row.endingBalance < 600000).length;

    return {
      totalInflow,
      totalOutflow,
      minBalance: Number.isFinite(minBalance) ? minBalance : 0,
      criticalWeeks,
    };
  }, [rows]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-2xl font-display font-bold">Rolling 13-Week Cash Flow</h2>
        <p className="text-sm text-muted-foreground">Plan around payroll, tax, and vendor obligations before liquidity stress appears.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Opening Cash" value={`$${metrics?.totalCash?.toLocaleString() || 0}`} detail="Real-time treasury snapshot" icon={<Wallet className="text-emerald-400" size={18} />} />
        <SummaryCard title="Forecast Inflow" value={`$${overview.totalInflow.toLocaleString()}`} detail="Expected receipts this cycle" icon={<TrendingDown className="text-blue-400" size={18} />} />
        <SummaryCard title="Forecast Outflow" value={`$${overview.totalOutflow.toLocaleString()}`} detail="Non-negotiable obligations" icon={<CalendarClock className="text-red-400" size={18} />} />
        <SummaryCard title="Critical Weeks" value={`${overview.criticalWeeks}`} detail={`Min balance $${overview.minBalance.toLocaleString()}`} icon={<AlertTriangle className="text-amber-400" size={18} />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inflow vs Outflow</CardTitle>
          <CardDescription>Weekly mismatch highlights timing risk, not just total profitability.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[290px] w-full"
            config={{
              inflow: { label: "Inflow", color: "var(--chart-2)" },
              outflow: { label: "Outflow", color: "var(--chart-4)" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(value) => `$${value.toLocaleString()}`} />} />
                <Bar dataKey="inflow" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Liquidity Risk Signal</span>
              <span>{Math.min(overview.criticalWeeks * 12, 100)}%</span>
            </div>
            <Progress value={Math.min(overview.criticalWeeks * 12, 100)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liquidity Grid</CardTitle>
          <CardDescription>Use this view for daily treasury standups and escalation workflows.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Week</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3 text-chart-2">Inflow</th>
                  <th className="px-4 py-3 text-chart-4">Outflow</th>
                  <th className="px-4 py-3">End</th>
                  <th className="px-4 py-3">Event</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className={`border-b border-border ${row.endingBalance < 600000 ? "bg-red-500/10" : "hover:bg-muted/30"}`}>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3 text-muted-foreground">${row.startingBalance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-chart-2">{row.inflow ? `+$${row.inflow.toLocaleString()}` : "-"}</td>
                    <td className="px-4 py-3 text-chart-4">-${row.outflow.toLocaleString()}</td>
                    <td className={`px-4 py-3 font-semibold ${row.endingBalance < 600000 ? "text-red-500" : ""}`}>${row.endingBalance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.criticalEventName || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, detail, icon }: { title: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="p-2 rounded-md bg-muted/40 border border-border">{icon}</div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{detail}</p>
      </CardContent>
    </Card>
  );
}
