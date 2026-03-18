"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Repeat2, Sparkles } from "lucide-react";
import { format } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Alert { type: string; message: string; severity: "low" | "medium" | "high" }
interface RecurringExpense { title: string; occurrences: number; total: number }
interface TopCategory { category: string; total: number }

interface InsightsData {
  spendingPatterns: {
    currentMonthTotal: number;
    previousMonthTotal: number;
    monthOverMonthChangePct: number;
  };
  anomalies:    Alert[];
  alerts:       Alert[];
  recurringExpenses: RecurringExpense[];
  topCategories: TopCategory[];
}

interface TrendRow  { month: string; amount: number }
interface TrendData { trend: TrendRow[] }

interface MonthlyRow  { month: string; [key: string]: number | string }
interface MonthlyData { monthly: MonthlyRow[] }

// ── Mock Fallback ─────────────────────────────────────────────────────────────

const MOCK_INSIGHTS: InsightsData = {
  spendingPatterns: { currentMonthTotal: 18450, previousMonthTotal: 18100, monthOverMonthChangePct: 1.9 },
  anomalies: [],
  alerts: [
    { type: "category", message: "Food and Dining crossed your Chennai hostel target by ₹700", severity: "medium" },
    { type: "category", message: "Transport stable due to MTC pass renewal",                  severity: "low"    },
  ],
  recurringExpenses: [
    { title: "Guindy Hostel Mess", occurrences: 3, total: 4350 },
    { title: "Jio Fiber",          occurrences: 3, total: 2997 },
    { title: "TNEB EB Bill",       occurrences: 2, total: 2900 },
  ],
  topCategories: [
    { category: "Food & Dining", total: 5200 },
    { category: "Utilities",     total: 5100 },
    { category: "Shopping",      total: 3700 },
    { category: "Transport",     total: 2800 },
    { category: "Entertainment", total: 1650 },
  ],
};

const MOCK_TREND: TrendData = {
  trend: [
    { month: "Oct", amount: 16500 },
    { month: "Nov", amount: 17800 },
    { month: "Dec", amount: 19200 },
    { month: "Jan", amount: 17100 },
    { month: "Feb", amount: 18100 },
    { month: "Mar", amount: 18450 },
  ],
};

