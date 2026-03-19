"use client";

import { useEffect, useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface LifecycleRecord {
  id: string; client: string; amount: number;
  created: string; sent: string; reminders: number;
  payments: string; settled: string; status: string;
}

export default function InvoiceReportsPage() {
  const [records, setRecords] = useState<LifecycleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reports/data", { cache: "no-store", credentials: "include" });
        const json = await res.json();
        if (!res.ok) { toast.error("Error", json.error ?? "Failed to load."); return; }
        setRecords(json.invoiceLifecycle ?? []);
      } catch { toast.error("Network error", "Could not reach the server."); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

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

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading invoice reports...</span>
        </div>
      ) : (
        <div className="chart-card overflow-x-auto">
          <p className="chart-card-title mb-4">Invoice Lifecycle Report</p>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No invoices found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th><th>Client</th><th>Amount</th><th>Created</th>
                  <th>Sent</th><th>Reminders</th><th>Payments</th><th>Settled</th><th>Status</th>
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
                    <td><span className={`badge ${r.status === "Paid" ? "badge-success" : r.status === "Overdue" ? "badge-danger" : "badge-warning"}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
