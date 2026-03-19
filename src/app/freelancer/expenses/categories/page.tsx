"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface CategoryItem { name: string; value: number; color: string; }

export default function ExpenseCategoriesPage() {
  const [categoriesData, setCategoriesData] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reports/data", { cache: "no-store", credentials: "include" });
        const json = await res.json();
        if (!res.ok) { toast.error("Error", json.error ?? "Failed to load."); return; }
        setCategoriesData(json.allCategoryExpenses ?? []);
      } catch { toast.error("Network error", "Could not reach the server."); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  const total = categoriesData.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/expenses", label: "All Expenses" },
          { href: "/freelancer/expenses/add", label: "Add Expense" },
          { href: "/freelancer/expenses/categories", label: "Categories" },
          { href: "/freelancer/expenses/business-personal", label: "Business vs Personal" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/expenses/categories" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading categories...</span>
        </div>
      ) : categoriesData.length === 0 ? (
        <div className="chart-card text-center py-12">
          <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="chart-card">
            <p className="chart-card-title">Expenses by Category</p>
            <p className="chart-card-subtitle">All time · ₹{total.toLocaleString("en-IN")} total</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoriesData} cx="50%" cy="50%" innerRadius={62} outerRadius={88}
                  paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {categoriesData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {categoriesData.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{total > 0 ? Math.round((c.value / total) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <p className="chart-card-title">Category-wise Totals</p>
            <p className="chart-card-subtitle">Sorted by highest spend</p>
            <div className="mt-4">
              <table className="data-table">
                <thead><tr><th>Category</th><th>Amount</th><th>Share</th></tr></thead>
                <tbody>
                  {[...categoriesData].sort((a, b) => b.value - a.value).map((c) => (
                    <tr key={c.name}>
                      <td><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: c.color }} />{c.name}</div></td>
                      <td className="stat-number font-semibold">₹{c.value.toLocaleString("en-IN")}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${total > 0 ? Math.round((c.value / total) * 100) : 0}%`, background: c.color }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{total > 0 ? Math.round((c.value / total) * 100) : 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
