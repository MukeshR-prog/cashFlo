"use client";

import { FileDown } from "lucide-react";
import Link from "next/link";

const records = [
  { id: "INV-021", client: "Nexus Labs", amount: 42000, created: "2026-02-26", sent: "2026-02-28", reminders: 1, firstPayment: "2026-03-14", settled: "2026-03-15", daysToClose: 17, status: "Complete" },
  { id: "INV-017", client: "BuildZen", amount: 33000, created: "2026-01-25", sent: "2026-02-01", reminders: 0, firstPayment: "2026-02-20", settled: "2026-02-20", daysToClose: 26, status: "Complete" },
  { id: "INV-014", client: "Synapse Media", amount: 8500, created: "2026-01-05", sent: "2026-01-08", reminders: 0, firstPayment: "2026-02-10", settled: "2026-02-10", daysToClose: 36, status: "Complete" },
  { id: "INV-020", client: "TrueVen Co.", amount: 18500, created: "2026-02-20", sent: "2026-02-22", reminders: 2, firstPayment: "—", settled: "—", daysToClose: null, status: "Overdue" },
];

export default function InvoiceCompletionPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/reports", label: "Monthly" },
          { href: "/freelancer/reports/annual", label: "Annual" },
          { href: "/freelancer/reports/tax", label: "Tax Summary" },
          { href: "/freelancer/reports/invoice-completion", label: "Invoice Completion" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/reports/invoice-completion" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn btn-outline btn-sm gap-1.5"><FileDown size={14} /> CSV</button>
        <button className="btn btn-outline btn-sm gap-1.5"><FileDown size={14} /> PDF</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Avg Days to Close</p>
          <p className="kpi-value text-xl">26.3d</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Completion Rate</p>
          <p className="kpi-value text-xl text-success">75%</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Revenue Closed</p>
          <p className="kpi-value text-xl text-primary">₹83,500</p>
        </div>
      </div>

      <div className="chart-card overflow-x-auto">
        <p className="chart-card-title mb-4">Invoice Lifecycle Completion Report</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Created</th>
              <th>Sent</th>
              <th>Reminders</th>
              <th>First Payment</th>
              <th>Settled</th>
              <th>Days to Close</th>
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
                <td className="text-xs text-muted-foreground">{r.firstPayment}</td>
                <td className="text-xs text-muted-foreground">{r.settled}</td>
                <td className="text-center">
                  {r.daysToClose ? (
                    <span className={`font-semibold ${r.daysToClose > 30 ? "text-warning-foreground" : "text-success"}`}>{r.daysToClose}d</span>
                  ) : "—"}
                </td>
                <td>
                  <span className={`badge ${r.status === "Complete" ? "badge-success" : "badge-danger"}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
