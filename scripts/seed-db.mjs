/**
 * scripts/seed-db.mjs
 * ────────────────────
 * Seed the MongoDB database with realistic sample data for ONE user.
 *
 * Usage:
 *   node scripts/seed-db.mjs
 *   # or to target a specific email:
 *   SEED_EMAIL=you@example.com node scripts/seed-db.mjs
 *
 * The script:
 *  1. Connects to the MongoDB in .env.local (MONGODB_URI)
 *  2. Finds the first user in the DB (or the one matching SEED_EMAIL)
 *  3. Wipes existing Expenses, Invoices, Clients, PaymentSettlements for that user
 *  4. Seeds fresh realistic data so the RAG chatbot has something to answer
 */

import "dotenv/config";
import mongoose from "mongoose";

// ── Env ────────────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/iteryx-db-26";
const TARGET_EMAIL = process.env.SEED_EMAIL ?? null;

// ─────────────────────────────────────────────────────────────────────────────
// Inline schema definitions (avoids TS compilation step)
// ─────────────────────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema(
  { name: String, email: String, password: String, image: String, provider: String,
    providerId: String, sessionTokenHash: String, sessionExpiresAt: Date,
    role: String, onboardingCompleted: Boolean, loginCount: Number, profile: mongoose.Schema.Types.Mixed },
  { timestamps: true }
);
const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

const ClientSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, name: String, email: String, phone: String },
  { timestamps: true }
);
const Client = mongoose.models.Client ?? mongoose.model("Client", ClientSchema);

const InvoiceItemSchema = new mongoose.Schema(
  { description: String, quantity: Number, unitPrice: Number, amount: Number },
  { _id: false }
);
const InvoiceSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    invoiceNumber: String, issueDate: Date, dueDate: Date,
    items: [InvoiceItemSchema], totalAmount: Number, amountPaid: Number,
    amountDue: Number, status: String, paymentLink: String, notes: String },
  { timestamps: true }
);
const Invoice = mongoose.models.Invoice ?? mongoose.model("Invoice", InvoiceSchema);

const ExpenseSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String, amount: Number, category: String, date: Date,
    type: String, paymentMode: String, notes: String },
  { timestamps: true }
);
const Expense = mongoose.models.Expense ?? mongoose.model("Expense", ExpenseSchema);

const PaymentSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    amount: Number, paymentDate: Date, paymentMode: String,
    transactionId: String, payerName: String, payerEmail: String, payerPhone: String },
  { timestamps: true }
);
const Payment = mongoose.models.PaymentSettlement ?? mongoose.model("PaymentSettlement", PaymentSchema);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed data definitions
// ─────────────────────────────────────────────────────────────────────────────

