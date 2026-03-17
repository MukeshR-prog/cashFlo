"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FileDown } from "lucide-react";
import Link from "next/link";

const businessExpenses = [
  { name: "Software", value: 8310, color: "var(--chart-1)" },
  { name: "Infrastructure", value: 3200, color: "var(--chart-2)" },
  { name: "Communication", value: 1500, color: "var(--chart-3)" },
  { name: "Marketing", value: 2200, color: "var(--chart-4)" },
  { name: "Travel", value: 500, color: "var(--chart-5)" },
];

const totalBusiness = businessExpenses.reduce((s, e) => s + e.value, 0);
const totalIncome = 375000;
const totalPersonal = 13540;
const netTaxableIncome = totalIncome - totalBusiness;

export default function TaxSummaryPage() {
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

      {/* Key Tax Figures */}
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
        {/* Business Expense Table */}
        <div className="chart-card">
          <p className="chart-card-title">Business Expense Breakdown</p>
          <p className="chart-card-subtitle">Deductible business expenses by category</p>
          <div className="mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {[...businessExpenses].sort((a, b) => b.value - a.value).map((e) => (
                  <tr key={e.name}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                        {e.name}
                      </div>
                    </td>
                    <td className="stat-number font-semibold">₹{e.value.toLocaleString("en-IN")}</td>
                    <td className="text-muted-foreground">{((e.value / totalBusiness) * 100).toFixed(1)}%</td>
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

        {/* Business expense donut */}
        <div className="chart-card">
          <p className="chart-card-title">Business Expense Distribution</p>
          <p className="chart-card-subtitle">Tax-deductible categories only</p>
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
        </div>
      </div>
    </div>
  );
}
