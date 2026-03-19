import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Invoice from "@/app/api/_lib/models/Invoice";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Reminder from "@/app/api/_lib/models/Reminder";

export const dynamic = "force-dynamic";

interface TimelineEvent {
  type: "created" | "sent" | "reminder" | "payment" | "overdue" | "paid";
  description: string;
  date: string;
  actor: string;
  amount?: number;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });
    }

    await connectDB();

    const invoice = await Invoice.findOne({
      _id: id,
      userId: auth.userId,
    }).lean();

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const [settlements, reminders] = await Promise.all([
      PaymentSettlement.find({ invoiceId: invoice._id, userId: auth.userId })
        .sort({ paymentDate: 1 })
        .lean(),
      Reminder.find({ invoiceId: invoice._id, userId: auth.userId })
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    const events: TimelineEvent[] = [];

    // Invoice created
    events.push({
      type: "created",
      description: `Invoice ${invoice.invoiceNumber} created`,
      date: invoice.createdAt.toISOString(),
      actor: "You",
    });

    // Invoice sent (if status is not draft)
    if (invoice.status !== "draft") {
      events.push({
        type: "sent",
        description: `Invoice sent to client`,
        date: invoice.issueDate.toISOString(),
        actor: "You",
      });
    }

    // Reminders
    for (const reminder of reminders) {
      if (reminder.status === "sent" && reminder.sentAt) {
        events.push({
          type: "reminder",
          description: `${reminder.context === "overdue" ? "Overdue" : "Due soon"} reminder sent via ${reminder.type}`,
          date: reminder.sentAt.toISOString(),
          actor: "System",
        });
      }
    }

    // Payments
    for (const settlement of settlements) {
      events.push({
        type: "payment",
        description: `Payment of ₹${settlement.amount.toLocaleString("en-IN")} received via ${settlement.paymentMode}`,
        date: settlement.paymentDate.toISOString(),
        actor: "Client",
        amount: settlement.amount,
      });
    }

    // If overdue
    if (invoice.status === "overdue") {
      events.push({
        type: "overdue",
        description: "Invoice became overdue",
        date: invoice.dueDate.toISOString(),
        actor: "System",
      });
    }

    // If fully paid
    if (invoice.status === "paid") {
      const lastPayment = settlements[settlements.length - 1];
      events.push({
        type: "paid",
        description: "Invoice fully paid",
        date: lastPayment
          ? lastPayment.paymentDate.toISOString()
          : invoice.updatedAt.toISOString(),
        actor: "System",
      });
    }

    // Sort events by date descending (newest first)
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      events,
    });
  } catch (error) {
    console.error("[INVOICE_TIMELINE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
