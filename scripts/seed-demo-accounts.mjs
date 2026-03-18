/**
 * scripts/seed-demo-accounts.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * Seeds TWO complete demo accounts in MongoDB Atlas.
 * Run once; safe to re-run (idempotent — wipes & recreates per account).
 *
 *   node scripts/seed-demo-accounts.mjs
 *
 * Demo accounts created:
 *   ① Freelancer  →  freelancer@iteryx.com   /  Demo@2024
 *   ② Student     →  student@iteryx.com      /  Demo@2024
 *
 * Every account gets:
 *   • User record  (hashed + plain password stored for debugging)
 *   • Clients, Invoices, Payment Settlements   (freelancer only)
 *   • Expenses / Notifications                 (both)
 * ────────────────────────────────────────────────────────────────────────────
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

function assertAtlasUri(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI is required. This script runs only against MongoDB Atlas.");
  }

  const normalized = String(uri).toLowerCase();
  const isLocal =
    normalized.includes("localhost") ||
    normalized.includes("127.0.0.1") ||
    normalized.includes("0.0.0.0");
  const isAtlas = normalized.includes("mongodb.net");

  if (isLocal || !isAtlas) {
    throw new Error(
      "Refusing to run: this script is Atlas-only. Point MONGODB_URI to your Atlas cluster URI."
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function txnId() {
  return `TXN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

// ─── Demo account configs ────────────────────────────────────────────────────

const DEMO_PASSWORD     = "Demo@2024";
const FREELANCER_EMAIL  = "freelancer@iteryx.com";
const STUDENT_EMAIL     = "student@iteryx.com";
const DEMO_EMAILS = [FREELANCER_EMAIL, STUDENT_EMAIL];

// ─── Freelancer data ─────────────────────────────────────────────────────────

const FREELANCER_CLIENTS = [
  { name: "Marina Retail Pvt Ltd",   email: "finance@marinaretail.in",   phone: "+91 98401 11001" },
  { name: "Kovai Tech Labs",         email: "accounts@kovaitechlabs.com", phone: "+91 98402 22002" },
  { name: "Madurai Foods Co",        email: "billing@maduraifoods.in",    phone: "+91 98403 33003" },
  { name: "S. Prabhakaran",          email: "prabhakaran.s@gmail.com",     phone: "+91 99521 44004" },
  { name: "Chennai Logistics Hub",   email: "ap@chennailogistics.in",      phone: "+91 98404 55005" },
  { name: "Thanjai Consulting",      email: "hello@thanjaiconsulting.com", phone: "+91 99522 66006" },
];

const FREELANCER_EXPENSES = [
  // Food & Dining
  { title: "Swiggy Order",         category: "Food & Dining",  amount: 620,   paymentMode: "UPI",         daysBack: 1,  type: "PERSONAL", notes: "Dinner" },
  { title: "Client Lunch",         category: "Food & Dining",  amount: 4800,  paymentMode: "Credit Card", daysBack: 5,  type: "BUSINESS", notes: "T. Nagar kickoff meeting" },
  { title: "Zomato Order",         category: "Food & Dining",  amount: 490,   paymentMode: "UPI",         daysBack: 8,  type: "PERSONAL" },
  { title: "Weekly Groceries",     category: "Food & Dining",  amount: 2200,  paymentMode: "UPI",         daysBack: 12, type: "PERSONAL" },
  { title: "A2B Tiffin",           category: "Food & Dining",  amount: 480,   paymentMode: "Credit Card", daysBack: 15, type: "PERSONAL" },
  { title: "Team Outing",          category: "Food & Dining",  amount: 6200,  paymentMode: "Credit Card", daysBack: 50, type: "BUSINESS", notes: "Phase 2 delivery celebration" },
  { title: "Monthly Groceries",    category: "Food & Dining",  amount: 4600,  paymentMode: "Debit Card",  daysBack: 35, type: "PERSONAL" },
  // Transport
  { title: "Chennai Metro Card Recharge", category: "Transport", amount: 500, paymentMode: "UPI",         daysBack: 2,  type: "PERSONAL" },
  { title: "Petrol",               category: "Transport",      amount: 2200,  paymentMode: "Cash",        daysBack: 6,  type: "PERSONAL" },
  { title: "Ola Cab",              category: "Transport",      amount: 320,   paymentMode: "UPI",         daysBack: 9,  type: "PERSONAL" },
  { title: "Train – Coimbatore",   category: "Transport",      amount: 1900,  paymentMode: "Credit Card", daysBack: 20, type: "BUSINESS", notes: "Kovai Tech Labs onsite" },
  { title: "Petrol",               category: "Transport",      amount: 1800,  paymentMode: "Cash",        daysBack: 36, type: "PERSONAL" },
  // Utilities
  { title: "TNEB Electricity Bill", category: "Utilities",     amount: 2300,  paymentMode: "Net Banking", daysBack: 4,  type: "PERSONAL" },
  { title: "Internet Bill",        category: "Utilities",      amount: 1499,  paymentMode: "Net Banking", daysBack: 8,  type: "PERSONAL" },
  { title: "Mobile Recharge",      category: "Utilities",      amount: 719,   paymentMode: "UPI",         daysBack: 14, type: "PERSONAL" },
  { title: "Gas Cylinder",         category: "Utilities",      amount: 950,   paymentMode: "Cash",        daysBack: 20, type: "PERSONAL" },
  { title: "Electricity Bill",     category: "Utilities",      amount: 2100,  paymentMode: "Net Banking", daysBack: 38, type: "PERSONAL" },
  // Software (freelancer tools)
  { title: "Figma Pro",            category: "Software",       amount: 1500,  paymentMode: "Credit Card", daysBack: 10, type: "BUSINESS" },
  { title: "GitHub Copilot",       category: "Software",       amount: 800,   paymentMode: "Credit Card", daysBack: 10, type: "BUSINESS" },
  { title: "Notion Pro",           category: "Software",       amount: 480,   paymentMode: "Credit Card", daysBack: 11, type: "BUSINESS" },
  { title: "Adobe CC",             category: "Software",       amount: 4999,  paymentMode: "Credit Card", daysBack: 45, type: "BUSINESS" },
  { title: "Vercel Pro",           category: "Software",       amount: 1700,  paymentMode: "Credit Card", daysBack: 22, type: "BUSINESS" },
  // Subscriptions
  { title: "Netflix",              category: "Subscriptions",  amount: 649,   paymentMode: "Credit Card", daysBack: 10, type: "PERSONAL" },
  { title: "Spotify Premium",      category: "Subscriptions",  amount: 119,   paymentMode: "UPI",         daysBack: 10, type: "PERSONAL" },
  { title: "Netflix",              category: "Subscriptions",  amount: 649,   paymentMode: "Credit Card", daysBack: 40, type: "PERSONAL" },
  // Health
  { title: "Gym Membership",       category: "Health",         amount: 2200,  paymentMode: "UPI",         daysBack: 13, type: "PERSONAL" },
  { title: "Doctor Consultation",  category: "Health",         amount: 800,   paymentMode: "Cash",        daysBack: 28, type: "PERSONAL" },
  { title: "Gym Membership",       category: "Health",         amount: 2200,  paymentMode: "UPI",         daysBack: 43, type: "PERSONAL" },
  // Business equipment
  { title: "27in Dell Monitor",    category: "Shopping",       amount: 18500, paymentMode: "Credit Card", daysBack: 19, type: "BUSINESS", notes: "Workspace upgrade" },
  { title: "Mechanical Keyboard",  category: "Shopping",       amount: 4200,  paymentMode: "Credit Card", daysBack: 23, type: "BUSINESS" },
  // Office
  { title: "Co-working Space",     category: "Office",         amount: 8000,  paymentMode: "Net Banking", daysBack: 32, type: "BUSINESS", notes: "OMR monthly desk rental" },
  { title: "Office Stationery",    category: "Office",         amount: 650,   paymentMode: "Cash",        daysBack: 24, type: "BUSINESS" },
];

// ─── Student data ─────────────────────────────────────────────────────────────

const STUDENT_EXPENSES = [
  // Food – dominant category for a student
  { title: "Hostel Mess Bill",     category: "Food & Dining",  amount: 3200,  paymentMode: "UPI",         daysBack: 1,  type: "PERSONAL", notes: "April hostel mess" },
  { title: "Swiggy Order",        category: "Food & Dining",  amount: 320,   paymentMode: "UPI",         daysBack: 3,  type: "PERSONAL" },
  { title: "Zomato Lunch",         category: "Food & Dining",  amount: 280,   paymentMode: "UPI",         daysBack: 5,  type: "PERSONAL" },
  { title: "Canteen Tea & Snacks", category: "Food & Dining",  amount: 90,    paymentMode: "Cash",        daysBack: 6,  type: "PERSONAL" },
  { title: "Swiggy Pizza",         category: "Food & Dining",  amount: 450,   paymentMode: "UPI",         daysBack: 10, type: "PERSONAL", notes: "Late night study session" },
  { title: "Mess Bill",            category: "Food & Dining",  amount: 3200,  paymentMode: "UPI",         daysBack: 31, type: "PERSONAL", notes: "March hostel mess" },
  { title: "Zomato",               category: "Food & Dining",  amount: 310,   paymentMode: "UPI",         daysBack: 34, type: "PERSONAL" },
  { title: "Grocery Run",          category: "Food & Dining",  amount: 850,   paymentMode: "UPI",         daysBack: 40, type: "PERSONAL" },
  // Transport
  { title: "MTC Bus Pass (Monthly)", category: "Transport",    amount: 400,   paymentMode: "UPI",         daysBack: 2,  type: "PERSONAL" },
  { title: "Auto Rickshaw",        category: "Transport",      amount: 120,   paymentMode: "Cash",        daysBack: 4,  type: "PERSONAL" },
  { title: "Train Ticket – Home",  category: "Transport",      amount: 780,   paymentMode: "UPI",         daysBack: 21, type: "PERSONAL", notes: "Weekend trip home" },
  { title: "Rapido Bike",          category: "Transport",      amount: 85,    paymentMode: "UPI",         daysBack: 9,  type: "PERSONAL" },
  { title: "Bus Pass (Monthly)",   category: "Transport",      amount: 400,   paymentMode: "UPI",         daysBack: 32, type: "PERSONAL" },
  // Education
  { title: "Data Structures Book", category: "Education",      amount: 680,   paymentMode: "Debit Card",  daysBack: 7,  type: "PERSONAL" },
  { title: "Udemy – ML Course",    category: "Education",      amount: 499,   paymentMode: "Credit Card", daysBack: 14, type: "PERSONAL", notes: "Machine Learning A-Z" },
  { title: "Semester Fee",         category: "Education",      amount: 45000, paymentMode: "Net Banking", daysBack: 60, type: "PERSONAL", notes: "Semester 5 tuition - Anna University" },
  { title: "Stationery Pack",      category: "Education",      amount: 320,   paymentMode: "Cash",        daysBack: 18, type: "PERSONAL" },
  { title: "Coursera Subscription",category: "Education",      amount: 1299,  paymentMode: "Credit Card", daysBack: 29, type: "PERSONAL" },
  // Utilities
  { title: "Mobile Recharge",      category: "Utilities",      amount: 299,   paymentMode: "UPI",         daysBack: 3,  type: "PERSONAL" },
  { title: "Electricity Bill",     category: "Utilities",      amount: 420,   paymentMode: "Net Banking", daysBack: 8,  type: "PERSONAL", notes: "Room share – half bill" },
  { title: "Mobile Recharge",      category: "Utilities",      amount: 299,   paymentMode: "UPI",         daysBack: 33, type: "PERSONAL" },
  // Subscriptions
  { title: "Netflix (Family)",     category: "Subscriptions",  amount: 199,   paymentMode: "UPI",         daysBack: 12, type: "PERSONAL", notes: "Split with roommate" },
  { title: "Spotify",              category: "Subscriptions",  amount: 59,    paymentMode: "UPI",         daysBack: 12, type: "PERSONAL" },
  { title: "Netflix (Family)",     category: "Subscriptions",  amount: 199,   paymentMode: "UPI",         daysBack: 42, type: "PERSONAL" },
  // Health
  { title: "Gym Membership",       category: "Health",         amount: 800,   paymentMode: "Cash",        daysBack: 15, type: "PERSONAL", notes: "College gym quarterly" },
  { title: "Pharmacy",             category: "Health",         amount: 350,   paymentMode: "Cash",        daysBack: 22, type: "PERSONAL" },
  // Shopping / Personal
  { title: "Amazon – Headphones",  category: "Shopping",       amount: 1299,  paymentMode: "Debit Card",  daysBack: 16, type: "PERSONAL", notes: "Noise-cancelling for studying" },
  { title: "Flipkart – Clothing",  category: "Shopping",       amount: 950,   paymentMode: "Debit Card",  daysBack: 25, type: "PERSONAL" },
  { title: "Laptop Bag",           category: "Shopping",       amount: 699,   paymentMode: "UPI",         daysBack: 38, type: "PERSONAL" },
  // Entertainment
  { title: "Movie Tickets",        category: "Entertainment",  amount: 360,   paymentMode: "UPI",         daysBack: 11, type: "PERSONAL", notes: "Weekend outing at PVR Chennai" },
  { title: "Cricket Match Ticket", category: "Entertainment",  amount: 500,   paymentMode: "UPI",         daysBack: 45, type: "PERSONAL" },
];

// ─── Main seeder ──────────────────────────────────────────────────────────────

async function seedUser({ email, name, role, profile, expenseDefs, clientDefs, invoiceFn, notifMessages }) {
  const db = mongoose.connection.db;

  const hashedPwd = await bcrypt.hash(DEMO_PASSWORD, 12);

  // Upsert user
  let user = await db.collection("users").findOne({ email });
  if (user) {
    await db.collection("users").updateOne({ _id: user._id }, {
      $set: {
        name, role, password: hashedPwd, plainPassword: DEMO_PASSWORD,
        onboardingCompleted: true, isDemo: true, profile,
        provider: "credentials", loginCount: 0,
      },
    });
    user = await db.collection("users").findOne({ email });
    console.log(`   ♻️  Updated user: ${email}`);
  } else {
    const res = await db.collection("users").insertOne({
      name, email, role, password: hashedPwd, plainPassword: DEMO_PASSWORD,
      provider: "credentials", onboardingCompleted: true, isDemo: true,
      loginCount: 0, profile, image: null, createdAt: new Date(), updatedAt: new Date(),
    });
    user = await db.collection("users").findOne({ _id: res.insertedId });
    console.log(`   ✨ Created user: ${email}`);
  }

  const userId = user._id;

  // Clear all existing data
  const [d1, d2, d3, d4, d5] = await Promise.all([
    db.collection("expenses").deleteMany({ userId }),
    db.collection("invoices").deleteMany({ userId }),
    db.collection("clients").deleteMany({ userId }),
    db.collection("paymentsettlements").deleteMany({ userId }),
    db.collection("notifications").deleteMany({ userId }),
  ]);
  console.log(`   🗑️  Cleared: ${d1.deletedCount} expenses, ${d2.deletedCount} invoices, ${d3.deletedCount} clients, ${d4.deletedCount} payments, ${d5.deletedCount} notifications`);

  // Seed expenses
  await db.collection("expenses").insertMany(
    expenseDefs.map((e) => ({
      userId,
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: daysAgo(e.daysBack),
      type: e.type,
      paymentMode: e.paymentMode,
      notes: e.notes ?? "",
      createdAt: daysAgo(e.daysBack),
      updatedAt: daysAgo(e.daysBack),
    }))
  );
  console.log(`   💸 Seeded ${expenseDefs.length} expenses`);

  // Seed notifications
  await db.collection("notifications").insertMany(
    notifMessages.map(({ message, type, read, daysBack }) => ({
      userId, message, type, read: read ?? false,
      createdAt: daysAgo(daysBack), updatedAt: daysAgo(daysBack),
    }))
  );
  console.log(`   🔔 Seeded ${notifMessages.length} notifications`);

  // Seed clients + invoices (freelancer only)
  if (clientDefs && invoiceFn) {
    const insertedClients = await db.collection("clients").insertMany(
      clientDefs.map((c) => ({ ...c, userId, createdAt: new Date(), updatedAt: new Date() }))
    );
    const clients = await db
      .collection("clients")
      .find({ _id: { $in: Object.values(insertedClients.insertedIds) } })
      .toArray();
    console.log(`   🏢 Seeded ${clients.length} clients`);

    const invoiceDefs = invoiceFn(clients);
    let pmtCount = 0;
    for (const inv of invoiceDefs) {
      const invDoc = await db.collection("invoices").insertOne({
        userId,
        clientId: inv.client._id,
        invoiceNumber: inv.num,
        issueDate: daysAgo(inv.issued),
        dueDate: daysAgo(inv.due),
        items: inv.items,
        totalAmount: inv.total,
        amountPaid: inv.amountPaid,
        amountDue: inv.amountDue,
        status: inv.status,
        notes: inv.notes ?? "",
        createdAt: daysAgo(inv.issued),
        updatedAt: new Date(),
      });

      if (inv.payment) {
        await db.collection("paymentsettlements").insertOne({
          userId,
          invoiceId: invDoc.insertedId,
          amount: inv.payment.amount,
          paymentDate: daysAgo(inv.payment.paidDaysAgo),
          paymentMode: inv.payment.mode,
          transactionId: txnId(),
          payerName: inv.client.name,
          payerEmail: inv.client.email,
          createdAt: daysAgo(inv.payment.paidDaysAgo),
          updatedAt: daysAgo(inv.payment.paidDaysAgo),
        });
        pmtCount++;
      }
    }
    console.log(`   🧾 Seeded ${invoiceDefs.length} invoices + ${pmtCount} payments`);

    const revenue = invoiceDefs.reduce((s, i) => s + i.amountPaid, 0);
    const outstanding = invoiceDefs.reduce((s, i) => s + i.amountDue, 0);
    console.log(`   💰 Revenue: ₹${revenue.toLocaleString("en-IN")}  |  Outstanding: ₹${outstanding.toLocaleString("en-IN")}`);
  }

  console.log("");
}

async function cleanupAtlasToDemoOnly() {
  const db = mongoose.connection.db;

  const demoUsers = await db
    .collection("users")
    .find({ email: { $in: DEMO_EMAILS } }, { projection: { _id: 1, email: 1 } })
    .toArray();

  if (demoUsers.length !== DEMO_EMAILS.length) {
    throw new Error(
      `Expected ${DEMO_EMAILS.length} demo users after seed, found ${demoUsers.length}. Aborting cleanup.`
    );
  }

  const allowedUserIds = demoUsers.map((u) => u._id);

  // Keep only records tied to the two demo users.
  const scopedCollections = [
    "expenses",
    "invoices",
    "clients",
    "paymentsettlements",
    "notifications",
    "chatsessions",
    "reminders",
  ];

  let purgedRecords = 0;
  for (const name of scopedCollections) {
    const result = await db.collection(name).deleteMany({ userId: { $nin: allowedUserIds } });
    purgedRecords += result.deletedCount;
  }

  const removeNonDemoUsers = await db.collection("users").deleteMany({
    _id: { $nin: allowedUserIds },
  });

  const collections = await db.listCollections().toArray();
  const dynamicPattern = /^(user|client|invoice|expense)_\d+$/i;
  let droppedCollections = 0;
  for (const collection of collections) {
    if (dynamicPattern.test(collection.name)) {
      await db.collection(collection.name).drop();
      droppedCollections++;
    }
  }

  console.log(
    `   🧹 Atlas cleanup complete: removed ${purgedRecords} non-demo records, ${removeNonDemoUsers.deletedCount} non-demo users, dropped ${droppedCollections} dynamic collections`
  );
}

// ─── Invoice builder for the freelancer ──────────────────────────────────────

function buildFreelancerInvoices(clients) {
  return [
    {
      client: clients[0], num: "INV-2024-001", issued: 90, due: 60,
      items: [
        { description: "Full-Stack Web App – Phase 1", quantity: 1, unitPrice: 95000, amount: 95000 },
        { description: "UI/UX Design",                 quantity: 1, unitPrice: 25000, amount: 25000 },
      ],
      total: 120000, amountPaid: 120000, amountDue: 0, status: "paid",
      notes: "Phase 1 delivered on time for Chennai retail rollout.",
      payment: { amount: 120000, paidDaysAgo: 58, mode: "Net Banking" },
    },
    {
      client: clients[1], num: "INV-2024-002", issued: 60, due: 30,
      items: [
        { description: "Mobile App MVP (React Native)", quantity: 1, unitPrice: 80000, amount: 80000 },
      ],
      total: 80000, amountPaid: 40000, amountDue: 40000, status: "partially_paid",
      notes: "50% advance received. Balance due on delivery.",
      payment: { amount: 40000, paidDaysAgo: 25, mode: "UPI" },
    },
    {
      client: clients[2], num: "INV-2024-003", issued: 30, due: 0,
      items: [
        { description: "E-commerce Platform Setup",    quantity: 1, unitPrice: 55000, amount: 55000 },
        { description: "Payment Gateway Integration",  quantity: 1, unitPrice: 15000, amount: 15000 },
      ],
      total: 70000, amountPaid: 0, amountDue: 70000, status: "due",
      notes: "Due today. Follow up with Madurai finance team.",
      payment: null,
    },
    {
      client: clients[3], num: "INV-2024-004", issued: 45, due: 15,
      items: [
        { description: "Backend API Development – Mar", quantity: 60, unitPrice: 800, amount: 48000 },
      ],
      total: 48000, amountPaid: 0, amountDue: 48000, status: "overdue",
      notes: "30 days overdue. Escalation needed with client in Trichy.",
      payment: null,
    },
    {
      client: clients[4], num: "INV-2024-005", issued: 7, due: -23,
      items: [
        { description: "Cloud Infrastructure Setup",  quantity: 1, unitPrice: 35000, amount: 35000 },
        { description: "DevOps & CI/CD Pipeline",     quantity: 1, unitPrice: 20000, amount: 20000 },
      ],
      total: 55000, amountPaid: 0, amountDue: 55000, status: "sent",
      notes: "Invoice sent. Payment expected within 30 days.",
      payment: null,
    },
    {
      client: clients[5], num: "INV-2024-006", issued: 120, due: 90,
      items: [
        { description: "Digital Transformation Consulting", quantity: 10, unitPrice: 5000, amount: 50000 },
      ],
      total: 50000, amountPaid: 50000, amountDue: 0, status: "paid",
      notes: "Long-term TN consulting retainer - complete.",
      payment: { amount: 50000, paidDaysAgo: 88, mode: "Net Banking" },
    },
    {
      client: clients[0], num: "INV-2024-007", issued: 15, due: -15,
      items: [
        { description: "Full-Stack App – Phase 2",   quantity: 1, unitPrice: 70000, amount: 70000 },
        { description: "Performance Optimisation",   quantity: 1, unitPrice: 10000, amount: 10000 },
      ],
      total: 80000, amountPaid: 30000, amountDue: 50000, status: "partially_paid",
      notes: "Advance paid. Final payment due in 15 days.",
      payment: { amount: 30000, paidDaysAgo: 10, mode: "UPI" },
    },
  ];
}

// ─── Notifications ────────────────────────────────────────────────────────────

const FREELANCER_NOTIFS = [
  { message: "New payment of ₹1,20,000 received from Marina Retail Pvt Ltd", type: "payment",  read: false, daysBack: 0 },
  { message: "Invoice INV-2024-004 is 15 days overdue - follow up with S. Prabhakaran", type: "overdue",  read: false, daysBack: 1 },
  { message: "Invoice INV-2024-003 due today - Madurai Foods Co", type: "due",      read: false, daysBack: 0 },
  { message: "Invoice INV-2024-005 sent to Chennai Logistics Hub - ₹55,000", type: "invoice", read: true,  daysBack: 7 },
  { message: "₹40,000 advance received from Kovai Tech Labs", type: "payment",  read: true,  daysBack: 25 },
  { message: "Monthly summary: ₹1,70,000 collected this quarter", type: "summary",  read: true,  daysBack: 30 },
  { message: "Reminder: Figma Pro subscription renews in 5 days", type: "reminder",  read: false, daysBack: 0 },
];

const STUDENT_NOTIFS = [
  { message: "Budget alert: Food & Dining spending is 85% of monthly limit", type: "alert",   read: false, daysBack: 0 },
  { message: "Semester fee of ₹45,000 was recorded 2 months ago", type: "info",    read: true,  daysBack: 60 },
  { message: "You saved ₹2,400 compared to last month – great job!", type: "success",  read: false, daysBack: 1 },
  { message: "New ML course added to your tracked expenses", type: "info",    read: true,  daysBack: 14 },
  { message: "Tip: Split PG and mess bills easily using the expense tracker", type: "tip",     read: true,  daysBack: 5 },
  { message: "Monthly report ready – April expenses totalled ₹12,800", type: "report",   read: false, daysBack: 0 },
];

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  assertAtlasUri(MONGODB_URI);

  console.log("🚀 Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("✅ Connected\n");

  // ── ① Freelancer demo ──────────────────────────────────────────────────────
  console.log("📦 Seeding FREELANCER demo account...");
  await seedUser({
    email:   FREELANCER_EMAIL,
    name:    "Arun Prakash",
    role:    "freelancer",
    profile: {
      primaryService:    "Software Development",
      experienceLevel:   "expert",
      monthlyIncomeGoal: 200000,
      skills:            ["React", "Node.js", "TypeScript", "MongoDB", "Next.js", "AWS"],
      portfolioUrl:      "https://arunprakash.dev",
    },
    expenseDefs:   FREELANCER_EXPENSES,
    clientDefs:    FREELANCER_CLIENTS,
    invoiceFn:     buildFreelancerInvoices,
    notifMessages: FREELANCER_NOTIFS,
  });

  // ── ② Student demo ─────────────────────────────────────────────────────────
  console.log("📦 Seeding STUDENT demo account...");
  await seedUser({
    email:   STUDENT_EMAIL,
    name:    "Nivetha K",
    role:    "student",
    profile: {
      school:         "Anna University, Chennai",
      course:         "B.E. Computer Science (Year 3)",
      graduationYear: 2026,
      monthlyBudget:  15000,
    },
    expenseDefs:   STUDENT_EXPENSES,
    clientDefs:    null,
    invoiceFn:     null,
    notifMessages: STUDENT_NOTIFS,
  });

  console.log("🧽 Removing non-demo data from Atlas...");
  await cleanupAtlasToDemoOnly();

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("══════════════════════════════════════════════════════");
  console.log("✅  Demo accounts seeded successfully!");
  console.log("══════════════════════════════════════════════════════");
  console.log("");
  console.log("  🧑‍💻 Freelancer");
  console.log(`     Email    : ${FREELANCER_EMAIL}`);
  console.log(`     Password : ${DEMO_PASSWORD}`);
  console.log(`     Role     : Freelancer → /freelancer/dashboard`);
  console.log("");
  console.log("  🎓 Student");
  console.log(`     Email    : ${STUDENT_EMAIL}`);
  console.log(`     Password : ${DEMO_PASSWORD}`);
  console.log(`     Role     : Student → /dashboard`);
  console.log("");
  console.log("  Password storage (for demo users only):");
  console.log("    • password      : bcrypt hash (used for authentication)");
  console.log("    • plainPassword : original password (debugging)");
  console.log("");
  console.log("  Atlas now contains only these demo users and related data.");
  console.log("══════════════════════════════════════════════════════\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err.message ?? err);
  process.exit(1);
});
