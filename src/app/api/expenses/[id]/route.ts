import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import Expense from "@/app/api/_lib/models/Expense";
import { requireSession } from "@/app/api/_lib/auth/require-session";

const isValidDate = (value: string) => !Number.isNaN(new Date(value).getTime());

const updateExpenseSchema = z.object({
  title: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  date: z.string().refine(isValidDate, "Invalid date").optional(),
  type: z.enum(["BUSINESS", "PERSONAL"]).optional(),
  paymentMode: z.string().optional(),
  notes: z.string().optional(),
});

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid expense id" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    const updateData: Record<string, unknown> = {
      ...parsed.data,
      ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
    };

    const updated = await Expense.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({
      expense: {
        id: updated._id.toString(),
        title: updated.title,
        amount: updated.amount,
        category: updated.category,
        date: updated.date,
        type: updated.type,
        paymentMode: updated.paymentMode ?? null,
        notes: updated.notes ?? "",
      },
    });
  } catch (error) {
    console.error("[EXPENSES_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid expense id" }, { status: 400 });
    }

    await connectDB();

    const deleted = await Expense.findOneAndDelete({ _id: id, userId: auth.userId }).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Expense deleted" });
  } catch (error) {
    console.error("[EXPENSES_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
