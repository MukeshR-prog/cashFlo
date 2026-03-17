import { NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Expense from "@/app/api/_lib/models/Expense";

export async function GET() {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [currentMonth, prevMonth, topCategories, recurringCandidates] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: auth.userId, date: { $gte: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId: auth.userId, date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId: auth.userId, date: { $gte: currentMonthStart } } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
      ]),
      Expense.aggregate([
        { $match: { userId: auth.userId } },
        { $group: { _id: "$title", count: { $sum: 1 }, total: { $sum: "$amount" } } },
        { $match: { count: { $gte: 2 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const currentTotal = currentMonth[0]?.total ?? 0;
    const prevTotal = prevMonth[0]?.total ?? 0;
    const changePct = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    const anomalies: Array<{ type: string; message: string; severity: "low" | "medium" | "high" }> = [];
    if (changePct > 25) {
      anomalies.push({
        type: "spike",
        message: `Spending increased by ${changePct.toFixed(1)}% vs previous month`,
        severity: "high",
      });
    }

    const alerts = topCategories.slice(0, 2).map((row) => ({
      type: "category",
      message: `High spending in ${row._id}: ${row.total.toFixed(2)}`,
      severity: "medium" as const,
    }));

    const recurringExpenses = recurringCandidates.map((row) => ({
      title: row._id,
      occurrences: row.count,
      total: row.total,
    }));

    return NextResponse.json({
      spendingPatterns: {
        currentMonthTotal: currentTotal,
        previousMonthTotal: prevTotal,
        monthOverMonthChangePct: Number(changePct.toFixed(2)),
      },
      anomalies,
      alerts,
      recurringExpenses,
      topCategories: topCategories.map((row) => ({ category: row._id, total: row.total })),
    });
  } catch (error) {
    console.error("[INSIGHTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
