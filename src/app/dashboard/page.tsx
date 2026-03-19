"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { KpiCard } from "@/components/ui/KpiCard";
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "@/components/ui/Toaster";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Wallet, CreditCard, Receipt, ShoppingBag, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  category?: string;
}

interface DashboardSummary {
  cashInHand: number;
  monthlyExpenses: number;
  totalExpenses: number;
  monthlyIncome: number;
  recentTransactions: Transaction[];
}

interface CategoryItem { name: string; value: number }
interface CategoryData  { categories: CategoryItem[] }

// ── Mock Fallback Data ─────────────────────────────────────────────────────────

const MOCK_SUMMARY: DashboardSummary = {
  cashInHand: 36240,
  monthlyExpenses: 18450,
  totalExpenses: 39,
  monthlyIncome: 42000,
  recentTransactions: [
    { id: "1", title: "Guindy Hostel Mess",      amount: 1450,  date: new Date().toISOString(), type: "expense", category: "Food & Dining"  },
    { id: "2", title: "Part-time Tuition Credit", amount: 22000, date: new Date().toISOString(), type: "income",  category: "Income"         },
    { id: "3", title: "Pothys Essentials",       amount: 2100,  date: new Date().toISOString(), type: "expense", category: "Shopping"       },
    { id: "4", title: "MTC Monthly Bus Pass",    amount: 1000,  date: new Date().toISOString(), type: "expense", category: "Transport"      },
    { id: "5", title: "Sun NXT + Hotstar",       amount: 899,   date: new Date().toISOString(), type: "expense", category: "Entertainment"  },
    { id: "6", title: "TNEB EB Bill",            amount: 1450,  date: new Date().toISOString(), type: "expense", category: "Utilities"      },
    { id: "7", title: "Apollo Pharmacy",         amount: 760,   date: new Date().toISOString(), type: "expense", category: "Health"         },
  ],
};

const MOCK_CATEGORIES: CategoryData = {
  categories: [
    { name: "Food & Dining",  value: 5200 },
    { name: "Utilities",      value: 5100 },
    { name: "Shopping",       value: 3700 },
    { name: "Transport",      value: 2800 },
    { name: "Entertainment",  value: 1650 },
  ],
};

const MOCK_TREND = [
  { month: "Oct", amount: 16500 },
  { month: "Nov", amount: 17800 },
  { month: "Dec", amount: 19200 },
  { month: "Jan", amount: 17100 },
  { month: "Feb", amount: 18100 },
  { month: "Mar", amount: 18450 },
];

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  const abs = Math.abs(n);
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000)   return `₹${(abs / 1000).toFixed(1)}K`;
  return `₹${abs.toLocaleString("en-IN")}`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-foreground">₹{payload[0].value.toLocaleString("en-IN")}</p>
    </div>
  );
}

