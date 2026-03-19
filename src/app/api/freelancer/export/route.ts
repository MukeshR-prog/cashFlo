import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Invoice from "@/app/api/_lib/models/Invoice";
import PaymentSettlement from "@/app/api/_lib/models/PaymentSettlement";
import Expense from "@/app/api/_lib/models/Expense";
import BankTransaction from "@/app/api/_lib/models/BankTransaction";
import mongoose from "mongoose";

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerLine = headers.join(",");
  const lines = rows.map((row) =>
    headers
      .map((h) => {
        const v = row[h];
        const text = v == null ? "" : String(v).replace(/"/g, '""');
        return `"${text}"`;
      })
      .join(",")
  );
  return [headerLine, ...lines].join("\n");
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const searchParams = req.nextUrl.searchParams;
    const type   = searchParams.get("type") ?? "invoices";  // invoices | payments | expenses | transactions | full
    const format = searchParams.get("format") ?? "csv";

    if (format !== "csv") {
      return NextResponse.json({ error: "Only csv is supported" }, { status: 400 });
    }

    await connectDB();
    const userId = new mongoose.Types.ObjectId(auth.userId);

    let csv = "";
    let filename = "export.csv";

    if (type === "invoices" || type === "full") {
      const invoices = await Invoice.find({ userId })
        .populate("clientId", "name email")
        .sort({ issueDate: -1 })
        .lean();

      const rows = invoices.map((inv) => ({
        "Invoice #":   inv.invoiceNumber,
        Client:        (inv.clientId as any)?.name ?? "",
        "Issue Date":  inv.issueDate.toISOString().split("T")[0],
        "Due Date":    inv.dueDate.toISOString().split("T")[0],
        Status:        inv.status,
        "Total (₹)":  inv.totalAmount,
        "Paid (₹)":   inv.amountPaid,
        "Due (₹)":    inv.amountDue,
        Notes:         inv.notes ?? "",
      }));

      if (type === "invoices") {
        csv = toCsv(rows);
        filename = "invoices.csv";
      } else {
        csv += "=== INVOICES ===\n" + toCsv(rows) + "\n\n";
      }
    }

    if (type === "payments" || type === "full") {
      const payments = await PaymentSettlement.find({ userId })
        .populate("invoiceId", "invoiceNumber")
        .sort({ paymentDate: -1 })
        .lean();

      const rows = payments.map((p) => ({
        "Invoice #":   (p.invoiceId as any)?.invoiceNumber ?? "",
        "Payment Date": p.paymentDate.toISOString().split("T")[0],
        "Amount (₹)":  p.amount,
        Mode:          p.paymentMode ?? "",
        Payer:          p.payerName ?? "",
        Transaction:   p.transactionId ?? "",
      }));

      if (type === "payments") {
        csv = toCsv(rows);
        filename = "payments.csv";
      } else {
        csv += "=== PAYMENTS ===\n" + toCsv(rows) + "\n\n";
      }
    }

    if (type === "expenses" || type === "full") {
      const expenses = await Expense.find({ userId }).sort({ date: -1 }).lean();
      const rows = expenses.map((e) => ({
        Date:         e.date.toISOString().split("T")[0],
        Title:        e.title,
        Category:     e.category,
        "Amount (₹)": e.amount,
        Type:         e.type,
        Mode:         e.paymentMode ?? "",
        Notes:        e.notes ?? "",
      }));

      if (type === "expenses") {
        csv = toCsv(rows);
        filename = "expenses.csv";
      } else {
        csv += "=== EXPENSES ===\n" + toCsv(rows);
      }
    }

    if (type === "transactions" || type === "full") {
      const transactions = await BankTransaction.find({ userId }).sort({ transactionDate: -1 }).lean();
      const rows = transactions.map((t) => ({
        Date: t.transactionDate.toISOString().split("T")[0],
        Source: t.source,
        Direction: t.direction,
        "Amount (INR)": t.amount,
        Description: t.description,
        Reference: t.reference ?? "",
      }));

      if (type === "transactions") {
        csv = toCsv(rows);
        filename = "transactions.csv";
      } else {
        csv += "\n\n=== TRANSACTIONS ===\n" + toCsv(rows);
      }
    }

    if (type === "full") filename = "cashflo-full-export.csv";

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[FREELANCER_EXPORT_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
