/**
 * GET /api/reports/data
 * ─────────────────────
 * Returns aggregated reports data computed from real database records:
 * - Monthly cashflow (last 6 months)
 * - Monthly income (with expected upcoming)
 * - Profitability (income vs business expenses)
 * - Expense category breakdown
 * - Recent ledger entries
 * - Annual (12-month) overview
 */

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Expense from "@/app/api/_lib/models/Expense";
import Invoice from "@/app/api/_lib/models/Invoice";
import BankTransaction from "@/app/api/_lib/models/BankTransaction";

export const dynamic = "force-dynamic";

function monthLabel(date: Date) {
  return date.toLocaleString("en-IN", { month: "short" });
}

function monthYearLabel(date: Date) {
  const m = date.toLocaleString("en-IN", { month: "short" });
  const y = date.getFullYear().toString().slice(2);
  return `${m} '${y}`;
}

export async function GET() {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    const now = new Date();

    // Fetch all data
    const [settlements, expenses, invoices, bankTxns] = await Promise.all([
      PaymentSettlement.find({ userId }).sort({ paymentDate: 1 }).lean(),
      Expense.find({ userId }).sort({ date: 1 }).lean(),
      Invoice.find({ userId }).lean(),
      BankTransaction.find({ userId }).sort({ transactionDate: -1 }).limit(20).lean(),
    ]);

    // ── Monthly Cashflow (last 6 months) ─────────────────────────────────────
    const cashflowMonths: { month: string; cashIn: number; cashOut: number; net: number; balance: number; inflow: number; outflow: number }[] = [];
    let runningBalance = 0;

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const label = monthLabel(monthStart);

      const cashIn = settlements
        .filter((s) => new Date(s.paymentDate) >= monthStart && new Date(s.paymentDate) <= monthEnd)
        .reduce((sum, s) => sum + s.amount, 0);

      const cashOut = expenses
        .filter((e) => new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd)
        .reduce((sum, e) => sum + e.amount, 0);

      runningBalance += cashIn - cashOut;

      cashflowMonths.push({
        month: label,
        cashIn,
        cashOut,
        net: cashIn - cashOut,
        balance: runningBalance,
        inflow: cashIn,
        outflow: cashOut,
      });
    }

    // ── Monthly Income (settled + expected) ──────────────────────────────────
    const incomeMonths: { month: string; settledIncome: number; expected: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const settled = settlements
        .filter((s) => new Date(s.paymentDate) >= monthStart && new Date(s.paymentDate) <= monthEnd)
        .reduce((sum, s) => sum + s.amount, 0);

      const expected = invoices
        .filter((inv) => {
          const due = new Date(inv.dueDate);
          return due >= monthStart && due <= monthEnd && (inv.status === "sent" || inv.status === "due" || inv.status === "partially_paid");
        })
        .reduce((sum, inv) => sum + (inv.amountDue ?? 0), 0);

      incomeMonths.push({
        month: monthLabel(monthStart),
        settledIncome: settled,
        expected,
      });
    }

    // ── Profitability (last 6 months) ────────────────────────────────────────
    const profitMonths: { month: string; income: number; businessExpenses: number; profit: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const income = settlements
        .filter((s) => new Date(s.paymentDate) >= monthStart && new Date(s.paymentDate) <= monthEnd)
        .reduce((sum, s) => sum + s.amount, 0);

      const bizExpenses = expenses
        .filter((e) => new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd && e.type === "BUSINESS")
        .reduce((sum, e) => sum + e.amount, 0);

      profitMonths.push({
        month: monthLabel(monthStart),
        income,
        businessExpenses: bizExpenses,
        profit: income - bizExpenses,
      });
    }

    // ── Expense Category Breakdown (current month) ───────────────────────────
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const categoryMap = new Map<string, number>();
    const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

    for (const e of expenses) {
      if (new Date(e.date) >= currentMonthStart) {
        const cat = e.category ?? "Other";
        categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + e.amount);
      }
    }

    const categoryExpenses = [...categoryMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value], i) => ({ name, value, color: chartColors[i % chartColors.length] }));

    const totalExpenses = categoryExpenses.reduce((s, c) => s + c.value, 0);
    const currentMonthSettlements = settlements
      .filter((s) => new Date(s.paymentDate) >= currentMonthStart)
      .reduce((sum, s) => sum + s.amount, 0);

    // ── Recent Ledger Entries ────────────────────────────────────────────────
    const ledger: { date: string; source: string; type: "Inflow" | "Outflow"; amount: number }[] = [];

    for (const s of settlements.slice(-5).reverse()) {
      ledger.push({
        date: new Date(s.paymentDate).toISOString().split("T")[0],
        source: `Payment – ${s.payerName ?? "Client"}`,
        type: "Inflow",
        amount: s.amount,
      });
    }

    for (const e of expenses.slice(-5).reverse()) {
      ledger.push({
        date: new Date(e.date).toISOString().split("T")[0],
        source: e.title,
        type: "Outflow",
        amount: e.amount,
      });
    }

    for (const b of bankTxns.slice(0, 5)) {
      ledger.push({
        date: new Date(b.transactionDate).toISOString().split("T")[0],
        source: b.description,
        type: b.direction === "credit" ? "Inflow" : "Outflow",
        amount: b.amount,
      });
    }

    ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // ── Annual (12 months) ──────────────────────────────────────────────────
    const annualData: { month: string; income: number; expenses: number; profit: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const income = settlements
        .filter((s) => new Date(s.paymentDate) >= monthStart && new Date(s.paymentDate) <= monthEnd)
        .reduce((sum, s) => sum + s.amount, 0);

      const exp = expenses
        .filter((e) => new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd)
        .reduce((sum, e) => sum + e.amount, 0);

      annualData.push({
        month: i >= 6 ? monthYearLabel(monthStart) : monthLabel(monthStart),
        income,
        expenses: exp,
        profit: income - exp,
      });
    }

    // ── All-time Expense Categories ──────────────────────────────────────────
    const allCatMap = new Map<string, number>();
    for (const e of expenses) {
      const cat = e.category ?? "Other";
      allCatMap.set(cat, (allCatMap.get(cat) ?? 0) + e.amount);
    }
    const allCategoryExpenses = [...allCatMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: chartColors[i % chartColors.length] }));


    // ── Business vs Personal Split ──────────────────────────────────────────
    const businessPersonalMonths: { month: string; business: number; personal: number }[] = [];
    let totalBusinessAll = 0;
    let totalPersonalAll = 0;
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      let biz = 0;
      let pers = 0;
      for (const e of expenses) {
        const d = new Date(e.date);
        if (d >= monthStart && d <= monthEnd) {
          if (e.type === "BUSINESS") biz += e.amount;
          else pers += e.amount;
        }
      }
      totalBusinessAll += biz;
      totalPersonalAll += pers;
      businessPersonalMonths.push({ month: monthLabel(monthStart), business: biz, personal: pers });
    }

    // ── Tax Summary ─────────────────────────────────────────────────────────
    const totalSettlements = settlements.reduce((s, p) => s + p.amount, 0);
    const businessExCats = new Map<string, number>();
    for (const e of expenses) {
      if (e.type === "BUSINESS") {
        const cat = e.category ?? "Other";
        businessExCats.set(cat, (businessExCats.get(cat) ?? 0) + e.amount);
      }
    }
    const businessExpenseBreakdown = [...businessExCats.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value, color: chartColors[i % chartColors.length] }));

    // ── Invoice Lifecycle (drafts, sent/due, completion) ────────────────────
    const Reminder = (await import("@/app/api/_lib/models/Reminder")).default;
    const Client = (await import("@/app/api/_lib/models/Client")).default;
    const reminders = await Reminder.find({ userId }).lean();
    const clientsList = await Client.find({ userId }).lean();
    const clientMap = new Map<string, string>();
    for (const c of clientsList) clientMap.set(c._id.toString(), c.name);

    // Drafts
    const draftInvoices = invoices
      .filter((inv) => inv.status === "draft")
      .map((inv) => ({
        id: inv.invoiceNumber,
        client: clientMap.get(inv.clientId.toString()) ?? "Unknown",
        amount: inv.totalAmount,
        lastEdited: new Date(inv.updatedAt ?? inv.issueDate).toISOString().split("T")[0],
        created: new Date(inv.issueDate).toISOString().split("T")[0],
      }));

    // Sent & Due groups
    const sentDueInvoices = invoices
      .filter((inv) => ["sent", "due", "overdue", "partially_paid"].includes(inv.status))
      .map((inv) => {
        const dueDate = new Date(inv.dueDate);
        const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: inv.invoiceNumber,
          _id: inv._id.toString(),
          client: clientMap.get(inv.clientId.toString()) ?? "Unknown",
          amount: inv.totalAmount,
          dueDate: dueDate.toISOString().split("T")[0],
          sentDate: new Date(inv.issueDate).toISOString().split("T")[0],
          daysOverdue: diffDays,
          reminderSent: reminders.some((r) => r.invoiceId.toString() === inv._id.toString()),
          status: inv.status,
        };
      });

    // Invoice Completion records
    const completionRecords = invoices.map((inv) => {
      const invPayments = settlements.filter((s) => s.invoiceId?.toString() === inv._id.toString());
      const firstPayment = invPayments.length > 0 ? new Date(invPayments[0].paymentDate).toISOString().split("T")[0] : "—";
      const settled = inv.status === "paid" && invPayments.length > 0
        ? new Date(invPayments[invPayments.length - 1].paymentDate).toISOString().split("T")[0]
        : "—";
      const issueDate = new Date(inv.issueDate);
      const daysToClose = inv.status === "paid" && invPayments.length > 0
        ? Math.floor((new Date(invPayments[invPayments.length - 1].paymentDate).getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const invReminders = reminders.filter((r) => r.invoiceId?.toString() === inv._id.toString());

      return {
        id: inv.invoiceNumber,
        client: clientMap.get(inv.clientId.toString()) ?? "Unknown",
        amount: inv.totalAmount,
        created: issueDate.toISOString().split("T")[0],
        sent: issueDate.toISOString().split("T")[0],
        reminders: invReminders.length,
        firstPayment,
        settled,
        daysToClose,
        status: inv.status === "paid" ? "Complete" : inv.status === "overdue" ? "Overdue" : "In Progress",
      };
    });

    // Invoice lifecycle report
    const invoiceLifecycle = invoices.map((inv) => {
      const invPayments = settlements.filter((s) => s.invoiceId?.toString() === inv._id.toString());
      const paymentDates = invPayments.map((p) => new Date(p.paymentDate).toISOString().split("T")[0]).join(", ") || "—";
      const settled = inv.status === "paid" && invPayments.length > 0
        ? new Date(invPayments[invPayments.length - 1].paymentDate).toISOString().split("T")[0]
        : "—";
      const invReminders = reminders.filter((r) => r.invoiceId?.toString() === inv._id.toString());
      return {
        id: inv.invoiceNumber,
        client: clientMap.get(inv.clientId.toString()) ?? "Unknown",
        amount: inv.totalAmount,
        created: new Date(inv.issueDate).toISOString().split("T")[0],
        sent: new Date(inv.issueDate).toISOString().split("T")[0],
        reminders: invReminders.length,
        payments: paymentDates,
        settled,
        status: inv.status === "paid" ? "Paid" : inv.status === "overdue" ? "Overdue" : "Pending",
      };
    });

    return NextResponse.json({
      cashflow: cashflowMonths,
      income: incomeMonths,
      profitability: profitMonths,
      categoryExpenses,
      allCategoryExpenses,
      totalExpenses,
      totalIncome: currentMonthSettlements,
      totalIncomeAllTime: totalSettlements,
      totalPersonalExpenses: totalPersonalAll,
      ledger: ledger.slice(0, 10),
      annualData,
      // Tax summary
      businessExpenseBreakdown,
      totalBusinessExpenses: totalBusinessAll,
      // Business vs Personal
      businessPersonalMonths,
      businessPersonalSplit: [
        { name: "Business", value: totalBusinessAll, color: "var(--chart-1)" },
        { name: "Personal", value: totalPersonalAll, color: "var(--chart-4)" },
      ],
      // Invoice lifecycle
      draftInvoices,
      sentDueInvoices,
      completionRecords,
      invoiceLifecycle,
    });
  } catch (error) {
    console.error("[REPORTS_DATA_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
