/**
 * POST /api/seed
 * ──────────────
 * Dev-only endpoint to populate the database with realistic sample data
 * for a freelance web developer based in Tamil Nadu.
 *
 * All records are tagged with isDemo: true. Re-seeding only deletes
 * demo records and skips if demo data already exists.
 */

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Client from "@/app/api/_lib/models/Client";
import Invoice from "@/app/api/_lib/models/Invoice";
import Expense from "@/app/api/_lib/models/Expense";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import BankTransaction from "@/app/api/_lib/models/BankTransaction";
import Reminder from "@/app/api/_lib/models/Reminder";

export async function POST() {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  await connectDB();
  const userId = new mongoose.Types.ObjectId(auth.userId);

  // ── Check if demo data already exists ─────────────────────────────────────
  const existingDemo = await Client.findOne({ userId, isDemo: true }).lean();
  if (existingDemo) {
    return NextResponse.json({ success: true, alreadySeeded: true });
  }

  function daysAgo(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  }

  // ── Clear only demo data ──────────────────────────────────────────────────
  await Promise.all([
    Expense.deleteMany({ userId, isDemo: true }),
    Invoice.deleteMany({ userId, isDemo: true }),
    Client.deleteMany({ userId, isDemo: true }),
    PaymentSettlement.deleteMany({ userId, isDemo: true }),
    BankTransaction.deleteMany({ userId, isDemo: true }),
    Reminder.deleteMany({ userId, isDemo: true }),
  ]);

  // ── 1. Clients — real TN-based businesses & individuals ───────────────────
  const clientDefs = [
    { name: "Kovai SoftTech Solutions",    email: "accounts@kovaisofttech.in",   phone: "+91 98421 52001" },
    { name: "Madurai Meenakshi Textiles",  email: "finance@meenakshitextiles.com", phone: "+91 98422 63002" },
    { name: "Karthik Subramanian",         email: "karthik.subbu@gmail.com",     phone: "+91 90038 74003" },
    { name: "Salem Steel Traders",         email: "billing@salemsteel.co.in",    phone: "+91 98428 85004" },
    { name: "Trichy GreenEnergy Pvt Ltd",  email: "ap@trichygreenenergy.in",     phone: "+91 98429 96005" },
    { name: "Pondicherry Heritage Hotels", email: "digital@pondiheritage.com",   phone: "+91 98430 07006" },
    { name: "Nagercoil Coir Exports",      email: "info@nagercoilcoir.in",       phone: "+91 99421 18007" },
  ];
  const clients = await Client.insertMany(clientDefs.map((c) => ({ ...c, userId, isDemo: true })));

  // ── 2. Expenses — realistic TN freelancer daily expenses ──────────────────
  const expenseDefs = [
    // Food & Dining
    { title: "Saravana Bhavan lunch",         category: "Food & Dining",  amount: 280,  paymentMode: "UPI",         daysBack: 1,  type: "PERSONAL", notes: "T.Nagar branch" },
    { title: "Swiggy dinner – Biriyani",      category: "Food & Dining",  amount: 420,  paymentMode: "UPI",         daysBack: 2,  type: "PERSONAL" },
    { title: "Murugan Idli Shop",             category: "Food & Dining",  amount: 180,  paymentMode: "Cash",        daysBack: 4,  type: "PERSONAL" },
    { title: "Filter coffee + snacks",        category: "Food & Dining",  amount: 120,  paymentMode: "Cash",        daysBack: 5,  type: "PERSONAL" },
    { title: "Team lunch – Dindigul Thalappakatti", category: "Food & Dining", amount: 2800, paymentMode: "Credit Card", daysBack: 8, type: "BUSINESS", notes: "Client meeting lunch" },
    { title: "Zomato Pro – weekly groceries",  category: "Food & Dining",  amount: 1850, paymentMode: "UPI",         daysBack: 10, type: "PERSONAL" },
    { title: "Annapoorna mess – lunch",        category: "Food & Dining",  amount: 150,  paymentMode: "Cash",        daysBack: 14, type: "PERSONAL" },
    { title: "Sangeetha Restaurant",           category: "Food & Dining",  amount: 350,  paymentMode: "UPI",         daysBack: 18, type: "PERSONAL" },
    { title: "Weekly vegetables – Koyambedu",  category: "Food & Dining",  amount: 980,  paymentMode: "Cash",        daysBack: 21, type: "PERSONAL" },
    { title: "Dominos – Friday night",         category: "Food & Dining",  amount: 680,  paymentMode: "UPI",         daysBack: 28, type: "PERSONAL" },
    { title: "Team dinner – Cream Centre",     category: "Food & Dining",  amount: 3500, paymentMode: "Credit Card", daysBack: 35, type: "BUSINESS", notes: "Project milestone celebration" },
    { title: "Monthly groceries – Reliance Fresh", category: "Food & Dining", amount: 4200, paymentMode: "Debit Card", daysBack: 38, type: "PERSONAL" },

    // Transport
    { title: "Chennai Metro – monthly pass",  category: "Transport",      amount: 1400, paymentMode: "UPI",         daysBack: 3,  type: "PERSONAL" },
    { title: "Petrol – TVS Apache",           category: "Transport",      amount: 1200, paymentMode: "Cash",        daysBack: 6,  type: "PERSONAL" },
    { title: "Ola – client visit T.Nagar",    category: "Transport",      amount: 280,  paymentMode: "UPI",         daysBack: 9,  type: "BUSINESS" },
    { title: "Rapido bike – Anna Nagar",      category: "Transport",      amount: 85,   paymentMode: "UPI",         daysBack: 12, type: "PERSONAL" },
    { title: "Train ticket – Chennai to Coimbatore", category: "Transport", amount: 650, paymentMode: "UPI",       daysBack: 22, type: "BUSINESS", notes: "Client site visit" },
    { title: "Petrol – TVS Apache",           category: "Transport",      amount: 1100, paymentMode: "Cash",        daysBack: 34, type: "PERSONAL" },
    { title: "Flight – Chennai to Trivandrum", category: "Transport",     amount: 4800, paymentMode: "Credit Card", daysBack: 45, type: "BUSINESS", notes: "Project kickoff meeting" },

    // Utilities
    { title: "TANGEDCO EB bill",              category: "Utilities",      amount: 1850, paymentMode: "Net Banking", daysBack: 5,  type: "PERSONAL", notes: "March bill" },
    { title: "Airtel Fiber broadband",        category: "Utilities",      amount: 1199, paymentMode: "UPI",         daysBack: 7,  type: "PERSONAL" },
    { title: "Jio mobile recharge",           category: "Utilities",      amount: 599,  paymentMode: "UPI",         daysBack: 15, type: "PERSONAL" },
    { title: "Chennai Metro Water",           category: "Utilities",      amount: 250,  paymentMode: "Cash",        daysBack: 20, type: "PERSONAL" },
    { title: "TANGEDCO EB bill",              category: "Utilities",      amount: 1720, paymentMode: "Net Banking", daysBack: 36, type: "PERSONAL" },
    { title: "Airtel Fiber broadband",        category: "Utilities",      amount: 1199, paymentMode: "UPI",         daysBack: 37, type: "PERSONAL" },
    { title: "Indane gas cylinder",           category: "Utilities",      amount: 920,  paymentMode: "Cash",        daysBack: 25, type: "PERSONAL" },

    // Subscriptions & Software
    { title: "Netflix Standard",              category: "Subscriptions",  amount: 649,  paymentMode: "Credit Card", daysBack: 11, type: "PERSONAL" },
    { title: "Figma Professional",            category: "Software",       amount: 1500, paymentMode: "Credit Card", daysBack: 13, type: "BUSINESS" },
    { title: "GitHub Copilot",                category: "Software",       amount: 800,  paymentMode: "Credit Card", daysBack: 13, type: "BUSINESS" },
    { title: "Vercel Pro hosting",            category: "Software",       amount: 1600, paymentMode: "Credit Card", daysBack: 16, type: "BUSINESS" },
    { title: "Notion Team plan",              category: "Software",       amount: 420,  paymentMode: "Credit Card", daysBack: 17, type: "BUSINESS" },
    { title: "Zoho Invoice subscription",     category: "Software",       amount: 900,  paymentMode: "Credit Card", daysBack: 19, type: "BUSINESS" },
    { title: "AWS Mumbai region",             category: "Software",       amount: 2400, paymentMode: "Credit Card", daysBack: 30, type: "BUSINESS" },
    { title: "Netflix Standard",              category: "Subscriptions",  amount: 649,  paymentMode: "Credit Card", daysBack: 41, type: "PERSONAL" },
    { title: "Spotify Premium",               category: "Subscriptions",  amount: 119,  paymentMode: "UPI",         daysBack: 42, type: "PERSONAL" },
    { title: "Figma Professional",            category: "Software",       amount: 1500, paymentMode: "Credit Card", daysBack: 43, type: "BUSINESS" },
    { title: "AWS Mumbai region",             category: "Software",       amount: 2200, paymentMode: "Credit Card", daysBack: 60, type: "BUSINESS" },

    // Health
    { title: "Gym – Cult.fit Adyar",          category: "Health",         amount: 1800, paymentMode: "UPI",         daysBack: 2,  type: "PERSONAL" },
    { title: "Apollo pharmacy medicines",     category: "Health",         amount: 650,  paymentMode: "Cash",        daysBack: 24, type: "PERSONAL" },
    { title: "Eye checkup – Sankara Nethralaya", category: "Health",      amount: 1200, paymentMode: "UPI",         daysBack: 32, type: "PERSONAL" },

    // Shopping & Office
    { title: "Croma – laptop charger",        category: "Shopping",       amount: 2800, paymentMode: "Credit Card", daysBack: 23, type: "BUSINESS" },
    { title: "Amazon – mechanical keyboard",  category: "Shopping",       amount: 3200, paymentMode: "Credit Card", daysBack: 27, type: "BUSINESS", notes: "Keychron K2" },
    { title: "T-shirts – Trends Megamart",    category: "Shopping",       amount: 1800, paymentMode: "Debit Card",  daysBack: 33, type: "PERSONAL" },
    { title: "Stationery – Higginbothams",    category: "Office",         amount: 380,  paymentMode: "Cash",        daysBack: 26, type: "BUSINESS" },
    { title: "Printer ink HP",                category: "Office",         amount: 850,  paymentMode: "UPI",         daysBack: 40, type: "BUSINESS" },

    // Rent / Co-working
    { title: "Co-working desk – WeWork OMR",  category: "Office",         amount: 8500, paymentMode: "Net Banking", daysBack: 1,  type: "BUSINESS", notes: "March rent" },
    { title: "Co-working desk – WeWork OMR",  category: "Office",         amount: 8500, paymentMode: "Net Banking", daysBack: 31, type: "BUSINESS", notes: "Feb rent" },
    { title: "Co-working desk – WeWork OMR",  category: "Office",         amount: 8500, paymentMode: "Net Banking", daysBack: 61, type: "BUSINESS", notes: "Jan rent" },
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
      isDemo: true,
    }))
  );

  // ── 3. Invoices + Payments ────────────────────────────────────────────────
  const invoiceDefs = [
    {
      client: clients[0], // Kovai SoftTech
      invoiceNumber: "INV-2026-001",
      issuedDaysAgo: 55, dueDaysAgo: 25,
      items: [
        { description: "E-commerce website – React + Node.js", quantity: 1, unitPrice: 65000, amount: 65000 },
        { description: "Payment gateway integration – Razorpay", quantity: 1, unitPrice: 8000, amount: 8000 },
      ],
      totalAmount: 73000, amountPaid: 73000, amountDue: 0,
      status: "paid" as const,
      payment: { amount: 73000, paidDaysAgo: 22, paymentMode: "Net Banking", transactionId: "NEFT2026031573K" },
    },
    {
      client: clients[1], // Madurai Meenakshi Textiles
      invoiceNumber: "INV-2026-002",
      issuedDaysAgo: 40, dueDaysAgo: 10,
      items: [
        { description: "Product catalogue web app", quantity: 1, unitPrice: 45000, amount: 45000 },
        { description: "Admin panel + inventory module", quantity: 1, unitPrice: 25000, amount: 25000 },
      ],
      totalAmount: 70000, amountPaid: 35000, amountDue: 35000,
      status: "partially_paid" as const,
      payment: { amount: 35000, paidDaysAgo: 15, paymentMode: "UPI", transactionId: "UPI202603143500" },
    },
    {
      client: clients[2], // Karthik Subramanian
      invoiceNumber: "INV-2026-003",
      issuedDaysAgo: 25, dueDaysAgo: 0,
      items: [
        { description: "Portfolio website – Next.js + Vercel", quantity: 1, unitPrice: 18000, amount: 18000 },
        { description: "Domain + SSL setup", quantity: 1, unitPrice: 1500, amount: 1500 },
      ],
      totalAmount: 19500, amountPaid: 0, amountDue: 19500,
      status: "due" as const,
      payment: null,
    },
    {
      client: clients[3], // Salem Steel Traders
      invoiceNumber: "INV-2026-004",
      issuedDaysAgo: 50, dueDaysAgo: 20,
      items: [
        { description: "Inventory management dashboard", quantity: 1, unitPrice: 55000, amount: 55000 },
      ],
      totalAmount: 55000, amountPaid: 0, amountDue: 55000,
      status: "overdue" as const,
      payment: null,
    },
    {
      client: clients[4], // Trichy GreenEnergy
      invoiceNumber: "INV-2026-005",
      issuedDaysAgo: 7, dueDaysAgo: -23,
      items: [
        { description: "IoT dashboard – React + MQTT", quantity: 1, unitPrice: 40000, amount: 40000 },
        { description: "AWS IoT Core integration", quantity: 1, unitPrice: 15000, amount: 15000 },
        { description: "Mobile responsive PWA", quantity: 1, unitPrice: 8000, amount: 8000 },
      ],
      totalAmount: 63000, amountPaid: 0, amountDue: 63000,
      status: "sent" as const,
      payment: null,
    },
    {
      client: clients[5], // Pondicherry Heritage Hotels
      invoiceNumber: "INV-2026-006",
      issuedDaysAgo: 75, dueDaysAgo: 45,
      items: [
        { description: "Hotel booking website – Next.js", quantity: 1, unitPrice: 50000, amount: 50000 },
        { description: "Google Maps + Reviews integration", quantity: 1, unitPrice: 5000, amount: 5000 },
      ],
      totalAmount: 55000, amountPaid: 55000, amountDue: 0,
      status: "paid" as const,
      payment: { amount: 55000, paidDaysAgo: 42, paymentMode: "Net Banking", transactionId: "NEFT2026020255K" },
    },
    {
      client: clients[6], // Nagercoil Coir Exports
      invoiceNumber: "INV-2026-007",
      issuedDaysAgo: 90, dueDaysAgo: 60,
      items: [
        { description: "Export order tracking system", quantity: 1, unitPrice: 35000, amount: 35000 },
      ],
      totalAmount: 35000, amountPaid: 35000, amountDue: 0,
      status: "paid" as const,
      payment: { amount: 35000, paidDaysAgo: 55, paymentMode: "UPI", transactionId: "UPI2025122735K" },
    },
    {
      client: clients[0], // Kovai SoftTech (repeat)
      invoiceNumber: "INV-2026-008",
      issuedDaysAgo: 3, dueDaysAgo: -27,
      items: [
        { description: "Monthly maintenance – March", quantity: 1, unitPrice: 12000, amount: 12000 },
      ],
      totalAmount: 12000, amountPaid: 0, amountDue: 12000,
      status: "sent" as const,
      payment: null,
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
      isDemo: true,
    });

    if (inv.payment) {
      await PaymentSettlement.create({
        userId,
        invoiceId: doc._id,
        amount: inv.payment.amount,
        paymentDate: daysAgo(inv.payment.paidDaysAgo),
        paymentMode: inv.payment.paymentMode,
        transactionId: inv.payment.transactionId,
        payerName: inv.client.name,
        payerEmail: inv.client.email,
        isDemo: true,
      });
    }
  }

  // ── Create reminders for overdue/due invoices ─────────────────────────────
  const overdueInvoices = await Invoice.find({ userId, isDemo: true, status: { $in: ["overdue", "due"] } }).lean();
  for (const inv of overdueInvoices) {
    await Reminder.create({
      userId,
      invoiceId: inv._id,
      type: "email",
      status: "sent",
      context: inv.status === "overdue" ? "overdue" : "before_due",
      sentAt: daysAgo(inv.status === "overdue" ? 5 : 2),
      isDemo: true,
    });
  }

  // ── 4. Bank Transactions ──────────────────────────────────────────────────
  const { createHash } = await import("crypto");
  const bankTxDefs = [
    { source: "wallet" as const, direction: "credit" as const, amount: 15000, description: "PhonePe – Karthik Subramanian advance", daysBack: 3 },
    { source: "wallet" as const, direction: "debit" as const, amount: 1800, description: "Google Pay – Cult.fit gym", daysBack: 4 },
    { source: "upi" as const, direction: "credit" as const, amount: 35000, description: "UPI: Madurai Meenakshi Textiles – INV-002 partial", daysBack: 15 },
    { source: "bank_transfer" as const, direction: "credit" as const, amount: 73000, description: "NEFT: Kovai SoftTech Solutions – INV-001", daysBack: 22 },
    { source: "manual" as const, direction: "credit" as const, amount: 5000, description: "Cash – freelance WordPress fix for local shop", daysBack: 10 },
    { source: "manual" as const, direction: "debit" as const, amount: 2800, description: "Cash – team lunch Thalappakatti", daysBack: 8 },
    { source: "wallet" as const, direction: "credit" as const, amount: 8000, description: "Paytm – Logo design project", daysBack: 18 },
    { source: "bank_transfer" as const, direction: "credit" as const, amount: 55000, description: "NEFT: Pondicherry Heritage Hotels – INV-006", daysBack: 42 },
    { source: "upi" as const, direction: "credit" as const, amount: 35000, description: "UPI: Nagercoil Coir Exports – INV-007", daysBack: 55 },
    { source: "wallet" as const, direction: "debit" as const, amount: 4200, description: "PhonePe – monthly groceries", daysBack: 38 },
  ];

  for (const tx of bankTxDefs) {
    const txDate = daysAgo(tx.daysBack);
    const base = `${auth.userId}|${txDate.toISOString()}|${tx.direction}|${tx.amount}|${tx.description}`;
    const fingerprint = createHash("sha256").update(base).digest("hex");
    await BankTransaction.create({
      userId,
      source: tx.source,
      direction: tx.direction,
      amount: tx.amount,
      currency: "INR",
      transactionDate: txDate,
      description: tx.description,
      fingerprint,
      isDemo: true,
    });
  }

  return NextResponse.json({
    success: true,
    alreadySeeded: false,
    seeded: {
      clients: clientDefs.length,
      expenses: expenseDefs.length,
      invoices: invoiceDefs.length,
      payments: invoiceDefs.filter((i) => i.payment).length,
      bankTransactions: bankTxDefs.length,
      reminders: overdueInvoices.length,
    },
  });
}
