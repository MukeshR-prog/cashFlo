import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Expense from "@/app/api/_lib/models/Expense";
import BankTransaction from "@/app/api/_lib/models/BankTransaction";
import UnifiedTransaction from "@/app/api/_lib/models/UnifiedTransaction";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    // Clear existing unified transactions for this user
    await UnifiedTransaction.deleteMany({ userId });

    const [settlements, expenses, bankTxns] = await Promise.all([
      PaymentSettlement.find({ userId }).lean(),
      Expense.find({ userId }).lean(),
      BankTransaction.find({ userId }).lean(),
    ]);

    const docs = [];

    // PaymentSettlement → Cash In
    for (const s of settlements) {
      docs.push({
        userId,
        source: "PAYMENT" as const,
        type: `Payment for Invoice`,
        amount: s.amount,
        direction: "IN" as const,
        referenceId: s._id.toString(),
        date: s.paymentDate,
        paymentMode: s.paymentMode,
      });
    }

    // Expense → Cash Out
    for (const e of expenses) {
      docs.push({
        userId,
        source: "EXPENSE" as const,
        type: e.title,
        amount: e.amount,
        direction: "OUT" as const,
        referenceId: e._id.toString(),
        date: e.date,
        paymentMode: e.paymentMode,
        category: e.category,
      });
    }

    // BankTransaction → IN or OUT based on direction
    for (const b of bankTxns) {
      const src = b.source === "wallet" ? "WALLET" as const
        : b.source === "manual" ? "MANUAL" as const
        : "BANK" as const;
      docs.push({
        userId,
        source: src,
        type: b.description,
        amount: b.amount,
        direction: (b.direction === "credit" ? "IN" : "OUT") as "IN" | "OUT",
        referenceId: b._id.toString(),
        date: b.transactionDate,
      });
    }

    if (docs.length > 0) {
      await UnifiedTransaction.insertMany(docs);
    }

    return NextResponse.json({
      success: true,
      synced: {
        payments: settlements.length,
        expenses: expenses.length,
        bankTransactions: bankTxns.length,
        total: docs.length,
      },
    });
  } catch (error) {
    console.error("[TRANSACTIONS_SYNC_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
