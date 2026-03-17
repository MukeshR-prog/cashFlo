"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  Flame,
  Gauge,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { CashFlowDay, Invoice, AnomalyAlert } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type DashboardMetrics = {
  totalCash: number;
  monthlyBurn: number;
  predictedRunwayMonths: number;
  uncollectedAR: number;
  runwayZeroDate: string;
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

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [cashflow, setCashflow] = useState<CashFlowDay[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const [m, c, i, a] = await Promise.all([
          getDashboardData<DashboardMetrics>(user.id, "metrics"),
          getDashboardData<CashFlowDay[]>(user.id, "cashflow"),
          getDashboardData<Invoice[]>(user.id, "invoices"),
          getDashboardData<AnomalyAlert[]>(user.id, "alerts"),
        ]);
        setMetrics(m);
        setCashflow(c);
        setInvoices(i);
        setAlerts(a);
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [user]);

  const derived = useMemo(() => {
    const inflowTotal = cashflow.reduce((sum, row) => sum + row.inflow, 0);
    const outflowTotal = cashflow.reduce((sum, row) => sum + row.outflow, 0);
    const overdue = invoices.filter((inv) => inv.status === "overdue");
    const pending = invoices.filter((inv) => inv.status === "pending");

    const collectionsData = [
      { label: "Overdue", value: overdue.reduce((sum, inv) => sum + inv.amount, 0) },
      { label: "Pending", value: pending.reduce((sum, inv) => sum + inv.amount, 0) },
      { label: "Paid", value: invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0) },
    ];

    const netCash = inflowTotal - outflowTotal;
    const runwayHealth = metrics ? Math.min((metrics.predictedRunwayMonths / 12) * 100, 100) : 0;

    return {
      inflowTotal,
      outflowTotal,
      netCash,
      collectionsData,
      overdueCount: overdue.length,
      alertCount: alerts.length,
      runwayHealth,
    };
  }, [cashflow, invoices, alerts, metrics]);

  if (loading || isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-border/70 bg-[linear-gradient(120deg,color-mix(in_oklch,var(--chart-1)_16%,transparent)_0%,transparent_55%),linear-gradient(180deg,var(--card)_0%,color-mix(in_oklch,var(--card)_90%,var(--chart-2))_100%)]">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Financial Decision Support System</p>
              <h2 className="mt-1 text-2xl font-bold">Founder Command Center</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Real-time visibility across runway, cash flow, receivables, and financial risk.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => router.push("/dashboard/planning")}>
                Scenario Simulator
              </Button>
              <Button onClick={() => router.push("/dashboard/copilot")}>
                Ask AI Assistant
                <Sparkles size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Cash Balance"
          value={`$${metrics.totalCash.toLocaleString()}`}
          detail="Live treasury snapshot"
          icon={CircleDollarSign}
          trend="+4.2% this month"
        />
        <KpiCard
          title="Monthly Burn"
          value={`$${metrics.monthlyBurn.toLocaleString()}`}
          detail="Operating spend pace"
          icon={Flame}
          trend="-2.1% vs last month"
        />
        <KpiCard
          title="Runway"
          value={`${metrics.predictedRunwayMonths} months`}
          detail={`Zero-cash date: ${metrics.runwayZeroDate}`}
          icon={Gauge}
          trend="Needs action before Q4"
        />
        <KpiCard
          title="Open Risk Alerts"
          value={`${derived.alertCount}`}
          detail={`${derived.overdueCount} overdue invoice issues`}
          icon={AlertTriangle}
          trend="2 critical"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Track liquidity, collections, and risk signals from one place.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cashflow">
              <TabsList>
                <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                <TabsTrigger value="collections">Collections</TabsTrigger>
                <TabsTrigger value="risk">Risk Feed</TabsTrigger>
              </TabsList>

              <TabsContent value="cashflow">
                <ChartContainer
                  className="h-[280px] w-full"
                  config={{
                    inflow: { label: "Inflow", color: "var(--chart-2)" },
                    outflow: { label: "Outflow", color: "var(--chart-4)" },
                  }}
                >
                  <BarChart data={cashflow}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                    <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => `$${v.toLocaleString()}`} />} />
                    <Bar dataKey="inflow" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outflow" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="collections">
                <div className="grid gap-4 lg:grid-cols-2">
                  <ChartContainer
                    className="h-[260px] w-full"
                    config={{
                      value: { label: "Amount", color: "var(--chart-1)" },
                    }}
                  >
                    <PieChart>
                      <Pie data={derived.collectionsData} dataKey="value" nameKey="label" outerRadius={88}>
                        {derived.collectionsData.map((entry) => (
                          <Cell
                            key={entry.label}
                            fill={pieColors[derived.collectionsData.findIndex((item) => item.label === entry.label) % pieColors.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => `$${v.toLocaleString()}`} />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="space-y-2">
                    {derived.collectionsData.map((row) => (
                      <div key={row.label} className="rounded-lg border border-border bg-muted/35 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{row.label}</p>
                          <p className="text-sm font-semibold">${row.value.toLocaleString()}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Receivables status bucket</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="risk">
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="rounded-lg border border-border bg-muted/35 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.description}</p>
                        </div>
                        <Badge variant="outline" className="uppercase">
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Runway Confidence</CardTitle>
            <CardDescription>How healthy your cash position is against a 12-month target.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Runway health</span>
                <span className="font-semibold">{derived.runwayHealth.toFixed(0)}%</span>
              </div>
              <Progress value={derived.runwayHealth} />
            </div>

            <ChartContainer
              className="h-[220px] w-full"
              config={{
                endingBalance: { label: "Ending Balance", color: "var(--chart-1)" },
              }}
            >
              <AreaChart data={cashflow}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => `$${v.toLocaleString()}`} />} />
                <Area type="monotone" dataKey="endingBalance" fill="var(--chart-1)" fillOpacity={0.25} stroke="var(--chart-1)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>

            <div className="rounded-lg border border-border bg-muted/35 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">AI recommendation</p>
              <p className="mt-1 text-sm">
                Prioritize overdue collections and delay discretionary hiring by one month to extend runway by approximately 1.1 months.
              </p>
              <Button className="mt-3 w-full" variant="secondary" onClick={() => router.push("/dashboard/planning")}>
                Open What-If Modeling
                <ArrowUpRight size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Bot size={18} />
            Founder-Friendly Insight Feed
          </CardTitle>
          <CardDescription>Jargon-free summaries explaining what changed and what to do next.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <InsightCard
            title="Cash Flow"
            text="This month, money is leaving faster than it is coming in. Keep a close eye on payroll week and large vendor payouts."
          />
          <InsightCard
            title="Collections"
            text="Two customers are paying late. Recovering these invoices quickly can materially reduce short-term runway risk."
          />
          <InsightCard
            title="Planning"
            text="If hiring increases now, your runway drops below comfort levels. Simulate a phased hiring plan before committing."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  title,
  value,
  detail,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ size?: number }>;
  trend: string;
}) {
  return (
    <Card className="border-border/70 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="rounded-md bg-primary/12 p-1.5 text-primary">
            <Icon size={14} />
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        <p className="mt-2 text-xs font-medium text-primary">{trend}</p>
      </CardContent>
    </Card>
  );
}

function InsightCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/35 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
