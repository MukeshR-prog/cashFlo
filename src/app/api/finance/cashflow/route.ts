import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Expense from "@/app/api/_lib/models/Expense";
import BankTransaction from "@/app/api/_lib/models/BankTransaction";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const year = Number(req.nextUrl.searchParams.get("year") ?? new Date().getFullYear());
  const userId = new mongoose.Types.ObjectId(auth.userId);
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const [cashIn, cashOut, bankIn, bankOut] = await Promise.all([
      PaymentSettlement.aggregate([
        { $match: { userId, paymentDate: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: "$paymentDate" } }, amount: { $sum: "$amount" } } },
        { $sort: { "_id.month": 1 } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: "$date" } }, amount: { $sum: "$amount" } } },
        { $sort: { "_id.month": 1 } },
      ]),
      BankTransaction.aggregate([
        { $match: { userId, direction: "credit", transactionDate: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: "$transactionDate" } }, amount: { $sum: "$amount" } } },
        { $sort: { "_id.month": 1 } },
      ]),
      BankTransaction.aggregate([
        { $match: { userId, direction: "debit", transactionDate: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: "$transactionDate" } }, amount: { $sum: "$amount" } } },
        { $sort: { "_id.month": 1 } },
      ]),
    ]);

    const mergeByMonth = (base: Array<{ _id: { month: number }; amount: number }>, extra: Array<{ _id: { month: number }; amount: number }>) => {
      const map = new Map<number, number>();
      for (const row of base) map.set(row._id.month, (map.get(row._id.month) ?? 0) + row.amount);
      for (const row of extra) map.set(row._id.month, (map.get(row._id.month) ?? 0) + row.amount);
      return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([month, amount]) => ({ _id: { month }, amount }));
    };

    const mergedCashIn = mergeByMonth(cashIn as Array<{ _id: { month: number }; amount: number }>, bankIn as Array<{ _id: { month: number }; amount: number }>);
    const mergedCashOut = mergeByMonth(cashOut as Array<{ _id: { month: number }; amount: number }>, bankOut as Array<{ _id: { month: number }; amount: number }>);

    return NextResponse.json({
      year,
      monthlyCashIn: mergedCashIn.map((row) => ({ month: row._id.month, amount: row.amount })),
      monthlyCashOut: mergedCashOut.map((row) => ({ month: row._id.month, amount: row.amount })),
    });
  } catch (error) {
    console.error("[CASHFLOW_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
