"use client";

import { Lightbulb, AlertTriangle, Bell, TrendingDown } from "lucide-react";
import Link from "next/link";

const riskClients = [
  { name: "TrueVen Co.", risk: "High", reminders: 3, overdue: 2, suggestion: "Require partial upfront payment on future invoices. Set aggressive 3-day reminder cadence." },
  { name: "CodeBase Inc.", risk: "Medium", reminders: 2, overdue: 1, suggestion: "Send reminder on Day 7 post-due. Consider 1% late fee policy." },
  { name: "Arjun Dev", risk: "Medium", reminders: 2, overdue: 1, suggestion: "Switch to milestone-based billing to reduce exposure." },
];

const insightCards = [
  { icon: Bell, title: "Reminder Pattern: TrueVen Co.", body: "Send reminders on Day 1, Day 7, and Day 14. Escalate to personal call after Day 14.", severity: "high", color: "var(--destructive)" },
  { icon: TrendingDown, title: "Consider Upfront Deposits", body: "For clients with 1+ overdue invoice, require 30% upfront before starting work.", severity: "medium", color: "var(--warning)" },
  { icon: Lightbulb, title: "Reliable Clients: Offer Early Pay Discount", body: "Nexus Labs and BuildZen always pay on time. Offer 2% early payment discount to encourage the behavior.", severity: "low", color: "var(--success)" },
];

const reliabilityBadge: Record<string, string> = {
  High: "badge-danger",
  Medium: "badge-warning",
  Low: "badge-success",
};

export default function ClientReliabilityPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/clients", label: "All Clients" },
          { href: "/freelancer/clients/behavior", label: "Payment Behavior" },
          { href: "/freelancer/clients/reliability", label: "Reliability Insights" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/clients/reliability" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insightCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="card-hover group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
                   style={{ background: `color-mix(in oklch, ${c.color} 12%, transparent)` }}>
                <Icon size={17} style={{ color: c.color }} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-bold text-foreground">{c.title}</p>
                <span className={`badge ${reliabilityBadge[c.severity === "high" ? "High" : c.severity === "medium" ? "Medium" : "Low"]}`}>
                  {c.severity}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          );
        })}
      </div>

      {/* Risk Table */}
      <div className="chart-card">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-warning-foreground" />
          <p className="chart-card-title">Client Risk Assessment</p>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Risk Level</th>
              <th>Reminders Sent</th>
              <th>Overdue Count</th>
              <th>Suggested Action</th>
            </tr>
          </thead>
          <tbody>
            {riskClients.map((c) => (
              <tr key={c.name}>
                <td className="font-semibold">{c.name}</td>
                <td><span className={`badge ${reliabilityBadge[c.risk]}`}>{c.risk}</span></td>
                <td>{c.reminders}</td>
                <td className="text-destructive font-semibold">{c.overdue}</td>
                <td className="text-xs text-muted-foreground max-w-[240px]">{c.suggestion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
