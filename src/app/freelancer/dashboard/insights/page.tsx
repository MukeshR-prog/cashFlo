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
    title: "Low-use Coworking Seat",
    description: "Your Guindy coworking add-on costs ₹4,200/mo but desk check-ins were only 3 this month.",
    saving: "₹4,200/mo",
    color: "var(--destructive)",
  },
  {
    severity: "medium",
    icon: RefreshCw,
    title: "Duplicate Communication Stack",
    description: "Google Workspace Meet and Zoom are both active for client calls. Consolidate to save monthly.",
    saving: "₹1,350/mo",
    color: "var(--warning)",
  },
  {
    severity: "medium",
    icon: TrendingDown,
    title: "Infra Spend Trending Up",
    description: "AWS Mumbai + CDN costs rose 28% in the last quarter compared to your baseline.",
    saving: "₹2,800 if capped",
    color: "var(--warning)",
  },
  {
    severity: "low",
    icon: Lightbulb,
    title: "Shift Annual Billing",
    description: "Moving Zoho Workplace and Canva Pro to annual plans reduces overall tooling cost.",
    saving: "₹9,600/yr",
    color: "var(--chart-1)",
  },
];

const recurringExpenses = [
  { vendor: "Zoho Workplace", category: "Software", amount: 2200, type: "Monthly" },
  { vendor: "Canva Pro", category: "Software", amount: 999, type: "Monthly" },
  { vendor: "AWS Mumbai", category: "Infrastructure", amount: 5100, type: "Monthly" },
  { vendor: "Airtel Xstream", category: "Communication", amount: 1599, type: "Monthly" },
  { vendor: "Google Workspace", category: "Communication", amount: 950, type: "Monthly" },
  { vendor: "Notion Team", category: "Tools", amount: 780, type: "Monthly" },
];

const categoryExpenseData = [
  { category: "Software", amount: 7190 },
  { category: "Infrastructure", amount: 5100 },
  { category: "Communication", amount: 2549 },
  { category: "Marketing", amount: 2100 },
  { category: "Tools", amount: 780 },
];

const severityColor: Record<string, string> = {
  high: "badge-danger",
  medium: "badge-warning",
  low: "badge-primary",
};

export default function FreelancerInsightsPage() {
  const totalPotentialSavings = "₹8,350/mo";

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
