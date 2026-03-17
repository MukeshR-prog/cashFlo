/**
 * POST /api/seed
 * ──────────────
 * Dev-only endpoint to populate the database with sample data for the
 * currently authenticated user. Redirected to 404 in production.
 *
 * Usage: fetch('/api/seed', { method: 'POST' })
 */

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Client from "@/app/api/_lib/models/Client";
import Invoice from "@/app/api/_lib/models/Invoice";
import Expense from "@/app/api/_lib/models/Expense";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";

// Only run in development
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  await connectDB();
  const userId = new mongoose.Types.ObjectId(auth.userId);

  // ── helpers ──────────────────────────────────────────────────────────────────
  function daysAgo(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  }

  // ── 1. Clear existing ────────────────────────────────────────────────────────
  await Promise.all([
    Expense.deleteMany({ userId }),
    Invoice.deleteMany({ userId }),
    Client.deleteMany({ userId }),
    PaymentSettlement.deleteMany({ userId }),
  ]);

  // ── 2. Clients ────────────────────────────────────────────────────────────────
  const clientDefs = [
    { name: "Nexus Digital LLP",   email: "billing@nexusdigital.in",  phone: "+91 98201 11001" },
    { name: "Spark Ventures",      email: "accounts@sparkventures.io", phone: "+91 98202 22002" },
    { name: "Maya Retail Pvt Ltd", email: "finance@mayaretail.com",   phone: "+91 98203 33003" },
    { name: "Arun Kumar",          email: "arun.kumar@gmail.com",     phone: "+91 99001 44004" },
    { name: "BlueSky Technologies",email: "ap@bluesky.tech",          phone: "+91 98204 55005" },
  ];
  const clients = await Client.insertMany(clientDefs.map((c) => ({ ...c, userId })));

  // ── 3. Expenses ───────────────────────────────────────────────────────────────
  const expenseDefs = [
    { title: "Swiggy Order",          category: "Food & Dining",  amount: 620,  paymentMode: "UPI",         daysBack: 1,  type: "PERSONAL", notes: "Dinner" },
    { title: "Zomato Lunch",           category: "Food & Dining",  amount: 385,  paymentMode: "UPI",         daysBack: 3,  type: "PERSONAL", notes: "Lunch" },
    { title: "Starbucks Coffee",       category: "Food & Dining",  amount: 480,  paymentMode: "Credit Card", daysBack: 5,  type: "PERSONAL" },
    { title: "Weekly Groceries",       category: "Food & Dining",  amount: 2200, paymentMode: "UPI",         daysBack: 7,  type: "PERSONAL" },
    { title: "Team Lunch",             category: "Food & Dining",  amount: 3200, paymentMode: "Credit Card", daysBack: 12, type: "BUSINESS", notes: "Client meeting" },
    { title: "Dominos Pizza",          category: "Food & Dining",  amount: 720,  paymentMode: "UPI",         daysBack: 18, type: "PERSONAL" },
    { title: "Monthly Groceries",      category: "Food & Dining",  amount: 4800, paymentMode: "Debit Card",  daysBack: 35, type: "PERSONAL" },
    { title: "Metro Card Recharge",   category: "Transport",       amount: 500,  paymentMode: "UPI",         daysBack: 2,  type: "PERSONAL" },
    { title: "Petrol",                category: "Transport",       amount: 1800, paymentMode: "Cash",        daysBack: 6,  type: "PERSONAL" },
    { title: "Ola Cab",               category: "Transport",       amount: 320,  paymentMode: "UPI",         daysBack: 9,  type: "PERSONAL" },
    { title: "Flight Tickets",        category: "Transport",       amount: 8500, paymentMode: "Credit Card", daysBack: 25, type: "BUSINESS", notes: "Client visit Mumbai" },
    { title: "Electricity Bill",      category: "Utilities",       amount: 2300, paymentMode: "Net Banking", daysBack: 4,  type: "PERSONAL", notes: "March bill" },
    { title: "Internet Bill",         category: "Utilities",       amount: 1499, paymentMode: "Net Banking", daysBack: 8,  type: "PERSONAL" },
    { title: "Mobile Recharge",       category: "Utilities",       amount: 719,  paymentMode: "UPI",         daysBack: 14, type: "PERSONAL" },
    { title: "Gas Cylinder",          category: "Utilities",       amount: 950,  paymentMode: "Cash",        daysBack: 20, type: "PERSONAL" },
    { title: "Netflix Subscription",  category: "Subscriptions",   amount: 649,  paymentMode: "Credit Card", daysBack: 10, type: "PERSONAL", notes: "Monthly" },
    { title: "Figma Pro",             category: "Software",        amount: 1500, paymentMode: "Credit Card", daysBack: 15, type: "BUSINESS" },
    { title: "GitHub Copilot",        category: "Software",        amount: 800,  paymentMode: "Credit Card", daysBack: 16, type: "BUSINESS" },
    { title: "Notion Pro",            category: "Software",        amount: 480,  paymentMode: "Credit Card", daysBack: 17, type: "BUSINESS" },
    { title: "Adobe CC",              category: "Software",        amount: 4999, paymentMode: "Credit Card", daysBack: 45, type: "BUSINESS" },
    { title: "Gym Membership",        category: "Health",          amount: 1800, paymentMode: "UPI",         daysBack: 13, type: "PERSONAL" },
    { title: "Doctor Consultation",   category: "Health",          amount: 800,  paymentMode: "Cash",        daysBack: 28, type: "PERSONAL" },
    { title: "Amazon Electronics",    category: "Shopping",        amount: 3480, paymentMode: "Credit Card", daysBack: 19, type: "PERSONAL", notes: "Headphones" },
    { title: "Flipkart Clothing",     category: "Shopping",        amount: 2100, paymentMode: "Debit Card",  daysBack: 23, type: "PERSONAL" },
    { title: "Office Stationery",     category: "Office",          amount: 650,  paymentMode: "Cash",        daysBack: 24, type: "BUSINESS" },
    { title: "Printer Cartridges",    category: "Office",          amount: 1200, paymentMode: "UPI",         daysBack: 30, type: "BUSINESS" },
    { title: "Swiggy Order",          category: "Food & Dining",   amount: 490,  paymentMode: "UPI",         daysBack: 40, type: "PERSONAL" },
    { title: "Metro Card Recharge",   category: "Transport",       amount: 500,  paymentMode: "UPI",         daysBack: 42, type: "PERSONAL" },
    { title: "Electricity Bill",      category: "Utilities",       amount: 2100, paymentMode: "Net Banking", daysBack: 38, type: "PERSONAL" },
    { title: "Gym Membership",        category: "Health",          amount: 1800, paymentMode: "UPI",         daysBack: 43, type: "PERSONAL" },
    { title: "Netflix Subscription",  category: "Subscriptions",   amount: 649,  paymentMode: "Credit Card", daysBack: 40, type: "PERSONAL" },
    { title: "Petrol",                category: "Transport",       amount: 1500, paymentMode: "Cash",        daysBack: 36, type: "PERSONAL" },
    { title: "Team Outing",           category: "Food & Dining",   amount: 5500, paymentMode: "Credit Card", daysBack: 50, type: "BUSINESS", notes: "Team celebration" },
  ];

  await Expense.insertMany(
    expenseDefs.map((e) => ({
      userId,
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: daysAgo(e.daysBack),
      type: e.type as "BUSINESS" | "PERSONAL",
      paymentMode: e.paymentMode,
      notes: e.notes ?? "",
    }))
  );

  // ── 4. Invoices + Payments ────────────────────────────────────────────────────
  const invoiceDefs = [
    {
      client: clients[0],
      invoiceNumber: "INV-2024-001",
      issuedDaysAgo: 60, dueDaysAgo: 30,
      items: [
        { description: "Website Redesign", quantity: 1, unitPrice: 45000, amount: 45000 },
        { description: "SEO Optimisation", quantity: 1, unitPrice: 12000, amount: 12000 },
      ],
      totalAmount: 57000, amountPaid: 57000, amountDue: 0,
      status: "paid" as const,
      payment: { amount: 57000, paidDaysAgo: 28, paymentMode: "Net Banking" },
    },
    {
      client: clients[1],
      invoiceNumber: "INV-2024-002",
      issuedDaysAgo: 45, dueDaysAgo: 15,
      items: [{ description: "Mobile App MVP", quantity: 1, unitPrice: 80000, amount: 80000 }],
      totalAmount: 80000, amountPaid: 40000, amountDue: 40000,
      status: "partially_paid" as const,
      payment: { amount: 40000, paidDaysAgo: 20, paymentMode: "UPI" },
    },
    {
      client: clients[2],
      invoiceNumber: "INV-2024-003",
      issuedDaysAgo: 30, dueDaysAgo: 0,
      items: [
        { description: "Brand Identity Package", quantity: 1, unitPrice: 35000, amount: 35000 },
        { description: "Social Media Assets", quantity: 10, unitPrice: 500, amount: 5000 },
      ],
      totalAmount: 40000, amountPaid: 0, amountDue: 40000,
      status: "due" as const,
      payment: null,
    },
    {
      client: clients[3],
      invoiceNumber: "INV-2024-004",
      issuedDaysAgo: 40, dueDaysAgo: 10,
      items: [{ description: "Freelance Dev – March", quantity: 40, unitPrice: 800, amount: 32000 }],
      totalAmount: 32000, amountPaid: 0, amountDue: 32000,
      status: "overdue" as const,
      payment: null,
    },
    {
      client: clients[4],
      invoiceNumber: "INV-2024-005",
      issuedDaysAgo: 5, dueDaysAgo: -25, // due in future
      items: [
        { description: "Cloud Infrastructure Setup", quantity: 1, unitPrice: 25000, amount: 25000 },
        { description: "DevOps Consulting – 10 hrs", quantity: 10, unitPrice: 2000, amount: 20000 },
      ],
      totalAmount: 45000, amountPaid: 0, amountDue: 45000,
      status: "sent" as const,
      payment: null,
    },
    {
      client: clients[0],
      invoiceNumber: "INV-2024-006",
      issuedDaysAgo: 90, dueDaysAgo: 60,
      items: [{ description: "UI/UX Audit", quantity: 1, unitPrice: 15000, amount: 15000 }],
      totalAmount: 15000, amountPaid: 15000, amountDue: 0,
      status: "paid" as const,
      payment: { amount: 15000, paidDaysAgo: 58, paymentMode: "UPI" },
    },
  ];

  for (const inv of invoiceDefs) {
    const doc = await Invoice.create({
      userId,
      clientId: inv.client._id,
      invoiceNumber: inv.invoiceNumber,
      issueDate: daysAgo(inv.issuedDaysAgo),
      dueDate: daysAgo(inv.dueDaysAgo),
      items: inv.items,
      totalAmount: inv.totalAmount,
      amountPaid: inv.amountPaid,
      amountDue: inv.amountDue,
      status: inv.status,
    });

    if (inv.payment) {
      await PaymentSettlement.create({
        userId,
        invoiceId: doc._id,
        amount: inv.payment.amount,
        paymentDate: daysAgo(inv.payment.paidDaysAgo),
        paymentMode: inv.payment.paymentMode,
        transactionId: `TXN${Date.now().toString(36).toUpperCase()}`,
        payerName: inv.client.name,
        payerEmail: inv.client.email,
      });
    }
  }

  return NextResponse.json({
    success: true,
    seeded: {
      expenses: expenseDefs.length,
      invoices: invoiceDefs.length,
      clients: clientDefs.length,
      payments: invoiceDefs.filter((i) => i.payment).length,
    },
  });
}
