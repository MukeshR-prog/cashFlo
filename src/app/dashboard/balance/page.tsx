"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, TrendingDown, Wallet, ArrowDown } from "lucide-react";

const balanceHistory = [
  { date: "Mar 1",  balance: 85000 },
  { date: "Mar 5",  balance: 79200 },
  { date: "Mar 9",  balance: 74800 },
  { date: "Mar 11", balance: 68500 },
  { date: "Mar 13", balance: 63200 },
  { date: "Mar 15", balance: 57800 },
  { date: "Mar 17", balance: 48750 },
];

const waterfallData = [
  { name: "Opening Balance", value: 85000,  type: "start",    color: "var(--chart-2)" },
  { name: "Salary",          value: 85000,  type: "inflow",   color: "var(--success)" },
  { name: "Food & Dining",   value: -8200,  type: "outflow",  color: "var(--chart-1)" },
  { name: "Shopping",        value: -6500,  type: "outflow",  color: "var(--chart-1)" },
  { name: "Utilities",       value: -5000,  type: "outflow",  color: "var(--chart-1)" },
  { name: "Transport",       value: -3800,  type: "outflow",  color: "var(--chart-1)" },
  { name: "Entertainment",   value: -2900,  type: "outflow",  color: "var(--chart-1)" },
  { name: "Closing Balance", value: 48750,  type: "end",      color: "var(--chart-2)" },
];

const deductions = [
  { title: "Swiggy",              amount: 620,  date: "Mar 17", category: "Food & Dining"  },
  { title: "Amazon",              amount: 3480, date: "Mar 14", category: "Shopping"        },
  { title: "Metro Recharge",      amount: 500,  date: "Mar 14", category: "Transport"       },
  { title: "Netflix",             amount: 649,  date: "Mar 13", category: "Entertainment"   },
  { title: "Electricity Bill",    amount: 2300, date: "Mar 12", category: "Utilities"       },
  { title: "Gym",                 amount: 1800, date: "Mar 11", category: "Health"          },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: {value: number}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-foreground">₹{payload[0].value.toLocaleString("en-IN")}</p>
    </div>
  );
}

export default function BalancePage() {
  const currentBalance = 48750;
  const monthBudget = 35000;
  const spent = 26400;
  const remaining = monthBudget - spent;
  const pct = Math.round((spent / monthBudget) * 100);

  return (
    <div className="space-y-5">
      {/* Hero balance card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-md animate-fade-up">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-5"
             style={{ background: "radial-gradient(ellipse 70% 50% at 20% 30%, var(--chart-2), transparent)" }} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Main balance */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet size={16} className="text-primary" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Balance</p>
            </div>
            <p className="text-5xl font-bold stat-number text-foreground tracking-tight">
              ₹{currentBalance.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-destructive mt-2 flex items-center gap-1">
              <TrendingDown size={12} />
              -₹36,250 from opening this month
            </p>
          </div>

          {/* Budget progress */}
          <div className="sm:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground mb-1">Monthly Budget</p>
                <p className="text-2xl font-bold stat-number text-foreground">₹35,000</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                <p className={`text-2xl font-bold stat-number ${remaining > 0 ? "text-success" : "text-destructive"}`}>
                  ₹{remaining.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Spent: ₹{spent.toLocaleString("en-IN")}</span>
                <span>{pct}% of budget</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: pct > 90 ? "var(--destructive)" : pct > 70 ? "var(--warning)" : "var(--chart-1)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Balance history line */}
        <div className="chart-card animate-fade-up delay-100">
          <p className="chart-card-title">Balance History</p>
          <p className="chart-card-subtitle">March 2025 daily balance</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={balanceHistory} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                     tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="balance" stroke="var(--chart-2)" strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "var(--chart-2)", strokeWidth: 2, stroke: "var(--card)" }} activeDot={{ r: 5.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Waterfall inflow/outflow */}
        <div className="chart-card animate-fade-up delay-200">
          <p className="chart-card-title">Inflow vs Outflow</p>
          <p className="chart-card-subtitle">Waterfall breakdown · March</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={waterfallData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 8.5, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                     interval={0} angle={-30} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                     tickFormatter={(v) => `₹${(Math.abs(v)/1000).toFixed(0)}K`} width={44} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {waterfallData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent deductions */}
      <div className="chart-card animate-fade-up delay-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="chart-card-title">Recent Deductions</p>
            <p className="chart-card-subtitle">Latest withdrawals from balance</p>
          </div>
          <a href="/dashboard/expenses" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={11} />
          </a>
        </div>

        <div className="space-y-1">
          {deductions.map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-muted/60 transition-colors group animate-fade-up"
              style={{ animationDelay: `${300 + i * 50}ms` }}
            >
              <div className="w-8 h-8 rounded-lg bg-destructive/8 flex items-center justify-center shrink-0">
                <ArrowDown size={14} className="text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{d.title}</p>
                <p className="text-[11px] text-muted-foreground">{d.date} · {d.category}</p>
              </div>
              <p className="text-sm font-bold stat-number text-destructive shrink-0">
                -₹{d.amount.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
