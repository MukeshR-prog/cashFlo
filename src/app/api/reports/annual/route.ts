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

    const [incomeRows, expenseRows, bankIncomeRows, bankExpenseRows] = await Promise.all([
      PaymentSettlement.aggregate([
        { $match: { userId, paymentDate: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: "$paymentDate" } }, total: { $sum: "$amount" } } },
        { $sort: { "_id.month": 1 } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: "$date" } }, total: { $sum: "$amount" } } },
        { $sort: { "_id.month": 1 } },
      ]),
      BankTransaction.aggregate([
        { $match: { userId, direction: "credit", transactionDate: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: "$transactionDate" } }, total: { $sum: "$amount" } } },
        { $sort: { "_id.month": 1 } },
      ]),
      BankTransaction.aggregate([
        { $match: { userId, direction: "debit", transactionDate: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: "$transactionDate" } }, total: { $sum: "$amount" } } },
        { $sort: { "_id.month": 1 } },
      ]),
    ]);

    const mergeByMonth = (
      a: Array<{ _id: { month: number }; total: number }>,
      b: Array<{ _id: { month: number }; total: number }>
    ) => {
      const map = new Map<number, number>();
      for (const row of a) map.set(row._id.month, (map.get(row._id.month) ?? 0) + row.total);
      for (const row of b) map.set(row._id.month, (map.get(row._id.month) ?? 0) + row.total);
      return Array.from(map.entries())
        .sort((x, y) => x[0] - y[0])
        .map(([month, total]) => ({ month, total }));
    };

    const income = mergeByMonth(
      incomeRows as Array<{ _id: { month: number }; total: number }>,
      bankIncomeRows as Array<{ _id: { month: number }; total: number }>
    );
    const expenses = mergeByMonth(
      expenseRows as Array<{ _id: { month: number }; total: number }>,
      bankExpenseRows as Array<{ _id: { month: number }; total: number }>
    );

    const totalIncome = income.reduce((sum, row) => sum + row.total, 0);
    const totalExpenses = expenses.reduce((sum, row) => sum + row.total, 0);

    return NextResponse.json({
      year,
      income,
      expenses,
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
    });
  } catch (error) {
    console.error("[REPORT_ANNUAL_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
