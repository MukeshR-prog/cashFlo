import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Expense from "@/app/api/_lib/models/Expense";
import { getMonthBoundaries } from "@/app/api/_lib/finance/date-range";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const year = Number(req.nextUrl.searchParams.get("year") || undefined);
    const month = Number(req.nextUrl.searchParams.get("month") || undefined);
    const userId = new mongoose.Types.ObjectId(auth.userId);
    const { start, end } = getMonthBoundaries(Number.isNaN(year) ? undefined : year, Number.isNaN(month) ? undefined : month);

    const [income, expenses] = await Promise.all([
      PaymentSettlement.aggregate([
        { $match: { userId, paymentDate: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalIncome = income[0]?.total ?? 0;
    const totalExpenses = expenses[0]?.total ?? 0;

    return NextResponse.json({
      period: { start, end },
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
    });
  } catch (error) {
    console.error("[REPORT_MONTHLY_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
