"use client";

import { useState } from "react";
import { Search, ArrowUpRight, Phone, Mail } from "lucide-react";
import Link from "next/link";

const clients = [
  { id: "CLT-001", name: "Nexus Labs", email: "billing@nexuslabs.io", phone: "+91 98765 43210", totalBilled: 42000, totalPaid: 42000, pending: 0, invoices: 3, lastInvoice: "2026-03-01" },
  { id: "CLT-002", name: "Pixel Studio", email: "accounts@pixelstudio.com", phone: "+91 87654 32109", totalBilled: 28000, totalPaid: 0, pending: 28000, invoices: 1, lastInvoice: "2026-03-10" },
  { id: "CLT-003", name: "CodeBase Inc.", email: "finance@codebase.in", phone: "+91 76543 21098", totalBilled: 15500, totalPaid: 0, pending: 15500, invoices: 2, lastInvoice: "2026-03-08" },
  { id: "CLT-004", name: "Arjun Dev", email: "arjun@devcraft.io", phone: "+91 65432 10987", totalBilled: 9200, totalPaid: 5000, pending: 4200, invoices: 1, lastInvoice: "2026-03-05" },
  { id: "CLT-005", name: "TrueVen Co.", email: "pay@trueven.co", phone: "+91 54321 09876", totalBilled: 18500, totalPaid: 0, pending: 18500, invoices: 2, lastInvoice: "2026-02-22" },
  { id: "CLT-006", name: "BuildZen", email: "cc@buildzen.in", phone: "+91 43210 98765", totalBilled: 33000, totalPaid: 33000, pending: 0, invoices: 2, lastInvoice: "2026-02-01" },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/clients", label: "All Clients" },
          { href: "/freelancer/clients/behavior", label: "Payment Behavior" },
          { href: "/freelancer/clients/reliability", label: "Reliability Insights" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/clients" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 max-w-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients..."
            className="field-input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Clients", value: clients.length, color: "text-foreground" },
          { label: "Total Billed", value: `₹${(clients.reduce((s, c) => s + c.totalBilled, 0) / 1000).toFixed(0)}K`, color: "text-foreground" },
          { label: "Collected", value: `₹${(clients.reduce((s, c) => s + c.totalPaid, 0) / 1000).toFixed(0)}K`, color: "text-success" },
          { label: "Outstanding", value: `₹${(clients.reduce((s, c) => s + c.pending, 0) / 1000).toFixed(0)}K`, color: "text-warning-foreground" },
        ].map((s) => (
          <div key={s.label} className="kpi-card py-3 px-4">
            <p className="kpi-label mb-1">{s.label}</p>
            <p className={`text-2xl font-bold stat-number ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((client, i) => (
          <div
            key={client.id}
            className="card-hover group animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              {client.pending === 0 ? (
                <span className="badge badge-success text-[10px]">All Paid</span>
              ) : client.totalPaid === 0 ? (
                <span className="badge badge-danger text-[10px]">Unpaid</span>
              ) : (
                <span className="badge badge-warning text-[10px]">Partial</span>
              )}
            </div>

            <p className="text-base font-bold text-foreground mb-0.5">{client.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
              <Mail size={10} /> {client.email}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
              <Phone size={10} /> {client.phone}
            </p>

            <div className="grid grid-cols-3 gap-2 text-center border-t border-border pt-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Billed</p>
                <p className="text-sm font-bold stat-number text-foreground">₹{(client.totalBilled / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Paid</p>
                <p className="text-sm font-bold stat-number text-success">₹{(client.totalPaid / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Pending</p>
                <p className={`text-sm font-bold stat-number ${client.pending > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {client.pending > 0 ? `₹${(client.pending / 1000).toFixed(0)}K` : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">{client.invoices} invoices</p>
              <Link href={`/freelancer/clients/${client.id}`} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Profile <ArrowUpRight size={11} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
