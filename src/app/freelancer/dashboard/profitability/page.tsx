"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const profitability = [
  { month: "Oct", income: 58000, businessExpenses: 26000, profit: 32000 },
  { month: "Nov", income: 64000, businessExpenses: 28500, profit: 35500 },
  { month: "Dec", income: 52000, businessExpenses: 24000, profit: 28000 },
  { month: "Jan", income: 76000, businessExpenses: 31200, profit: 44800 },
  { month: "Feb", income: 69000, businessExpenses: 29500, profit: 39500 },
  { month: "Mar", income: 83000, businessExpenses: 33800, profit: 49200 },
];

const fmt = (v: number) => `₹${v.toLocaleString("en-IN")}`;

export default function ProfitabilityPage() {
  const totalProfit = profitability.reduce((sum, row) => sum + row.profit, 0);
  const cashIn = profitability.reduce((sum, row) => sum + row.income, 0);
  const totalExpenses = profitability.reduce((sum, row) => sum + row.businessExpenses, 0);
  const cashInHand = cashIn - totalExpenses;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/dashboard", label: "Overview" },
          { href: "/freelancer/dashboard/cashflow", label: "Cash Flow" },
          { href: "/freelancer/dashboard/income", label: "Income Analytics" },
          { href: "/freelancer/dashboard/profitability", label: "Profitability" },
          { href: "/freelancer/dashboard/insights", label: "Smart Insights" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/dashboard/profitability" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Profit</p>
          <p className="kpi-value text-xl text-success">{fmt(totalProfit)}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Loss</p>
          <p className="kpi-value text-xl text-destructive">₹0</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Cash in Hand</p>
          <p className="kpi-value text-xl text-primary">{fmt(cashInHand)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="chart-card">
          <p className="chart-card-title">Profit / Loss Trend</p>
          <p className="chart-card-subtitle">Profit = Cash In - Business Expenses</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={profitability} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => [fmt(Number(v)), "Net"]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
              <Line type="monotone" dataKey="profit" stroke="var(--chart-3)" strokeWidth={2.4} dot={{ r: 4, fill: "var(--chart-3)", strokeWidth: 2, stroke: "var(--card)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <p className="chart-card-title">Income vs Business Expenses</p>
          <p className="chart-card-subtitle">Period-wise profitability impact</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={profitability} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => [fmt(Number(v)), ""]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
              <Bar dataKey="income" fill="var(--success)" opacity={0.8} radius={[4, 4, 0, 0]} />
              <Bar dataKey="businessExpenses" fill="var(--destructive)" opacity={0.6} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
