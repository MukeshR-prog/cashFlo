"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const clientData = {
  "CLT-001": {
    id: "CLT-001",
    name: "Nexus Labs",
    email: "billing@nexuslabs.io",
    phone: "+91 98765 43210",
    notes: "Prefers invoices before 25th of each month.",
    terms: "15-day payment cycle, net banking preferred.",
    totalBilled: 42000,
    totalPaid: 42000,
    pending: 0,
    invoices: [
      { id: "INV-021", amount: 42000, status: "Paid", created: "2026-02-26" },
    ],
    payments: [
      { id: "PAY-031", invoice: "INV-021", amount: 20000, date: "2026-03-15", mode: "UPI" },
      { id: "PAY-030", invoice: "INV-021", amount: 22000, date: "2026-03-14", mode: "Bank" },
    ],
  },
  "CLT-002": {
    id: "CLT-002",
    name: "Pixel Studio",
    email: "accounts@pixelstudio.com",
    phone: "+91 87654 32109",
    notes: "Needs milestone breakdown in invoice line-items.",
    terms: "50% upfront on projects above ₹40K.",
    totalBilled: 28000,
    totalPaid: 0,
    pending: 28000,
    invoices: [
      { id: "INV-024", amount: 28000, status: "Sent", created: "2026-03-09" },
    ],
    payments: [],
  },
} as const;

type ClientKey = keyof typeof clientData;

function fmt(v: number) {
  return `₹${v.toLocaleString("en-IN")}`;
}

export default function ClientProfilePage() {
  const params = useParams<{ id: string }>();

  const client = useMemo(() => {
    const key = params.id?.toUpperCase() as ClientKey;
    return clientData[key] ?? null;
  }, [params.id]);

  if (!client) {
    return (
      <div className="card text-center py-12 animate-fade-up">
        <p className="text-base font-semibold text-foreground">Client not found</p>
        <p className="text-sm text-muted-foreground mt-1">Use a valid client id from the Clients page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/clients", label: "All Clients" },
          { href: "/freelancer/clients/behavior", label: "Payment Behavior" },
          { href: "/freelancer/clients/reliability", label: "Reliability Insights" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-muted text-muted-foreground hover:bg-muted/80">
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-foreground">{client.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{client.email} · {client.phone}</p>
          </div>
          <span className={`badge ${client.pending > 0 ? "badge-warning" : "badge-success"}`}>
            {client.pending > 0 ? "Outstanding" : "Clear"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="kpi-card py-3 px-4">
            <p className="kpi-label mb-1">Total Billed</p>
            <p className="kpi-value text-xl">{fmt(client.totalBilled)}</p>
          </div>
          <div className="kpi-card py-3 px-4">
            <p className="kpi-label mb-1">Total Paid</p>
            <p className="kpi-value text-xl text-success">{fmt(client.totalPaid)}</p>
          </div>
          <div className="kpi-card py-3 px-4">
            <p className="kpi-label mb-1">Outstanding</p>
            <p className="kpi-value text-xl text-warning-foreground">{fmt(client.pending)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-semibold text-foreground mb-1">Notes</p>
            <p className="text-muted-foreground">{client.notes}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-semibold text-foreground mb-1">Preferences / Terms</p>
            <p className="text-muted-foreground">{client.terms}</p>
          </div>
        </div>
      </div>

      <div className="chart-card overflow-x-auto">
        <p className="chart-card-title mb-3">Linked Invoices</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {client.invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="font-semibold text-primary">{inv.id}</td>
                <td className="stat-number font-semibold">{fmt(inv.amount)}</td>
                <td><span className={`badge ${inv.status === "Paid" ? "badge-success" : "badge-primary"}`}>{inv.status}</span></td>
                <td className="text-xs text-muted-foreground">{inv.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="chart-card overflow-x-auto">
        <p className="chart-card-title mb-3">Payment History</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>
            {client.payments.length > 0 ? (
              client.payments.map((p) => (
                <tr key={p.id}>
                  <td className="text-xs text-muted-foreground font-mono">{p.id}</td>
                  <td className="font-semibold text-primary">{p.invoice}</td>
                  <td className="stat-number text-success font-semibold">{fmt(p.amount)}</td>
                  <td className="text-xs text-muted-foreground">{p.date}</td>
                  <td><span className="badge badge-secondary">{p.mode}</span></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-sm text-muted-foreground py-6">No payments yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
