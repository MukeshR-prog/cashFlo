import { NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Expense from "@/app/api/_lib/models/Expense";

export async function GET() {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const data = await Expense.aggregate([
      { $match: { userId: auth.userId } },
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
