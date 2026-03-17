import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Expense from "@/app/api/_lib/models/Expense";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const months = Number(req.nextUrl.searchParams.get("months") ?? "6");
    const start = new Date();
    start.setMonth(start.getMonth() - (months - 1));
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const grouped = await Expense.aggregate([
      { $match: { userId: auth.userId, date: { $gte: start } } },
      {
        $group: {
          _id: {
            y: { $year: "$date" },
            m: { $month: "$date" },
            category: "$category",
          },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);

    const map = new Map<string, Record<string, number | string>>();
    for (const row of grouped) {
      const key = `${row._id.y}-${row._id.m}`;
      if (!map.has(key)) {
        map.set(key, { month: `${row._id.y}-${String(row._id.m).padStart(2, "0")}` });
      }
      const entry = map.get(key)!;
      entry[row._id.category] = row.amount;
    }

    return NextResponse.json({ monthly: Array.from(map.values()) });
  } catch (error) {
    console.error("[ANALYTICS_MONTHLY_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
