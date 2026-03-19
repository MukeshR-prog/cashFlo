"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Filter } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

interface BankTransaction {
  id: string;
  source: string;
  direction: "credit" | "debit";
  amount: number;
  currency: string;
  transactionDate: string;
  description: string;
  reference: string | null;
}

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PaymentTransactionsPage() {
  const [rows, setRows] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<"all" | "credit" | "debit">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", "300");
        if (direction !== "all") params.set("direction", direction);
        const res = await fetch(`/api/transactions?${params.toString()}`, { cache: "no-store", credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error("Could not load transactions", data.error ?? "Please try again.");
          setRows([]);
          return;
        }
        setRows(data.transactions ?? []);
      } catch {
        toast.error("Network error", "Could not reach the server.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [direction]);

  const filtered = useMemo(
    () => rows.filter((r) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        r.description.toLowerCase().includes(q) ||
        (r.reference ?? "").toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q)
      );
    }),
    [rows, query]
  );

  const creditTotal = filtered.filter((r) => r.direction === "credit").reduce((s, r) => s + r.amount, 0);
  const debitTotal = filtered.filter((r) => r.direction === "debit").reduce((s, r) => s + r.amount, 0);

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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/payments/transactions" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Rows</p>
          <p className="text-2xl font-bold stat-number">{filtered.length}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Credits</p>
          <p className="text-2xl font-bold stat-number text-success">{fmt(creditTotal)}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Debits</p>
          <p className="text-2xl font-bold stat-number text-destructive">{fmt(debitTotal)}</p>
        </div>
      </div>

      <div className="chart-card p-3 flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-muted-foreground" />
        {[
          { label: "All", value: "all" },
          { label: "Credits", value: "credit" },
          { label: "Debits", value: "debit" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDirection(opt.value as "all" | "credit" | "debit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${direction === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            {opt.label}
          </button>
        ))}
        <input
          className="field-input h-9 text-xs px-3 ml-auto min-w-[220px]"
          placeholder="Search description, source, reference"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="chart-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Direction</th>
              <th>Amount</th>
              <th>Source</th>
              <th>Description</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-8">Loading transactions...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-8">No transactions found.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id}>
                <td className="text-xs text-muted-foreground">{new Date(r.transactionDate).toISOString().slice(0, 10)}</td>
                <td>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${r.direction === "credit" ? "text-success" : "text-destructive"}`}>
                    {r.direction === "credit" ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                    {r.direction}
                  </span>
                </td>
                <td className={`stat-number font-semibold ${r.direction === "credit" ? "text-success" : "text-destructive"}`}>{fmt(r.amount)}</td>
                <td><span className="badge badge-secondary">{r.source}</span></td>
                <td className="text-sm text-foreground max-w-[320px] truncate" title={r.description}>{r.description}</td>
                <td className="text-xs text-muted-foreground">{r.reference ?? "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
