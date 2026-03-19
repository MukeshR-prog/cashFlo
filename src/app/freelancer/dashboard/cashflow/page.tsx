"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

interface CashRow {
  month: string;
  inflow: number;
  outflow: number;
  balance: number;
}

interface LedgerRow {
  date: string;
  source: string;
  type: "Inflow" | "Outflow";
  amount: number;
}

interface ReportsData {
  cashflow: CashRow[];
  ledger: LedgerRow[];
}

const fmt = (v: number) => `₹${v.toLocaleString("en-IN")}`;

export default function CashFlowPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reports/data", { cache: "no-store", credentials: "include" });
        const json = await res.json();
        if (!res.ok) { toast.error("Could not load data", json.error ?? "Please try again."); return; }
        setData(json);
      } catch { toast.error("Network error", "Could not reach the server."); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  const monthlyCash = data?.cashflow ?? [];
  const ledger = data?.ledger ?? [];

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

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading cash flow data...</span>
        </div>
      ) : (
        <>
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
              <p className="kpi-value text-xl">{fmt(monthlyCash.length > 0 ? monthlyCash[monthlyCash.length - 1].balance : 0)}</p>
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
            {ledger.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No recent transactions found.</p>
            ) : (
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
                  {ledger.map((row, i) => (
                    <tr key={i}>
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
            )}
          </div>
        </>
      )}
    </div>
  );
}
