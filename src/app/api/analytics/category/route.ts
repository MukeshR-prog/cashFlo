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
    const userId = new mongoose.Types.ObjectId(auth.userId);

    const months = Number(req.nextUrl.searchParams.get("months") ?? "0");
    const start = new Date();
    if (months > 0) {
      start.setMonth(start.getMonth() - (months - 1));
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }

    const match: Record<string, unknown> = { userId };
    if (months > 0) {
      match.date = { $gte: start };
    }

    const data = await Expense.aggregate([
      { $match: match },
      { $group: { _id: "$category", value: { $sum: "$amount" } } },
      { $sort: { value: -1 } },
    ]);

    return NextResponse.json({
      categories: data.map((row) => ({ name: row._id, value: row.value })),
    });
  } catch (error) {
    console.error("[ANALYTICS_CATEGORY_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
