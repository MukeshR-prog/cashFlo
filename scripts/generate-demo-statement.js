// Script to generate a demo bank statement PDF for testing
// Uses pdfkit to create a text-based PDF that pdf parsers can extract

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const doc = new PDFDocument({ margin: 50, size: "A4" });
const outPath = path.join(__dirname, "public", "demo-bank-statement.pdf");

// Ensure public dir exists
if (!fs.existsSync(path.join(__dirname, "public"))) {
  fs.mkdirSync(path.join(__dirname, "public"), { recursive: true });
}

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

// ── Header ──────────────────────────────────────────
doc.fontSize(18).font("Helvetica-Bold").text("STATE BANK OF INDIA", { align: "center" });
doc.fontSize(10).font("Helvetica").text("Anna Nagar Branch, Chennai - 600040", { align: "center" });
doc.moveDown(0.5);
doc.fontSize(14).font("Helvetica-Bold").text("ACCOUNT STATEMENT", { align: "center" });
doc.moveDown(0.5);

// ── Account Info ────────────────────────────────────
doc.fontSize(9).font("Helvetica");
doc.text("Account Holder: Moulee Krishnan");
doc.text("Account No: XXXX XXXX 4521");
doc.text("IFSC: SBIN0001234");
doc.text("Statement Period: 01/02/2026 - 28/02/2026");
doc.text("Currency: INR");
doc.moveDown(1);

// ── Table Header ────────────────────────────────────
const colX = [50, 120, 280, 370, 440, 510];
const colW = [70, 160, 90, 70, 70, 80];
const headers = ["Date", "Description", "Ref No", "Debit", "Credit", "Balance"];

doc.font("Helvetica-Bold").fontSize(8);
doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
const headerY = doc.y + 4;
headers.forEach((h, i) => {
  doc.text(h, colX[i], headerY, { width: colW[i], align: i >= 3 ? "right" : "left" });
});
doc.y = headerY + 14;
doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
doc.moveDown(0.3);

// ── Transactions ────────────────────────────────────
const transactions = [
  { date: "01/02/2026", desc: "Opening Balance", ref: "", debit: "", credit: "", balance: "1,25,340.00" },
  { date: "02/02/2026", desc: "UPI/CR/402918231/Kovai Tech Labs/Payment", ref: "TXN20260202001", debit: "", credit: "40,000.00", balance: "1,65,340.00" },
  { date: "03/02/2026", desc: "NEFT/CR/SBIN226034/Marina Retail Pvt Ltd", ref: "TXN20260203001", debit: "", credit: "1,20,000.00", balance: "2,85,340.00" },
  { date: "05/02/2026", desc: "UPI/DR/Google One Subscription", ref: "TXN20260205001", debit: "179.00", credit: "", balance: "2,85,161.00" },
  { date: "06/02/2026", desc: "UPI/DR/Swiggy Order #SW28391", ref: "TXN20260206001", debit: "620.00", credit: "", balance: "2,84,541.00" },
  { date: "07/02/2026", desc: "NEFT/DR/AWS Cloud Services Feb", ref: "TXN20260207001", debit: "8,450.00", credit: "", balance: "2,76,091.00" },
  { date: "08/02/2026", desc: "UPI/DR/Chennai Metro Card Recharge", ref: "TXN20260208001", debit: "500.00", credit: "", balance: "2,75,591.00" },
  { date: "10/02/2026", desc: "UPI/CR/Thanjai Consulting/Invoice Pay", ref: "TXN20260210001", debit: "", credit: "50,000.00", balance: "3,25,591.00" },
  { date: "12/02/2026", desc: "UPI/DR/TNEB Electricity Bill Feb", ref: "TXN20260212001", debit: "2,300.00", credit: "", balance: "3,23,291.00" },
  { date: "14/02/2026", desc: "UPI/DR/Airtel Postpaid Bill", ref: "TXN20260214001", debit: "699.00", credit: "", balance: "3,22,592.00" },
  { date: "15/02/2026", desc: "UPI/CR/Madhumithra/Project Milestone 2", ref: "TXN20260215001", debit: "", credit: "20,000.00", balance: "3,42,592.00" },
  { date: "16/02/2026", desc: "UPI/DR/Zomato Order #ZMT99281", ref: "TXN20260216001", debit: "450.00", credit: "", balance: "3,42,142.00" },
  { date: "18/02/2026", desc: "NEFT/DR/Rent Transfer Feb 2026", ref: "TXN20260218001", debit: "15,000.00", credit: "", balance: "3,27,142.00" },
  { date: "19/02/2026", desc: "UPI/DR/Decathlon Sports Purchase", ref: "TXN20260219001", debit: "3,200.00", credit: "", balance: "3,23,942.00" },
  { date: "20/02/2026", desc: "UPI/CR/Madurai Foods Co/Feb Invoice", ref: "TXN20260220001", debit: "", credit: "1,55,000.00", balance: "4,78,942.00" },
  { date: "22/02/2026", desc: "UPI/DR/GitHub Pro Annual", ref: "TXN20260222001", debit: "820.00", credit: "", balance: "4,78,122.00" },
  { date: "24/02/2026", desc: "UPI/DR/Flipkart Order #FK38291", ref: "TXN20260224001", debit: "2,499.00", credit: "", balance: "4,75,623.00" },
  { date: "25/02/2026", desc: "NEFT/CR/Kovai Tech Labs/Retainer Feb", ref: "TXN20260225001", debit: "", credit: "35,000.00", balance: "5,10,623.00" },
  { date: "26/02/2026", desc: "UPI/DR/Netflix Subscription", ref: "TXN20260226001", debit: "649.00", credit: "", balance: "5,09,974.00" },
  { date: "28/02/2026", desc: "Closing Balance", ref: "", debit: "", credit: "", balance: "5,09,974.00" },
];

doc.font("Helvetica").fontSize(7.5);
transactions.forEach((t) => {
  const rowY = doc.y;
  doc.text(t.date, colX[0], rowY, { width: colW[0] });
  doc.text(t.desc, colX[1], rowY, { width: colW[1] });
  doc.text(t.ref, colX[2], rowY, { width: colW[2] });
  doc.text(t.debit, colX[3], rowY, { width: colW[3], align: "right" });
  doc.text(t.credit, colX[4], rowY, { width: colW[4], align: "right" });
  doc.text(t.balance, colX[5], rowY, { width: colW[5], align: "right" });
  doc.y = rowY + 16;
});

// ── Footer ──────────────────────────────────────────
doc.moveDown(1);
doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke();
doc.moveDown(0.5);
doc.fontSize(7).text("This is a computer-generated statement and does not require a signature.", { align: "center" });
doc.text("For any queries, please contact your branch or call 1800-425-3800.", { align: "center" });

doc.end();

stream.on("finish", () => {
  console.log(`\n✅ Demo bank statement PDF created at:\n   ${outPath}\n`);
  console.log("You can upload this at: /freelancer/payments/upload\n");
});
