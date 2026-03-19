"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FileDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface CategoryItem { name: string; value: number; color: string; }

export default function TaxSummaryPage() {
  const [businessExpenses, setBusinessExpenses] = useState<CategoryItem[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalPersonal, setTotalPersonal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reports/data", { cache: "no-store", credentials: "include" });
        const json = await res.json();
        if (!res.ok) { toast.error("Error", json.error ?? "Failed to load."); return; }
        setBusinessExpenses(json.businessExpenseBreakdown ?? []);
        setTotalIncome(json.totalIncomeAllTime ?? 0);
        setTotalPersonal(json.totalPersonalExpenses ?? 0);
      } catch { toast.error("Network error", "Could not reach the server."); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  const totalBusiness = businessExpenses.reduce((s, e) => s + e.value, 0);
  const netTaxableIncome = totalIncome - totalBusiness;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/reports", label: "Monthly" },
          { href: "/freelancer/reports/annual", label: "Annual" },
          { href: "/freelancer/reports/tax", label: "Tax Summary" },
          { href: "/freelancer/reports/invoice-completion", label: "Invoice Completion" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/reports/tax" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
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
          <span className="ml-2 text-sm text-muted-foreground">Loading tax summary...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Income (FY)", value: `₹${(totalIncome / 100000).toFixed(2)}L`, color: "text-success" },
              { label: "Business Expenses", value: `₹${totalBusiness.toLocaleString("en-IN")}`, color: "text-primary" },
              { label: "Personal Expenses", value: `₹${totalPersonal.toLocaleString("en-IN")}`, color: "text-muted-foreground" },
              { label: "Net Taxable Income", value: `₹${(netTaxableIncome / 100000).toFixed(2)}L`, color: "text-foreground" },
            ].map((s) => (
              <div key={s.label} className="kpi-card py-3 px-4">
                <p className="kpi-label mb-1">{s.label}</p>
                <p className={`kpi-value text-xl ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="chart-card">
              <p className="chart-card-title">Business Expense Breakdown</p>
              <p className="chart-card-subtitle">Deductible business expenses by category</p>
              <div className="mt-4">
                <table className="data-table">
                  <thead><tr><th>Category</th><th>Amount</th><th>% of Total</th></tr></thead>
                  <tbody>
                    {[...businessExpenses].sort((a, b) => b.value - a.value).map((e) => (
                      <tr key={e.name}>
                        <td><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: e.color }} />{e.name}</div></td>
                        <td className="stat-number font-semibold">₹{e.value.toLocaleString("en-IN")}</td>
                        <td className="text-muted-foreground">{totalBusiness > 0 ? ((e.value / totalBusiness) * 100).toFixed(1) : 0}%</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border font-bold">
                      <td className="text-foreground">Total</td>
                      <td className="stat-number text-primary">₹{totalBusiness.toLocaleString("en-IN")}</td>
                      <td>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="chart-card">
              <p className="chart-card-title">Business Expense Distribution</p>
              <p className="chart-card-subtitle">Tax-deductible categories only</p>
              {businessExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No business expenses found.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={businessExpenses} cx="50%" cy="50%" innerRadius={56} outerRadius={82}
                        paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {businessExpenses.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
                        contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-1">
                    {businessExpenses.map((e) => (
                      <div key={e.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: e.color }} />
                          <span className="text-muted-foreground">{e.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">₹{e.value.toLocaleString("en-IN")}</span>
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
