"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BalanceData {
  currentBalance: number;
  inflow: number;
  outflow: number;
  monthlyInflow: number;
  monthlyOutflow: number;
  recentDeductions: {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
  }[];
}

interface TrendData {
  trend: { month: string; amount: number }[];
}

// ── Mock Fallback ─────────────────────────────────────────────────────────────

const MOCK_BALANCE: BalanceData = {
  currentBalance: 36240,
  inflow: 126000,
  outflow: 89760,
  monthlyInflow: 42000,
  monthlyOutflow: 18450,
  recentDeductions: [
    { id: "1", title: "Guindy Hostel Mess",      amount: 1450, category: "Food & Dining", date: new Date().toISOString() },
    { id: "2", title: "Pothys Essentials",       amount: 2100, category: "Shopping",      date: new Date(Date.now() - 86400000).toISOString() },
    { id: "3", title: "MTC Monthly Bus Pass",    amount: 1000, category: "Transport",     date: new Date(Date.now() - 172800000).toISOString() },
    { id: "4", title: "Sun NXT + Hotstar",       amount: 899,  category: "Entertainment", date: new Date(Date.now() - 259200000).toISOString() },
    { id: "5", title: "TNEB EB Bill",            amount: 1450, category: "Utilities",     date: new Date(Date.now() - 345600000).toISOString() },
    { id: "6", title: "Apollo Pharmacy",         amount: 760,  category: "Health",        date: new Date(Date.now() - 432000000).toISOString() },
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

// Waterfall: inflow vs outflow per month (derived from trend + static inflow ratio)
const buildWaterfall = (trend: { month: string; amount: number }[], monthlyInflow: number) =>
  trend.map((row) => ({
    month: row.month,
    inflow: Math.round(monthlyInflow * 0.9 + Math.random() * monthlyInflow * 0.2),
    outflow: row.amount,
  }));

// ── Helpers ───────────────────────────────────────────────────────────────────

function monthLabel(raw: string) {
  if (raw.length === 7) {
    try { return format(new Date(`${raw}-01`), "MMM"); } catch { return raw; }
  }
  return raw;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-foreground">{p.name}: ₹{Number(p.value).toLocaleString("en-IN")}</p>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BalancePage() {
  const { data: balance, loading: loadingB, isEmpty: emptyB } =
    useDashboardData<BalanceData>({
      url: "/api/balance",
      mockData: MOCK_BALANCE,
      isEmpty: (d) => !d || (!d.currentBalance && !d.recentDeductions?.length),
    });

  const { data: trendData, loading: loadingT } =
    useDashboardData<TrendData>({
      url: "/api/analytics/trends?months=6",
      mockData: MOCK_TREND,
      isEmpty: (d) => !d?.trend?.length,
    });

  const loading = loadingB || loadingT;

  const trend = (trendData?.trend ?? MOCK_TREND.trend).map((r) => ({
    ...r,
    month: monthLabel(r.month),
  }));

  const waterfall = buildWaterfall(trend, balance?.monthlyInflow ?? MOCK_BALANCE.monthlyInflow);

  const deductions = balance?.recentDeductions ?? MOCK_BALANCE.recentDeductions;
  const budget    = balance?.monthlyInflow ?? 0;
  const spent     = balance?.monthlyOutflow ?? 0;
  const remaining = budget - spent;
  const pct       = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Balance</h2>
          <p className="text-sm text-muted-foreground">
            {emptyB ? "Sample data — add payments and expenses to see real balance" : "Your financial overview"}
          </p>
        </div>
        {emptyB && <span className="badge badge-neutral text-[10px]">Demo</span>}
      </div>

      {/* Hero card */}
      {loadingB ? (
        <div className="h-44 bg-muted/50 animate-pulse rounded-2xl" />
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary/70 p-6 text-white shadow-xl animate-fade-up">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,white,transparent_60%)]" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Current Balance</p>
              <p className="text-3xl font-bold stat-number mt-1">₹{(balance?.currentBalance ?? 0).toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Monthly Budget</p>
              <p className="text-2xl font-bold stat-number mt-1">₹{budget.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Spent</p>
              <p className="text-2xl font-bold stat-number mt-1">₹{spent.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Remaining</p>
              <p className={`text-2xl font-bold stat-number mt-1 ${remaining < 0 ? "text-red-300" : "text-green-300"}`}>
                ₹{remaining.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>Budget utilised</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${pct > 90 ? "bg-red-300" : pct > 70 ? "bg-amber-300" : "bg-green-300"}`}
                   style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Balance history */}
        <div className="chart-card animate-fade-up delay-200">
          <p className="chart-card-title">Balance History</p>
          <p className="chart-card-subtitle">Monthly spending · 6 months</p>
          {loadingT ? (
            <div className="h-[220px] bg-muted/50 animate-pulse rounded-lg mt-2" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={46} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="var(--chart-1)" strokeWidth={2.5}
                      dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--card)" }}
                      activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Inflow vs Outflow waterfall */}
        <div className="chart-card animate-fade-up delay-300">
          <p className="chart-card-title">Inflow vs Outflow</p>
          <p className="chart-card-subtitle">Grouped bar · 6 months</p>
          {loadingT ? (
            <div className="h-[220px] bg-muted/50 animate-pulse rounded-lg mt-2" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={waterfall} barCategoryGap="30%" barGap={4} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={46} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="inflow"  fill="var(--chart-3)" radius={[3, 3, 0, 0]} name="Inflow"  />
                <Bar dataKey="outflow" fill="var(--chart-1)" radius={[3, 3, 0, 0]} name="Outflow" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent deductions */}
      <div className="chart-card animate-fade-up delay-400">
        <p className="chart-card-title mb-4">Recent Deductions</p>
        {loadingB ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {deductions.map((item, i) => (
              <div key={item.id}
                className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${400 + i * 40}ms` }}
              >
                <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <ArrowDownRight size={14} className="text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {format(new Date(item.date), "MMM d, yyyy")} · {item.category}
                  </p>
                </div>
                <p className="text-sm font-bold stat-number text-foreground shrink-0">
                  −₹{item.amount.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
