"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { FileDown, TrendingUp, TrendingDown, DollarSign, Receipt, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

interface CategoryExpense {
  name: string;
  value: number;
  color: string;
}

interface CashRow {
  month: string;
  cashIn: number;
  cashOut: number;
}

interface ReportsData {
  cashflow: CashRow[];
  categoryExpenses: CategoryExpense[];
  totalExpenses: number;
  totalIncome: number;
}

function toInr(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function MonthlyReportPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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

  const cashFlowData = data?.cashflow ?? [];
  const categoryExpenses = data?.categoryExpenses ?? [];
  const totalExpenses = data?.totalExpenses ?? 0;
  const totalIncome = data?.totalIncome ?? 0;
  const profit = totalIncome - totalExpenses;

  const handleCsvExport = async () => {
    try {
      setIsExportingCsv(true);
      const res = await fetch("/api/freelancer/export?type=full&format=csv", { cache: "no-store", credentials: "include" });
      if (!res.ok) throw new Error("Failed to export CSV");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cashflo-reports.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[MONTHLY_REPORT_CSV_EXPORT]", error);
      alert("Unable to export CSV right now. Please try again.");
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handlePdfExport = () => {
    try {
      setIsExportingPdf(true);
      const w = window.open("", "_blank", "noopener,noreferrer,width=1000,height=800");
      if (!w) { alert("Popup blocked. Please allow popups and try again."); return; }

      const rows = cashFlowData
        .map((row) => `<tr><td>${row.month}</td><td>${toInr(row.cashIn)}</td><td>${toInr(row.cashOut)}</td></tr>`)
        .join("");
      const categories = categoryExpenses
        .map((row) => `<tr><td>${row.name}</td><td>${toInr(row.value)}</td></tr>`)
        .join("");
      const now = new Date();
      const renderedAt = now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

      w.document.write(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>cashFlo Monthly Report</title>
            <style>
              body { font-family: Arial, Helvetica, sans-serif; margin: 28px; color: #111827; }
              h1 { margin: 0 0 4px; }
              p { margin: 0 0 12px; color: #4b5563; }
              .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 18px 0; }
              .kpi { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }
              .kpi h3 { margin: 0 0 6px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
              .kpi p { margin: 0; font-size: 20px; font-weight: 700; color: #111827; }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; }
              th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; font-size: 12px; }
              th { background: #f9fafb; }
              .section { margin-top: 18px; }
              .section h2 { margin: 0 0 8px; font-size: 16px; }
            </style>
          </head>
          <body>
            <h1>cashFlo Monthly Report</h1>
            <p>Generated on ${renderedAt}</p>
            <div class="grid">
              <div class="kpi"><h3>Total Income</h3><p>${toInr(totalIncome)}</p></div>
              <div class="kpi"><h3>Total Expenses</h3><p>${toInr(totalExpenses)}</p></div>
              <div class="kpi"><h3>Net Profit</h3><p>${toInr(profit)}</p></div>
              <div class="kpi"><h3>Cash In Hand</h3><p>${toInr(Math.round(profit * 0.9))}</p></div>
            </div>
            <div class="section">
              <h2>Cash In vs Cash Out</h2>
              <table>
                <thead><tr><th>Month</th><th>Cash In</th><th>Cash Out</th></tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
            <div class="section">
              <h2>Expense Category Breakdown</h2>
              <table>
                <thead><tr><th>Category</th><th>Amount</th></tr></thead>
                <tbody>${categories}</tbody>
              </table>
            </div>
          </body>
        </html>
      `);
      w.document.close();
      w.focus();
      w.print();
    } catch (error) {
      console.error("[MONTHLY_REPORT_PDF_EXPORT]", error);
      alert("Unable to export PDF right now. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

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

      <div className="flex justify-end gap-2">
        <button onClick={handleCsvExport} disabled={isExportingCsv} className="btn btn-outline btn-sm gap-1.5">
          <FileDown size={14} /> {isExportingCsv ? "Exporting..." : "CSV"}
        </button>
        <button onClick={handlePdfExport} disabled={isExportingPdf} className="btn btn-outline btn-sm gap-1.5">
          <FileDown size={14} /> {isExportingPdf ? "Preparing..." : "PDF"}
        </button>
      </div>

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading monthly reports...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Income", value: toInr(totalIncome), icon: DollarSign, color: "var(--success)" },
              { label: "Total Expenses", value: toInr(totalExpenses), icon: Receipt, color: "var(--destructive)" },
              { label: "Net Profit", value: toInr(profit), icon: TrendingUp, color: "var(--chart-3)" },
              { label: "Cash In Hand", value: `₹${(profit * 0.9).toFixed(0)}`, icon: TrendingDown, color: "var(--chart-1)" },
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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

            <div className="chart-card">
              <p className="chart-card-title">Expense Category Breakdown</p>
              <p className="chart-card-subtitle">This month</p>
              {categoryExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No expenses recorded this month.</p>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
