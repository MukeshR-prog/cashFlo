"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const monthlyIncome = [
  { month: "Jan", settledIncome: 71000, expected: 18000 },
  { month: "Feb", settledIncome: 69000, expected: 21000 },
  { month: "Mar", settledIncome: 83000, expected: 24000 },
  { month: "Apr", settledIncome: 42000, expected: 35000 },
];

const fmt = (v: number) => `₹${v.toLocaleString("en-IN")}`;

export default function IncomeAnalyticsPage() {
  const settled = monthlyIncome.reduce((sum, item) => sum + item.settledIncome, 0);
  const expected = monthlyIncome.reduce((sum, item) => sum + item.expected, 0);

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
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/dashboard/income" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Total Settled Income</p>
          <p className="kpi-value text-xl text-success">{fmt(settled)}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Expected Upcoming Income</p>
          <p className="kpi-value text-xl text-primary">{fmt(expected)}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Selected Period Total</p>
          <p className="kpi-value text-xl">{fmt(settled + expected)}</p>
        </div>
      </div>

      <div className="chart-card">
        <p className="chart-card-title">Monthly Income Trend</p>
        <p className="chart-card-subtitle">Paid/settled invoices only + expected inflow</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyIncome} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v) => [fmt(Number(v)), ""]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
            <Bar dataKey="settledIncome" fill="var(--chart-1)" opacity={0.85} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expected" fill="var(--chart-3)" opacity={0.6} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card overflow-x-auto">
        <p className="chart-card-title mb-3">Month-wise Income Breakdown</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Settled Income</th>
              <th>Expected</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {monthlyIncome.map((item) => (
              <tr key={item.month}>
                <td className="font-medium text-foreground">{item.month}</td>
                <td className="stat-number text-success font-semibold">{fmt(item.settledIncome)}</td>
                <td className="stat-number text-primary">{fmt(item.expected)}</td>
                <td className="stat-number font-semibold">{fmt(item.settledIncome + item.expected)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
