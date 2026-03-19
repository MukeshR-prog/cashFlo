import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import mongoose from "mongoose";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import connectDB from "@/app/api/_lib/db/mongodb";
import BankTransaction from "@/app/api/_lib/models/BankTransaction";

export const dynamic = "force-dynamic";

interface ParsedTransaction {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
}

function normalizeDate(value: string): Date {
  const now = new Date();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? now : parsed;
  }

  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(value)) {
    const [d, m, y] = value.split(/[\/\-]/).map((p) => Number(p));
    const year = y < 100 ? 2000 + y : y;
    const parsed = new Date(Date.UTC(year, (m || 1) - 1, d || 1));
    return Number.isNaN(parsed.getTime()) ? now : parsed;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? now : parsed;
}

/**
 * Parses plain text extracted from a bank statement PDF.
 * Supports common Indian bank statement formats (SBI, HDFC, ICICI, Axis, Kotak).
 *
 * Strategy: look for lines that start with a date-like pattern and contain numbers.
 */
function parseTransactions(text: string): ParsedTransaction[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const transactions: ParsedTransaction[] = [];

  // Common date patterns: DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY, YYYY-MM-DD
  const dateRe =
    /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4}-\d{2}-\d{2})/i;

  // Number pattern for amounts: 1,234.56 or 1234.56
  const amountRe = /([\d,]+\.?\d*)/g;

  for (const line of lines) {
    const dateMatch = line.match(dateRe);
    if (!dateMatch) continue;

    const dateStr = dateMatch[1];
    const rest = line.slice(dateStr.length).trim();

    // Extract all numbers from the rest of the line
    const amounts: number[] = [];
    let m;
    while ((m = amountRe.exec(rest)) !== null) {
      const val = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(val) && val > 0) amounts.push(val);
    }
    amountRe.lastIndex = 0;

    if (amounts.length === 0) continue;

    // Heuristic: last amount is balance, second-to-last is debit or credit
    const balance = amounts.length >= 2 ? amounts[amounts.length - 1] : null;
    const transactionAmount = amounts.length >= 2 ? amounts[amounts.length - 2] : amounts[0];

    // Try to detect debit (Dr) or credit (Cr) indicator
    const lowerRest = rest.toLowerCase();
    const isDebit = /\bdr\b|debit|withdrawal|withdraw/.test(lowerRest);
    const isCredit = /\bcr\b|credit|deposit/.test(lowerRest);

    // Description = everything before the first number in rest
    const firstNumIdx = rest.search(/[\d,]/);
    const description = firstNumIdx > 0 ? rest.slice(0, firstNumIdx).trim() : rest.trim();

    transactions.push({
      date: dateStr,
      description: description || "Transaction",
      debit: isDebit || (!isCredit && amounts.length >= 3) ? transactionAmount : null,
      credit: isCredit || (!isDebit && amounts.length < 3) ? transactionAmount : null,
      balance,
    });
  }

  return transactions;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const formData = await req.formData();
    const file = formData.get("file");
    const persist = String(formData.get("persist") ?? "false").toLowerCase() === "true";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── pdf-parse import ──────────────────────────────────────────
    // IMPORTANT: We import from 'pdf-parse/lib/pdf-parse.js' directly
    // because the main index.js has a bug: it checks `!module.parent` and
    // tries to readFileSync a test PDF that doesn't exist in node_modules.
    // Importing the inner module skips that code entirely.
    let text = "";
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      const result = await pdfParse(buffer);
      text = result?.text ?? "";
    } catch (parseError) {
      console.error("[PARSE_PDF] pdf-parse failed:", parseError);
      return NextResponse.json(
        { error: "PDF parsing failed. Make sure the file is a text-based PDF (not scanned/image). Try uploading a CSV instead." },
        { status: 422 }
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. The file might be scanned or image-based. Try a CSV export instead." },
        { status: 422 }
      );
    }

    const transactions = parseTransactions(text);

    let imported = 0;
    let skipped = 0;
    if (persist && transactions.length > 0) {
      await connectDB();

      const userId = new mongoose.Types.ObjectId(auth.userId);
      const fileName = typeof file.name === "string" ? file.name : "statement.pdf";

      const rows = transactions
        .filter((t) => (t.credit ?? 0) > 0 || (t.debit ?? 0) > 0)
        .map((t) => {
          const direction: "credit" | "debit" = (t.credit ?? 0) > 0 ? "credit" : "debit";
          const amount = direction === "credit" ? (t.credit as number) : (t.debit as number);
          const transactionDate = normalizeDate(t.date);
          const base = `${auth.userId}|${transactionDate.toISOString()}|${direction}|${amount}|${t.description}`;
          const fingerprint = createHash("sha256").update(base).digest("hex");

          return {
            filter: { userId, fingerprint },
            update: {
              $setOnInsert: {
                userId,
                source: "bank_statement_pdf" as const,
                direction,
                amount,
                currency: "INR",
                transactionDate,
                description: t.description,
                reference: fileName,
                fingerprint,
                raw: `${t.date} | ${t.description} | debit=${t.debit ?? ""} | credit=${t.credit ?? ""} | balance=${t.balance ?? ""}`,
              },
            },
          };
        });

      if (rows.length > 0) {
        for (const row of rows) {
          const result = await BankTransaction.updateOne(row.filter, row.update, { upsert: true });
          if ((result as { upsertedCount?: number }).upsertedCount && (result as { upsertedCount?: number }).upsertedCount! > 0) {
            imported += 1;
          } else {
            skipped += 1;
          }
        }
      }
    }

    return NextResponse.json({
      rawText: text.slice(0, 2000), // First 2000 chars for debugging
      transactions,
      total: transactions.length,
      persisted: persist,
      imported,
      skipped,
    });
  } catch (error) {
    console.error("[PARSE_PDF]", error);
    return NextResponse.json({ error: "Failed to parse PDF. Try uploading a CSV bank statement instead." }, { status: 500 });
  }
}
