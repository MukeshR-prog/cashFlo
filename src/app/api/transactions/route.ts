import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import BankTransaction from "@/app/api/_lib/models/BankTransaction";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? 100);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 100;
    const direction = req.nextUrl.searchParams.get("direction");

    await connectDB();

    const query: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(auth.userId) };
    if (direction === "credit" || direction === "debit") {
      query.direction = direction;
    }

    const rows = await BankTransaction.find(query)
      .sort({ transactionDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      transactions: rows.map((row) => ({
        id: row._id.toString(),
        source: row.source,
        direction: row.direction,
        amount: row.amount,
        currency: row.currency,
        transactionDate: row.transactionDate,
        description: row.description,
        reference: row.reference ?? null,
        linkedExpenseId: row.linkedExpenseId ? String(row.linkedExpenseId) : null,
        linkedSettlementId: row.linkedSettlementId ? String(row.linkedSettlementId) : null,
      })),
    });
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
