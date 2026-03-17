"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  FileText, DollarSign, Clock, AlertTriangle, TrendingUp,
  ArrowUpRight, Wallet, CheckCircle, Send, AlertCircle, TrendingDown,
} from "lucide-react";

// ── Mock Data ─────────────────────────────────────────────────────────────────

const kpis = [
  {
    label: "Total Invoiced",
    value: "₹2,45,000",
    delta: "+₹35K this month",
    deltaType: "up",
    icon: FileText,
    accentColor: "var(--primary)",
  },
  {
    label: "Cash In",
    value: "₹1,88,500",
    delta: "76.9% collection rate",
    deltaType: "up",
    icon: DollarSign,
    accentColor: "var(--success)",
  },
  {
    label: "Pending",
    value: "₹38,200",
    delta: "4 invoices awaiting",
    deltaType: "neutral",
    icon: Clock,
    accentColor: "var(--warning)",
  },
  {
    label: "Overdue",
    value: "₹18,300",
    delta: "2 invoices past due",
    deltaType: "down",
    icon: AlertTriangle,
    accentColor: "var(--destructive)",
  },
  {
    label: "Cash in Hand",
    value: "₹1,52,400",
    delta: "After all expenses",
    deltaType: "up",
    icon: Wallet,
    accentColor: "var(--primary)",
  },
  {
    label: "Net Profit",
    value: "₹1,24,200",
    delta: "+18% vs last month",
    deltaType: "up",
    icon: TrendingUp,
    accentColor: "var(--success)",
  },
  {
    label: "Total Expenses",
    value: "₹64,300",
    delta: "Business + personal",
    deltaType: "neutral",
    icon: TrendingDown,
    accentColor: "var(--warning)",
  },
  {
    label: "Expected",
    value: "₹52,700",
    delta: "Sent + due soon",
    deltaType: "up",
    icon: TrendingUp,
    accentColor: "var(--accent)",
  },
];

const cashFlowData = [
  { month: "Oct", cashIn: 42000, cashOut: 18000 },
  { month: "Nov", cashIn: 55000, cashOut: 22000 },
  { month: "Dec", cashIn: 38000, cashOut: 19000 },
  { month: "Jan", cashIn: 67000, cashOut: 25000 },
  { month: "Feb", cashIn: 48000, cashOut: 21000 },
  { month: "Mar", cashIn: 75000, cashOut: 28000 },
];

const profitTrend = [
  { month: "Oct", profit: 24000 },
  { month: "Nov", profit: 33000 },
  { month: "Dec", profit: 19000 },
  { month: "Jan", profit: 42000 },
  { month: "Feb", profit: 27000 },
  { month: "Mar", profit: 47000 },
];

const monthlyIncomeTrend = [
  { month: "Oct", income: 42000 },
  { month: "Nov", income: 55000 },
  { month: "Dec", income: 38000 },
  { month: "Jan", income: 67000 },
  { month: "Feb", income: 48000 },
  { month: "Mar", income: 75000 },
];

const invoiceStatusData = [
  { name: "Paid",    value: 12, color: "var(--chart-1)" },
  { name: "Sent",    value: 5,  color: "var(--chart-2)" },
  { name: "Overdue", value: 2,  color: "var(--chart-3)" },
  { name: "Draft",   value: 3,  color: "var(--chart-4)" },
  { name: "Partial", value: 2,  color: "var(--chart-5)" },
];

const overdueInvoices = [
  { id: "INV-018", client: "Nexus Labs",   amount: "₹12,500", overdueDays: 8  },
  { id: "INV-015", client: "TrueVen Co.", amount: "₹5,800",  overdueDays: 15 },
];

