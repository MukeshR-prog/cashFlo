"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface PartialInvoice {
  id: string;
  clientName: string;
  invoiceNumber: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  dueDate: string;
}

export default function PartialPaymentsPage() {
  const [partialInvoices, setPartialInvoices] = useState<PartialInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/invoices?status=partially_paid", { cache: "no-store", credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error("Could not load partial invoices", data.error ?? "Please try again.");
          setPartialInvoices([]);
          return;
        }
        setPartialInvoices(data.invoices ?? []);
      } catch {
        toast.error("Network error", "Could not load partial invoices.");
        setPartialInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

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
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/payments/partial" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="chart-card text-sm text-muted-foreground">Loading partial payments...</div>
      ) : partialInvoices.length === 0 ? (
        <div className="chart-card text-sm text-muted-foreground">No partially paid invoices found.</div>
      ) : partialInvoices.map((inv) => {
        const pct = inv.totalAmount > 0 ? Math.round((inv.amountPaid / inv.totalAmount) * 100) : 0;
        return (
          <div key={inv.id} className="chart-card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-bold text-foreground">{inv.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">{inv.clientName || "Unknown Client"}</p>
              </div>
              <span className="badge badge-warning">Partial</span>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>₹{inv.amountPaid.toLocaleString("en-IN")} received</span>
                <span className="font-semibold text-foreground">{pct}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: "var(--chart-1)" }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5">
                <span className="text-success font-semibold">₹{inv.amountPaid.toLocaleString("en-IN")} paid</span>
                <span className="text-muted-foreground">₹{inv.amountDue.toLocaleString("en-IN")} remaining</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Due date: {new Date(inv.dueDate).toISOString().slice(0, 10)}</p>
          </div>
        );
      })}
    </div>
  );
}