const EXPENSE_SEEDS = [
  // Food & Dining
  { title: "Swiggy Order",         category: "Food & Dining",   amount: 620,  paymentMode: "UPI",         daysAgo: 1,   type: "PERSONAL", notes: "Dinner" },
  { title: "Zomato Lunch",          category: "Food & Dining",   amount: 385,  paymentMode: "UPI",         daysAgo: 3,   type: "PERSONAL", notes: "Lunch" },
  { title: "Starbucks Coffee",      category: "Food & Dining",   amount: 480,  paymentMode: "Credit Card", daysAgo: 5,   type: "PERSONAL" },
  { title: "Weekly Groceries",      category: "Food & Dining",   amount: 2200, paymentMode: "UPI",         daysAgo: 7,   type: "PERSONAL" },
  { title: "Team Lunch",            category: "Food & Dining",   amount: 3200, paymentMode: "Credit Card", daysAgo: 12,  type: "BUSINESS", notes: "Client meeting" },
  { title: "Dominos Pizza",         category: "Food & Dining",   amount: 720,  paymentMode: "UPI",         daysAgo: 18,  type: "PERSONAL" },
  { title: "Swiggy Order",         category: "Food & Dining",   amount: 540,  paymentMode: "UPI",         daysAgo: 22,  type: "PERSONAL" },
  { title: "Monthly Groceries",     category: "Food & Dining",   amount: 4800, paymentMode: "Debit Card",  daysAgo: 35,  type: "PERSONAL" },
  // Transport
  { title: "Metro Card Recharge",  category: "Transport",        amount: 500,  paymentMode: "UPI",         daysAgo: 2,   type: "PERSONAL" },
  { title: "Petrol",               category: "Transport",        amount: 1800, paymentMode: "Cash",        daysAgo: 6,   type: "PERSONAL" },
  { title: "Ola Cab",              category: "Transport",        amount: 320,  paymentMode: "UPI",         daysAgo: 9,   type: "PERSONAL" },
  { title: "Rapido Bike",          category: "Transport",        amount: 85,   paymentMode: "UPI",         daysAgo: 11,  type: "PERSONAL" },
  { title: "Flight Tickets",       category: "Transport",        amount: 8500, paymentMode: "Credit Card", daysAgo: 25,  type: "BUSINESS", notes: "Client visit Mumbai" },
  // Utilities
  { title: "Electricity Bill",     category: "Utilities",        amount: 2300, paymentMode: "Net Banking", daysAgo: 4,   type: "PERSONAL", notes: "March bill" },
  { title: "Internet Bill",        category: "Utilities",        amount: 1499, paymentMode: "Net Banking", daysAgo: 8,   type: "PERSONAL" },
  { title: "Mobile Recharge",      category: "Utilities",        amount: 719,  paymentMode: "UPI",         daysAgo: 14,  type: "PERSONAL" },
  { title: "Gas Cylinder",        category: "Utilities",        amount: 950,  paymentMode: "Cash",        daysAgo: 20,  type: "PERSONAL" },
  // Software & Subscriptions
  { title: "Netflix Subscription", category: "Subscriptions",   amount: 649,  paymentMode: "Credit Card", daysAgo: 10,  type: "PERSONAL", notes: "Monthly" },
  { title: "Figma Pro",            category: "Software",         amount: 1500, paymentMode: "Credit Card", daysAgo: 15,  type: "BUSINESS" },
  { title: "GitHub Copilot",       category: "Software",         amount: 800,  paymentMode: "Credit Card", daysAgo: 16,  type: "BUSINESS" },
  { title: "Notion Pro",           category: "Software",         amount: 480,  paymentMode: "Credit Card", daysAgo: 17,  type: "BUSINESS" },
  { title: "Adobe CC",             category: "Software",         amount: 4999, paymentMode: "Credit Card", daysAgo: 45,  type: "BUSINESS" },
  // Health
  { title: "Gym Membership",       category: "Health",           amount: 1800, paymentMode: "UPI",         daysAgo: 13,  type: "PERSONAL" },
  { title: "Doctor Consultation",  category: "Health",           amount: 800,  paymentMode: "Cash",        daysAgo: 28,  type: "PERSONAL" },
  // Shopping
  { title: "Amazon Electronics",   category: "Shopping",         amount: 3480, paymentMode: "Credit Card", daysAgo: 19,  type: "PERSONAL", notes: "Headphones" },
  { title: "Flipkart Clothing",    category: "Shopping",         amount: 2100, paymentMode: "Debit Card",  daysAgo: 23,  type: "PERSONAL" },
  // Office
  { title: "Office Stationery",    category: "Office",           amount: 650,  paymentMode: "Cash",        daysAgo: 24,  type: "BUSINESS" },
  { title: "Printer Cartridges",   category: "Office",           amount: 1200, paymentMode: "UPI",         daysAgo: 30,  type: "BUSINESS" },
  // Previous month
  { title: "Swiggy Order",        category: "Food & Dining",   amount: 490,  paymentMode: "UPI",         daysAgo: 40,  type: "PERSONAL" },
  { title: "Metro Card Recharge", category: "Transport",        amount: 500,  paymentMode: "UPI",         daysAgo: 42,  type: "PERSONAL" },
  { title: "Electricity Bill",    category: "Utilities",        amount: 2100, paymentMode: "Net Banking", daysAgo: 38,  type: "PERSONAL" },
  { title: "Gym Membership",      category: "Health",           amount: 1800, paymentMode: "UPI",         daysAgo: 43,  type: "PERSONAL" },
  { title: "Netflix Subscription",category: "Subscriptions",   amount: 649,  paymentMode: "Credit Card", daysAgo: 40,  type: "PERSONAL" },
  { title: "Petrol",              category: "Transport",        amount: 1500, paymentMode: "Cash",        daysAgo: 36,  type: "PERSONAL" },
  { title: "Team Outing",         category: "Food & Dining",   amount: 5500, paymentMode: "Credit Card", daysAgo: 50,  type: "BUSINESS", notes: "Team celebration" },
];

