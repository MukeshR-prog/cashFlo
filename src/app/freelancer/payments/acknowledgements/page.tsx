"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, MessageSquare, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface ReminderRow {
  id: string;
  invoiceId: string;
  type: string;
  context: string;
  status: "pending" | "sent" | "failed";
  sentAt: string | null;
  createdAt: string;
}

interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amountPaid: number;
}

export default function AcknowledgementsPage() {
  const [logs, setLogs] = useState<ReminderRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<ReminderRow | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [remRes, invRes] = await Promise.all([
          fetch("/api/reminders", { cache: "no-store", credentials: "include" }),
          fetch("/api/invoices", { cache: "no-store", credentials: "include" }),
        ]);
        const remJson = await remRes.json().catch(() => ({}));
        const invJson = await invRes.json().catch(() => ({}));
        if (!remRes.ok) toast.error("Could not load acknowledgements", remJson.error ?? "Please try again.");
        if (!invRes.ok) toast.error("Could not load invoices", invJson.error ?? "Please try again.");
        const reminders = (remJson.reminders ?? []) as ReminderRow[];
        setLogs(reminders.filter((r) => r.status === "sent"));
        setInvoices(invJson.invoices ?? []);
      } catch {
        toast.error("Network error", "Could not load acknowledgement history.");
        setLogs([]);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const invoiceById = useMemo(() => {
    const map = new Map<string, InvoiceRow>();
    for (const i of invoices) map.set(i.id, i);
    return map;
  }, [invoices]);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/payments", label: "Payment Records" },
          { href: "/freelancer/payments/upload", label: "Upload Statement" },
          { href: "/freelancer/payments/transactions", label: "Transactions" },
          { href: "/freelancer/payments/reminders", label: "Reminders" },
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
            {loading ? (
              <tr><td colSpan={8} className="text-center text-sm text-muted-foreground py-8">Loading acknowledgements...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-sm text-muted-foreground py-8">No acknowledgement messages sent yet.</td></tr>
            ) : logs.map((ack) => {
              const invoice = invoiceById.get(ack.invoiceId);
              const invoiceNumber = invoice?.invoiceNumber ?? ack.invoiceId.slice(-6);
              const clientName = invoice?.clientName ?? "Client";
              const amount = invoice?.amountPaid ?? 0;
              const date = ack.sentAt ? new Date(ack.sentAt).toISOString().slice(0, 10) : new Date(ack.createdAt).toISOString().slice(0, 10);
              const channel = ack.type === "email" ? "Email" : ack.type;
              return (
              <tr key={ack.id}>
                <td className="text-xs text-muted-foreground font-mono">{ack.id.slice(-8)}</td>
                <td className="text-primary font-semibold">{invoiceNumber}</td>
                <td>{clientName}</td>
                <td className="stat-number text-success font-semibold">₹{amount.toLocaleString("en-IN")}</td>
                <td className="text-xs text-muted-foreground">{date}</td>
                <td>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {channel === "Email" ? <Mail size={12} /> : <MessageSquare size={12} />}
                    {channel}
                  </span>
                </td>
                <td><span className="badge badge-success">Delivered</span></td>
                <td>
                  <button onClick={() => setPreview(ack)} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    <Eye size={12} /> View
                  </button>
                </td>
              </tr>
              );
            })}
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
              <p><span className="text-foreground font-semibold">To:</span> {invoiceById.get(preview.invoiceId)?.clientName ?? "Client"}</p>
              <p><span className="text-foreground font-semibold">Channel:</span> {preview.type}</p>
              <p><span className="text-foreground font-semibold">Sent:</span> {(preview.sentAt ? new Date(preview.sentAt) : new Date(preview.createdAt)).toISOString().slice(0, 16).replace("T", " ")}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-foreground border border-border">
              {`Reminder sent for invoice ${invoiceById.get(preview.invoiceId)?.invoiceNumber ?? preview.invoiceId}. Context: ${preview.context}.`}
            </div>
            <span className="badge badge-success w-fit">Delivered</span>
          </div>
        </div>
      )}
    </div>
  );
}
