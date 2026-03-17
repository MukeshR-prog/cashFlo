"use client";

import { KpiCard } from "@/components/ui/KpiCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Wallet,
  CreditCard,
  Receipt,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ── Sample data ──────────────────────────────────────────
const monthlySpend = [
  { month: "Oct", amount: 24200 },
  { month: "Nov", amount: 31800 },
  { month: "Dec", amount: 28500 },
  { month: "Jan", amount: 19200 },
  { month: "Feb", amount: 22800 },
  { month: "Mar", amount: 26400 },
];

const categoryData = [
  { name: "Food & Dining",  value: 8200,  color: "var(--chart-1)" },
  { name: "Shopping",       value: 6500,  color: "var(--chart-2)" },
  { name: "Transport",      value: 3800,  color: "var(--chart-3)" },
  { name: "Entertainment",  value: 2900,  color: "var(--chart-4)" },
  { name: "Utilities",      value: 5000,  color: "var(--chart-5)" },
];

const balanceTrend = [
  { day: "1", balance: 85000 },
  { day: "5", balance: 79200 },
  { day: "10", balance: 72800 },
  { day: "15", balance: 68500 },
  { day: "20", balance: 61200 },
  { day: "25", balance: 55800 },
  { day: "Today", balance: 48750 },
];

const recentTransactions = [
  { id: 1, title: "Swiggy Order",       category: "Food & Dining", amount: -620,   date: "Today, 1:24 PM",  icon: "🍔", positive: false },
  { id: 2, title: "Salary Credit",      category: "Income",        amount: +85000, date: "Mar 15",          icon: "💼", positive: true },
  { id: 3, title: "Amazon Shopping",    category: "Shopping",      amount: -3480,  date: "Mar 14",          icon: "📦", positive: false },
  { id: 4, title: "Metro Recharge",     category: "Transport",     amount: -500,   date: "Mar 14",          icon: "🚇", positive: false },
  { id: 5, title: "Netflix",            category: "Entertainment", amount: -649,   date: "Mar 13",          icon: "🎬", positive: false },
  { id: 6, title: "Electricity Bill",   category: "Utilities",     amount: -2300,  date: "Mar 12",          icon: "⚡", positive: false },
  { id: 7, title: "Gym Membership",     category: "Health",        amount: -1800,  date: "Mar 11",          icon: "💪", positive: false },
];

function formatCurrency(amount: number) {
  const abs = Math.abs(amount);
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

export default function DashboardPage() {
  const totalCategorySpend = categoryData.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-6">
      {/* ── KPI Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Current Balance"
          value="₹48,750"
          delta="-₹7,450 this week"
          deltaType="down"
          icon={Wallet}
          accentColor="var(--chart-1)"
          delay={0}
        />
        <KpiCard
          label="Monthly Spend"
          value="₹26,400"
          delta="+15.8% vs last month"
          deltaType="up"
          icon={CreditCard}
          accentColor="var(--chart-2)"
          delay={75}
        />
        <KpiCard
          label="Total Expenses"
          value="47"
          delta="This month"
          deltaType="neutral"
          icon={Receipt}
          accentColor="var(--chart-3)"
          delay={150}
          description="7 pending"
        />
        <KpiCard
          label="Top Category"
          value="Food & Dining"
          delta="₹8,200 spent"
          deltaType="down"
          icon={ShoppingBag}
          accentColor="var(--chart-4)"
          delay={225}
          description="31% of total"
        />
      </div>

      {/* ── Charts Row ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Spending Trend — full width on the left (2 cols) */}
        <div className="chart-card lg:col-span-2 animate-fade-up delay-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="chart-card-title">Monthly Spending Trend</p>
              <p className="chart-card-subtitle">6-month overview · Area chart</p>
            </div>
            <span className="badge badge-primary">Mar 2025</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlySpend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--chart-1)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#spendGrad)"
                dot={{ r: 4, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--card)" }}
                activeDot={{ r: 6, fill: "var(--chart-1)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Donut */}
        <div className="chart-card animate-fade-up delay-300">
          <p className="chart-card-title">Category Breakdown</p>
          <p className="chart-card-subtitle">Current month</p>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="w-full space-y-1.5 mt-1">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {Math.round((c.value / totalCategorySpend) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Balance trend + Transactions ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Balance mini chart */}
        <div className="chart-card lg:col-span-2 animate-fade-up delay-300">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="chart-card-title">Balance History</p>
              <p className="chart-card-subtitle">March 2025</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold stat-number text-foreground">₹48,750</p>
              <p className="text-xs text-destructive flex items-center justify-end gap-1">
                <ArrowDownRight size={12} />
                -₹36,250 this month
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={balanceTrend} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "var(--chart-2)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="chart-card lg:col-span-3 animate-fade-up delay-400">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="chart-card-title">Recent Transactions</p>
              <p className="chart-card-subtitle">Last 7 entries</p>
            </div>
            <a href="/dashboard/expenses" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </a>
          </div>

          <div className="space-y-1">
            {recentTransactions.map((tx, i) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group animate-fade-up"
                style={{ animationDelay: `${400 + i * 50}ms` }}
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-base shrink-0">
                  {tx.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.title}</p>
                  <p className="text-[11px] text-muted-foreground">{tx.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold stat-number ${tx.positive ? "text-success" : "text-foreground"}`}>
                    {tx.positive ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{tx.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
