"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { FileDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface AnnualRow {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export default function AnnualReportPage() {
  const [annualData, setAnnualData] = useState<AnnualRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reports/data", { cache: "no-store", credentials: "include" });
        const json = await res.json();
        if (!res.ok) { toast.error("Could not load data", json.error ?? "Please try again."); return; }
        setAnnualData(json.annualData ?? []);
      } catch { toast.error("Network error", "Could not reach the server."); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  const totalIncome = annualData.reduce((s, d) => s + d.income, 0);
  const totalExpenses = annualData.reduce((s, d) => s + d.expenses, 0);
  const totalProfit = annualData.reduce((s, d) => s + d.profit, 0);

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

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading annual data...</span>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
