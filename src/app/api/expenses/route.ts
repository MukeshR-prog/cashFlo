import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/app/api/_lib/db/mongodb";
import Expense from "@/app/api/_lib/models/Expense";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import { getDateRange } from "@/app/api/_lib/finance/date-range";

const createExpenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  date: z.string(),
  type: z.enum(["BUSINESS", "PERSONAL"]).default("PERSONAL"),
  paymentMode: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const { start, end } = getDateRange(searchParams);

    const query: Record<string, unknown> = { userId: auth.userId };
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (start || end) {
      query.date = {
        ...(start ? { $gte: start } : {}),
        ...(end ? { $lte: end } : {}),
      };
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Expense.countDocuments(query),
    ]);

    return NextResponse.json({
      expenses: expenses.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        amount: item.amount,
        category: item.category,
        date: item.date,
        type: item.type,
        paymentMode: item.paymentMode ?? null,
        notes: item.notes ?? "",
        createdAt: item.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[EXPENSES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = createExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    const created = await Expense.create({
      userId: auth.userId,
      title: parsed.data.title,
      amount: parsed.data.amount,
      category: parsed.data.category,
      date: new Date(parsed.data.date),
      type: parsed.data.type,
      paymentMode: parsed.data.paymentMode,
      notes: parsed.data.notes,
    });

    return NextResponse.json(
      {
        expense: {
          id: created._id.toString(),
          title: created.title,
          amount: created.amount,
          category: created.category,
          date: created.date,
          type: created.type,
          paymentMode: created.paymentMode ?? null,
          notes: created.notes ?? "",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[EXPENSES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
