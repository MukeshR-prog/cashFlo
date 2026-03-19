"use client";

import { useEffect, useState } from "react";
import { Lightbulb, AlertTriangle, Bell, TrendingDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface ClientData {
  clientId: string;
  name: string;
  avgDelay: number;
  overdueCount: number;
  reminderCount: number;
  onTimePayments: number;
  totalInvoices: number;
  totalPaid: number;
  reliability: "Good" | "Late" | "Risk";
}

const reliabilityBadge: Record<string, string> = {
  High: "badge-danger",
  Medium: "badge-warning",
  Low: "badge-success",
};

function generateInsights(clients: ClientData[]) {
  const insights: { icon: typeof Bell; title: string; body: string; severity: string; color: string }[] = [];

  const riskClients = clients.filter((c) => c.reliability === "Risk");
  const lateClients = clients.filter((c) => c.reliability === "Late");
  const goodClients = clients.filter((c) => c.reliability === "Good");

  if (riskClients.length > 0) {
    const top = riskClients[0];
    insights.push({
      icon: Bell,
      title: `Reminder Pattern: ${top.name}`,
      body: `${top.name} has ${top.reminderCount} reminders and ${top.overdueCount} overdue invoices. Send reminders on Day 1, Day 7, and Day 14. Escalate to personal call after Day 14.`,
      severity: "high",
      color: "var(--destructive)",
    });
  }

  if (lateClients.length > 0 || riskClients.length > 0) {
    insights.push({
      icon: TrendingDown,
      title: "Consider Upfront Deposits",
      body: `For ${lateClients.length + riskClients.length} client(s) with late/overdue payments, require 30% upfront before starting work.`,
      severity: "medium",
      color: "var(--warning)",
    });
  }

  if (goodClients.length > 0) {
    const names = goodClients.slice(0, 2).map((c) => c.name).join(" and ");
    insights.push({
      icon: Lightbulb,
      title: "Reliable Clients: Offer Early Pay Discount",
      body: `${names} ${goodClients.length > 2 ? `and ${goodClients.length - 2} more` : ""} always pay on time. Offer 2% early payment discount to encourage the behavior.`,
      severity: "low",
      color: "var(--success)",
    });
  }

  if (insights.length === 0) {
    insights.push({
      icon: Lightbulb,
      title: "No Risk Detected",
      body: "All your clients are paying on time. Keep up the great work!",
      severity: "low",
      color: "var(--success)",
    });
  }

  return insights;
}

export default function ClientReliabilityPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/clients/reliability", { cache: "no-store", credentials: "include" });
        const data = await res.json();
        if (!res.ok) {
          toast.error("Could not load data", data.error ?? "Please try again.");
          return;
        }
        setClients(data.clients ?? []);
      } catch {
        toast.error("Network error", "Could not reach the server.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const riskClients = clients.filter((c) => c.reliability === "Risk" || c.reliability === "Late");
  const insightCards = generateInsights(clients);

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

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Computing reliability insights...</span>
        </div>
      ) : (
        <>
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
            {riskClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No at-risk clients detected. All clients are paying reliably.</p>
            ) : (
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
                  {riskClients.map((c) => {
                    const risk = c.reliability === "Risk" ? "High" : "Medium";
                    const suggestion = c.reliability === "Risk"
                      ? "Require partial upfront payment on future invoices. Set aggressive 3-day reminder cadence."
                      : "Send reminder on Day 7 post-due. Consider 1% late fee policy.";
                    return (
                      <tr key={c.clientId}>
                        <td className="font-semibold">{c.name}</td>
                        <td><span className={`badge ${reliabilityBadge[risk]}`}>{risk}</span></td>
                        <td>{c.reminderCount}</td>
                        <td className="text-destructive font-semibold">{c.overdueCount}</td>
                        <td className="text-xs text-muted-foreground max-w-[240px]">{suggestion}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
