import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import Invoice from "@/app/api/_lib/models/Invoice";
import Client from "@/app/api/_lib/models/Client";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import { resolveInvoiceStatusAfterPayment } from "@/app/api/_lib/finance/invoice-status";

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

const createInvoiceSchema = z.object({
  clientId: z.string().min(1),
  invoiceNumber: z.string().min(1),
  issueDate: z.string(),
  dueDate: z.string(),
  items: z.array(invoiceItemSchema).min(1),
  paymentLink: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "sent", "due", "overdue", "partially_paid", "paid"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const status = req.nextUrl.searchParams.get("status");
    const query: Record<string, unknown> = { userId: auth.userId };
    if (status) query.status = status;

    const invoices = await Invoice.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      invoices: invoices.map((invoice) => ({
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
      })),
    });
  } catch (error) {
    console.error("[INVOICES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    const clientExists = await Client.exists({ _id: parsed.data.clientId, userId: auth.userId });
    if (!clientExists) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const items = parsed.data.items.map((item) => ({
      ...item,
      amount: item.quantity * item.unitPrice,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const dueDate = new Date(parsed.data.dueDate);

    const initialStatus =
      parsed.data.status ?? resolveInvoiceStatusAfterPayment(totalAmount, 0, dueDate);

    const created = await Invoice.create({
      userId: new mongoose.Types.ObjectId(auth.userId),
      clientId: new mongoose.Types.ObjectId(parsed.data.clientId),
      invoiceNumber: parsed.data.invoiceNumber,
      issueDate: new Date(parsed.data.issueDate),
      dueDate,
      items,
      totalAmount,
      amountPaid: 0,
      amountDue: totalAmount,
      status: initialStatus,
      paymentLink: parsed.data.paymentLink,
      notes: parsed.data.notes,
    });

    return NextResponse.json(
      {
        invoice: {
          id: created._id.toString(),
          clientId: created.clientId.toString(),
          invoiceNumber: created.invoiceNumber,
          issueDate: created.issueDate,
          dueDate: created.dueDate,
          items: created.items,
          totalAmount: created.totalAmount,
          amountPaid: created.amountPaid,
          amountDue: created.amountDue,
          status: created.status,
          paymentLink: created.paymentLink ?? null,
          notes: created.notes ?? "",
        },
      },
      { status: 201 }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("[INVOICES_POST]", error);
    if (error?.code === 11000) {
      return NextResponse.json({ error: "Invoice number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
