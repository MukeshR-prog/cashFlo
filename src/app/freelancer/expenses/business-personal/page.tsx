"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const businessData = [
  { month: "Oct", business: 14200, personal: 4500 },
  { month: "Nov", business: 18500, personal: 5200 },
  { month: "Dec", business: 12800, personal: 6100 },
  { month: "Jan", business: 21000, personal: 4800 },
  { month: "Feb", business: 16400, personal: 5500 },
  { month: "Mar", business: 20610, personal: 3540 },
];

type View = "BUSINESS" | "PERSONAL" | "COMBINED";

const splitData = [
  { name: "Business", value: 103510, color: "var(--chart-1)" },
  { name: "Personal", value: 29690, color: "var(--chart-4)" },
];

export default function BusinessPersonalPage() {
  const [view, setView] = useState<View>("COMBINED");

  const filteredData = businessData.map((d) => {
    if (view === "BUSINESS") return { month: d.month, business: d.business };
    if (view === "PERSONAL") return { month: d.month, personal: d.personal };
    return d;
  });

  const totalBusiness = businessData.reduce((s, d) => s + d.business, 0);
  const totalPersonal = businessData.reduce((s, d) => s + d.personal, 0);
  const totalCombined = totalBusiness + totalPersonal;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/expenses", label: "All Expenses" },
          { href: "/freelancer/expenses/add", label: "Add Expense" },
          { href: "/freelancer/expenses/categories", label: "Categories" },
          { href: "/freelancer/expenses/business-personal", label: "Business vs Personal" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/expenses/business-personal" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(["BUSINESS", "PERSONAL", "COMBINED"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Business Expenses</p>
          <p className="kpi-value text-xl text-primary">₹{(totalBusiness / 1000).toFixed(1)}K</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Personal Expenses</p>
          <p className="kpi-value text-xl text-foreground">₹{(totalPersonal / 1000).toFixed(1)}K</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Combined Total</p>
          <p className="kpi-value text-xl">₹{(totalCombined / 1000).toFixed(1)}K</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Stacked Bar Chart */}
        <div className="chart-card">
          <p className="chart-card-title">Monthly Breakdown</p>
          <p className="chart-card-subtitle">Business vs Personal · {view.toLowerCase()} view</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filteredData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={44} />
              <Tooltip
                formatter={(v, name) => [`₹${Number(v).toLocaleString("en-IN")}`, String(name)]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }}
              />
              {(view === "COMBINED" || view === "BUSINESS") && (
                <Bar dataKey="business" stackId="a" fill="var(--chart-1)" opacity={0.85} radius={view === "BUSINESS" ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              )}
              {(view === "COMBINED" || view === "PERSONAL") && (
                <Bar dataKey="personal" stackId="a" fill="var(--chart-4)" opacity={0.75} radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Split */}
        <div className="chart-card">
          <p className="chart-card-title">Business vs Personal Split</p>
          <p className="chart-card-subtitle">6-month total allocation</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={splitData} cx="50%" cy="50%" innerRadius={62} outerRadius={88}
                paddingAngle={4} dataKey="value" strokeWidth={0}>
                {splitData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-1">
            {splitData.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="font-semibold text-foreground">{Math.round((s.value / totalCombined) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
