"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";

const settlements = [
  { id: "INV-021", client: "Nexus Labs", amount: 42000, settlementDate: "2026-03-15", source: "Bank + UPI", notes: "Full payment via 2 installments." },
  { id: "INV-017", client: "BuildZen", amount: 33000, settlementDate: "2026-02-20", source: "PayPal", notes: "Single payment." },
  { id: "INV-014", client: "Synapse Media", amount: 8500, settlementDate: "2026-02-10", source: "UPI", notes: "Paid on time." },
];

export default function SettlementsPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/payments", label: "Payment Records" },
          { href: "/freelancer/payments/partial", label: "Partial Payments" },
          { href: "/freelancer/payments/settlements", label: "Settlements" },
          { href: "/freelancer/payments/acknowledgements", label: "Acknowledgements" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/payments/settlements" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Total Settled</p>
          <p className="kpi-value text-xl text-success">₹83,500</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Invoices Closed</p>
          <p className="kpi-value text-xl">3</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Avg Settlement</p>
          <p className="kpi-value text-xl">₹27,833</p>
        </div>
      </div>

      <div className="chart-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Settlement Date</th>
              <th>Source</th>
              <th>Notes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((s) => (
              <tr key={s.id}>
                <td className="font-semibold text-primary">{s.id}</td>
                <td>{s.client}</td>
                <td className="stat-number font-bold text-success">₹{s.amount.toLocaleString("en-IN")}</td>
                <td className="text-xs text-muted-foreground">{s.settlementDate}</td>
                <td><span className="badge badge-secondary">{s.source}</span></td>
                <td className="text-xs text-muted-foreground max-w-[160px] truncate">{s.notes}</td>
                <td>
                  <span className="flex items-center gap-1 text-success text-xs font-semibold">
                    <CheckCircle size={12} /> Settled
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
