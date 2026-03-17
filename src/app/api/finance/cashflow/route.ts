import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Expense from "@/app/api/_lib/models/Expense";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const year = Number(req.nextUrl.searchParams.get("year") ?? new Date().getFullYear());
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const [cashIn, cashOut] = await Promise.all([
      PaymentSettlement.aggregate([
        { $match: { userId: auth.userId, paymentDate: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: "$paymentDate" } }, amount: { $sum: "$amount" } } },
        { $sort: { "_id.month": 1 } },
      ]),
      Expense.aggregate([
        { $match: { userId: auth.userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: "$date" } }, amount: { $sum: "$amount" } } },
        { $sort: { "_id.month": 1 } },
      ]),
    ]);

    return NextResponse.json({
      year,
      monthlyCashIn: cashIn.map((row) => ({ month: row._id.month, amount: row.amount })),
      monthlyCashOut: cashOut.map((row) => ({ month: row._id.month, amount: row.amount })),
    });
  } catch (error) {
    console.error("[CASHFLOW_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
