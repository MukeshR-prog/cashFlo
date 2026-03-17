import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Expense from "@/app/api/_lib/models/Expense";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const days = Number(req.nextUrl.searchParams.get("days") ?? "28");
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const heat = await Expense.aggregate([
      { $match: { userId: auth.userId, date: { $gte: start } } },
      {
        $group: {
          _id: {
            y: { $year: "$date" },
            m: { $month: "$date" },
            d: { $dayOfMonth: "$date" },
          },
          value: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
    ]);

    return NextResponse.json({
      heatmap: heat.map((row) => ({
        date: `${row._id.y}-${String(row._id.m).padStart(2, "0")}-${String(row._id.d).padStart(2, "0")}`,
        value: row.value,
      })),
    });
  } catch (error) {
    console.error("[ANALYTICS_HEATMAP_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
