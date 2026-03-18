/**
 * scripts/seed-freelancer-data.mjs
 * Seeds financial data for the freelancer@gmail.com demo account.
 * Run: node scripts/seed-freelancer-data.mjs
 */
import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/iteryx-db-26";

// Minimal schemas (no model collision issues)
const ClientSchema = new mongoose.Schema(
  { userId: mongoose.Schema.Types.ObjectId, name: String, email: String, phone: String },
  { timestamps: true }
);

const InvoiceItemSchema = new mongoose.Schema(
  { description: String, quantity: Number, unitPrice: Number, amount: Number },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    clientId: mongoose.Schema.Types.ObjectId,
    invoiceNumber: String,
    issueDate: Date,
    dueDate: Date,
    items: [InvoiceItemSchema],
    totalAmount: Number,
    amountPaid: Number,
    amountDue: Number,
    status: String,
  },
  { timestamps: true }
);

const ExpenseSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    title: String,
    amount: Number,
    category: String,
    date: Date,
    type: String,
    paymentMode: String,
    notes: String,
  },
  { timestamps: true }
);

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri, { bufferCommands: false });
  console.log("Connected!");

  const db = mongoose.connection.db;

  // Force fresh model registration
  const Client = mongoose.model("Client_Seed", ClientSchema);
  const Invoice = mongoose.model("Invoice_Seed", InvoiceSchema);
  const Expense = mongoose.model("Expense_Seed", ExpenseSchema);

  // Find the freelancer user
  const userDoc = await db.collection("users").findOne({ email: "freelancer@gmail.com" });
  if (!userDoc) {
    console.error("❌ User freelancer@gmail.com not found.");
    process.exit(1);
  }
  const userId = userDoc._id;
  console.log("Found user:", userDoc.email, "id:", userId.toString());

  // Clear existing data
  const [d1, d2, d3, d4] = await Promise.all([
    db.collection("expenses").deleteMany({ userId }),
    db.collection("invoices").deleteMany({ userId }),
    db.collection("clients").deleteMany({ userId }),
    db.collection("paymentsettlements").deleteMany({ userId }),
  ]);
  console.log(`Cleared: ${d1.deletedCount} expenses, ${d2.deletedCount} invoices, ${d3.deletedCount} clients, ${d4.deletedCount} payments`);

  // Seed clients
  const clientDefs = [
    { name: "Nexus Digital LLP",    email: "billing@nexusdigital.in",   phone: "+91 98201 11001" },
    { name: "Spark Ventures",       email: "accounts@sparkventures.io",  phone: "+91 98202 22002" },
    { name: "Maya Retail Pvt Ltd",  email: "finance@mayaretail.com",     phone: "+91 98203 33003" },
    { name: "Arun Kumar",           email: "arun.kumar@gmail.com",       phone: "+91 99001 44004" },
    { name: "BlueSky Technologies", email: "ap@bluesky.tech",            phone: "+91 98204 55005" },
    { name: "Rao Consulting",       email: "rao@raoconsulting.in",       phone: "+91 99005 66006" },
  ];
  const clients = await Client.insertMany(clientDefs.map((c) => ({ ...c, userId })));
  console.log(`Created ${clients.length} clients`);

  // Seed expenses
  const expenseDefs = [
    { title: "Swiggy Order",         category: "Food & Dining",  amount: 620,   paymentMode: "UPI",         daysBack: 1,  type: "PERSONAL", notes: "Dinner" },
    { title: "Zomato Lunch",         category: "Food & Dining",  amount: 385,   paymentMode: "UPI",         daysBack: 3,  type: "PERSONAL", notes: "Lunch" },
    { title: "Starbucks Coffee",     category: "Food & Dining",  amount: 480,   paymentMode: "Credit Card", daysBack: 5,  type: "PERSONAL" },
    { title: "Weekly Groceries",     category: "Food & Dining",  amount: 2200,  paymentMode: "UPI",         daysBack: 7,  type: "PERSONAL" },
    { title: "Client Team Lunch",    category: "Food & Dining",  amount: 4800,  paymentMode: "Credit Card", daysBack: 10, type: "BUSINESS", notes: "Nexus Digital meeting" },
    { title: "Dominos Pizza",        category: "Food & Dining",  amount: 720,   paymentMode: "UPI",         daysBack: 18, type: "PERSONAL" },
    { title: "Monthly Groceries",    category: "Food & Dining",  amount: 4800,  paymentMode: "Debit Card",  daysBack: 35, type: "PERSONAL" },
    { title: "Team Outing",          category: "Food & Dining",  amount: 6200,  paymentMode: "Credit Card", daysBack: 50, type: "BUSINESS", notes: "Project delivery celebration" },
    { title: "Metro Card Recharge",  category: "Transport",      amount: 500,   paymentMode: "UPI",         daysBack: 2,  type: "PERSONAL" },
    { title: "Petrol",               category: "Transport",      amount: 2200,  paymentMode: "Cash",        daysBack: 6,  type: "PERSONAL" },
    { title: "Ola Cab",              category: "Transport",      amount: 320,   paymentMode: "UPI",         daysBack: 9,  type: "PERSONAL" },
    { title: "Flight - Mumbai",      category: "Transport",      amount: 9500,  paymentMode: "Credit Card", daysBack: 20, type: "BUSINESS", notes: "Client site visit" },
    { title: "Petrol",               category: "Transport",      amount: 1800,  paymentMode: "Cash",        daysBack: 36, type: "PERSONAL" },
    { title: "Electricity Bill",     category: "Utilities",      amount: 2300,  paymentMode: "Net Banking", daysBack: 4,  type: "PERSONAL", notes: "March bill" },
    { title: "Internet Bill",        category: "Utilities",      amount: 1499,  paymentMode: "Net Banking", daysBack: 8,  type: "PERSONAL" },
    { title: "Mobile Recharge",      category: "Utilities",      amount: 719,   paymentMode: "UPI",         daysBack: 14, type: "PERSONAL" },
    { title: "Gas Cylinder",         category: "Utilities",      amount: 950,   paymentMode: "Cash",        daysBack: 20, type: "PERSONAL" },
    { title: "Electricity Bill",     category: "Utilities",      amount: 2100,  paymentMode: "Net Banking", daysBack: 38, type: "PERSONAL" },
    { title: "Figma Pro",            category: "Software",       amount: 1500,  paymentMode: "Credit Card", daysBack: 15, type: "BUSINESS" },
    { title: "GitHub Copilot",       category: "Software",       amount: 800,   paymentMode: "Credit Card", daysBack: 16, type: "BUSINESS" },
    { title: "Notion Pro",           category: "Software",       amount: 480,   paymentMode: "Credit Card", daysBack: 17, type: "BUSINESS" },
    { title: "Adobe CC",             category: "Software",       amount: 4999,  paymentMode: "Credit Card", daysBack: 45, type: "BUSINESS" },
    { title: "Vercel Pro",           category: "Software",       amount: 1700,  paymentMode: "Credit Card", daysBack: 22, type: "BUSINESS" },
    { title: "Netflix",              category: "Subscriptions",  amount: 649,   paymentMode: "Credit Card", daysBack: 10, type: "PERSONAL" },
    { title: "Spotify Premium",      category: "Subscriptions",  amount: 119,   paymentMode: "UPI",         daysBack: 10, type: "PERSONAL" },
    { title: "Gym Membership",       category: "Health",         amount: 2200,  paymentMode: "UPI",         daysBack: 13, type: "PERSONAL" },
    { title: "Doctor Consultation",  category: "Health",         amount: 800,   paymentMode: "Cash",        daysBack: 28, type: "PERSONAL" },
    { title: "Gym Membership",       category: "Health",         amount: 2200,  paymentMode: "UPI",         daysBack: 43, type: "PERSONAL" },
    { title: "Amazon - Monitor",     category: "Shopping",       amount: 18500, paymentMode: "Credit Card", daysBack: 19, type: "BUSINESS", notes: "27in Dell monitor for workspace" },
    { title: "Mechanical Keyboard",  category: "Shopping",       amount: 4200,  paymentMode: "Credit Card", daysBack: 23, type: "BUSINESS" },
    { title: "Office Stationery",    category: "Office",         amount: 650,   paymentMode: "Cash",        daysBack: 24, type: "BUSINESS" },
    { title: "Co-working Space",     category: "Office",         amount: 8000,  paymentMode: "Net Banking", daysBack: 32, type: "BUSINESS", notes: "March membership" },
  ];
  await Expense.insertMany(
    expenseDefs.map((e) => ({
      userId,
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: daysAgo(e.daysBack),
      type: e.type,
      paymentMode: e.paymentMode,
      notes: e.notes ?? "",
    }))
  );
  console.log(`Created ${expenseDefs.length} expenses`);

  // Seed invoices + payments
  const invoiceDefs = [
    {
      client: clients[0], num: "INV-2024-001", issued: 90, due: 60,
      items: [
        { description: "Full-Stack Web App – Phase 1", quantity: 1, unitPrice: 95000, amount: 95000 },
        { description: "UI/UX Design",                quantity: 1, unitPrice: 25000, amount: 25000 },
      ],
      total: 120000, amountPaid: 120000, amountDue: 0, status: "paid",
      payment: { amount: 120000, paidDaysAgo: 58, mode: "Net Banking" },
    },
    {
      client: clients[1], num: "INV-2024-002", issued: 60, due: 30,
      items: [{ description: "Mobile App MVP (React Native)", quantity: 1, unitPrice: 80000, amount: 80000 }],
      total: 80000, amountPaid: 40000, amountDue: 40000, status: "partially_paid",
      payment: { amount: 40000, paidDaysAgo: 25, mode: "UPI" },
    },
    {
      client: clients[2], num: "INV-2024-003", issued: 30, due: 0,
      items: [
        { description: "E-commerce Platform Setup",   quantity: 1, unitPrice: 55000, amount: 55000 },
        { description: "Payment Gateway Integration", quantity: 1, unitPrice: 15000, amount: 15000 },
      ],
      total: 70000, amountPaid: 0, amountDue: 70000, status: "due",
      payment: null,
    },
    {
      client: clients[3], num: "INV-2024-004", issued: 45, due: 15,
      items: [{ description: "Backend API Development – Mar", quantity: 60, unitPrice: 800, amount: 48000 }],
      total: 48000, amountPaid: 0, amountDue: 48000, status: "overdue",
      payment: null,
    },
    {
      client: clients[4], num: "INV-2024-005", issued: 7, due: -23,
      items: [
        { description: "Cloud Infrastructure Setup", quantity: 1, unitPrice: 35000, amount: 35000 },
        { description: "DevOps & CI/CD Pipeline",    quantity: 1, unitPrice: 20000, amount: 20000 },
      ],
      total: 55000, amountPaid: 0, amountDue: 55000, status: "sent",
      payment: null,
    },
    {
      client: clients[5], num: "INV-2024-006", issued: 120, due: 90,
      items: [{ description: "Digital Transformation Consulting", quantity: 10, unitPrice: 5000, amount: 50000 }],
      total: 50000, amountPaid: 50000, amountDue: 0, status: "paid",
      payment: { amount: 50000, paidDaysAgo: 88, mode: "Net Banking" },
    },
    {
      client: clients[0], num: "INV-2024-007", issued: 15, due: -15,
      items: [
        { description: "Full-Stack App – Phase 2",  quantity: 1, unitPrice: 70000, amount: 70000 },
        { description: "Performance Optimisation",  quantity: 1, unitPrice: 10000, amount: 10000 },
      ],
      total: 80000, amountPaid: 30000, amountDue: 50000, status: "partially_paid",
      payment: { amount: 30000, paidDaysAgo: 10, mode: "UPI" },
    },
  ];

  let pmtCount = 0;
  for (const inv of invoiceDefs) {
    const doc = await db.collection("invoices").insertOne({
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (inv.payment) {
      await db.collection("paymentsettlements").insertOne({
        userId,
        invoiceId: doc.insertedId,
        amount: inv.payment.amount,
        paymentDate: daysAgo(inv.payment.paidDaysAgo),
        paymentMode: inv.payment.mode,
        transactionId: `TXN${Date.now().toString(36).toUpperCase()}`,
        payerName: inv.client.name,
        payerEmail: inv.client.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      pmtCount++;
    }
  }
  console.log(`Created ${invoiceDefs.length} invoices and ${pmtCount} payments`);

  const totalRevenue = invoiceDefs.reduce((s, i) => s + i.amountPaid, 0);
  const totalOutstanding = invoiceDefs.reduce((s, i) => s + i.amountDue, 0);
  console.log("\n─────────────────────────────────────────");
  console.log("✅ Seeding complete for freelancer@gmail.com");
  console.log(`   Revenue collected : INR ${totalRevenue.toLocaleString("en-IN")}`);
  console.log(`   Outstanding       : INR ${totalOutstanding.toLocaleString("en-IN")}`);
  console.log("─────────────────────────────────────────");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});
