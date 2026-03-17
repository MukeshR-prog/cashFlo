import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import Invoice from "@/app/api/_lib/models/Invoice";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import { resolveInvoiceStatusAfterPayment } from "@/app/api/_lib/finance/invoice-status";

const isValidDate = (value: string) => !Number.isNaN(new Date(value).getTime());

const updateItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

const updateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1).optional(),
  issueDate: z.string().refine(isValidDate, "Invalid issue date").optional(),
  dueDate: z.string().refine(isValidDate, "Invalid due date").optional(),
  items: z.array(updateItemSchema).optional(),
  paymentLink: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "sent", "due", "overdue", "partially_paid", "paid"]).optional(),
});

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });
    }

    await connectDB();

    const invoice = await Invoice.findOne({ _id: id, userId: auth.userId }).lean();
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      invoice: {
        id: invoice._id.toString(),
        clientId: invoice.clientId.toString(),
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        items: invoice.items,
        totalAmount: invoice.totalAmount,
        amountPaid: invoice.amountPaid,
        amountDue: invoice.amountDue,
        status: invoice.status,
        paymentLink: invoice.paymentLink ?? null,
        notes: invoice.notes ?? "",
      },
    });
  } catch (error) {
    console.error("[INVOICE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    const existing = await Invoice.findOne({ _id: id, userId: auth.userId });
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (parsed.data.invoiceNumber) existing.invoiceNumber = parsed.data.invoiceNumber;
    if (parsed.data.issueDate) existing.issueDate = new Date(parsed.data.issueDate);
    if (parsed.data.dueDate) existing.dueDate = new Date(parsed.data.dueDate);
    if (parsed.data.paymentLink !== undefined) existing.paymentLink = parsed.data.paymentLink;
    if (parsed.data.notes !== undefined) existing.notes = parsed.data.notes;

    if (parsed.data.items) {
      existing.items = parsed.data.items.map((item) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      }));
      existing.totalAmount = existing.items.reduce((sum, item) => sum + item.amount, 0);
      existing.amountDue = Math.max(0, existing.totalAmount - existing.amountPaid);
      existing.status = resolveInvoiceStatusAfterPayment(existing.totalAmount, existing.amountPaid, existing.dueDate);
    }

    if (parsed.data.status) {
      existing.status = parsed.data.status;
    }

    await existing.save();

    return NextResponse.json({
      invoice: {
        id: existing._id.toString(),
        clientId: existing.clientId.toString(),
        invoiceNumber: existing.invoiceNumber,
        issueDate: existing.issueDate,
        dueDate: existing.dueDate,
        items: existing.items,
        totalAmount: existing.totalAmount,
        amountPaid: existing.amountPaid,
        amountDue: existing.amountDue,
        status: existing.status,
        paymentLink: existing.paymentLink ?? null,
        notes: existing.notes ?? "",
      },
    });
  } catch (error) {
    console.error("[INVOICE_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid invoice id" }, { status: 400 });
    }

    await connectDB();

    const deleted = await Invoice.findOneAndDelete({ _id: id, userId: auth.userId }).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Invoice deleted" });
  } catch (error) {
    console.error("[INVOICE_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
