"use client";

import { useState } from "react";
import { FileText, ArrowUpRight, Plus, Filter, Download } from "lucide-react";
import Link from "next/link";

const STATUS_TABS = ["All", "Draft", "Sent", "Viewed", "Due Soon", "Overdue", "Partial", "Paid"] as const;
type Status = typeof STATUS_TABS[number];

const invoices = [
  { id: "INV-024", client: "Pixel Studio", amount: 28000, dueDate: "2026-03-25", status: "Sent", sentDate: "2026-03-10", paid: 0, paymentDate: "—", createdDate: "2026-03-09", updatedDate: "2026-03-10" },
  { id: "INV-023", client: "CodeBase Inc.", amount: 15500, dueDate: "2026-03-28", status: "Due Soon", sentDate: "2026-03-08", paid: 0, paymentDate: "—", createdDate: "2026-03-07", updatedDate: "2026-03-08" },
  { id: "INV-022", client: "Arjun Dev", amount: 9200, dueDate: "2026-03-30", status: "Partial", sentDate: "2026-03-05", paid: 5000, paymentDate: "2026-03-10", createdDate: "2026-03-03", updatedDate: "2026-03-10" },
  { id: "INV-021", client: "Nexus Labs", amount: 42000, dueDate: "2026-03-15", status: "Paid", sentDate: "2026-02-28", paid: 42000, paymentDate: "2026-03-15", createdDate: "2026-02-26", updatedDate: "2026-03-15" },
  { id: "INV-020", client: "TrueVen Co.", amount: 18500, dueDate: "2026-03-10", status: "Overdue", sentDate: "2026-02-22", paid: 0, paymentDate: "—", createdDate: "2026-02-20", updatedDate: "2026-03-12" },
  { id: "INV-019", client: "Nova Systems", amount: 7800, dueDate: "—", status: "Draft", sentDate: "—", paid: 0, paymentDate: "—", createdDate: "2026-03-14", updatedDate: "2026-03-16" },
  { id: "INV-018", client: "Riya Mehta", amount: 12000, dueDate: "2026-02-28", status: "Overdue", sentDate: "2026-02-10", paid: 0, paymentDate: "—", createdDate: "2026-02-08", updatedDate: "2026-03-06" },
  { id: "INV-017", client: "BuildZen", amount: 33000, dueDate: "2026-02-20", status: "Paid", sentDate: "2026-02-01", paid: 33000, paymentDate: "2026-02-20", createdDate: "2026-01-25", updatedDate: "2026-02-20" },
  { id: "INV-016", client: "Synapse Media", amount: 5500, dueDate: "—", status: "Viewed", sentDate: "2026-03-01", paid: 0, paymentDate: "—", createdDate: "2026-02-27", updatedDate: "2026-03-02" },
];

const statusStyle: Record<string, string> = {
  Draft: "badge-neutral",
  Sent: "badge-primary",
  "Due Soon": "badge-warning",
  Overdue: "badge-danger",
  Partial: "badge-accent",
  Paid: "badge-success",
  Viewed: "badge-secondary",
};

function fmtAmount(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function FreelancerInvoicesPage() {
  const [activeTab, setActiveTab] = useState<Status>("All");

  const filtered = activeTab === "All"
    ? invoices
    : invoices.filter((inv) => inv.status === activeTab);

  const summary = {
    total: invoices.length,
    unpaid: invoices.filter((i) => ["Sent", "Due Soon", "Partial"].includes(i.status)).length,
    overdue: invoices.filter((i) => i.status === "Overdue").length,
    paid: invoices.filter((i) => i.status === "Paid").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5 flex-wrap animate-fade-up">
        {[
          { href: "/freelancer/invoices", label: "All Invoices" },
          { href: "/freelancer/invoices/create", label: "Create" },
          { href: "/freelancer/invoices/drafts", label: "Drafts" },
          { href: "/freelancer/invoices/sent", label: "Sent & Due" },
          { href: "/freelancer/invoices/timeline", label: "Timeline" },
          { href: "/freelancer/invoices/reports", label: "Reports" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/invoices" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between animate-fade-up">
        <div />
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm gap-1.5">
            <Download size={14} /> Export
          </button>
          <Link href="/freelancer/invoices/create" className="btn btn-primary btn-sm gap-1.5">
            <Plus size={14} /> New Invoice
          </Link>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up delay-75">
        {[
          { label: "Total Invoices", value: summary.total, color: "text-foreground" },
          { label: "Unpaid", value: summary.unpaid, color: "text-warning-foreground" },
          { label: "Overdue", value: summary.overdue, color: "text-destructive" },
          { label: "Paid", value: summary.paid, color: "text-success" },
        ].map((s) => (
          <div key={s.label} className="kpi-card py-3 px-4">
            <p className="kpi-label mb-1">{s.label}</p>
            <p className={`text-2xl font-bold stat-number ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 flex-wrap animate-fade-up delay-100">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="chart-card animate-fade-up delay-150 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Sent Date</th>
              <th>Payment Date</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td className="font-semibold text-primary">{inv.id}</td>
                <td className="font-medium text-foreground">{inv.client}</td>
                <td className="stat-number font-semibold">{fmtAmount(inv.amount)}</td>
                <td className="text-muted-foreground text-xs">{inv.dueDate}</td>
                <td>
                  <span className={`badge ${statusStyle[inv.status]}`}>{inv.status}</span>
                </td>
                <td className="text-xs text-muted-foreground">{inv.sentDate}</td>
                <td className="text-xs text-muted-foreground">{inv.paymentDate}</td>
                <td className="text-xs text-muted-foreground">{inv.createdDate}</td>
                <td className="text-xs text-muted-foreground">{inv.updatedDate}</td>
                <td className="stat-number text-success">{inv.paid > 0 ? fmtAmount(inv.paid) : "—"}</td>
                <td className="stat-number text-foreground">
                  {inv.amount - inv.paid > 0 ? fmtAmount(inv.amount - inv.paid) : "—"}
                </td>
                <td>
                  <button className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    View <ArrowUpRight size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText size={32} className="text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No invoices in this category</p>
          </div>
        )}
      </div>

    </div>
  );
}
