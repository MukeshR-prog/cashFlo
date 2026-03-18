"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, ArrowUpRight, Plus, Filter, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

const STATUS_TABS = ["All", "Draft", "Sent", "Viewed", "Due Soon", "Overdue", "Partial", "Paid"] as const;
type Status = typeof STATUS_TABS[number];

interface InvoiceRow {
  id: string;
  clientId: string;
  clientName?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: "draft" | "sent" | "due" | "overdue" | "partially_paid" | "paid";
  notes?: string;
}

const labelToApiStatus: Record<Exclude<Status, "All" | "Viewed" | "Due Soon" | "Partial">, InvoiceRow["status"]> = {
  Draft: "draft",
  Sent: "sent",
  Overdue: "overdue",
  Paid: "paid",
};

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
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async (status?: string) => {
    setLoading(true);
    try {
      const query = status ? `?status=${encodeURIComponent(status)}` : "";
      const res = await fetch(`/api/invoices${query}`, { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to load invoices" }));
        toast.error("Could not load invoices", err.error ?? "Please try again.");
        setInvoices([]);
        return;
      }
      const data = await res.json();
      setInvoices(data.invoices ?? []);
    } catch {
      toast.error("Network error", "Could not reach the server.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const mappedStatus = labelToApiStatus[activeTab as Exclude<Status, "All" | "Viewed" | "Due Soon" | "Partial">];
    void fetchInvoices(activeTab === "All" || !mappedStatus ? undefined : mappedStatus);
  }, [activeTab]);

  const filtered = useMemo(
    () =>
      invoices.filter((inv) => {
        if (activeTab === "All") return true;
        if (activeTab === "Viewed") return inv.status === "sent";
        if (activeTab === "Due Soon") return inv.status === "due";
        if (activeTab === "Partial") return inv.status === "partially_paid";
        if (activeTab === "Draft") return inv.status === "draft";
        if (activeTab === "Sent") return inv.status === "sent";
        if (activeTab === "Overdue") return inv.status === "overdue";
        if (activeTab === "Paid") return inv.status === "paid";
        return true;
      }),
    [invoices, activeTab]
  );

  const selected = filtered.find((inv) => inv.id === selectedInvoiceId) ?? filtered[0] ?? null;

  const handleExport = async () => {
    try {
      const res = await fetch("/api/freelancer/export?type=invoices&format=csv", { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        toast.error("Export failed", err.error ?? "Please try again.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoices.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export ready", "Invoices CSV downloaded.");
    } catch {
      toast.error("Network error", "Could not reach the server.");
    }
  };

  const summary = {
    total: invoices.length,
    unpaid: invoices.filter((i) => ["sent", "due", "partially_paid"].includes(i.status)).length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    paid: invoices.filter((i) => i.status === "paid").length,
  };

  const toDisplayStatus = (status: InvoiceRow["status"]) => {
    if (status === "partially_paid") return "Partial";
    if (status === "due") return "Due Soon";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const fmtDate = (iso: string) => new Date(iso).toISOString().split("T")[0];

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
          <button className="btn btn-outline btn-sm gap-1.5" onClick={handleExport}>
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
            {loading ? (
              <tr><td colSpan={12} className="text-center py-8 text-sm text-muted-foreground">Loading invoices...</td></tr>
            ) : filtered.map((inv) => (
              <tr key={inv.id} className={selected?.id === inv.id ? "bg-primary/5" : ""}>
                <td className="font-semibold text-primary">{inv.invoiceNumber}</td>
                <td className="font-medium text-foreground">{inv.clientName ?? "Unknown"}</td>
                <td className="stat-number font-semibold">{fmtAmount(inv.totalAmount)}</td>
                <td className="text-muted-foreground text-xs">{fmtDate(inv.dueDate)}</td>
                <td>
                  <span className={`badge ${statusStyle[toDisplayStatus(inv.status)]}`}>{toDisplayStatus(inv.status)}</span>
                </td>
                <td className="text-xs text-muted-foreground">{fmtDate(inv.issueDate)}</td>
                <td className="text-xs text-muted-foreground">{inv.amountPaid > 0 ? "Received" : "—"}</td>
                <td className="text-xs text-muted-foreground">{fmtDate(inv.issueDate)}</td>
                <td className="text-xs text-muted-foreground">{fmtDate(inv.issueDate)}</td>
                <td className="stat-number text-success">{inv.amountPaid > 0 ? fmtAmount(inv.amountPaid) : "—"}</td>
                <td className="stat-number text-foreground">
                  {inv.amountDue > 0 ? fmtAmount(inv.amountDue) : "—"}
                </td>
                <td>
                  <button className="text-xs text-primary hover:underline flex items-center gap-0.5" onClick={() => setSelectedInvoiceId(inv.id)}>
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

      {selected && (
        <div className="chart-card animate-fade-up delay-200">
          <p className="chart-card-title">Selected Invoice</p>
          <p className="chart-card-subtitle">Details update when you choose a different row</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Invoice</p>
              <p className="font-semibold text-foreground">{selected.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="font-semibold text-foreground">{selected.clientName ?? "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-semibold text-foreground">{toDisplayStatus(selected.status)}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
