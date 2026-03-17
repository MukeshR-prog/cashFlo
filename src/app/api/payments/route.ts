import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Invoice from "@/app/api/_lib/models/Invoice";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import { resolveInvoiceStatusAfterPayment } from "@/app/api/_lib/finance/invoice-status";

const isValidDate = (value: string) => !Number.isNaN(new Date(value).getTime());

const createPaymentSchema = z.object({
  invoiceId: z.string().min(1).refine((value) => mongoose.isValidObjectId(value), "Invalid invoice id"),
  amount: z.number().positive(),
  paymentDate: z.string().refine(isValidDate, "Invalid payment date").optional(),
  paymentMode: z.string().min(1),
  transactionId: z.string().optional(),
  payerName: z.string().optional(),
  payerEmail: z.string().email().optional(),
  payerPhone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    const invoice = await Invoice.findOne({ _id: parsed.data.invoiceId, userId: auth.userId });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const settlement = await PaymentSettlement.create({
      invoiceId: invoice._id,
      userId: auth.userId,
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

    return NextResponse.json(
      {
        payment: {
          id: settlement._id.toString(),
          invoiceId: settlement.invoiceId.toString(),
          amount: settlement.amount,
          paymentDate: settlement.paymentDate,
          paymentMode: settlement.paymentMode,
          transactionId: settlement.transactionId ?? null,
          payerName: settlement.payerName ?? null,
          payerEmail: settlement.payerEmail ?? null,
          payerPhone: settlement.payerPhone ?? null,
        },
        invoice: {
          id: invoice._id.toString(),
          amountPaid: invoice.amountPaid,
          amountDue: invoice.amountDue,
          status: invoice.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[PAYMENTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
