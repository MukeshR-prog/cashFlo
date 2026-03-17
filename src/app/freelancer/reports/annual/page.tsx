"use client";

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FileDown } from "lucide-react";
import Link from "next/link";

const annualData = [
  { month: "Apr '25", income: 55000, expenses: 22000, profit: 33000 },
  { month: "May", income: 48000, expenses: 19000, profit: 29000 },
  { month: "Jun", income: 62000, expenses: 24000, profit: 38000 },
  { month: "Jul", income: 71000, expenses: 28000, profit: 43000 },
  { month: "Aug", income: 58000, expenses: 21000, profit: 37000 },
  { month: "Sep", income: 84000, expenses: 31000, profit: 53000 },
  { month: "Oct", income: 42000, expenses: 18000, profit: 24000 },
  { month: "Nov", income: 55000, expenses: 22000, profit: 33000 },
  { month: "Dec", income: 38000, expenses: 19000, profit: 19000 },
  { month: "Jan '26", income: 67000, expenses: 25000, profit: 42000 },
  { month: "Feb", income: 48000, expenses: 21000, profit: 27000 },
  { month: "Mar", income: 75000, expenses: 28000, profit: 47000 },
];

const totalIncome = annualData.reduce((s, d) => s + d.income, 0);
const totalExpenses = annualData.reduce((s, d) => s + d.expenses, 0);
const totalProfit = annualData.reduce((s, d) => s + d.profit, 0);

export default function AnnualReportPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/reports", label: "Monthly" },
          { href: "/freelancer/reports/annual", label: "Annual" },
          { href: "/freelancer/reports/tax", label: "Tax Summary" },
          { href: "/freelancer/reports/invoice-completion", label: "Invoice Completion" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/reports/annual" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-outline btn-sm gap-1.5"><FileDown size={14} /> CSV</button>
        <button className="btn btn-outline btn-sm gap-1.5"><FileDown size={14} /> PDF</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Annual Income</p>
          <p className="kpi-value text-xl text-success">₹{(totalIncome / 100000).toFixed(2)}L</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Annual Expenses</p>
          <p className="kpi-value text-xl text-destructive">₹{(totalExpenses / 1000).toFixed(0)}K</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Annual Profit</p>
          <p className="kpi-value text-xl text-primary">₹{(totalProfit / 100000).toFixed(2)}L</p>
        </div>
      </div>

      {/* 12-Month Bar Chart */}
      <div className="chart-card">
        <p className="chart-card-title">Annual Revenue Overview</p>
        <p className="chart-card-subtitle">12-month income vs expenses · bar chart</p>
        <div className="flex items-center gap-4 text-xs mt-1 mb-4">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-success/80" /> Income</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-destructive/70" /> Expenses</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={annualData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={44} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
            <Bar dataKey="income" fill="var(--success)" opacity={0.80} radius={[3, 3, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--destructive)" opacity={0.60} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* P&L Trend Line */}
      <div className="chart-card">
        <p className="chart-card-title">Annual Profit / Loss Trend</p>
        <p className="chart-card-subtitle">Net profit month-wise · line chart</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={annualData} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={44} />
            <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
            <Line type="monotone" dataKey="profit" stroke="var(--chart-3)" strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--chart-3)", strokeWidth: 2, stroke: "var(--card)" }}
              activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
