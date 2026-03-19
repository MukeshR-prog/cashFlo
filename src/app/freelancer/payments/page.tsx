"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, FileText } from "lucide-react";
import Link from "next/link";
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import { toast } from "@/components/ui/Toaster";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PaymentRow {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  transactionId: string | null;
  payerName: string | null;
  payerEmail: string | null;
  payerPhone: string | null;
  invoiceAmountDue: number | null;
}

const modeStyle: Record<string, string> = {
  UPI: "badge-primary",
  Bank: "badge-secondary",
  PayPal: "badge-accent",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modeFilter, setModeFilter] = useState("All");
  const [invoiceFilter, setInvoiceFilter] = useState("All");
  const [payerFilter, setPayerFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/payments", { cache: "no-store", credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error("Could not load payments", data.error ?? "Please try again.");
          setPayments([]);
          return;
        }
        setPayments(data.payments ?? []);
      } catch {
        toast.error("Network error", "Could not load payment records.");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    void loadPayments();
  }, []);

  const invoices = useMemo(
    () => Array.from(new Set(payments.map((p) => p.invoiceNumber).filter(Boolean))),
    [payments]
  );

  const filtered = payments.filter((p) => {
    const modeMatch = modeFilter === "All" || p.paymentMode === modeFilter;
    const invoiceMatch = invoiceFilter === "All" || p.invoiceNumber === invoiceFilter;
    const payerMatch =
      payerFilter.trim().length === 0 ||
      (p.payerName ?? "").toLowerCase().includes(payerFilter.toLowerCase()) ||
      (p.payerEmail ?? "").toLowerCase().includes(payerFilter.toLowerCase()) ||
      (p.payerPhone ?? "").includes(payerFilter);
    const isoDate = new Date(p.paymentDate).toISOString().slice(0, 10);
    const dateMatch = !dateFilter || isoDate === dateFilter;
    return modeMatch && invoiceMatch && payerMatch && dateMatch;
  });

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
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/payments" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div className="chart-card p-3 flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-muted-foreground" />
        {["All", "UPI", "Bank", "Wallet", "PayPal", "Card", "Cash"].map((m) => (
          <button
            key={m}
            onClick={() => setModeFilter(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              modeFilter === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {m}
          </button>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-10 items-center gap-2 rounded-xl border border-input bg-card px-3 text-xs text-foreground transition-colors hover:bg-muted/70">
            <FileText className="h-3.5 w-3.5" />
            {invoiceFilter === "All" ? "All invoices" : invoiceFilter}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Filter by Invoice</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={invoiceFilter} onValueChange={setInvoiceFilter}>
                <DropdownMenuRadioItem value="All">All invoices</DropdownMenuRadioItem>
                {invoices.map((inv) => (
                  <DropdownMenuRadioItem key={inv} value={inv}>{inv}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          className="field-input h-9 text-xs px-3"
          placeholder="Filter payer"
          value={payerFilter}
          onChange={(e) => setPayerFilter(e.target.value)}
          style={{ width: '200px' }}
        />
        <span className="text-[11px] font-semibold text-muted-foreground">Date</span>
        <DatePickerInput
          className="w-44"
          inputClassName="text-xs"
          value={dateFilter}
          onChange={setDateFilter}
          ariaLabel="Filter by date"
          title="Filter by date"
        />
      </div>

      {/* Table */}
      <div className="chart-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Invoice</th>
              <th>Client</th>
              <th>Amount Paid</th>
              <th>Date</th>
              <th>Mode</th>
              <th>Txn ID</th>
              <th>Payer</th>
              <th>Payer Email</th>
              <th>Payer Phone</th>
              <th>Status</th>
              <th>Remaining</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} className="text-center text-sm text-muted-foreground py-8">Loading payment records...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center text-sm text-muted-foreground py-8">No payment records found.</td>
              </tr>
            ) : filtered.map((p) => (
              <tr key={p.id}>
                <td className="font-semibold text-muted-foreground text-xs">{p.id}</td>
                <td className="text-primary font-semibold">{p.invoiceNumber || "--"}</td>
                <td>{p.clientName}</td>
                <td className="stat-number font-bold text-success">₹{p.amount.toLocaleString("en-IN")}</td>
                <td className="text-xs text-muted-foreground">{new Date(p.paymentDate).toISOString().slice(0, 10)}</td>
                <td><span className={`badge ${modeStyle[p.paymentMode] ?? "badge-neutral"}`}>{p.paymentMode}</span></td>
                <td className="text-xs text-muted-foreground font-mono">{p.transactionId ?? "--"}</td>
                <td className="font-medium text-foreground">{p.payerName ?? "--"}</td>
                <td className="text-xs text-muted-foreground">{p.payerEmail ?? "--"}</td>
                <td className="text-xs text-muted-foreground">{p.payerPhone ?? "--"}</td>
                <td><span className="badge badge-success">Completed</span></td>
                <td className="stat-number text-foreground">
                  {(p.invoiceAmountDue ?? 0) > 0 ? `₹${(p.invoiceAmountDue ?? 0).toLocaleString("en-IN")}` : <span className="text-success text-xs font-semibold">Settled</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
