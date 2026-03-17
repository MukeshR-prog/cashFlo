"use client";

import { useState } from "react";
import { Mail, MessageSquare, Eye } from "lucide-react";
import Link from "next/link";

const logs = [
  { id: "ACK-008", invoice: "INV-021", client: "Nexus Labs", amount: 42000, date: "2026-03-15", channel: "Email", status: "Delivered", message: "Payment received for INV-021. Thank you for your prompt payment!" },
  { id: "ACK-007", invoice: "INV-017", client: "BuildZen", amount: 33000, date: "2026-02-20", channel: "WhatsApp", status: "Delivered", message: "Hi BuildZen team! We have received your payment of ₹33,000 for INV-017. Receipt attached." },
  { id: "ACK-006", invoice: "INV-014", client: "Synapse Media", amount: 8500, date: "2026-02-10", channel: "Email", status: "Delivered", message: "Payment of ₹8,500 for INV-014 acknowledged. Receipt will follow shortly." },
];

export default function AcknowledgementsPage() {
  const [preview, setPreview] = useState<(typeof logs)[0] | null>(null);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/payments", label: "Payment Records" },
          { href: "/freelancer/payments/partial", label: "Partial Payments" },
          { href: "/freelancer/payments/settlements", label: "Settlements" },
          { href: "/freelancer/payments/acknowledgements", label: "Acknowledgements" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/payments/acknowledgements" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="chart-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>ACK ID</th>
              <th>Invoice</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((ack) => (
              <tr key={ack.id}>
                <td className="text-xs text-muted-foreground font-mono">{ack.id}</td>
                <td className="text-primary font-semibold">{ack.invoice}</td>
                <td>{ack.client}</td>
                <td className="stat-number text-success font-semibold">₹{ack.amount.toLocaleString("en-IN")}</td>
                <td className="text-xs text-muted-foreground">{ack.date}</td>
                <td>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {ack.channel === "Email" ? <Mail size={12} /> : <MessageSquare size={12} />}
                    {ack.channel}
                  </span>
                </td>
                <td><span className="badge badge-success">{ack.status}</span></td>
                <td>
                  <button onClick={() => setPreview(ack)} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    <Eye size={12} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview Drawer */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-scale-in space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">Acknowledgement Preview</p>
              <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground transition-colors text-xs">Close</button>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><span className="text-foreground font-semibold">To:</span> {preview.client}</p>
              <p><span className="text-foreground font-semibold">Channel:</span> {preview.channel}</p>
              <p><span className="text-foreground font-semibold">Sent:</span> {preview.date}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-foreground border border-border">
              {preview.message}
            </div>
            <span className="badge badge-success w-fit">{preview.status}</span>
          </div>
        </div>
      )}
    </div>
  );
}
