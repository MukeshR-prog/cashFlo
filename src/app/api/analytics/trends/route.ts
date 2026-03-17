import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Expense from "@/app/api/_lib/models/Expense";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const months = Number(req.nextUrl.searchParams.get("months") ?? "8");
  const userId = new mongoose.Types.ObjectId(auth.userId);
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const trend = await Expense.aggregate([
      { $match: { userId, date: { $gte: start } } },
      {
        $group: {
          _id: {
            y: { $year: "$date" },
            m: { $month: "$date" },
          },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);

    return NextResponse.json({
      trend: trend.map((row) => ({
        month: `${row._id.y}-${String(row._id.m).padStart(2, "0")}`,
        amount: row.amount,
      })),
    });
  } catch (error) {
    console.error("[ANALYTICS_TRENDS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
