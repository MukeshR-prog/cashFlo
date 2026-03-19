"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BellRing, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  dueDate: string;
  amountDue: number;
  status: string;
}

interface ReminderItem {
  id: string;
  invoiceId: string;
  type: string;
  context: string;
  status: "pending" | "sent" | "failed";
  sentAt: string | null;
  createdAt: string;
}

export default function PaymentRemindersPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);
  const [runningAuto, setRunningAuto] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoiceRes, reminderRes] = await Promise.all([
        fetch("/api/invoices", { cache: "no-store", credentials: "include" }),
        fetch("/api/reminders", { cache: "no-store", credentials: "include" }),
      ]);

      const invoiceJson = await invoiceRes.json().catch(() => ({}));
      const reminderJson = await reminderRes.json().catch(() => ({}));

      if (!invoiceRes.ok) {
        toast.error("Could not load invoices", invoiceJson.error ?? "Please try again.");
      }
      if (!reminderRes.ok) {
        toast.error("Could not load reminders", reminderJson.error ?? "Please try again.");
      }

      const invoiceRows = (invoiceJson.invoices ?? []) as InvoiceItem[];
      setInvoices(invoiceRows);
      setReminders((reminderJson.reminders ?? []) as ReminderItem[]);
    } catch {
      toast.error("Network error", "Could not load reminder data.");
      setInvoices([]);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const candidates = useMemo(
    () => invoices.filter((i) => ["sent", "due", "overdue", "partially_paid"].includes(i.status) && i.amountDue > 0),
    [invoices]
  );

  const invoiceNoById = useMemo(() => {
    const map = new Map<string, string>();
    for (const i of invoices) map.set(i.id, i.invoiceNumber);
    return map;
  }, [invoices]);

  const sendManual = async (invoiceId: string) => {
    setSendingInvoiceId(invoiceId);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ invoiceId, type: "email" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error("Reminder failed", data.error ?? "Please try again.");
        return;
      }
      toast.success("Reminder sent", data.message ?? "Email reminder sent.");
      await loadData();
    } catch {
      toast.error("Network error", "Could not send reminder.");
    } finally {
      setSendingInvoiceId(null);
    }
  };

  const runAuto = async () => {
    setRunningAuto(true);
    try {
      const res = await fetch("/api/reminders/auto", { method: "POST", credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error("Auto reminders failed", data.error ?? "Please try again.");
        return;
      }
      toast.success("Auto reminders complete", `Sent: ${data.sent ?? 0}, Skipped: ${data.skipped ?? 0}, Failed: ${data.failed ?? 0}`);
      await loadData();
    } catch {
      toast.error("Network error", "Could not run auto reminders.");
    } finally {
      setRunningAuto(false);
    }
  };

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
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/payments/reminders" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="chart-card p-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BellRing size={15} className="text-primary" />
          <p className="text-sm font-semibold text-foreground">Reminder Operations</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => void loadData()}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={runAuto} disabled={runningAuto}>
            {runningAuto ? "Running..." : "Run Auto Reminders"}
          </button>
        </div>
      </div>

      <div className="chart-card overflow-x-auto">
        <p className="chart-card-title mb-3">Due / Overdue Invoices</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Due Date</th>
              <th>Amount Due</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-8">Loading invoices...</td></tr>
            ) : candidates.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-8">No due invoices pending reminders.</td></tr>
            ) : candidates.map((inv) => (
              <tr key={inv.id}>
                <td className="text-primary font-semibold">{inv.invoiceNumber}</td>
                <td>{inv.clientName || "Unknown"}</td>
                <td className="text-xs text-muted-foreground">{new Date(inv.dueDate).toISOString().slice(0, 10)}</td>
                <td className="stat-number text-warning-foreground">₹{inv.amountDue.toLocaleString("en-IN")}</td>
                <td><span className="badge badge-warning">{inv.status}</span></td>
                <td>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={sendingInvoiceId === inv.id}
                    onClick={() => void sendManual(inv.id)}
                  >
                    {sendingInvoiceId === inv.id ? "Sending..." : "Send Reminder"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="chart-card overflow-x-auto">
        <p className="chart-card-title mb-3">Reminder History</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Reminder ID</th>
              <th>Invoice</th>
              <th>Type</th>
              <th>Context</th>
              <th>Status</th>
              <th>Sent At</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-8">Loading reminders...</td></tr>
            ) : reminders.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-8">No reminders yet.</td></tr>
            ) : reminders.map((r) => (
              <tr key={r.id}>
                <td className="text-xs text-muted-foreground font-mono">{r.id.slice(-8)}</td>
                <td className="font-semibold text-primary">{invoiceNoById.get(r.invoiceId) ?? r.invoiceId.slice(-6)}</td>
                <td><span className="badge badge-secondary">{r.type}</span></td>
                <td><span className="badge badge-neutral">{r.context}</span></td>
                <td>
                  <span className={`badge ${r.status === "sent" ? "badge-success" : r.status === "failed" ? "badge-danger" : "badge-warning"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="text-xs text-muted-foreground">{r.sentAt ? new Date(r.sentAt).toISOString().slice(0, 16).replace("T", " ") : "--"}</td>
                <td className="text-xs text-muted-foreground">{new Date(r.createdAt).toISOString().slice(0, 16).replace("T", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
