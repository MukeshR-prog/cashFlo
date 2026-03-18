/**
 * structured-db-query.ts
 * ──────────────────────
 * Safe, template-based MongoDB query execution for the structured-data path.
 * The LLM never generates raw DB queries – only picks a template + parameters.
 */

import mongoose from "mongoose";
import Expense from "@/app/api/_lib/models/Expense";
import Invoice from "@/app/api/_lib/models/Invoice";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Client from "@/app/api/_lib/models/Client";
import { QueryIntent } from "./query-understanding";

export interface DBResult {
  label: string;
  data: unknown;
}

// ──────────────────────────────────────────────────────────────────────────────
// Date range helpers
// ──────────────────────────────────────────────────────────────────────────────

function buildDateRange(
  year: number | null,
  month: number | null
): { $gte: Date; $lte: Date } | undefined {
  if (!year && !month) return undefined;
  const now = new Date();
  const y = year ?? now.getFullYear();
  if (month) {
    const start = new Date(y, month - 1, 1);
    const end = new Date(y, month, 0, 23, 59, 59, 999);
    return { $gte: start, $lte: end };
  }
  // Full year
  return { $gte: new Date(y, 0, 1), $lte: new Date(y, 11, 31, 23, 59, 59, 999) };
}

// ──────────────────────────────────────────────────────────────────────────────
// Query templates
// ──────────────────────────────────────────────────────────────────────────────

async function getExpenses(
  userId: mongoose.Types.ObjectId,
  entities: QueryIntent["entities"]
): Promise<DBResult[]> {
  const match: Record<string, unknown> = { userId };
  const dateRange = buildDateRange(entities.year as number | null, entities.month as number | null);
  if (dateRange) match.date = dateRange;
  if (entities.category) match.category = { $regex: entities.category as string, $options: "i" };

  const [summary, byCategory] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
          maxAmount: { $max: "$amount" },
        },
      },
    ]),
    Expense.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]),
  ]);

  return [
    { label: "Expense Summary", data: summary[0] ?? { total: 0, count: 0 } },
    { label: "Expenses by Category", data: byCategory },
  ];
}

async function getInvoices(
  userId: mongoose.Types.ObjectId,
  entities: QueryIntent["entities"]
): Promise<DBResult[]> {
  const match: Record<string, unknown> = { userId };
  if (entities.status) match.status = entities.status;
  const dateRange = buildDateRange(entities.year as number | null, entities.month as number | null);
  if (dateRange) match.issueDate = dateRange;

  const [summary, byStatus, recentItems] = await Promise.all([
    Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalDue: { $sum: "$amountDue" },
          totalPaid: { $sum: "$amountPaid" },
          count: { $sum: 1 },
        },
      },
    ]),
    Invoice.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$totalAmount" } } },
    ]),
    Invoice.find(match)
      .populate("clientId", "name email")
      .sort({ issueDate: -1 })
      .limit(5)
      .lean(),
  ]);

  return [
    { label: "Invoice Summary", data: summary[0] ?? {} },
    { label: "Invoices by Status", data: byStatus },
    { label: "Recent Invoices", data: recentItems },
  ];
}

async function getPayments(
  userId: mongoose.Types.ObjectId,
  entities: QueryIntent["entities"]
): Promise<DBResult[]> {
  const match: Record<string, unknown> = { userId };
  const dateRange = buildDateRange(entities.year as number | null, entities.month as number | null);
  if (dateRange) match.paymentDate = dateRange;

  const [summary, byMode] = await Promise.all([
    PaymentSettlement.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    PaymentSettlement.aggregate([
      { $match: match },
      { $group: { _id: "$paymentMode", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
  ]);

  return [
    { label: "Payment Summary", data: summary[0] ?? {} },
    { label: "Payments by Mode", data: byMode },
  ];
}

async function getClients(
  userId: mongoose.Types.ObjectId
): Promise<DBResult[]> {
  const clients = await Client.find({ userId }).sort({ createdAt: -1 }).limit(10).lean();
  return [{ label: "Clients", data: clients }];
}

async function getCashflow(
  userId: mongoose.Types.ObjectId,
  entities: QueryIntent["entities"]
): Promise<DBResult[]> {
  const match: Record<string, unknown> = { userId };
  const dateRange = buildDateRange(entities.year as number | null, entities.month as number | null);
  if (dateRange) match.date = dateRange;

  const [income, expenses] = await Promise.all([
    PaymentSettlement.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const incomeTotal = income[0]?.total ?? 0;
  const expenseTotal = expenses[0]?.total ?? 0;

  return [
    {
      label: "Cashflow",
      data: {
        income: incomeTotal,
        expenses: expenseTotal,
        net: incomeTotal - expenseTotal,
      },
    },
  ];
}

// ──────────────────────────────────────────────────────────────────────────────
// Router
// ──────────────────────────────────────────────────────────────────────────────

export async function executeStructuredQuery(
  userId: mongoose.Types.ObjectId,
  intent: QueryIntent
): Promise<DBResult[]> {
  switch (intent.intent) {
    case "expense_query":
      return getExpenses(userId, intent.entities);
    case "invoice_query":
      return getInvoices(userId, intent.entities);
    case "payment_query":
      return getPayments(userId, intent.entities);
    case "client_query":
      return getClients(userId);
    case "cashflow_query":
    case "analytics_query":
      return getCashflow(userId, intent.entities);
    default:
      // Try expenses + invoices as a broad default
      const [exp, inv] = await Promise.all([
        getExpenses(userId, intent.entities),
        getInvoices(userId, intent.entities),
      ]);
      return [...exp, ...inv];
  }
}
