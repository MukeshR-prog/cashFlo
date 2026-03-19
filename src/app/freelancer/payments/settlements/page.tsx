"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface PaidInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: number;
  amountPaid: number;
}

interface PaymentRow {
  invoiceId: string;
  paymentDate: string;
  paymentMode: string;
}

export default function SettlementsPage() {
  const [paidInvoices, setPaidInvoices] = useState<PaidInvoice[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [invRes, payRes] = await Promise.all([
          fetch("/api/invoices?status=paid", { cache: "no-store", credentials: "include" }),
          fetch("/api/payments", { cache: "no-store", credentials: "include" }),
        ]);
        const invJson = await invRes.json().catch(() => ({}));
        const payJson = await payRes.json().catch(() => ({}));
        if (!invRes.ok) toast.error("Could not load settlements", invJson.error ?? "Please try again.");
        if (!payRes.ok) toast.error("Could not load payment records", payJson.error ?? "Please try again.");
        setPaidInvoices(invJson.invoices ?? []);
        setPayments(payJson.payments ?? []);
      } catch {
        toast.error("Network error", "Could not load settlements.");
        setPaidInvoices([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const latestPaymentByInvoice = useMemo(() => {
    const map = new Map<string, PaymentRow>();
    for (const p of payments) {
      const existing = map.get(p.invoiceId);
      if (!existing || new Date(p.paymentDate).getTime() > new Date(existing.paymentDate).getTime()) {
        map.set(p.invoiceId, p);
      }
    }
    return map;
  }, [payments]);

  const totalSettled = paidInvoices.reduce((s, i) => s + (i.amountPaid || i.totalAmount || 0), 0);

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
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/payments/settlements" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Total Settled</p>
          <p className="kpi-value text-xl text-success">₹{totalSettled.toLocaleString("en-IN")}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Invoices Closed</p>
          <p className="kpi-value text-xl">{paidInvoices.length}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Avg Settlement</p>
          <p className="kpi-value text-xl">₹{paidInvoices.length ? Math.round(totalSettled / paidInvoices.length).toLocaleString("en-IN") : "0"}</p>
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
            {loading ? (
              <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-8">Loading settlements...</td></tr>
            ) : paidInvoices.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-8">No settled invoices yet.</td></tr>
            ) : paidInvoices.map((s) => {
              const latest = latestPaymentByInvoice.get(s.id);
              const source = latest?.paymentMode ?? "--";
              const settlementDate = latest ? new Date(latest.paymentDate).toISOString().slice(0, 10) : "--";
              return (
              <tr key={s.id}>
                <td className="font-semibold text-primary">{s.invoiceNumber}</td>
                <td>{s.clientName || "Unknown"}</td>
                <td className="stat-number font-bold text-success">₹{(s.amountPaid || s.totalAmount).toLocaleString("en-IN")}</td>
                <td className="text-xs text-muted-foreground">{settlementDate}</td>
                <td><span className="badge badge-secondary">{source}</span></td>
                <td className="text-xs text-muted-foreground max-w-[160px] truncate">Settled via {source}</td>
                <td>
                  <span className="flex items-center gap-1 text-success text-xs font-semibold">
                    <CheckCircle size={12} /> Settled
                  </span>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
