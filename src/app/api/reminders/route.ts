import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import Reminder from "@/app/api/_lib/models/Reminder";
import Invoice from "@/app/api/_lib/models/Invoice";
import Client from "@/app/api/_lib/models/Client";
import User from "@/app/api/_lib/models/User";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import { sendInvoiceEmail } from "@/app/api/_lib/email/send-invoice-email";

export const dynamic = "force-dynamic";

const sendReminderSchema = z.object({
  invoiceId: z.string().min(1).refine((v) => mongoose.isValidObjectId(v), "Invalid invoice ID"),
  type: z.enum(["email"]).default("email"),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = sendReminderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    // Fetch invoice (must belong to this user)
    const invoice = await Invoice.findOne({ _id: parsed.data.invoiceId, userId: auth.userId }).lean();
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Create reminder record (pending)
    const reminder = await Reminder.create({
      invoiceId: invoice._id,
      userId: new mongoose.Types.ObjectId(auth.userId),
      type: parsed.data.type,
      context: "manual",
      status: "pending",
    });

    // Fetch client and freelancer info
    const [clientDoc, userDoc] = await Promise.all([
      Client.findById(invoice.clientId).lean(),
      User.findById(auth.userId).lean(),
    ]);

    const clientEmail = (clientDoc as { email?: string } | null)?.email;
    const clientName = (clientDoc as { name?: string } | null)?.name ?? "Valued Client";
    const freelancerName = (userDoc as { name?: string } | null)?.name;

    if (!clientEmail) {
      await Reminder.findByIdAndUpdate(reminder._id, { status: "failed" });
      return NextResponse.json(
        { error: "Client does not have an email address. Please update the client profile first." },
        { status: 422 }
      );
    }

    // Send reminder email (reuses invoice email template)
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
        notes: `PAYMENT REMINDER\n\nThis is a friendly reminder that payment for invoice ${invoice.invoiceNumber} ${invoice.amountDue > 0 ? `of ₹${invoice.amountDue.toLocaleString("en-IN")} is due` : "is pending"}. Please complete payment at your earliest convenience.\n\n${invoice.notes ?? ""}`.trim(),
        freelancerName,
      });

      await Reminder.findByIdAndUpdate(reminder._id, { status: "sent", sentAt: new Date() });

      return NextResponse.json({
        success: true,
        message: `Reminder sent to ${clientEmail}`,
        reminderId: reminder._id.toString(),
      });
    } catch (emailErr) {
      console.error("[REMINDERS_POST] Email failed:", emailErr);
      await Reminder.findByIdAndUpdate(reminder._id, { status: "failed" });
      return NextResponse.json({ error: "Failed to send reminder email. Check SMTP configuration." }, { status: 500 });
    }
  } catch (error) {
    console.error("[REMINDERS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const reminders = await Reminder.find({ userId: auth.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      reminders: reminders.map((r) => ({
        id: r._id.toString(),
        invoiceId: r.invoiceId.toString(),
        type: r.type,
        context: r.context ?? "manual",
        status: r.status,
        sentAt: r.sentAt ?? null,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("[REMINDERS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
