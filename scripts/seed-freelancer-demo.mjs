/**
 * scripts/seed-freelancer-demo.mjs
 * ─────────────────────────────────
 * Creates (or resets) the demo freelancer account and populates it
 * with realistic mock data so the dashboards have live numbers.
 *
 * Usage:
 *   node scripts/seed-freelancer-demo.mjs
 *
 * Credentials seeded:
 *   Email:    freelancer@gmail.com
 *   Password: 12345678910
 */

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── Env ────────────────────────────────────────────────────────────────────────
const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/iteryx-db-26";

const DEMO_EMAIL    = "freelancer@gmail.com";
const DEMO_NAME     = "Arjun Mehta";
const DEMO_PASSWORD = "12345678910";

// ── Inline schemas ─────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name: String, email: String, password: String, image: String,
    provider: String, providerId: String, sessionTokenHash: String,
    sessionExpiresAt: Date, role: String, onboardingCompleted: Boolean,
    loginCount: Number, profile: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);
const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

const ClientSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String, email: String, phone: String },
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
const Payment =
  mongoose.models.PaymentSettlement ??
  mongoose.model("PaymentSettlement", PaymentSchema);

// ── Helpers ────────────────────────────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ── Seed data ──────────────────────────────────────────────────────────────────
const CLIENT_SEEDS = [
  { name: "Nexus Digital LLP",    email: "billing@nexusdigital.in",   phone: "+91 98201 11001" },
  { name: "Spark Ventures",       email: "accounts@sparkventures.io",  phone: "+91 98202 22002" },
  { name: "Maya Retail Pvt Ltd",  email: "finance@mayaretail.com",     phone: "+91 98203 33003" },
  { name: "Arun Kumar",           email: "arun.kumar@gmail.com",       phone: "+91 99001 44004" },
  { name: "BlueSky Technologies", email: "ap@bluesky.tech",            phone: "+91 98204 55005" },
  { name: "Rao Consulting",       email: "rao@raoconsulting.in",       phone: "+91 99005 66006" },
];

