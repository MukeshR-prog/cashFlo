/**
 * query-understanding.ts
 * ──────────────────────
 * Lightweight intent detection + entity extraction + query-type classification.
 * Does NOT call the LLM – keeps latency low and token cost zero for routing.
 */

export type QueryType = "structured_db" | "document_rag" | "general_ai";

export interface QueryIntent {
  intent: string;
  entities: Record<string, string | number | null>;
  queryType: QueryType;
}

// ──────────────────────────────────────────────────────────────────────────────
// Keyword dictionaries
// ──────────────────────────────────────────────────────────────────────────────

const STRUCTURED_KEYWORDS = [
  "expense", "expenses", "spent", "spending",
  "invoice", "invoices", "bill", "bills",
  "payment", "payments", "paid", "unpaid",
  "client", "clients", "customer", "customers",
  "income", "revenue", "balance", "cashflow", "cash flow",
  "overdue", "outstanding", "due",
  "total", "sum", "count", "how many", "how much",
  "category", "categories",
  "month", "year", "week", "last month", "this month",
];

const MONTHS: Record<string, number> = {
  january: 1,  february: 2, march: 3,    april: 4,
  may: 5,       june: 6,     july: 7,     august: 8,
  september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7,
  aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const CATEGORIES = [
  "food", "transport", "travel", "utilities", "rent", "office",
  "software", "subscriptions", "marketing", "salary", "salaries",
  "freelance", "consulting", "equipment", "health", "entertainment",
  "miscellaneous", "other",
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function extractYear(text: string): number | null {
  const match = text.match(/\b(20\d{2})\b/);
  return match ? parseInt(match[1], 10) : null;
}

function extractMonth(text: string): number | null {
  const lower = text.toLowerCase();
  for (const [name, num] of Object.entries(MONTHS)) {
    if (lower.includes(name)) return num;
  }
  if (/this month/i.test(lower)) return new Date().getMonth() + 1;
  if (/last month/i.test(lower)) {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.getMonth() + 1;
  }
  return null;
}

function extractCategory(text: string): string | null {
  const lower = text.toLowerCase();
  return CATEGORIES.find((c) => lower.includes(c)) ?? null;
}

function extractStatus(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\boverdue\b/.test(lower)) return "overdue";
  if (/\bunpaid\b/.test(lower)) return "due";
  if (/\bpaid\b/.test(lower)) return "paid";
  if (/\bsent\b/.test(lower)) return "sent";
  if (/\bdraft\b/.test(lower)) return "draft";
  return null;
}

function extractIntent(text: string): string {
  const lower = text.toLowerCase();
  if (/expense|spent|spending/.test(lower)) return "expense_query";
  if (/invoice|bill/.test(lower)) return "invoice_query";
  if (/payment|paid|collect/.test(lower)) return "payment_query";
  if (/client|customer/.test(lower)) return "client_query";
  if (/cashflow|cash flow|balance|revenue|income/.test(lower)) return "cashflow_query";
  if (/insight|trend|pattern|analysis|analytic/.test(lower)) return "analytics_query";
  return "general_query";
}

// ──────────────────────────────────────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────────────────────────────────────

export function understandQuery(userMessage: string): QueryIntent {
  const lower = userMessage.toLowerCase();

  const hasStructuredKeyword = STRUCTURED_KEYWORDS.some((kw) => lower.includes(kw));

  let queryType: QueryType;
  if (hasStructuredKeyword) {
    queryType = "structured_db";
  } else if (/report|summary|detail|explain|what is|how does|why/.test(lower)) {
    queryType = "document_rag";
  } else {
    queryType = "general_ai";
  }

  const entities: Record<string, string | number | null> = {
    year: extractYear(userMessage),
    month: extractMonth(userMessage),
    category: extractCategory(userMessage),
    status: extractStatus(userMessage),
  };

  return {
    intent: extractIntent(userMessage),
    entities,
    queryType,
  };
}