function SkeletonCard() {
  return <div className="kpi-card animate-pulse bg-muted/60 h-32 rounded-xl" />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: summary, loading: loadingS, isEmpty: emptyS } =
    useDashboardData<DashboardSummary>({
      url: "/api/dashboard/summary",
      mockData: MOCK_SUMMARY,
      isEmpty: (d) => !d || (!d.cashInHand && !d.monthlyExpenses && !d.recentTransactions?.length),
    });

  const { data: catData, loading: loadingC } =
    useDashboardData<CategoryData>({
      url: "/api/analytics/category",
      mockData: MOCK_CATEGORIES,
      isEmpty: (d) => !d?.categories?.length,
    });

  const { data: trendData, loading: loadingT } =
    useDashboardData<{ trend: { month: string; amount: number }[] }>({
      url: "/api/analytics/trends?months=6",
      mockData: { trend: MOCK_TREND },
      isEmpty: (d) => !d?.trend?.length,
    });

  const loading = loadingS || loadingC || loadingT;

  // Auto-seed when student account is empty (silent, no button needed)
  const autoSeededRef = useRef(false);
  useEffect(() => {
    if (autoSeededRef.current || loadingS) return;
    if (emptyS) {
      autoSeededRef.current = true;
      fetch("/api/seed", { method: "POST", credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.seeded) setTimeout(() => window.location.reload(), 400);
        })
        .catch(() => {});
    }
  }, [loadingS, emptyS]);

  // Format trend for chart — use backend month labels or raw mock
  const spendTrend = (trendData?.trend ?? MOCK_TREND).map((row) => ({
    month: row.month.length === 7
      ? format(new Date(`${row.month}-01`), "MMM")
      : String(row.month),
    amount: row.amount,
  }));

  const categories = catData?.categories ?? MOCK_CATEGORIES.categories;
  const totalCatSpend = categories.reduce((s, c) => s + c.value, 0);
  const transactions = summary?.recentTransactions ?? MOCK_SUMMARY.recentTransactions;

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <KpiCard
              label="Current Balance"
              value={formatCurrency(summary?.cashInHand ?? 0)}
              delta={emptyS ? "Sample data" : "Live balance"}
              deltaType="neutral"
              icon={Wallet}
              accentColor="var(--chart-1)"
              delay={0}
            />
            <KpiCard
              label="Monthly Spend"
              value={formatCurrency(summary?.monthlyExpenses ?? 0)}
              delta={emptyS ? "Sample data" : "This month"}
              deltaType="down"
              icon={CreditCard}
              accentColor="var(--chart-2)"
              delay={75}
            />
            <KpiCard
              label="Monthly Income"
              value={formatCurrency(summary?.monthlyIncome ?? 0)}
              delta={emptyS ? "Sample data" : "This month"}
              deltaType="up"
              icon={Receipt}
              accentColor="var(--chart-3)"
              delay={150}
            />
            <KpiCard
              label="Top Category"
              value={categories[0]?.name ?? "—"}
              delta={categories[0] ? `₹${categories[0].value.toLocaleString("en-IN")} spent` : "No data"}
              deltaType="neutral"
              icon={ShoppingBag}
              accentColor="var(--chart-4)"
              delay={225}
            />
          </>
        )}
      </div>

      {/* ── Charts Row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spending Trend */}
        <div className="chart-card lg:col-span-2 animate-fade-up delay-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="chart-card-title">Monthly Spending Trend</p>
              <p className="chart-card-subtitle">
                {emptyS ? "Sample data — add expenses to see your real trend" : "6-month overview · Area chart"}
              </p>
            </div>
            {emptyS && (
              <span className="badge badge-neutral text-[10px]">Demo</span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={spendTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--chart-1)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                     tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="var(--chart-1)" strokeWidth={2.5}
                    fill="url(#spendGrad)"
                    dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--card)" }}
                    activeDot={{ r: 6, fill: "var(--chart-1)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Donut */}
        <div className="chart-card animate-fade-up delay-300">
          <p className="chart-card-title">Category Breakdown</p>
          <p className="chart-card-subtitle">{emptyS ? "Sample data" : "Current month"}</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categories} cx="50%" cy="50%" innerRadius={55} outerRadius={78}
                   paddingAngle={3} dataKey="value" strokeWidth={0}>
                {categories.map((_entry, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {categories.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground">{c.name}</span>
                </div>
                <span className="font-semibold text-foreground">
                  {totalCatSpend ? Math.round((c.value / totalCatSpend) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Transactions ───────────────────────────── */}
      <div className="chart-card animate-fade-up delay-400">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="chart-card-title">Recent Transactions</p>
            <p className="chart-card-subtitle">{emptyS ? "Sample data — add expenses to see real entries" : `Last ${transactions.length} entries`}</p>
          </div>
          <a href="/dashboard/expenses" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </a>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx, i) => (
              <div key={tx.id}
                className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer animate-fade-up"
                style={{ animationDelay: `${400 + i * 50}ms` }}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${tx.type === "income" ? "bg-success/10" : "bg-muted"}`}>
                  {tx.type === "income" ? "💼" : "💳"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {format(new Date(tx.date), "MMM d, yyyy")}
                    {tx.category ? ` · ${tx.category}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold stat-number ${tx.type === "income" ? "text-success" : "text-foreground"}`}>
                    {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
