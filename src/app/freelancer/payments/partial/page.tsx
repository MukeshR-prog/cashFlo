"use client";

import Link from "next/link";

const partialInvoices = [
  {
    id: "INV-022",
    client: "Arjun Dev",
    total: 9200,
    received: 5000,
    remaining: 4200,
    lastPayment: "2026-03-10",
    nextExpectedPayment: "2026-03-24",
    installments: [
      { date: "2026-03-02", amount: 2000, mode: "UPI" },
      { date: "2026-03-10", amount: 3000, mode: "Bank" },
    ],
  },
  {
    id: "INV-011",
    client: "BlueWave Tech",
    total: 25000,
    received: 12500,
    remaining: 12500,
    lastPayment: "2026-02-28",
    nextExpectedPayment: "2026-03-20",
    installments: [
      { date: "2026-02-15", amount: 7500, mode: "PayPal" },
      { date: "2026-02-28", amount: 5000, mode: "Bank" },
    ],
  },
];

export default function PartialPaymentsPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/payments", label: "Payment Records" },
          { href: "/freelancer/payments/partial", label: "Partial Payments" },
          { href: "/freelancer/payments/settlements", label: "Settlements" },
          { href: "/freelancer/payments/acknowledgements", label: "Acknowledgements" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/payments/partial" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {partialInvoices.map((inv) => {
        const pct = Math.round((inv.received / inv.total) * 100);
        return (
          <div key={inv.id} className="chart-card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-bold text-foreground">{inv.id}</p>
                <p className="text-sm text-muted-foreground">{inv.client}</p>
              </div>
              <span className="badge badge-warning">Partial</span>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>₹{inv.received.toLocaleString("en-IN")} received</span>
                <span className="font-semibold text-foreground">{pct}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: "var(--chart-1)" }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5">
                <span className="text-success font-semibold">₹{inv.received.toLocaleString("en-IN")} paid</span>
                <span className="text-muted-foreground">₹{inv.remaining.toLocaleString("en-IN")} remaining</span>
              </div>
            </div>

            {/* Installment History */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Payment History</p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.installments.map((inst, i) => (
                    <tr key={i}>
                      <td className="text-xs text-muted-foreground">{inst.date}</td>
                      <td className="stat-number text-success font-semibold">₹{inst.amount.toLocaleString("en-IN")}</td>
                      <td><span className="badge badge-secondary text-[10px]">{inst.mode}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground">Last payment: {inv.lastPayment}</p>
            <p className="text-xs text-muted-foreground">Next expected payment: {inv.nextExpectedPayment}</p>
          </div>
        );
      })}
    </div>
  );
}
