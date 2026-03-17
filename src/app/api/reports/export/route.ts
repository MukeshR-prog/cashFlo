import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Expense from "@/app/api/_lib/models/Expense";

function toCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerLine = headers.join(",");
  const lines = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        const text = value == null ? "" : String(value).replace(/\"/g, '\"\"');
        return `\"${text}\"`;
      })
      .join(",")
  );
  return [headerLine, ...lines].join("\n");
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const format = req.nextUrl.searchParams.get("format") ?? "csv";
    if (format !== "csv") {
      return NextResponse.json({ error: "Only csv export is supported currently" }, { status: 400 });
    }

    await connectDB();

    const expenses = await Expense.find({ userId: auth.userId }).sort({ date: -1 }).lean();
    const csv = toCsv(
      expenses.map((e) => ({
        id: e._id.toString(),
        date: e.date.toISOString(),
        title: e.title,
        category: e.category,
        amount: e.amount,
        type: e.type,
        paymentMode: e.paymentMode ?? "",
        notes: e.notes ?? "",
      }))
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="expenses-report.csv"',
      },
    });
  } catch (error) {
    console.error("[REPORT_EXPORT_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
