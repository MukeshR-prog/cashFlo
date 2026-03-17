"use client";

import { FileDown } from "lucide-react";
import Link from "next/link";

const records = [
  { id: "INV-021", client: "Nexus Labs", created: "2026-02-26", sent: "2026-02-28", reminders: 1, payments: "2026-03-14, 2026-03-15", settled: "2026-03-15", status: "Paid", amount: 42000 },
  { id: "INV-017", client: "BuildZen", created: "2026-01-25", sent: "2026-02-01", reminders: 0, payments: "2026-02-20", settled: "2026-02-20", status: "Paid", amount: 33000 },
  { id: "INV-020", client: "TrueVen Co.", created: "2026-02-20", sent: "2026-02-22", reminders: 2, payments: "—", settled: "—", status: "Overdue", amount: 18500 },
];

export default function InvoiceReportsPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/invoices", label: "All Invoices" },
          { href: "/freelancer/invoices/create", label: "Create" },
          { href: "/freelancer/invoices/drafts", label: "Drafts" },
          { href: "/freelancer/invoices/sent", label: "Sent & Due" },
          { href: "/freelancer/invoices/timeline", label: "Timeline" },
          { href: "/freelancer/invoices/reports", label: "Reports" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/invoices/reports" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-outline btn-sm gap-1.5"><FileDown size={14} /> CSV</button>
        <button className="btn btn-outline btn-sm gap-1.5"><FileDown size={14} /> PDF</button>
      </div>

      <div className="chart-card overflow-x-auto">
        <p className="chart-card-title mb-4">Invoice Lifecycle Report</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Created</th>
              <th>Sent</th>
              <th>Reminders</th>
              <th>Payments</th>
              <th>Settled</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td className="font-semibold text-primary">{r.id}</td>
                <td>{r.client}</td>
                <td className="stat-number font-semibold">₹{r.amount.toLocaleString("en-IN")}</td>
                <td className="text-xs text-muted-foreground">{r.created}</td>
                <td className="text-xs text-muted-foreground">{r.sent}</td>
                <td className="text-center">{r.reminders}</td>
                <td className="text-xs text-muted-foreground max-w-[120px] truncate">{r.payments}</td>
                <td className="text-xs text-muted-foreground">{r.settled}</td>
                <td><span className={`badge ${r.status === "Paid" ? "badge-success" : "badge-danger"}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
