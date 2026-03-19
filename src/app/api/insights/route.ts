import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Expense from "@/app/api/_lib/models/Expense";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Invoice from "@/app/api/_lib/models/Invoice";
import Client from "@/app/api/_lib/models/Client";

export const dynamic = "force-dynamic";

interface Insight {
  type: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  saving?: string;
}

export async function GET() {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      currentMonthExpenses,
      prevMonthExpenses,
      topCategories,
      recurringCandidates,
      currentMonthIncome,
      prevMonthIncome,
      invoices,
      settlements,
      clients,
    ] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: currentMonthStart } } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
      ]),
      Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: "$title", count: { $sum: 1 }, total: { $sum: "$amount" } } },
        { $match: { count: { $gte: 2 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      PaymentSettlement.aggregate([
        { $match: { userId, paymentDate: { $gte: currentMonthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      PaymentSettlement.aggregate([
        { $match: { userId, paymentDate: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Invoice.find({ userId }).lean(),
      PaymentSettlement.find({ userId }).lean(),
      Client.find({ userId }).lean(),
    ]);

    const currentExpenseTotal = currentMonthExpenses[0]?.total ?? 0;
    const prevExpenseTotal = prevMonthExpenses[0]?.total ?? 0;
    const expenseChangePct = prevExpenseTotal > 0
      ? ((currentExpenseTotal - prevExpenseTotal) / prevExpenseTotal) * 100
      : 0;

    const currentIncomeTotal = currentMonthIncome[0]?.total ?? 0;
    const prevIncomeTotal = prevMonthIncome[0]?.total ?? 0;
    const incomeChangePct = prevIncomeTotal > 0
      ? ((currentIncomeTotal - prevIncomeTotal) / prevIncomeTotal) * 100
      : 0;

    // ── Build dynamic insights ───────────────────────────────────────────────
    const insights: Insight[] = [];

    // Expense spike
    if (expenseChangePct > 25) {
      insights.push({
        type: "spending_spike",
        title: "Spending Increased Significantly",
        message: `Your spending increased by ${expenseChangePct.toFixed(0)}% compared to last month. Review your expenses to identify areas to cut back.`,
        severity: "high",
      });
    }

    // Income growth
    if (incomeChangePct > 15) {
      insights.push({
        type: "income_growth",
        title: "Income Growing",
        message: `Your income increased by ${incomeChangePct.toFixed(0)}% compared to last month. Great momentum!`,
        severity: "low",
      });
    } else if (incomeChangePct < -15) {
      insights.push({
        type: "income_decline",
        title: "Income Declining",
        message: `Your income decreased by ${Math.abs(incomeChangePct).toFixed(0)}% compared to last month. Consider following up on pending invoices.`,
        severity: "high",
      });
    }

    // Category-level anomalies
    for (const cat of topCategories) {
      if (cat.total > currentExpenseTotal * 0.35 && currentExpenseTotal > 0) {
        insights.push({
          type: "category_spike",
          title: `High Spending in ${cat._id}`,
          message: `${cat._id} accounts for ${((cat.total / currentExpenseTotal) * 100).toFixed(0)}% of your expenses this month (₹${cat.total.toLocaleString("en-IN")}).`,
          severity: "medium",
          saving: `₹${Math.round(cat.total * 0.2).toLocaleString("en-IN")}/mo if reduced by 20%`,
        });
      }
    }

    // Client payment behavior
    const clientMap = new Map(clients.map((c) => [c._id.toString(), c]));
    const invoicesByClient = new Map<string, typeof invoices>();
    for (const inv of invoices) {
      const cid = inv.clientId?.toString();
      if (!cid) continue;
      if (!invoicesByClient.has(cid)) invoicesByClient.set(cid, []);
      invoicesByClient.get(cid)!.push(inv);
    }

    for (const [clientId, clientInvoices] of invoicesByClient) {
      const client = clientMap.get(clientId);
      if (!client) continue;

      const clientSettlements = settlements.filter(
        (s) => clientInvoices.some((inv) => inv._id.toString() === s.invoiceId?.toString())
      );

      if (clientSettlements.length === 0) continue;

      const delays: number[] = [];
      for (const s of clientSettlements) {
        const inv = clientInvoices.find((i) => i._id.toString() === s.invoiceId?.toString());
        if (!inv) continue;
        const delay = Math.ceil(
          (new Date(s.paymentDate).getTime() - new Date(inv.dueDate).getTime()) / 86_400_000
        );
        delays.push(delay);
      }

      const avgDelay = delays.length > 0
        ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length)
        : 0;

      if (avgDelay > 5) {
        insights.push({
          type: "client_late_payer",
          title: `${client.name} Pays Late`,
          message: `${client.name} usually pays ${avgDelay} days late on average. Consider requiring upfront deposits or more aggressive reminders.`,
          severity: avgDelay > 10 ? "high" : "medium",
        });
      }
    }

    // Recurring expense suggestions
    const recurringExpenses = recurringCandidates.map((row) => ({
      title: row._id,
      occurrences: row.count,
      total: row.total,
    }));

    if (recurringExpenses.length > 0) {
      const topRecurring = recurringExpenses[0];
      insights.push({
        type: "recurring",
        title: "Recurring Expense Detected",
        message: `"${topRecurring.title}" appears ${topRecurring.occurrences} times, totaling ₹${topRecurring.total.toLocaleString("en-IN")}. Consider negotiating a better rate or switching to annual billing.`,
        severity: "low",
        saving: `₹${Math.round(topRecurring.total * 0.15).toLocaleString("en-IN")}/yr with annual plan`,
      });
    }

    // Overdue invoices alert
    const overdueInvoices = invoices.filter((i) => i.status === "overdue");
    if (overdueInvoices.length > 0) {
      const overdueAmount = overdueInvoices.reduce((s, i) => s + (i.amountDue ?? 0), 0);
      insights.push({
        type: "overdue_alert",
        title: `${overdueInvoices.length} Overdue Invoice${overdueInvoices.length > 1 ? "s" : ""}`,
        message: `You have ₹${overdueAmount.toLocaleString("en-IN")} in overdue payments. Send reminders or follow up directly.`,
        severity: "high",
      });
    }

    // Ensure at least some insights
    if (insights.length === 0) {
      insights.push({
        type: "all_good",
        title: "Everything Looks Good",
        message: "No anomalies detected. Your finances are on track this month.",
        severity: "low",
      });
    }

    return NextResponse.json({
      spendingPatterns: {
        currentMonthTotal: currentExpenseTotal,
        previousMonthTotal: prevExpenseTotal,
        monthOverMonthChangePct: Number(expenseChangePct.toFixed(2)),
      },
      incomePatterns: {
        currentMonthTotal: currentIncomeTotal,
        previousMonthTotal: prevIncomeTotal,
        monthOverMonthChangePct: Number(incomeChangePct.toFixed(2)),
      },
      insights,
      recurringExpenses,
      topCategories: topCategories.map((row) => ({ category: row._id, total: row.total })),
    });
  } catch (error) {
    console.error("[INSIGHTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