const CLIENT_SEEDS = [
  { name: "Nexus Digital LLP",    email: "billing@nexusdigital.in",  phone: "+91 98201 11001" },
  { name: "Spark Ventures",       email: "accounts@sparkventures.io", phone: "+91 98202 22002" },
  { name: "Maya Retail Pvt Ltd",  email: "finance@mayaretail.com",   phone: "+91 98203 33003" },
  { name: "Arun Kumar",           email: "arun.kumar@gmail.com",     phone: "+91 99001 44004" },
  { name: "BlueSky Technologies", email: "ap@bluesky.tech",          phone: "+91 98204 55005" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main seeder
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("✅ Connected to MongoDB:", MONGODB_URI);

  // 1. Find user
  const query = TARGET_EMAIL ? { email: TARGET_EMAIL } : {};
  const user = await User.findOne(query).lean();
  if (!user) {
    console.error("❌ No user found. Please log in first to create a user, then run this script.");
    process.exit(1);
  }
  const userId = user._id;
  console.log(`👤 Seeding for user: ${user.name} (${user.email}) → ${userId}`);

  // 2. Clear existing data
  await Promise.all([
    Expense.deleteMany({ userId }),
    Invoice.deleteMany({ userId }),
    Client.deleteMany({ userId }),
    Payment.deleteMany({ userId }),
  ]);
  console.log("🗑️  Cleared existing data");

  // 3. Seed Clients
  const createdClients = await Client.insertMany(
    CLIENT_SEEDS.map((c) => ({ ...c, userId }))
  );
  console.log(`🏢 Seeded ${createdClients.length} clients`);

  // 4. Seed Expenses
  const expenseDocs = EXPENSE_SEEDS.map((e) => ({
    userId,
    title: e.title,
    amount: e.amount,
    category: e.category,
    date: daysAgo(e.daysAgo),
    type: e.type,
    paymentMode: e.paymentMode,
    notes: e.notes ?? "",
  }));
  await Expense.insertMany(expenseDocs);
  console.log(`💸 Seeded ${expenseDocs.length} expenses`);

  // 5. Seed Invoices + Payments
  const invoiceData = [
    {
      client: createdClients[0],
      invoiceNumber: "INV-2024-001",
      issueDate: daysAgo(60),
      dueDate: daysAgo(30),
      items: [
        { description: "Website Redesign",   quantity: 1, unitPrice: 45000, amount: 45000 },
        { description: "SEO Optimisation",   quantity: 1, unitPrice: 12000, amount: 12000 },
      ],
      totalAmount: 57000,
      amountPaid: 57000,
      amountDue: 0,
      status: "paid",
      paid: true,
      paidAmount: 57000,
      paymentDate: daysAgo(28),
      paymentMode: "Net Banking",
    },
    {
      client: createdClients[1],
      invoiceNumber: "INV-2024-002",
      issueDate: daysAgo(45),
      dueDate: daysAgo(15),
      items: [
        { description: "Mobile App MVP",     quantity: 1, unitPrice: 80000, amount: 80000 },
      ],
      totalAmount: 80000,
      amountPaid: 40000,
      amountDue: 40000,
      status: "partially_paid",
      paid: false,
      paidAmount: 40000,
      paymentDate: daysAgo(20),
      paymentMode: "UPI",
    },
    {
      client: createdClients[2],
      invoiceNumber: "INV-2024-003",
      issueDate: daysAgo(30),
      dueDate: daysAgo(0),
      items: [
        { description: "Brand Identity Package", quantity: 1, unitPrice: 35000, amount: 35000 },
        { description: "Social Media Assets",    quantity: 10, unitPrice: 500,  amount: 5000 },
      ],
      totalAmount: 40000,
      amountPaid: 0,
      amountDue: 40000,
      status: "due",
      paid: false,
    },
    {
      client: createdClients[3],
      invoiceNumber: "INV-2024-004",
      issueDate: daysAgo(40),
      dueDate: daysAgo(10),
      items: [
        { description: "Freelance Dev – March", quantity: 40, unitPrice: 800, amount: 32000 },
      ],
      totalAmount: 32000,
      amountPaid: 0,
      amountDue: 32000,
      status: "overdue",
      paid: false,
    },
    {
      client: createdClients[4],
      invoiceNumber: "INV-2024-005",
      issueDate: daysAgo(5),
      dueDate: daysAgo(-25), // due in future
      items: [
        { description: "Cloud Infrastructure Setup", quantity: 1, unitPrice: 25000, amount: 25000 },
        { description: "DevOps Consulting – 10 hrs", quantity: 10, unitPrice: 2000, amount: 20000 },
      ],
      totalAmount: 45000,
      amountPaid: 0,
      amountDue: 45000,
      status: "sent",
      paid: false,
    },
    {
      client: createdClients[0],
      invoiceNumber: "INV-2024-006",
      issueDate: daysAgo(90),
      dueDate: daysAgo(60),
      items: [
        { description: "UI/UX Audit",        quantity: 1, unitPrice: 15000, amount: 15000 },
      ],
      totalAmount: 15000,
      amountPaid: 15000,
      amountDue: 0,
      status: "paid",
      paid: true,
      paidAmount: 15000,
      paymentDate: daysAgo(58),
      paymentMode: "UPI",
    },
  ];

  const payments = [];
  for (const inv of invoiceData) {
    const doc = await Invoice.create({
      userId,
      clientId: inv.client._id,
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      items: inv.items,
      totalAmount: inv.totalAmount,
      amountPaid: inv.amountPaid,
      amountDue: inv.amountDue,
      status: inv.status,
    });

    if (inv.paid || (inv.paidAmount && inv.paidAmount > 0)) {
      payments.push({
        userId,
        invoiceId: doc._id,
        amount: inv.paidAmount,
        paymentDate: inv.paymentDate ?? daysAgo(5),
        paymentMode: inv.paymentMode ?? "UPI",
        transactionId: `TXN${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        payerName: inv.client.name,
        payerEmail: inv.client.email,
      });
    }
  }

  if (payments.length > 0) {
    await Payment.insertMany(payments);
    console.log(`💳 Seeded ${payments.length} payments`);
  }
  console.log(`🧾 Seeded ${invoiceData.length} invoices`);

  console.log("\n✅ Database seeding complete!");
  console.log("   You can now ask the AI chatbot about your expenses, invoices, and payments.");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
