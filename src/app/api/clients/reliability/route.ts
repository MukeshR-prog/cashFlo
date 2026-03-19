import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Client from "@/app/api/_lib/models/Client";
import Invoice from "@/app/api/_lib/models/Invoice";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Reminder from "@/app/api/_lib/models/Reminder";

export const dynamic = "force-dynamic";

interface ClientReliability {
  clientId: string;
  name: string;
  avgDelay: number;
  overdueCount: number;
  reminderCount: number;
  onTimePayments: number;
  totalInvoices: number;
  totalPaid: number;
  reliability: "Good" | "Late" | "Risk";
}

function classify(avgDelay: number): "Good" | "Late" | "Risk" {
  if (avgDelay <= 2) return "Good";
  if (avgDelay <= 7) return "Late";
  return "Risk";
}

export async function GET() {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    const [clients, invoices, settlements, reminders] = await Promise.all([
      Client.find({ userId }).lean(),
      Invoice.find({ userId }).lean(),
      PaymentSettlement.find({ userId }).lean(),
      Reminder.find({ userId }).lean(),
    ]);

    const results: ClientReliability[] = clients.map((client) => {
      const clientIdStr = client._id.toString();

      // Invoices for this client
      const clientInvoices = invoices.filter(
        (inv) => inv.clientId?.toString() === clientIdStr
      );

      // Settlements for this client's invoices
      const clientInvoiceIds = new Set(clientInvoices.map((inv) => inv._id.toString()));
      const clientSettlements = settlements.filter(
        (s) => clientInvoiceIds.has(s.invoiceId?.toString())
      );

      // Reminders for this client's invoices
      const clientReminders = reminders.filter(
        (r) => clientInvoiceIds.has(r.invoiceId?.toString())
      );

      // Calculate avg delay: paymentDate - dueDate (in days)
      const delays: number[] = [];
      let onTime = 0;

      for (const settlement of clientSettlements) {
        const invoice = clientInvoices.find(
          (inv) => inv._id.toString() === settlement.invoiceId?.toString()
        );
        if (!invoice) continue;

        const dueDate = new Date(invoice.dueDate).getTime();
        const paymentDate = new Date(settlement.paymentDate).getTime();
        const delayDays = Math.ceil((paymentDate - dueDate) / 86_400_000);
        delays.push(Math.max(0, delayDays));

        if (delayDays <= 0) onTime += 1;
      }

      const avgDelay = delays.length > 0
        ? Math.round(delays.reduce((s, d) => s + d, 0) / delays.length)
        : 0;

      const overdueCount = clientInvoices.filter(
        (inv) => inv.status === "overdue"
      ).length;

      return {
        clientId: clientIdStr,
        name: client.name,
        avgDelay,
        overdueCount,
        reminderCount: clientReminders.length,
        onTimePayments: onTime,
        totalInvoices: clientInvoices.length,
        totalPaid: clientSettlements.reduce((s, p) => s + p.amount, 0),
        reliability: classify(avgDelay),
      };
    });

    // Sort: Risk first, then Late, then Good
    const order = { Risk: 0, Late: 1, Good: 2 };
    results.sort((a, b) => order[a.reliability] - order[b.reliability]);

    return NextResponse.json({ clients: results });
  } catch (error) {
    console.error("[CLIENTS_RELIABILITY_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
