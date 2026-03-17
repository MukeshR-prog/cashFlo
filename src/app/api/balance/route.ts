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

    const yearParam = req.nextUrl.searchParams.get("year");
    const monthParam = req.nextUrl.searchParams.get("month");
    const year = yearParam ? Number(yearParam) : undefined;
    const month = monthParam ? Number(monthParam) : undefined;
    const userId = new mongoose.Types.ObjectId(auth.userId);
    const { start, end } = getMonthBoundaries(year, month);

    const [allIn, allOut, monthIn, monthOut, recentDeductions] = await Promise.all([
      PaymentSettlement.aggregate([{ $match: { userId } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Expense.aggregate([{ $match: { userId } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      PaymentSettlement.aggregate([
        { $match: { userId, paymentDate: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.find({ userId: auth.userId }).sort({ date: -1 }).limit(10).lean(),
    ]);

    const inflow = allIn[0]?.total ?? 0;
    const outflow = allOut[0]?.total ?? 0;

    return NextResponse.json({
      currentBalance: inflow - outflow,
      inflow,
      outflow,
      monthlyInflow: monthIn[0]?.total ?? 0,
      monthlyOutflow: monthOut[0]?.total ?? 0,
      recentDeductions: recentDeductions.map((row) => ({
        id: row._id.toString(),
        title: row.title,
        amount: row.amount,
        category: row.category,
        date: row.date,
      })),
    });
  } catch (error) {
    console.error("[BALANCE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
