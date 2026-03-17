"use client";

import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AlertTriangle, TrendingDown, Lightbulb, RefreshCw, Zap, DollarSign } from "lucide-react";

const insightCards = [
  {
    severity: "high",
    icon: AlertTriangle,
    title: "Unused Subscription Detected",
    description: "You're paying ₹4,999/mo for Adobe CC but haven't used it in 47 days.",
    saving: "₹4,999/mo",
    color: "var(--destructive)",
  },
  {
    severity: "medium",
    icon: RefreshCw,
    title: "Duplicate Tools",
    description: "Both Slack and Teams are active. Consolidating saves ₹1,200/mo.",
    saving: "₹1,200/mo",
    color: "var(--warning)",
  },
  {
    severity: "medium",
    icon: TrendingDown,
    title: "High Recurring Expenses",
    description: "Your Software category has grown 34% over the last 3 months.",
    saving: "₹8,400 if capped",
    color: "var(--warning)",
  },
  {
    severity: "low",
    icon: Lightbulb,
    title: "Annual Plan Savings",
    description: "Switching Figma to annual billing saves 16% vs your monthly plan.",
    saving: "₹2,880/yr",
    color: "var(--chart-1)",
  },
];

const recurringExpenses = [
  { vendor: "Adobe CC", category: "Software", amount: 4999, type: "Monthly" },
  { vendor: "Figma", category: "Software", amount: 1500, type: "Monthly" },
  { vendor: "Slack", category: "Communication", amount: 750, type: "Monthly" },
  { vendor: "Teams", category: "Communication", amount: 650, type: "Monthly" },
  { vendor: "AWS", category: "Infrastructure", amount: 3200, type: "Monthly" },
  { vendor: "Zoom", category: "Communication", amount: 1299, type: "Monthly" },
];

const categoryExpenseData = [
  { category: "Software", amount: 8200 },
  { category: "Infrastructure", amount: 3200 },
  { category: "Communication", amount: 2699 },
  { category: "Marketing", amount: 1500 },
  { category: "Tools", amount: 980 },
];

const severityColor: Record<string, string> = {
  high: "badge-danger",
  medium: "badge-warning",
  low: "badge-primary",
};

export default function FreelancerInsightsPage() {
  const totalPotentialSavings = "₹9,079/mo";

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

      {/* Header Summary */}
      <div className="card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 animate-fade-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-primary" />
              <p className="text-sm font-bold text-foreground">Smart Insights Active</p>
            </div>
            <p className="text-muted-foreground text-sm">
              We found <span className="text-foreground font-semibold">4 optimization opportunities</span> in your expenses.
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold stat-number text-success">{totalPotentialSavings}</p>
            <p className="text-xs text-muted-foreground">Potential savings identified</p>
          </div>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-up delay-100">
        {insightCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card-hover group">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `color-mix(in oklch, ${card.color} 12%, transparent)` }}
                >
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-sm font-bold text-foreground">{card.title}</p>
                    <span className={`badge ${severityColor[card.severity]}`}>
                      {card.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <DollarSign size={13} className="text-success" />
                    <span className="text-sm font-semibold text-success">Save up to {card.saving}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-up delay-200">
        {/* Recurring Expense by Category */}
        <div className="chart-card">
          <p className="chart-card-title">Recurring Expense by Category</p>
          <p className="chart-card-subtitle">Monthly subscription breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryExpenseData} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={88} />
              <Tooltip
                formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Monthly"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }}
              />
              <Bar dataKey="amount" fill="var(--chart-1)" opacity={0.80} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Flagged Subscriptions Table */}
        <div className="chart-card">
          <p className="chart-card-title">Flagged Subscriptions & Tools</p>
          <p className="chart-card-subtitle">Candidates for optimization</p>
          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {recurringExpenses.map((exp, i) => (
                  <tr key={i}>
                    <td className="font-medium">{exp.vendor}</td>
                    <td><span className="badge badge-secondary">{exp.category}</span></td>
                    <td className="font-semibold stat-number">₹{exp.amount.toLocaleString("en-IN")}</td>
                    <td className="text-muted-foreground text-xs">{exp.type}</td>
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
