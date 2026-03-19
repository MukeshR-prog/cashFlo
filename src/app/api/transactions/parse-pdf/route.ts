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
 * Extract all text from a PDF buffer using pdfjs-dist directly.
 * Works page-by-page to maximise text extraction.
 */
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // pdfjs-dist legacy build works in Node.js without a DOM
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");

  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const strings = content.items.map((item: any) => item.str || "");
    pages.push(strings.join(" "));
  }

  return pages.join("\n");
}

/**
 * Parses plain text extracted from a bank statement PDF.
 * Supports common Indian bank statement formats (SBI, HDFC, ICICI, Axis, Kotak).
 */
function parseTransactions(text: string): ParsedTransaction[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const transactions: ParsedTransaction[] = [];

  const dateRe =
    /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{4}-\d{2}-\d{2})/i;

  const amountRe = /([\d,]+\.?\d*)/g;

  for (const line of lines) {
    const dateMatch = line.match(dateRe);
    if (!dateMatch) continue;

    const dateStr = dateMatch[1];
    const rest = line.slice(dateStr.length).trim();

    const amounts: number[] = [];
    let m;
    while ((m = amountRe.exec(rest)) !== null) {
      const val = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(val) && val > 0) amounts.push(val);
    }
    amountRe.lastIndex = 0;

    if (amounts.length === 0) continue;

    const balance = amounts.length >= 2 ? amounts[amounts.length - 1] : null;
    const transactionAmount = amounts.length >= 2 ? amounts[amounts.length - 2] : amounts[0];

    const lowerRest = rest.toLowerCase();
    const isDebit = /\bdr\b|debit|withdrawal|withdraw/.test(lowerRest);
    const isCredit = /\bcr\b|credit|deposit/.test(lowerRest);

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

    // ── Extract text using pdfjs-dist directly ───────────────────
    let text = "";
    try {
      text = await extractTextFromPdf(buffer);
    } catch (parseError) {
      console.error("[PARSE_PDF] pdfjs-dist extraction failed:", parseError);
      return NextResponse.json(
        { error: "PDF parsing failed. The file may be corrupted or password-protected. Try uploading a CSV instead." },
        { status: 422 }
      );
    }

    console.log("[PARSE_PDF] Extracted text length:", text.trim().length, "| First 300 chars:", text.trim().slice(0, 300));

    if (!text || text.trim().length < 5) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. The file might be scanned or image-based. Try a CSV export instead.", extractedLength: text?.trim().length ?? 0 },
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
      rawText: text.slice(0, 2000),
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
