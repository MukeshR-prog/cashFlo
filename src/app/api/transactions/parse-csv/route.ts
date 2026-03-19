import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import BankTransaction from "@/app/api/_lib/models/BankTransaction";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

interface ParsedRow {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  // Detect header
  const headerLine = lines[0].toLowerCase();
  const sep = headerLine.includes("\t") ? "\t" : ",";
  const headers = lines[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

  // Map column indices
  const dateIdx = headers.findIndex((h) => /date/i.test(h));
  const descIdx = headers.findIndex((h) => /desc|narr|particular|remark/i.test(h));
  const debitIdx = headers.findIndex((h) => /debit|withdrawal|dr/i.test(h));
  const creditIdx = headers.findIndex((h) => /credit|deposit|cr/i.test(h));
  const balanceIdx = headers.findIndex((h) => /balance|bal/i.test(h));

  if (dateIdx === -1) return [];

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    const dateStr = cols[dateIdx] ?? "";
    if (!dateStr) continue;

    const parseAmount = (idx: number): number | null => {
      if (idx === -1 || !cols[idx]) return null;
      const val = parseFloat(cols[idx].replace(/[,₹\s]/g, ""));
      return isNaN(val) || val === 0 ? null : val;
    };

    rows.push({
      date: dateStr,
      description: descIdx !== -1 ? (cols[descIdx] ?? "Transaction") : "Transaction",
      debit: parseAmount(debitIdx),
      credit: parseAmount(creditIdx),
      balance: parseAmount(balanceIdx),
    });
  }

  return rows;
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

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const formData = await req.formData();
    const file = formData.get("file");
    const persist = String(formData.get("persist") ?? "false").toLowerCase() === "true";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No CSV file uploaded" }, { status: 400 });
    }

    const text = await file.text();

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: "CSV file appears to be empty or too short." },
        { status: 422 }
      );
    }

    const transactions = parseCSV(text);

    let imported = 0;
    let skipped = 0;

    if (persist && transactions.length > 0) {
      await connectDB();
      const userId = new mongoose.Types.ObjectId(auth.userId);
      const fileName = typeof file.name === "string" ? file.name : "statement.csv";

      for (const t of transactions) {
        if ((t.credit ?? 0) <= 0 && (t.debit ?? 0) <= 0) continue;

        const direction: "credit" | "debit" = (t.credit ?? 0) > 0 ? "credit" : "debit";
        const amount = direction === "credit" ? (t.credit as number) : (t.debit as number);
        const transactionDate = normalizeDate(t.date);
        const base = `${auth.userId}|${transactionDate.toISOString()}|${direction}|${amount}|${t.description}`;
        const fingerprint = createHash("sha256").update(base).digest("hex");

        const result = await BankTransaction.updateOne(
          { userId, fingerprint },
          {
            $setOnInsert: {
              userId,
              source: "bank_statement_pdf" as const, // reuse source type for CSV too
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
          { upsert: true }
        );

        if ((result as { upsertedCount?: number }).upsertedCount && (result as { upsertedCount?: number }).upsertedCount! > 0) {
          imported += 1;
        } else {
          skipped += 1;
        }
      }
    }

    return NextResponse.json({
      transactions,
      total: transactions.length,
      persisted: persist,
      imported,
      skipped,
    });
  } catch (error) {
    console.error("[PARSE_CSV]", error);
    return NextResponse.json({ error: "Failed to parse CSV" }, { status: 500 });
  }
}