const EXPENSE_SEEDS = [
  // Food & Dining
  { title: "Swiggy Order",         category: "Food & Dining",  amount: 620,  paymentMode: "UPI",         daysBack: 1,  type: "PERSONAL", notes: "Dinner" },
  { title: "Zomato Lunch",         category: "Food & Dining",  amount: 385,  paymentMode: "UPI",         daysBack: 3,  type: "PERSONAL", notes: "Lunch" },
  { title: "Starbucks Coffee",     category: "Food & Dining",  amount: 480,  paymentMode: "Credit Card", daysBack: 5,  type: "PERSONAL" },
  { title: "Weekly Groceries",     category: "Food & Dining",  amount: 2200, paymentMode: "UPI",         daysBack: 7,  type: "PERSONAL" },
  { title: "Client Team Lunch",    category: "Food & Dining",  amount: 4800, paymentMode: "Credit Card", daysBack: 10, type: "BUSINESS", notes: "Nexus Digital meeting" },
  { title: "Dominos Pizza",        category: "Food & Dining",  amount: 720,  paymentMode: "UPI",         daysBack: 18, type: "PERSONAL" },
  { title: "Monthly Groceries",    category: "Food & Dining",  amount: 4800, paymentMode: "Debit Card",  daysBack: 35, type: "PERSONAL" },
  { title: "Team Outing",          category: "Food & Dining",  amount: 6200, paymentMode: "Credit Card", daysBack: 50, type: "BUSINESS", notes: "Team celebration – project delivery" },
  // Transport
  { title: "Metro Card Recharge",  category: "Transport",      amount: 500,  paymentMode: "UPI",         daysBack: 2,  type: "PERSONAL" },
  { title: "Petrol",               category: "Transport",      amount: 2200, paymentMode: "Cash",        daysBack: 6,  type: "PERSONAL" },
  { title: "Ola Cab",              category: "Transport",      amount: 320,  paymentMode: "UPI",         daysBack: 9,  type: "PERSONAL" },
  { title: "Flight – Mumbai",      category: "Transport",      amount: 9500, paymentMode: "Credit Card", daysBack: 20, type: "BUSINESS", notes: "Client site visit" },
  { title: "Petrol",               category: "Transport",      amount: 1800, paymentMode: "Cash",        daysBack: 36, type: "PERSONAL" },
  // Utilities
  { title: "Electricity Bill",     category: "Utilities",      amount: 2300, paymentMode: "Net Banking", daysBack: 4,  type: "PERSONAL", notes: "March bill" },
  { title: "Internet Bill",        category: "Utilities",      amount: 1499, paymentMode: "Net Banking", daysBack: 8,  type: "PERSONAL" },
  { title: "Mobile Recharge",      category: "Utilities",      amount: 719,  paymentMode: "UPI",         daysBack: 14, type: "PERSONAL" },
  { title: "Gas Cylinder",         category: "Utilities",      amount: 950,  paymentMode: "Cash",        daysBack: 20, type: "PERSONAL" },
  { title: "Electricity Bill",     category: "Utilities",      amount: 2100, paymentMode: "Net Banking", daysBack: 38, type: "PERSONAL" },
  // Software & Tools
  { title: "Figma Pro",            category: "Software",       amount: 1500, paymentMode: "Credit Card", daysBack: 15, type: "BUSINESS" },
  { title: "GitHub Copilot",       category: "Software",       amount: 800,  paymentMode: "Credit Card", daysBack: 16, type: "BUSINESS" },
  { title: "Notion Pro",           category: "Software",       amount: 480,  paymentMode: "Credit Card", daysBack: 17, type: "BUSINESS" },
  { title: "Adobe CC",             category: "Software",       amount: 4999, paymentMode: "Credit Card", daysBack: 45, type: "BUSINESS" },
  { title: "Vercel Pro",           category: "Software",       amount: 1700, paymentMode: "Credit Card", daysBack: 22, type: "BUSINESS" },
  // Subscriptions
  { title: "Netflix",              category: "Subscriptions",  amount: 649,  paymentMode: "Credit Card", daysBack: 10, type: "PERSONAL" },
  { title: "Spotify Premium",      category: "Subscriptions",  amount: 119,  paymentMode: "UPI",         daysBack: 10, type: "PERSONAL" },
  { title: "Netflix",              category: "Subscriptions",  amount: 649,  paymentMode: "Credit Card", daysBack: 40, type: "PERSONAL" },
  // Health
  { title: "Gym Membership",       category: "Health",         amount: 2200, paymentMode: "UPI",         daysBack: 13, type: "PERSONAL" },
  { title: "Doctor Consultation",  category: "Health",         amount: 800,  paymentMode: "Cash",        daysBack: 28, type: "PERSONAL" },
  { title: "Gym Membership",       category: "Health",         amount: 2200, paymentMode: "UPI",         daysBack: 43, type: "PERSONAL" },
  // Shopping
  { title: "Amazon – Monitor",     category: "Shopping",       amount: 18500, paymentMode: "Credit Card", daysBack: 19, type: "BUSINESS", notes: "27\" Dell monitor for workspace" },
  { title: "Mechanical Keyboard",  category: "Shopping",       amount: 4200, paymentMode: "Credit Card", daysBack: 23, type: "BUSINESS" },
  // Office
  { title: "Office Stationery",    category: "Office",         amount: 650,  paymentMode: "Cash",        daysBack: 24, type: "BUSINESS" },
  { title: "Printer Cartridges",   category: "Office",         amount: 1200, paymentMode: "UPI",         daysBack: 30, type: "BUSINESS" },
  { title: "Co-working Space",     category: "Office",         amount: 8000, paymentMode: "Net Banking", daysBack: 32, type: "BUSINESS", notes: "March membership" },
];

