"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import Link from "next/link";
import { DatePickerInput } from "@/components/ui/DatePickerInput";

const payments = [
  { id: "PAY-046", invoice: "INV-042", client: "Velachery HealthTech", amount: 28000, date: "2026-03-15", mode: "UPI", txId: "UPI2046VHT", status: "Completed", remaining: 12000, payerName: "Karthik Raman", payerEmail: "accounts@velacheryhealth.in", payerPhone: "+91 97890 11452" },
  { id: "PAY-045", invoice: "INV-042", client: "Velachery HealthTech", amount: 12000, date: "2026-03-12", mode: "Bank", txId: "NEFT004512VHT", status: "Completed", remaining: 0, payerName: "Divya Narayanan", payerEmail: "finance@velacheryhealth.in", payerPhone: "+91 98402 88231" },
  { id: "PAY-044", invoice: "INV-038", client: "Coimbatore Agro Labs", amount: 36000, date: "2026-02-26", mode: "Bank", txId: "NEFT004438CAL", status: "Completed", remaining: 0, payerName: "Praveen Kumar", payerEmail: "billing@coagrolabs.com", payerPhone: "+91 94433 76210" },
  { id: "PAY-043", invoice: "INV-035", client: "Madurai Retail Hub", amount: 14500, date: "2026-02-10", mode: "UPI", txId: "UPI2043MRH", status: "Completed", remaining: 0, payerName: "Sowmya Krishnan", payerEmail: "accounts@madurairetailhub.in", payerPhone: "+91 98940 23176" },
];

const modeStyle: Record<string, string> = {
  UPI: "badge-primary",
  Bank: "badge-secondary",
  PayPal: "badge-accent",
};

export default function PaymentsPage() {
  const [modeFilter, setModeFilter] = useState("All");
  const [invoiceFilter, setInvoiceFilter] = useState("All");
  const [payerFilter, setPayerFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const invoices = Array.from(new Set(payments.map((p) => p.invoice)));

  const filtered = payments.filter((p) => {
    const modeMatch = modeFilter === "All" || p.mode === modeFilter;
    const invoiceMatch = invoiceFilter === "All" || p.invoice === invoiceFilter;
    const payerMatch =
      payerFilter.trim().length === 0 ||
      p.payerName.toLowerCase().includes(payerFilter.toLowerCase()) ||
      p.payerEmail.toLowerCase().includes(payerFilter.toLowerCase()) ||
      p.payerPhone.includes(payerFilter);
    const dateMatch = !dateFilter || p.date === dateFilter;
    return modeMatch && invoiceMatch && payerMatch && dateMatch;
  });

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/payments", label: "Payment Records" },
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
        {["All", "UPI", "Bank", "PayPal"].map((m) => (
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
        <select className="field-select h-10 w-45 text-xs" value={invoiceFilter} onChange={(e) => setInvoiceFilter(e.target.value)}>
          <option value="All">All invoices</option>
          {invoices.map((inv) => (
            <option key={inv} value={inv}>{inv}</option>
          ))}
        </select>
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
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="font-semibold text-muted-foreground text-xs">{p.id}</td>
                <td className="text-primary font-semibold">{p.invoice}</td>
                <td>{p.client}</td>
                <td className="stat-number font-bold text-success">₹{p.amount.toLocaleString("en-IN")}</td>
                <td className="text-xs text-muted-foreground">{p.date}</td>
                <td><span className={`badge ${modeStyle[p.mode] ?? "badge-neutral"}`}>{p.mode}</span></td>
                <td className="text-xs text-muted-foreground font-mono">{p.txId}</td>
                <td className="font-medium text-foreground">{p.payerName}</td>
                <td className="text-xs text-muted-foreground">{p.payerEmail}</td>
                <td className="text-xs text-muted-foreground">{p.payerPhone}</td>
                <td><span className="badge badge-success">{p.status}</span></td>
                <td className="stat-number text-foreground">
                  {p.remaining > 0 ? `₹${p.remaining.toLocaleString("en-IN")}` : <span className="text-success text-xs font-semibold">Settled</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
