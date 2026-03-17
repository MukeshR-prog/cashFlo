"use client";

import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { FileDown, TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react";

const cashFlowData = [
  { month: "Oct", cashIn: 42000, cashOut: 18000 },
  { month: "Nov", cashIn: 55000, cashOut: 22000 },
  { month: "Dec", cashIn: 38000, cashOut: 19000 },
  { month: "Jan", cashIn: 67000, cashOut: 25000 },
  { month: "Feb", cashIn: 48000, cashOut: 21000 },
  { month: "Mar", cashIn: 75000, cashOut: 28000 },
];

const categoryExpenses = [
  { name: "Software", value: 8310, color: "var(--chart-1)" },
  { name: "Infrastructure", value: 3200, color: "var(--chart-2)" },
  { name: "Communication", value: 1500, color: "var(--chart-3)" },
  { name: "Marketing", value: 2200, color: "var(--chart-4)" },
  { name: "Personal", value: 3540, color: "var(--chart-5)" },
];

const totalExpenses = categoryExpenses.reduce((s, c) => s + c.value, 0);
const totalIncome = 75000;
const profit = totalIncome - totalExpenses;

export default function MonthlyReportPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/reports", label: "Monthly" },
          { href: "/freelancer/reports/annual", label: "Annual" },
          { href: "/freelancer/reports/tax", label: "Tax Summary" },
          { href: "/freelancer/reports/invoice-completion", label: "Invoice Completion" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/reports" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Export */}
      <div className="flex justify-end gap-2">
        <button className="btn btn-outline btn-sm gap-1.5"><FileDown size={14} /> CSV</button>
        <button className="btn btn-outline btn-sm gap-1.5"><FileDown size={14} /> PDF</button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Income", value: `₹${totalIncome.toLocaleString("en-IN")}`, icon: DollarSign, color: "var(--success)", type: "up" },
          { label: "Total Expenses", value: `₹${totalExpenses.toLocaleString("en-IN")}`, icon: Receipt, color: "var(--destructive)", type: "down" },
          { label: "Net Profit", value: `₹${profit.toLocaleString("en-IN")}`, icon: TrendingUp, color: "var(--chart-3)", type: "up" },
          { label: "Cash In Hand", value: `₹${(profit * 0.9).toFixed(0)}`, icon: TrendingDown, color: "var(--chart-1)", type: "neutral" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="kpi-card py-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in oklch, ${kpi.color} 12%, transparent)` }}>
                  <Icon size={13} style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="kpi-label mb-0.5">{kpi.label}</p>
              <p className="kpi-value text-xl">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cash flow bar chart */}
        <div className="chart-card">
          <p className="chart-card-title">Cash In vs Cash Out</p>
          <p className="chart-card-subtitle">6-month comparison</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cashFlowData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={44} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
              <Bar dataKey="cashIn" fill="var(--success)" opacity={0.85} radius={[4, 4, 0, 0]} />
              <Bar dataKey="cashOut" fill="var(--destructive)" opacity={0.65} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Donut */}
        <div className="chart-card">
          <p className="chart-card-title">Expense Category Breakdown</p>
          <p className="chart-card-subtitle">March 2026</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={categoryExpenses} cx="50%" cy="50%" innerRadius={44} outerRadius={64}
                paddingAngle={3} dataKey="value" strokeWidth={0}>
                {categoryExpenses.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {categoryExpenses.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="text-muted-foreground truncate">{c.name}</span>
                <span className="ml-auto font-semibold text-foreground">₹{(c.value / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