// ── Main ───────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("✅ Connected to MongoDB:", MONGODB_URI);

  // 1. Upsert demo user
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 12);

  let user = await User.findOne({ email: DEMO_EMAIL });
  if (user) {
    user.name               = DEMO_NAME;
    user.password           = hashedPassword;
    user.provider           = "credentials";
    user.role               = "freelancer";
    user.onboardingCompleted = true;
    user.loginCount         = (user.loginCount ?? 0);
    user.profile            = {
      primaryService:   "Software Development",
      experienceLevel:  "expert",
      monthlyIncomeGoal: 200000,
      skills:           ["React", "Node.js", "TypeScript", "MongoDB", "Next.js"],
      portfolioUrl:     "https://arjunmehta.dev",
    };
    await user.save();
    console.log(`♻️  Updated existing user: ${DEMO_EMAIL}`);
  } else {
    user = await User.create({
      name:               DEMO_NAME,
      email:              DEMO_EMAIL,
      password:           hashedPassword,
      provider:           "credentials",
      role:               "freelancer",
      onboardingCompleted: true,
      loginCount:         0,
      profile: {
        primaryService:   "Software Development",
        experienceLevel:  "expert",
        monthlyIncomeGoal: 200000,
        skills:           ["React", "Node.js", "TypeScript", "MongoDB", "Next.js"],
        portfolioUrl:     "https://arjunmehta.dev",
      },
    });
    console.log(`✨ Created new demo user: ${DEMO_EMAIL}`);
  }

  const userId = user._id;

  // 2. Clear existing data for this user
  await Promise.all([
    Expense.deleteMany({ userId }),
    Invoice.deleteMany({ userId }),
    Client.deleteMany({ userId }),
    Payment.deleteMany({ userId }),
  ]);
  console.log("🗑️  Cleared existing financial data");

  // 3. Seed clients
  const clients = await Client.insertMany(
    CLIENT_SEEDS.map((c) => ({ ...c, userId }))
  );
  console.log(`🏢 Seeded ${clients.length} clients`);

  // 4. Seed expenses
  await Expense.insertMany(
    EXPENSE_SEEDS.map((e) => ({
      userId,
      title:       e.title,
      amount:      e.amount,
      category:    e.category,
      date:        daysAgo(e.daysBack),
      type:        e.type,
      paymentMode: e.paymentMode,
      notes:       e.notes ?? "",
    }))
  );
  console.log(`💸 Seeded ${EXPENSE_SEEDS.length} expenses`);

  // 5. Seed invoices + payments
  const invoiceDefs = [
    {
      client: clients[0], invoiceNumber: "INV-2024-001",
      issuedDaysAgo: 90, dueDaysAgo: 60,
      items: [
        { description: "Full-Stack Web App – Phase 1", quantity: 1, unitPrice: 95000, amount: 95000 },
        { description: "UI/UX Design",                 quantity: 1, unitPrice: 25000, amount: 25000 },
      ],
      totalAmount: 120000, amountPaid: 120000, amountDue: 0,
      status: "paid",
      payment: { amount: 120000, paidDaysAgo: 58, paymentMode: "Net Banking" },
    },
    {
      client: clients[1], invoiceNumber: "INV-2024-002",
      issuedDaysAgo: 60, dueDaysAgo: 30,
      items: [
        { description: "Mobile App MVP (React Native)", quantity: 1, unitPrice: 80000, amount: 80000 },
      ],
      totalAmount: 80000, amountPaid: 40000, amountDue: 40000,
      status: "partially_paid",
      payment: { amount: 40000, paidDaysAgo: 25, paymentMode: "UPI" },
    },
    {
      client: clients[2], invoiceNumber: "INV-2024-003",
      issuedDaysAgo: 30, dueDaysAgo: 0,
      items: [
        { description: "E-commerce Platform Setup",    quantity: 1, unitPrice: 55000, amount: 55000 },
        { description: "Payment Gateway Integration",  quantity: 1, unitPrice: 15000, amount: 15000 },
      ],
      totalAmount: 70000, amountPaid: 0, amountDue: 70000,
      status: "due",
      payment: null,
    },
    {
      client: clients[3], invoiceNumber: "INV-2024-004",
      issuedDaysAgo: 45, dueDaysAgo: 15,
      items: [
        { description: "Backend API Development – Mar", quantity: 60, unitPrice: 800, amount: 48000 },
      ],
      totalAmount: 48000, amountPaid: 0, amountDue: 48000,
      status: "overdue",
      payment: null,
    },
    {
      client: clients[4], invoiceNumber: "INV-2024-005",
      issuedDaysAgo: 7, dueDaysAgo: -23, // due in future
      items: [
        { description: "Cloud Infrastructure Setup",  quantity: 1, unitPrice: 35000, amount: 35000 },
        { description: "DevOps & CI/CD Pipeline",     quantity: 1, unitPrice: 20000, amount: 20000 },
      ],
      totalAmount: 55000, amountPaid: 0, amountDue: 55000,
      status: "sent",
      payment: null,
    },
    {
      client: clients[5], invoiceNumber: "INV-2024-006",
      issuedDaysAgo: 120, dueDaysAgo: 90,
      items: [
        { description: "Digital Transformation Consulting", quantity: 10, unitPrice: 5000, amount: 50000 },
      ],
      totalAmount: 50000, amountPaid: 50000, amountDue: 0,
      status: "paid",
      payment: { amount: 50000, paidDaysAgo: 88, paymentMode: "Net Banking" },
    },
    {
      client: clients[0], invoiceNumber: "INV-2024-007",
      issuedDaysAgo: 15, dueDaysAgo: -15, // due in future
      items: [
        { description: "Full-Stack App – Phase 2",    quantity: 1, unitPrice: 70000, amount: 70000 },
        { description: "Performance Optimisation",    quantity: 1, unitPrice: 10000, amount: 10000 },
      ],
      totalAmount: 80000, amountPaid: 30000, amountDue: 50000,
      status: "partially_paid",
      payment: { amount: 30000, paidDaysAgo: 10, paymentMode: "UPI" },
    },
  ];

  let paymentCount = 0;
  for (const inv of invoiceDefs) {
    const doc = await Invoice.create({
      userId,
      clientId:      inv.client._id,
      invoiceNumber: inv.invoiceNumber,
      issueDate:     daysAgo(inv.issuedDaysAgo),
      dueDate:       daysAgo(inv.dueDaysAgo),
      items:         inv.items,
      totalAmount:   inv.totalAmount,
      amountPaid:    inv.amountPaid,
      amountDue:     inv.amountDue,
      status:        inv.status,
    });

    if (inv.payment) {
      await Payment.create({
        userId,
        invoiceId:     doc._id,
        amount:        inv.payment.amount,
        paymentDate:   daysAgo(inv.payment.paidDaysAgo),
        paymentMode:   inv.payment.paymentMode,
        transactionId: `TXN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
        payerName:     inv.client.name,
        payerEmail:    inv.client.email,
      });
      paymentCount++;
    }
  }

  console.log(`🧾 Seeded ${invoiceDefs.length} invoices`);
  console.log(`💳 Seeded ${paymentCount} payment settlements`);

  const totalRevenue = invoiceDefs.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = invoiceDefs.reduce((sum, i) => sum + i.amountDue, 0);
  const totalExpenses = EXPENSE_SEEDS.reduce((sum, e) => sum + e.amount, 0);

  console.log("\n─────────────────────────────────────────────────────────");
  console.log("✅  Demo freelancer account seeded successfully!");
  console.log("─────────────────────────────────────────────────────────");
  console.log(`   Email     : ${DEMO_EMAIL}`);
  console.log(`   Password  : ${DEMO_PASSWORD}`);
  console.log(`   Role      : Freelancer`);
  console.log(`   Revenue   : ₹${totalRevenue.toLocaleString("en-IN")}`);
  console.log(`   Outstanding: ₹${totalOutstanding.toLocaleString("en-IN")}`);
  console.log(`   Expenses  : ₹${totalExpenses.toLocaleString("en-IN")}`);
  console.log("─────────────────────────────────────────────────────────\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