const upcomingPayments = [
  { id: "INV-022", client: "Pixel Studio",  amount: "₹28,000", dueIn: "3 days" },
  { id: "INV-021", client: "CodeBase Inc.", amount: "₹15,500", dueIn: "6 days" },
  { id: "INV-020", client: "Arjun Dev",     amount: "₹9,200",  dueIn: "9 days" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
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

// ── Dashboard Tabs ────────────────────────────────────────────────────────────

const tabs = [
  { href: "/freelancer/dashboard", label: "Overview" },
  { href: "/freelancer/dashboard/cashflow", label: "Cash Flow" },
  { href: "/freelancer/dashboard/income", label: "Income Analytics" },
  { href: "/freelancer/dashboard/profitability", label: "Profitability" },
  { href: "/freelancer/dashboard/insights", label: "Smart Insights" },
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
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
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
  return (
    <div className="space-y-6">

      {/* Tab strip */}
      <DashboardTabs />

      {/* Quick summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Overdue Payments", value: "2", textClass: "text-destructive" },
          { label: "Future Payments", value: "3", textClass: "text-primary" },
          { label: "Pending Earnings", value: "₹38,200", textClass: "text-foreground" },
        ].map((item, i) => (
          <div
            key={item.label}
            className="kpi-card py-3.5 px-4 animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <p className="kpi-label mb-1">{item.label}</p>
            <p className={`text-2xl font-bold stat-number ${item.textClass}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* ── KPI Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="kpi-card animate-fade-up"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <div
                className="kpi-card-glow"
                style={{ background: `radial-gradient(ellipse at top right, ${kpi.accentColor}, transparent)` }}
              />
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `color-mix(in oklch, ${kpi.accentColor} 10%, transparent)` }}
                >
                  <Icon size={16} style={{ color: kpi.accentColor }} />
                </div>
                {kpi.deltaType !== "neutral" && (
                  <ArrowUpRight
                    size={14}
                    className={kpi.deltaType === "up" ? "text-success" : "text-destructive rotate-180"}
                  />
                )}
              </div>
              <p className="kpi-label mb-1">{kpi.label}</p>
              <p className="kpi-value text-xl animate-count-up" style={{ animationDelay: `${i * 55 + 100}ms` }}>
                {kpi.value}
              </p>
              <p className={`text-[11px] mt-1.5 ${
                kpi.deltaType === "up" ? "kpi-delta-up" :
                kpi.deltaType === "down" ? "kpi-delta-down" : "text-muted-foreground"
              }`}>
                {kpi.deltaType === "up" ? "↑ " : kpi.deltaType === "down" ? "↓ " : ""}{kpi.delta}
              </p>
            </div>
          );
        })}
      </div>

      {/* Monthly Income Trend */}
      <div className="chart-card animate-fade-up delay-200">
        <p className="chart-card-title">Monthly Income Trend</p>
        <p className="chart-card-subtitle">Income from paid/settled invoices · 6 months</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyIncomeTrend} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={fmt} width={46} />
            <Tooltip formatter={(v) => [fmt(Number(v)), "Income"]}
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
            <Area type="monotone" dataKey="income" stroke="var(--chart-1)" strokeWidth={2.5}
              fill="url(#incomeGrad)"
              dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--card)" }}
              activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row 1: Cash Flow + P&L Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cash In vs Cash Out — monochromatic */}
        <div className="chart-card lg:col-span-2 animate-fade-up delay-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="chart-card-title">Cash In vs Cash Out</p>
              <p className="chart-card-subtitle">6-month comparison</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--chart-1)" }} />
                <span className="text-muted-foreground">Cash In</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "color-mix(in oklch, var(--chart-1) 35%, var(--muted))" }} />
                <span className="text-muted-foreground">Cash Out</span>
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cashFlowData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={fmt} width={52} />
              <Tooltip content={<CashFlowTooltip />} />
              <Bar dataKey="cashIn" fill="var(--chart-1)" opacity={0.9} radius={[4, 4, 0, 0]} />
              <Bar dataKey="cashOut" fill="var(--chart-2)" opacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* P&L Trend */}
        <div className="chart-card animate-fade-up delay-300">
          <p className="chart-card-title">Profit / Loss Trend</p>
          <p className="chart-card-subtitle">6-month net profit</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={profitTrend} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={fmt} width={46} />
              <Tooltip formatter={(v) => [fmt(Number(v)), "Net Profit"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
              <Area type="monotone" dataKey="profit" stroke="var(--chart-3)" strokeWidth={2.5}
                fill="url(#profitGrad)"
                dot={{ r: 4, fill: "var(--chart-3)", strokeWidth: 2, stroke: "var(--card)" }}
                activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Invoice Status + Overdue + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Invoice Status Donut */}
        <div className="chart-card animate-fade-up delay-100">
          <p className="chart-card-title">Invoice Status</p>
          <p className="chart-card-subtitle">24 total invoices</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={invoiceStatusData}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={72}
                paddingAngle={3} dataKey="value" strokeWidth={0}
              >
                {invoiceStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} invoices`, ""]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {invoiceStatusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
                <span className="font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Invoices */}
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
            {overdueInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl border border-destructive/15 hover:bg-destructive/5 transition-colors">
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
            ))}
            {overdueInvoices.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle size={24} className="text-success mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No overdue invoices</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Payments */}
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
            {upcomingPayments.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border hover:bg-muted/60 hover:scale-[1.01] transition-all duration-200 cursor-pointer">
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
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
