"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

const categoriesData = [
  { name: "Software", value: 8310, color: "var(--chart-1)" },
  { name: "Infrastructure", value: 3200, color: "var(--chart-2)" },
  { name: "Communication", value: 1500, color: "var(--chart-3)" },
  { name: "Travel", value: 500, color: "var(--chart-4)" },
  { name: "Marketing", value: 2200, color: "var(--chart-5)" },
  { name: "Food", value: 620, color: "var(--muted-foreground)" },
];

const total = categoriesData.reduce((s, c) => s + c.value, 0);

export default function ExpenseCategoriesPage() {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Donut Chart */}
        <div className="chart-card">
          <p className="chart-card-title">Expenses by Category</p>
          <p className="chart-card-subtitle">Current month · ₹{total.toLocaleString("en-IN")} total</p>
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
                <span className="font-semibold text-foreground">{Math.round((c.value / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Totals Table */}
        <div className="chart-card">
          <p className="chart-card-title">Category-wise Totals</p>
          <p className="chart-card-subtitle">Sorted by highest spend</p>
          <div className="mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {[...categoriesData].sort((a, b) => b.value - a.value).map((c) => (
                  <tr key={c.name}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                        {c.name}
                      </div>
                    </td>
                    <td className="stat-number font-semibold">₹{c.value.toLocaleString("en-IN")}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.round((c.value / total) * 100)}%`, background: c.color }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{Math.round((c.value / total) * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
