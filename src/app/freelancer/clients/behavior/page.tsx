"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
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
  Good: "badge-success",
  Late: "badge-warning",
  Risk: "badge-danger",
};

const reliabilityIcon: Record<string, typeof CheckCircle> = {
  Good: CheckCircle,
  Late: Clock,
  Risk: AlertTriangle,
};

export default function ClientBehaviorPage() {
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

  const avgDelayData = clients.map((c) => ({ name: c.name.split(" ")[0], delay: c.avgDelay }));

  const good = clients.filter((c) => c.reliability === "Good").length;
  const late = clients.filter((c) => c.reliability === "Late").length;
  const risk = clients.filter((c) => c.reliability === "Risk").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/clients", label: "All Clients" },
          { href: "/freelancer/clients/behavior", label: "Payment Behavior" },
          { href: "/freelancer/clients/reliability", label: "Reliability Insights" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/clients/behavior" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Computing client behavior...</span>
        </div>
      ) : clients.length === 0 ? (
        <div className="chart-card text-center py-12">
          <p className="text-sm text-muted-foreground">No client data available yet. Create invoices and record payments to see behavior analytics.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1">Good Payers</p>
              <p className="kpi-value text-xl text-success">{good}</p>
            </div>
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1">Late Payers</p>
              <p className="kpi-value text-xl text-warning-foreground">{late}</p>
            </div>
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1">At Risk</p>
              <p className="kpi-value text-xl text-destructive">{risk}</p>
            </div>
          </div>

          {/* Bar Chart: Avg Delay */}
          {avgDelayData.length > 0 && (
            <div className="chart-card">
              <p className="chart-card-title">Average Payment Delay by Client</p>
              <p className="chart-card-subtitle">Days past due date · lower is better</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={avgDelayData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} unit="d" width={32} />
                  <Tooltip
                    formatter={(v) => [`${v} days`, "Avg Delay"]}
                    contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }}
                  />
                  <Bar dataKey="delay" fill="var(--chart-1)" opacity={0.8} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Client Reliability Table */}
          <div className="chart-card">
            <p className="chart-card-title mb-4">Client Reliability Summary</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Avg Delay</th>
                  <th>Reminders Sent</th>
                  <th>Overdue Instances</th>
                  <th>On-Time Payments</th>
                  <th>Reliability</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const Icon = reliabilityIcon[c.reliability];
                  return (
                    <tr key={c.clientId}>
                      <td className="font-semibold">{c.name}</td>
                      <td>{c.avgDelay === 0 ? "On time" : `${c.avgDelay} days`}</td>
                      <td>{c.reminderCount}</td>
                      <td>{c.overdueCount}</td>
                      <td className="text-success font-semibold">{c.onTimePayments}</td>
                      <td>
                        <span className={`badge ${reliabilityBadge[c.reliability]} flex items-center gap-1 w-fit`}>
                          <Icon size={10} />
                          {c.reliability} payer
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
