import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Invoice from "@/app/api/_lib/models/Invoice";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Expense from "@/app/api/_lib/models/Expense";
import Client from "@/app/api/_lib/models/Client";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const userId = new mongoose.Types.ObjectId(auth.userId);
    const now = new Date();

    // Get current and last month date ranges
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Fetch all aggregates in parallel
    const [
      overdueInvoices,
      upcomingInvoices,
      totalEarned,
      pendingAmount,
      thisMonthExpenses,
      lastMonthExpenses,
      clientCount,
      invoiceStatusBreakdown,
      monthlyCashflow,
    ] = await Promise.all([
      // Overdue invoices
      Invoice.find({ userId, status: "overdue" }).populate("clientId", "name email").sort({ dueDate: 1 }).limit(5).lean(),

      // Upcoming (sent/due, not overdue)
      Invoice.find({ userId, status: { $in: ["sent", "due"] }, dueDate: { $gte: now } })
        .populate("clientId", "name email")
        .sort({ dueDate: 1 })
        .limit(5)
        .lean(),

      // Total paid (all time)
      PaymentSettlement.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // Pending amount (invoices not fully paid)
      Invoice.aggregate([
        { $match: { userId, status: { $in: ["sent", "due", "overdue", "partially_paid"] } } },
        { $group: { _id: null, total: { $sum: "$amountDue" } } },
      ]),

      // This month expenses
      Expense.aggregate([
        { $match: { userId, date: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // Last month expenses
      Expense.aggregate([
        { $match: { userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      // Client count
      Client.countDocuments({ userId }),

      // Invoice status breakdown for donut chart
      Invoice.aggregate([
        { $match: { userId } },
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$totalAmount" } } },
      ]),

      // Last 6 months cashflow
      PaymentSettlement.aggregate([
        { $match: { userId, paymentDate: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
        {
          $group: {
            _id: { year: { $year: "$paymentDate" }, month: { $month: "$paymentDate" } },
            cashIn: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    // Build 6-month array with both cashIn and expenses
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const cashflowMap: Record<string, { cashIn: number; cashOut: number }> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      cashflowMap[key] = { cashIn: 0, cashOut: 0 };
    }

    for (const m of monthlyCashflow) {
      const key = `${m._id.year}-${m._id.month}`;
      if (cashflowMap[key]) cashflowMap[key].cashIn = m.cashIn;
    }

    // Get last 6 months expenses
    const expenseMonthly = await Expense.aggregate([
      { $match: { userId, date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          cashOut: { $sum: "$amount" },
        },
      },
    ]);
    for (const m of expenseMonthly) {
      const key = `${m._id.year}-${m._id.month}`;
      if (cashflowMap[key]) cashflowMap[key].cashOut = m.cashOut;
    }

    const cashflowChart = Object.entries(cashflowMap).map(([key, val]) => {
      const [year, month] = key.split("-").map(Number);
      return {
        month: monthNames[month - 1],
        cashIn: Math.round(val.cashIn),
        cashOut: Math.round(val.cashOut),
        net: Math.round(val.cashIn - val.cashOut),
      };
    });

    // KPIs
    const totalEarnedVal = totalEarned[0]?.total ?? 0;
    const pendingVal     = pendingAmount[0]?.total ?? 0;
    const thisMonthExp   = thisMonthExpenses[0]?.total ?? 0;
    const lastMonthExp   = lastMonthExpenses[0]?.total ?? 0;
    const netProfit      = totalEarnedVal - (await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])).reduce((s, r) => s + r.total, 0);

    return NextResponse.json({
      kpis: {
        totalEarned:        Math.round(totalEarnedVal),
        pendingAmount:      Math.round(pendingVal),
        overdueCount:       overdueInvoices.length,
        upcomingCount:      upcomingInvoices.length,
        thisMonthExpenses:  Math.round(thisMonthExp),
        lastMonthExpenses:  Math.round(lastMonthExp),
        clientCount,
        netProfit:          Math.round(netProfit),
      },
      overdueInvoices: overdueInvoices.map((inv) => ({
        id:          inv.invoiceNumber,
        client:      (inv.clientId as any)?.name ?? "Unknown",
        amount:      `₹${inv.amountDue.toLocaleString("en-IN")}`,
        overdueDays: Math.floor((now.getTime() - inv.dueDate.getTime()) / 86400000),
        _id:         inv._id.toString(),
      })),
      upcomingPayments: upcomingInvoices.map((inv) => ({
        id:     inv.invoiceNumber,
        client: (inv.clientId as any)?.name ?? "Unknown",
        amount: `₹${inv.amountDue.toLocaleString("en-IN")}`,
        dueIn:  `${Math.ceil((inv.dueDate.getTime() - now.getTime()) / 86400000)}d`,
        _id:    inv._id.toString(),
      })),
      cashflowChart,
      invoiceStatusBreakdown: invoiceStatusBreakdown.map((s) => ({
        name:  s._id,
        value: s.count,
        total: s.total,
      })),
    });
  } catch (error) {
    console.error("[FREELANCER_DASHBOARD_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
