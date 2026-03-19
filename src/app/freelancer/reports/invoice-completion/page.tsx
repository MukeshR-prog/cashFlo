"use client";

import { useEffect, useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface CompletionRecord {
  id: string; client: string; amount: number;
  created: string; sent: string; reminders: number;
  firstPayment: string; settled: string;
  daysToClose: number | null; status: string;
}

export default function InvoiceCompletionPage() {
  const [records, setRecords] = useState<CompletionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reports/data", { cache: "no-store", credentials: "include" });
        const json = await res.json();
        if (!res.ok) { toast.error("Error", json.error ?? "Failed to load."); return; }
        setRecords(json.completionRecords ?? []);
      } catch { toast.error("Network error", "Could not reach the server."); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  const completedRecords = records.filter((r) => r.daysToClose !== null);
  const avgDaysToClose = completedRecords.length > 0
    ? (completedRecords.reduce((s, r) => s + (r.daysToClose ?? 0), 0) / completedRecords.length).toFixed(1)
    : "—";
  const completionRate = records.length > 0
    ? Math.round((records.filter((r) => r.status === "Complete").length / records.length) * 100)
    : 0;
  const revenueCollected = records.filter((r) => r.status === "Complete").reduce((s, r) => s + r.amount, 0);

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

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading completion data...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1">Avg Days to Close</p>
              <p className="kpi-value text-xl">{avgDaysToClose}{typeof avgDaysToClose === "string" && avgDaysToClose !== "—" ? "d" : avgDaysToClose !== "—" ? "d" : ""}</p>
            </div>
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1">Completion Rate</p>
              <p className="kpi-value text-xl text-success">{completionRate}%</p>
            </div>
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1">Revenue Closed</p>
              <p className="kpi-value text-xl text-primary">₹{revenueCollected.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="chart-card overflow-x-auto">
            <p className="chart-card-title mb-4">Invoice Lifecycle Completion Report</p>
            {records.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No invoices found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice</th><th>Client</th><th>Amount</th><th>Created</th>
                    <th>Sent</th><th>Reminders</th><th>First Payment</th>
                    <th>Settled</th><th>Days to Close</th><th>Status</th>
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
                        <span className={`badge ${r.status === "Complete" ? "badge-success" : r.status === "Overdue" ? "badge-danger" : "badge-warning"}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
