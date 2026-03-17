"use client";

import { CheckCircle, Edit3, FileDown, Send, Eye, DollarSign, Bell } from "lucide-react";
import Link from "next/link";

const events = [
  { invoiceId: "INV-021", events: [
    { ts: "2026-03-15 14:22", action: "Fully Paid", actor: "System", icon: CheckCircle, color: "var(--success)" },
    { ts: "2026-03-14 09:10", action: "Partial payment ₹22,000 received", actor: "System", icon: DollarSign, color: "var(--chart-3)" },
    { ts: "2026-03-10 11:30", action: "Reminder sent", actor: "Iteryx System", icon: Bell, color: "var(--warning)" },
    { ts: "2026-03-01 10:00", action: "Invoice viewed by client", actor: "Nexus Labs", icon: Eye, color: "var(--chart-2)" },
    { ts: "2026-02-28 16:45", action: "Invoice sent", actor: "You", icon: Send, color: "var(--chart-1)" },
    { ts: "2026-02-28 09:12", action: "PDF generated", actor: "You", icon: FileDown, color: "var(--muted-foreground)" },
    { ts: "2026-02-27 18:30", action: "Invoice edited", actor: "You", icon: Edit3, color: "var(--muted-foreground)" },
    { ts: "2026-02-26 14:00", action: "Invoice created", actor: "You", icon: Edit3, color: "var(--primary)" },
  ]}
];

export default function InvoiceTimelinePage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/invoices", label: "All Invoices" },
          { href: "/freelancer/invoices/create", label: "Create" },
          { href: "/freelancer/invoices/drafts", label: "Drafts" },
          { href: "/freelancer/invoices/sent", label: "Sent & Due" },
          { href: "/freelancer/invoices/timeline", label: "Timeline" },
          { href: "/freelancer/invoices/reports", label: "Reports" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/invoices/timeline" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div>
        <label className="field-label">Select Invoice</label>
        <select className="field-input max-w-xs">
          <option>INV-021 — Nexus Labs</option>
          <option>INV-022 — Arjun Dev</option>
          <option>INV-020 — TrueVen Co.</option>
        </select>
      </div>

      {events.map((inv) => (
        <div key={inv.invoiceId} className="chart-card">
          <div className="flex items-center gap-2 mb-6">
            <p className="text-sm font-bold text-foreground">{inv.invoiceId} — Event Timeline</p>
            <span className="badge badge-success">Complete</span>
          </div>

          {/* Timeline */}
          <div className="relative space-y-0">
            {inv.events.map((ev, i) => {
              const Icon = ev.icon;
              const isLast = i === inv.events.length - 1;
              return (
                <div key={i} className="flex gap-4">
                  {/* Line + Icon */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `color-mix(in oklch, ${ev.color} 15%, transparent)` }}
                    >
                      <Icon size={14} style={{ color: ev.color }} />
                    </div>
                    {!isLast && (
                      <div className="flex-1 w-px bg-border my-1" style={{ minHeight: 24 }} />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`pb-4 flex-1 ${isLast ? "" : ""}`}>
                    <p className="text-sm font-semibold text-foreground">{ev.action}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>{ev.ts}</span>
                      <span>·</span>
                      <span>{ev.actor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
