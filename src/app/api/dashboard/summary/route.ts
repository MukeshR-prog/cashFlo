import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Invoice from "@/app/api/_lib/models/Invoice";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Expense from "@/app/api/_lib/models/Expense";
import { getMonthBoundaries } from "@/app/api/_lib/finance/date-range";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const yearParam = req.nextUrl.searchParams.get("year");
    const monthParam = req.nextUrl.searchParams.get("month");
    const year = yearParam ? Number(yearParam) : undefined;
    const month = monthParam ? Number(monthParam) : undefined;

    const { start, end } = getMonthBoundaries(year, month);

    const [invoiceAgg, paymentAgg, totalExpensesAgg, monthExpensesAgg, overdueInvoices, recentExpenses, recentPayments] = await Promise.all([
      Invoice.aggregate([
        { $match: { userId: auth.userId } },
        {
          $group: {
            _id: null,
            totalInvoiced: { $sum: "$totalAmount" },
            pendingEarnings: { $sum: "$amountDue" },
          },
        },
      ]),
      PaymentSettlement.aggregate([
        { $match: { userId: auth.userId } },
        {
          $group: {
            _id: null,
            totalReceived: { $sum: "$amount" },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { userId: auth.userId } },
        { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId: auth.userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, monthlyExpenses: { $sum: "$amount" } } },
      ]),
      Invoice.aggregate([
        { $match: { userId: auth.userId, status: "overdue" } },
        { $group: { _id: null, overdueAmount: { $sum: "$amountDue" } } },
      ]),
      Expense.find({ userId: auth.userId }).sort({ date: -1 }).limit(5).lean(),
      PaymentSettlement.find({ userId: auth.userId }).sort({ paymentDate: -1 }).limit(5).lean(),
    ]);

    const totalInvoiced = invoiceAgg[0]?.totalInvoiced ?? 0;
    const pendingEarnings = invoiceAgg[0]?.pendingEarnings ?? 0;
    const totalReceived = paymentAgg[0]?.totalReceived ?? 0;
    const totalExpenses = totalExpensesAgg[0]?.totalExpenses ?? 0;
    const monthlyIncome = PaymentSettlement.aggregate([
      { $match: { userId: auth.userId, paymentDate: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthlyIncomeValue = (await monthlyIncome)[0]?.total ?? 0;

    const recentTransactions = [
      ...recentPayments.map((payment) => ({
        id: payment._id.toString(),
        title: "Invoice payment",
        amount: payment.amount,
        date: payment.paymentDate,
        type: "income",
      })),
      ...recentExpenses.map((expense) => ({
        id: expense._id.toString(),
        title: expense.title,
        amount: expense.amount,
        date: expense.date,
        type: "expense",
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

    return NextResponse.json({
      totalInvoiced,
      totalReceived,
      pendingEarnings,
      overdueAmount: overdueInvoices[0]?.overdueAmount ?? 0,
      cashInHand: totalReceived - totalExpenses,
      monthlyIncome: monthlyIncomeValue,
      totalExpenses,
      monthlyExpenses: monthExpensesAgg[0]?.monthlyExpenses ?? 0,
      recentTransactions,
    });
  } catch (error) {
    console.error("[DASHBOARD_SUMMARY]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
