import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import Invoice from "@/app/api/_lib/models/Invoice";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import { resolveInvoiceStatusAfterPayment } from "@/app/api/_lib/finance/invoice-status";

export const dynamic = "force-dynamic";

const webhookSchema = z.object({
  invoiceId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  amount: z.number().positive(),
  paymentDate: z.string().optional(),
  paymentMode: z.string().min(1),
  transactionId: z.string().optional(),
  payerName: z.string().optional(),
  payerEmail: z.string().email().optional(),
  payerPhone: z.string().optional(),
  source: z.enum(["upi", "bank_transfer", "wallet", "gateway"]).default("gateway"),
});

function isSignatureValid(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const left = Buffer.from(digest);
  const right = Buffer.from(signature);

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-cashflo-signature");

    if (!isSignatureValid(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const parsed = webhookSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    let invoice = null;
    if (parsed.data.invoiceId && mongoose.isValidObjectId(parsed.data.invoiceId)) {
      invoice = await Invoice.findById(parsed.data.invoiceId);
    }
    if (!invoice && parsed.data.invoiceNumber) {
      invoice = await Invoice.findOne({ invoiceNumber: parsed.data.invoiceNumber });
    }

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (parsed.data.transactionId) {
      const exists = await PaymentSettlement.findOne({
        userId: invoice.userId,
        invoiceId: invoice._id,
        transactionId: parsed.data.transactionId,
      }).lean();

      if (exists) {
        return NextResponse.json({ success: true, duplicate: true });
      }
    }

    const settlement = await PaymentSettlement.create({
      invoiceId: invoice._id,
      userId: invoice.userId,
      amount: parsed.data.amount,
      paymentDate: parsed.data.paymentDate ? new Date(parsed.data.paymentDate) : new Date(),
      paymentMode: parsed.data.paymentMode,
      transactionId: parsed.data.transactionId,
      payerName: parsed.data.payerName,
      payerEmail: parsed.data.payerEmail,
      payerPhone: parsed.data.payerPhone,
    });

    invoice.amountPaid = (invoice.amountPaid ?? 0) + parsed.data.amount;
    invoice.amountDue = Math.max(0, invoice.totalAmount - invoice.amountPaid);
    invoice.status = resolveInvoiceStatusAfterPayment(invoice.totalAmount, invoice.amountPaid, invoice.dueDate);
    await invoice.save();

    return NextResponse.json({
      success: true,
      source: parsed.data.source,
      paymentId: settlement._id.toString(),
      invoice: {
        id: invoice._id.toString(),
        status: invoice.status,
        amountPaid: invoice.amountPaid,
        amountDue: invoice.amountDue,
      },
    });
  } catch (error) {
    console.error("[PAYMENT_WEBHOOK_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
