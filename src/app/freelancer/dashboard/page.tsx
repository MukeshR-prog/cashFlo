"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  FileText, DollarSign, Clock, AlertTriangle, TrendingUp,
  ArrowUpRight, Wallet, AlertCircle, Send, TrendingDown, RefreshCw,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardData {
  kpis: {
    totalEarned: number;
    pendingAmount: number;
    overdueCount: number;
    upcomingCount: number;
    thisMonthExpenses: number;
    lastMonthExpenses: number;
    clientCount: number;
    netProfit: number;
  };
  overdueInvoices: { id: string; client: string; amount: string; overdueDays: number; _id: string }[];
  upcomingPayments: { id: string; client: string; amount: string; dueIn: string; _id: string }[];
  cashflowChart: { month: string; cashIn: number; cashOut: number; net: number }[];
  invoiceStatusBreakdown: { name: string; value: number; total: number }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/60 ${className}`} />;
}

function CashFlowTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-lg text-sm">
      <p className="text-xs text-muted-foreground font-medium mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.name === "cashIn" ? "var(--primary)" : "color-mix(in oklch, var(--primary) 40%, transparent)" }} />
          <p className="font-semibold text-foreground">
            {p.name === "cashIn" ? "Cash In" : "Cash Out"}: {fmt(p.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Status color map ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  paid:           "var(--chart-1)",
  sent:           "var(--chart-2)",
  overdue:        "var(--chart-3)",
  draft:          "var(--chart-4)",
  partially_paid: "var(--chart-5)",
  due:            "var(--chart-2)",
};

// ── Dashboard Tabs ────────────────────────────────────────────────────────────

const tabs = [
  { href: "/freelancer/dashboard",              label: "Overview" },
  { href: "/freelancer/dashboard/cashflow",     label: "Cash Flow" },
  { href: "/freelancer/dashboard/income",       label: "Income Analytics" },
  { href: "/freelancer/dashboard/profitability", label: "Profitability" },
  { href: "/freelancer/dashboard/insights",     label: "Smart Insights" },
];

function DashboardTabs() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tabs.map((tab) => {
        const active = tab.href === "/freelancer/dashboard" ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FreelancerDashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoSeeded, setAutoSeeded] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/freelancer/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load dashboard");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000); // auto-refresh every minute
    return () => clearInterval(interval);
  }, [fetchData]);

  // Auto-seed on first load when account has no data
  useEffect(() => {
    if (autoSeeded) return;
    if (!loading && data &&
      data.kpis.totalEarned === 0 &&
      data.kpis.clientCount === 0 &&
      data.invoiceStatusBreakdown.length === 0
    ) {
      setAutoSeeded(true);
      setLoading(true);
      fetch("/api/seed", { method: "POST" })
        .then(() => fetchData())
        .catch(() => setLoading(false));
    }
  }, [loading, data, autoSeeded, fetchData]);

  const kpis = data ? [
    { label: "Total Earned",     value: fmt(data.kpis.totalEarned),       delta: `${data.kpis.clientCount} active clients`, deltaType: "up",      icon: DollarSign },
    { label: "Net Profit",       value: fmt(data.kpis.netProfit),         delta: "After all expenses",                      deltaType: data.kpis.netProfit >= 0 ? "up" : "down", icon: TrendingUp },
    { label: "Pending",          value: fmt(data.kpis.pendingAmount),     delta: `${data.kpis.upcomingCount} invoices`,      deltaType: "neutral", icon: Clock },
    { label: "Overdue",          value: data.kpis.overdueCount.toString(),delta: "invoices past due",                        deltaType: "down",    icon: AlertTriangle },
    { label: "Monthly Expenses", value: fmt(data.kpis.thisMonthExpenses), delta: `vs ₹${(data.kpis.lastMonthExpenses/1000).toFixed(0)}K last month`, deltaType: "neutral", icon: TrendingDown },
    { label: "Active Clients",   value: data.kpis.clientCount.toString(), delta: "Total in your roster",                     deltaType: "up",      icon: FileText },
    { label: "Cash In",          value: fmt(data.kpis.totalEarned),       delta: "All settled payments",                     deltaType: "up",      icon: Wallet },
    { label: "Upcoming",         value: data.kpis.upcomingCount.toString(), delta: "payments due soon",                      deltaType: "up",      icon: Send },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Tabs + refresh */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <DashboardTabs />
        {lastUpdated && (
          <button onClick={fetchData} className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors group">
            <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
            Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="premium-alert premium-alert-danger flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle size={14} /> {error}
          <button onClick={fetchData} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Quick summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {loading
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-[78px]" />)
          : [
              { label: "Overdue Payments", value: data?.kpis.overdueCount ?? 0, textClass: "text-destructive" },
              { label: "Upcoming Due",     value: data?.kpis.upcomingCount ?? 0, textClass: "text-primary" },
              { label: "Pending Earnings", value: fmt(data?.kpis.pendingAmount ?? 0), textClass: "text-foreground" },
            ].map((item, i) => (
              <div key={item.label} className="kpi-card py-3.5 px-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <p className="kpi-label mb-1">{item.label}</p>
                <p className={`text-2xl font-bold stat-number ${item.textClass}`}>{item.value}</p>
              </div>
            ))}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading
          ? [0,1,2,3,4,5,6,7].map((i) => <Skeleton key={i} className="h-[110px]" />)
          : kpis.map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="kpi-card animate-fade-up" style={{ animationDelay: `${i * 55}ms` }}>
                  <div className="kpi-card-glow" />
                  <div className="flex items-start justify-between mb-3">
                    <p className="kpi-label">{kpi.label}</p>
                    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-primary" />
                    </div>
                  </div>
                  <p className="text-xl font-bold stat-number text-foreground">{kpi.value}</p>
                  <p className={`text-[11px] mt-1.5 font-medium ${kpi.deltaType === "up" ? "text-success" : kpi.deltaType === "down" ? "text-destructive" : "text-muted-foreground"}`}>
                    {kpi.delta}
                  </p>
                </div>
              );
            })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cash Flow */}
        <div className="chart-card animate-fade-up">
          <p className="chart-card-title">Cash Flow</p>
          <p className="chart-card-subtitle">Income vs expenses · last 6 months</p>
          {loading
            ? <Skeleton className="h-52 mt-3" />
            : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.cashflowChart ?? []} barGap={4} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip content={<CashFlowTooltip />} />
                  <Bar dataKey="cashIn"  fill="var(--primary)"                                    radius={[4,4,0,0]} name="cashIn"  />
                  <Bar dataKey="cashOut" fill="color-mix(in oklch, var(--primary) 35%, transparent)" radius={[4,4,0,0]} name="cashOut" />
                </BarChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Monthly Income Area */}
        <div className="chart-card animate-fade-up delay-100">
          <p className="chart-card-title">Monthly Income</p>
          <p className="chart-card-subtitle">Settled payments per month</p>
          {loading
            ? <Skeleton className="h-52 mt-3" />
            : <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data?.cashflowChart ?? []} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="var(--primary)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: unknown) => [`₹${Number(v).toLocaleString("en-IN")}`, "Income"]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="cashIn" stroke="var(--primary)" strokeWidth={2.5} fill="url(#incomeGrad)" dot={{ r: 3, fill: "var(--primary)", strokeWidth: 2, stroke: "var(--card)" }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
          }
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Invoice Status Donut */}
        <div className="chart-card animate-fade-up delay-100">
          <p className="chart-card-title">Invoice Status</p>
          <p className="chart-card-subtitle">Breakdown by status</p>
          {loading
            ? <Skeleton className="h-44 mt-3" />
            : <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={data?.invoiceStatusBreakdown ?? [{ name: "No data", value: 1 }]}
                      cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}
                    >
                      {(data?.invoiceStatusBreakdown ?? []).map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name] ?? `var(--chart-${(i % 5) + 1})`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} invoices`, ""]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-1">
                  {(data?.invoiceStatusBreakdown ?? []).map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.name] ?? "var(--chart-1)" }} />
                        <span className="text-muted-foreground capitalize">{s.name.replace("_", " ")}</span>
                      </div>
                      <span className="font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                  {(data?.invoiceStatusBreakdown ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">No invoices yet</p>
                  )}
                </div>
              </>
          }
        </div>

        {/* Overdue */}
        <div className="chart-card animate-fade-up delay-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="chart-card-title">Recently Overdue</p>
              <p className="chart-card-subtitle">Requires immediate action</p>
            </div>
            <a href="/freelancer/invoices/sent" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </a>
          </div>
          <div className="space-y-3">
            {loading
              ? [0, 1].map((i) => <Skeleton key={i} className="h-16" />)
              : (data?.overdueInvoices ?? []).length === 0
                ? <div className="text-center py-6">
                    <p className="text-sm text-success font-semibold">No overdue invoices ✓</p>
                    <p className="text-xs text-muted-foreground">All payments are on track</p>
                  </div>
                : (data?.overdueInvoices ?? []).map((inv) => (
                    <div key={inv._id} className="flex items-center gap-3 p-3 rounded-xl border border-destructive/15 hover:bg-destructive/5 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                        <AlertCircle size={15} className="text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{inv.id}</p>
                        <p className="text-xs text-muted-foreground truncate">{inv.client}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold stat-number text-destructive">{inv.amount}</p>
                        <p className="text-[11px] text-muted-foreground">{inv.overdueDays}d overdue</p>
                      </div>
                    </div>
                  ))
            }
          </div>
        </div>

        {/* Upcoming */}
        <div className="chart-card animate-fade-up delay-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="chart-card-title">Upcoming Payments</p>
              <p className="chart-card-subtitle">Expected this week</p>
            </div>
            <a href="/freelancer/invoices" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </a>
          </div>
          <div className="space-y-3">
            {loading
              ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)
              : (data?.upcomingPayments ?? []).length === 0
                ? <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No upcoming payments</p>
                  </div>
                : (data?.upcomingPayments ?? []).map((inv) => (
                    <div key={inv._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border hover:bg-muted/60 hover:scale-[1.01] transition-all duration-200 cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Send size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{inv.id}</p>
                        <p className="text-xs text-muted-foreground truncate">{inv.client}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold stat-number text-foreground">{inv.amount}</p>
                        <p className="text-[11px] text-primary font-medium">Due in {inv.dueIn}</p>
                      </div>
                    </div>
                  ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
