"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const monthlyCash = [
  { month: "Oct", inflow: 42000, outflow: 18000, balance: 24000 },
  { month: "Nov", inflow: 55000, outflow: 22000, balance: 57000 },
  { month: "Dec", inflow: 38000, outflow: 19000, balance: 76000 },
  { month: "Jan", inflow: 67000, outflow: 25000, balance: 118000 },
  { month: "Feb", inflow: 48000, outflow: 21000, balance: 145000 },
  { month: "Mar", inflow: 75000, outflow: 28000, balance: 192000 },
];

const ledger = [
  { date: "2026-03-12", source: "INV-024", type: "Inflow", amount: 28000 },
  { date: "2026-03-13", source: "AWS + Tools", type: "Outflow", amount: 5100 },
  { date: "2026-03-14", source: "INV-021 settlement", type: "Inflow", amount: 22000 },
  { date: "2026-03-15", source: "Office internet", type: "Outflow", amount: 1400 },
  { date: "2026-03-16", source: "INV-022 partial", type: "Inflow", amount: 5000 },
];

const fmt = (v: number) => `₹${v.toLocaleString("en-IN")}`;

export default function CashFlowPage() {
  const totalIn = monthlyCash.reduce((sum, row) => sum + row.inflow, 0);
  const totalOut = monthlyCash.reduce((sum, row) => sum + row.outflow, 0);
  const cashInHand = totalIn - totalOut;

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
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/dashboard/cashflow" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Total Cash In</p>
          <p className="kpi-value text-xl text-success">{fmt(totalIn)}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Total Cash Out</p>
          <p className="kpi-value text-xl text-destructive">{fmt(totalOut)}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Cash in Hand</p>
          <p className="kpi-value text-xl text-primary">{fmt(cashInHand)}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Real-time Position</p>
          <p className="kpi-value text-xl">{fmt(monthlyCash[monthlyCash.length - 1].balance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="chart-card">
          <p className="chart-card-title">Cash In vs Cash Out</p>
          <p className="chart-card-subtitle">Month-wise inflow and outflow</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyCash} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => [fmt(Number(v)), ""]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
              <Bar dataKey="inflow" fill="var(--success)" opacity={0.85} radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflow" fill="var(--destructive)" opacity={0.65} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <p className="chart-card-title">Running Cash Balance</p>
          <p className="chart-card-subtitle">Settlement-driven inflow, expense-driven outflow</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyCash} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="cashBal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => [fmt(Number(v)), "Balance"]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
              <Area type="monotone" dataKey="balance" stroke="var(--chart-2)" strokeWidth={2.2} fill="url(#cashBal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card overflow-x-auto">
        <p className="chart-card-title mb-3">Date-wise Inflow and Outflow Entries</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Source</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((row) => (
              <tr key={`${row.date}-${row.source}`}>
                <td className="text-xs text-muted-foreground">{row.date}</td>
                <td className="font-medium text-foreground">{row.source}</td>
                <td>
                  <span className={`badge ${row.type === "Inflow" ? "badge-success" : "badge-danger"}`}>{row.type}</span>
                </td>
                <td className={`stat-number font-semibold ${row.type === "Inflow" ? "text-success" : "text-destructive"}`}>{fmt(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