const MOCK_MONTHLY: MonthlyData = {
  monthly: [
    { month: "Oct", "Food & Dining": 4300, Shopping: 2800, Transport: 2400, Utilities: 4600 },
    { month: "Nov", "Food & Dining": 4500, Shopping: 3100, Transport: 2600, Utilities: 4700 },
    { month: "Dec", "Food & Dining": 5100, Shopping: 3600, Transport: 2900, Utilities: 5000 },
    { month: "Jan", "Food & Dining": 4700, Shopping: 3000, Transport: 2500, Utilities: 4300 },
    { month: "Feb", "Food & Dining": 4900, Shopping: 3200, Transport: 2600, Utilities: 4400 },
    { month: "Mar", "Food & Dining": 5200, Shopping: 3700, Transport: 2800, Utilities: 5100 },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function monthLabel(raw: string) {
  if (raw.length === 7) {
    try { return format(new Date(`${raw}-01`), "MMM"); } catch { return raw; }
  }
  return raw;
}

const severityConfig = {
  high:   { bg: "bg-destructive/10", text: "text-destructive",       icon: AlertTriangle,  border: "border-destructive/20" },
  medium: { bg: "bg-warning/10",     text: "text-amber-600 dark:text-amber-400", icon: TrendingUp,    border: "border-amber-500/20"   },
  low:    { bg: "bg-primary/5",      text: "text-primary",           icon: Sparkles,      border: "border-primary/15"     },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-foreground">₹{Number(p.value).toLocaleString("en-IN")}</p>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const { data: insights, loading: loadingI, isEmpty: emptyI } =
    useDashboardData<InsightsData>({
      url: "/api/insights",
      mockData: MOCK_INSIGHTS,
      isEmpty: (d) => !d?.spendingPatterns?.currentMonthTotal && !d?.topCategories?.length,
    });

  const { data: trendData, loading: loadingT } =
    useDashboardData<TrendData>({
      url: "/api/analytics/trends?months=6",
      mockData: MOCK_TREND,
      isEmpty: (d) => !d?.trend?.length,
    });

  const { data: monthlyData, loading: loadingM } =
    useDashboardData<MonthlyData>({
      url: "/api/analytics/monthly?months=6",
      mockData: MOCK_MONTHLY,
      isEmpty: (d) => !d?.monthly?.length,
    });

  const loading = loadingI || loadingT || loadingM;

  const trend = (trendData?.trend ?? MOCK_TREND.trend).map((r) => ({ ...r, month: monthLabel(r.month) }));
  const monthly = (monthlyData?.monthly ?? MOCK_MONTHLY.monthly).map((r) => ({ ...r, month: monthLabel(String(r.month)) }));
  const patterns  = insights?.spendingPatterns ?? MOCK_INSIGHTS.spendingPatterns;
  const allAlerts = [...(insights?.anomalies ?? []), ...(insights?.alerts ?? [])];
  const recurring = insights?.recurringExpenses ?? MOCK_INSIGHTS.recurringExpenses;

  // Cumulative area data derived from trend
  const cumulative = trend.reduce<{ month: string; cumulative: number }[]>((acc, row) => {
    const prev = acc[acc.length - 1]?.cumulative ?? 0;
    acc.push({ month: row.month, cumulative: prev + row.amount });
    return acc;
  }, []);

  const changePct = patterns.monthOverMonthChangePct;
  const isUp      = changePct >= 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Insights</h2>
          <p className="text-sm text-muted-foreground">
            {emptyI ? "Sample data — add expenses to see real insights" : "AI-powered spending analysis"}
          </p>
        </div>
        {emptyI && <span className="badge badge-neutral text-[10px]">Demo</span>}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "This Month",
            value: `₹${patterns.currentMonthTotal.toLocaleString("en-IN")}`,
            sub: "Total spent",
          },
          {
            label: "vs Last Month",
            value: `${isUp ? "+" : ""}${changePct.toFixed(1)}%`,
            sub: isUp ? "Spending up" : "Spending down",
            icon: isUp ? TrendingUp : TrendingDown,
            color: isUp ? "text-destructive" : "text-success",
          },
          {
            label: "Recurring Items",
            value: String(recurring.length),
            sub: "Detected patterns",
            icon: Repeat2,
            color: "text-primary",
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="card animate-fade-up" style={{ animationDelay: `${i * 75}ms` }}>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
              <div className="flex items-end gap-2 mt-1">
                <p className={`text-2xl font-bold stat-number ${kpi.color ?? "text-foreground"}`}>{kpi.value}</p>
                {Icon && <Icon size={16} className={kpi.color ?? ""} />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend line */}
        <div className="chart-card animate-fade-up delay-200">
          <p className="chart-card-title">Spending Trend</p>
          <p className="chart-card-subtitle">6-month line chart</p>
          {loadingT ? (
            <div className="h-[180px] bg-muted/50 animate-pulse rounded-lg mt-2" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={44} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="var(--chart-1)" strokeWidth={2.5}
                      dot={{ r: 3.5, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--card)" }} activeDot={{ r: 5.5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stacked bar */}
        <div className="chart-card animate-fade-up delay-300">
          <p className="chart-card-title">Category Breakdown by Month</p>
          <p className="chart-card-subtitle">Stacked bar</p>
          {loadingM ? (
            <div className="h-[180px] bg-muted/50 animate-pulse rounded-lg mt-2" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={44} />
                <Tooltip content={<CustomTooltip />} />
                {["Food & Dining", "Shopping", "Transport", "Utilities"].map((cat, i) => (
                  <Bar key={cat} dataKey={cat} stackId="a" fill={`var(--chart-${i + 1})`}
                       radius={i === 3 ? [3, 3, 0, 0] : undefined} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cumulative area */}
      <div className="chart-card animate-fade-up delay-400">
        <p className="chart-card-title">Cumulative Spend Projection</p>
        <p className="chart-card-subtitle">Running total over {trend.length} months</p>
        {loadingT ? (
          <div className="h-[160px] bg-muted/50 animate-pulse rounded-lg mt-2" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={cumulative} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                     tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cumulative" stroke="var(--chart-2)" strokeWidth={2} fill="url(#cumGrad)"
                    dot={{ r: 3, fill: "var(--chart-2)", strokeWidth: 2, stroke: "var(--card)" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* AI Alerts + Recurring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts */}
        <div className="card animate-fade-up delay-500">
          <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-primary" /> AI Spending Alerts
          </p>
          {allAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No anomalies detected. Spending looks healthy ✅</p>
          ) : (
            <div className="space-y-2">
              {allAlerts.map((alert, i) => {
                const cfg = severityConfig[alert.severity];
                const Icon = cfg.icon;
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border} animate-fade-up`}
                       style={{ animationDelay: `${500 + i * 60}ms` }}>
                    <Icon size={14} className={`${cfg.text} mt-0.5 shrink-0`} />
                    <p className="text-xs text-foreground leading-snug">{alert.message}</p>
                    <span className={`ml-auto text-[10px] font-bold uppercase ${cfg.text} shrink-0`}>{alert.severity}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recurring */}
        <div className="card animate-fade-up delay-500">
          <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Repeat2 size={14} className="text-primary" /> Recurring Expenses Detected
          </p>
          {recurring.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No recurring patterns found yet.</p>
          ) : (
            <div className="space-y-2">
              {recurring.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.occurrences}× detected</p>
                  </div>
                  <p className="text-sm font-bold stat-number text-foreground">₹{item.total.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
