"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AlertTriangle, TrendingDown, Lightbulb, Zap, DollarSign, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

interface Insight {
  type: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  saving?: string;
}

interface InsightsData {
  spendingPatterns: { currentMonthTotal: number; previousMonthTotal: number; monthOverMonthChangePct: number };
  incomePatterns: { currentMonthTotal: number; previousMonthTotal: number; monthOverMonthChangePct: number };
  insights: Insight[];
  recurringExpenses: { title: string; occurrences: number; total: number }[];
  topCategories: { category: string; total: number }[];
}

const severityColor: Record<string, string> = {
  high: "badge-danger",
  medium: "badge-warning",
  low: "badge-primary",
};

const severityIconMap: Record<string, typeof AlertTriangle> = {
  high: AlertTriangle,
  medium: TrendingDown,
  low: Lightbulb,
};

const severityCssColor: Record<string, string> = {
  high: "var(--destructive)",
  medium: "var(--warning)",
  low: "var(--chart-1)",
};

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function FreelancerInsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights", { cache: "no-store", credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        toast.error("Could not load insights", json.error ?? "Please try again.");
        return;
      }
      setData(json);
    } catch {
      toast.error("Network error", "Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const insights = data?.insights ?? [];
  const totalSavings = insights
    .filter((i) => i.saving)
    .map((i) => {
      const match = i.saving?.match(/₹([\d,]+)/);
      return match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
    })
    .reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/dashboard", label: "Overview" },
          { href: "/freelancer/dashboard/cashflow", label: "Cash Flow" },
          { href: "/freelancer/dashboard/income", label: "Income Analytics" },
          { href: "/freelancer/dashboard/profitability", label: "Profitability" },
          { href: "/freelancer/dashboard/insights", label: "Smart Insights" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/dashboard/insights" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Analyzing your data...</span>
        </div>
      ) : !data ? (
        <div className="chart-card text-center py-12">
          <p className="text-sm text-muted-foreground">Could not load insights data.</p>
        </div>
      ) : (
        <>
          {/* Header Summary */}
          <div className="card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 animate-fade-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={18} className="text-primary" />
                  <p className="text-sm font-bold text-foreground">Smart Insights Active</p>
                  <button onClick={fetchData} className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2">
                    <RefreshCw size={12} />
                  </button>
                </div>
                <p className="text-muted-foreground text-sm">
                  We found <span className="text-foreground font-semibold">{insights.length} insight{insights.length !== 1 ? "s" : ""}</span> from your financial data.
                </p>
              </div>
              <div className="text-right">
                {totalSavings > 0 && (
                  <>
                    <p className="text-2xl font-bold stat-number text-success">{fmt(totalSavings)}</p>
                    <p className="text-xs text-muted-foreground">Potential savings identified</p>
                  </>
                )}
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} className={data.incomePatterns.monthOverMonthChangePct >= 0 ? "text-success" : "text-destructive"} />
                    Income: {data.incomePatterns.monthOverMonthChangePct >= 0 ? "+" : ""}{data.incomePatterns.monthOverMonthChangePct.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown size={12} className={data.spendingPatterns.monthOverMonthChangePct <= 0 ? "text-success" : "text-destructive"} />
                    Spending: {data.spendingPatterns.monthOverMonthChangePct >= 0 ? "+" : ""}{data.spendingPatterns.monthOverMonthChangePct.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up delay-100">
            {insights.map((card, i) => {
              const Icon = severityIconMap[card.severity] ?? Lightbulb;
              const color = severityCssColor[card.severity] ?? "var(--chart-1)";
              return (
                <div key={i} className="card-hover group">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ background: `color-mix(in oklch, ${color} 12%, transparent)` }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-sm font-bold text-foreground">{card.title}</p>
                        <span className={`badge ${severityColor[card.severity]}`}>
                          {card.severity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{card.message}</p>
                      {card.saving && (
                        <div className="flex items-center gap-2 mt-3">
                          <DollarSign size={13} className="text-success" />
                          <span className="text-sm font-semibold text-success">Save up to {card.saving}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up delay-200">
            {/* Category Expense Chart */}
            {data.topCategories.length > 0 && (
              <div className="chart-card">
                <p className="chart-card-title">Top Expense Categories</p>
                <p className="chart-card-subtitle">This month&apos;s spending breakdown</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.topCategories} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={88} />
                    <Tooltip
                      formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Monthly"]}
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }}
                    />
                    <Bar dataKey="total" fill="var(--chart-1)" opacity={0.80} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recurring Expenses Table */}
            {data.recurringExpenses.length > 0 && (
              <div className="chart-card">
                <p className="chart-card-title">Recurring Expenses Detected</p>
                <p className="chart-card-subtitle">Expenses that appear multiple times</p>
                <div className="mt-4 overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Expense</th>
                        <th>Occurrences</th>
                        <th>Total Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recurringExpenses.map((exp, i) => (
                        <tr key={i}>
                          <td className="font-medium">{exp.title}</td>
                          <td><span className="badge badge-secondary">{exp.occurrences}×</span></td>
                          <td className="font-semibold stat-number">{fmt(exp.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
