import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Reminder from "@/app/api/_lib/models/Reminder";
import Invoice from "@/app/api/_lib/models/Invoice";
import Client from "@/app/api/_lib/models/Client";
import User from "@/app/api/_lib/models/User";
import { sendInvoiceEmail } from "@/app/api/_lib/email/send-invoice-email";

export const dynamic = "force-dynamic";

type ReminderContext = "due_soon" | "overdue";

function classifyInvoice(dueDate: Date): ReminderContext | null {
  const now = Date.now();
  const due = new Date(dueDate).getTime();
  const days = Math.ceil((due - now) / 86_400_000);

  if (days >= 0 && days <= 3) return "due_soon";
  if (days < 0) return "overdue";
  return null;
}

function lastReminderCutoff(context: ReminderContext): Date {
  const hours = context === "overdue" ? 72 : 24;
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function hasCronAuth(req: NextRequest): boolean {
  const configured = process.env.REMINDER_CRON_SECRET;
  if (!configured) return false;
  return req.headers.get("x-cron-secret") === configured;
}

async function processInvoicesForUser(userId: mongoose.Types.ObjectId) {
  const invoices = await Invoice.find({
    userId,
    status: { $in: ["sent", "due", "overdue", "partially_paid"] },
    amountDue: { $gt: 0 },
  }).lean();

  if (invoices.length === 0) {
    return { scanned: 0, sent: 0, skipped: 0, failed: 0 };
  }

  const [clients, users] = await Promise.all([
    Client.find({ _id: { $in: invoices.map((i) => i.clientId) } }).lean(),
    User.find({ _id: userId }).lean(),
  ]);

  const clientById = new Map(clients.map((c) => [c._id.toString(), c]));
  const freelancerName = users[0]?.name;

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const invoice of invoices) {
    const context = classifyInvoice(invoice.dueDate);
    if (!context) {
      skipped += 1;
      continue;
    }

    const existing = await Reminder.findOne({
      userId,
      invoiceId: invoice._id,
      type: "email",
      context,
      status: "sent",
      sentAt: { $gte: lastReminderCutoff(context) },
    }).lean();

    if (existing) {
      skipped += 1;
      continue;
    }

    const reminder = await Reminder.create({
      invoiceId: invoice._id,
      userId,
      type: "email",
      context,
      status: "pending",
    });

    const client = clientById.get(invoice.clientId.toString());
    const clientEmail = client?.email;
    const clientName = client?.name ?? "Valued Client";

    if (!clientEmail) {
      failed += 1;
      await Reminder.findByIdAndUpdate(reminder._id, { status: "failed" });
      continue;
    }

    const heading = context === "overdue" ? "OVERDUE PAYMENT REMINDER" : "PAYMENT DUE REMINDER";
    const note = context === "overdue"
      ? `Your invoice ${invoice.invoiceNumber} is overdue. Pending amount: INR ${invoice.amountDue.toLocaleString("en-IN")}. Kindly settle at the earliest.`
      : `Your invoice ${invoice.invoiceNumber} is due soon. Pending amount: INR ${invoice.amountDue.toLocaleString("en-IN")}. Please arrange payment before due date.`;

    try {
      await sendInvoiceEmail({
        to: clientEmail,
        clientName,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        items: invoice.items,
        totalAmount: invoice.totalAmount,
        paymentLink: invoice.paymentLink,
        notes: `${heading}\n\n${note}\n\n${invoice.notes ?? ""}`.trim(),
        freelancerName,
      });

      sent += 1;
      await Reminder.findByIdAndUpdate(reminder._id, { status: "sent", sentAt: new Date() });
    } catch (error) {
      console.error("[REMINDERS_AUTO_SEND]", error);
      failed += 1;
      await Reminder.findByIdAndUpdate(reminder._id, { status: "failed" });
    }
  }

  return { scanned: invoices.length, sent, skipped, failed };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const cronAuthorized = hasCronAuth(req);
    if (cronAuthorized) {
      const users = await User.find({}).select("_id").lean();
      let scanned = 0;
      let sent = 0;
      let skipped = 0;
      let failed = 0;

      for (const user of users) {
        const r = await processInvoicesForUser(user._id as mongoose.Types.ObjectId);
        scanned += r.scanned;
        sent += r.sent;
        skipped += r.skipped;
        failed += r.failed;
      }

      return NextResponse.json({ success: true, mode: "cron", scanned, sent, skipped, failed });
    }

    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const result = await processInvoicesForUser(new mongoose.Types.ObjectId(auth.userId));
    return NextResponse.json({ success: true, mode: "session", ...result });
  } catch (error) {
    console.error("[REMINDERS_AUTO_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
