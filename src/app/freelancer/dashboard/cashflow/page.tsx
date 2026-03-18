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
  { month: "Oct", inflow: 58000, outflow: 26000, balance: 32000 },
  { month: "Nov", inflow: 64000, outflow: 28500, balance: 67500 },
  { month: "Dec", inflow: 52000, outflow: 24000, balance: 95500 },
  { month: "Jan", inflow: 76000, outflow: 31200, balance: 140300 },
  { month: "Feb", inflow: 69000, outflow: 29500, balance: 179800 },
  { month: "Mar", inflow: 83000, outflow: 33800, balance: 229000 },
];

const ledger = [
  { date: "2026-03-12", source: "INV-042 Velachery HealthTech", type: "Inflow", amount: 32000 },
  { date: "2026-03-13", source: "Zoho Suite + AWS Mumbai", type: "Outflow", amount: 6900 },
  { date: "2026-03-14", source: "INV-038 settlement", type: "Inflow", amount: 36000 },
  { date: "2026-03-15", source: "Tangedco office EB", type: "Outflow", amount: 2100 },
  { date: "2026-03-16", source: "INV-045 partial", type: "Inflow", amount: 15000 },
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
