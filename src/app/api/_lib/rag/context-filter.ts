/**
 * context-filter.ts
 * ─────────────────
 * Deduplication, trimming, and token-budget enforcement before prompt assembly.
 */

import { RetrievedPassage } from "./vector-retrieval";
import { DBResult } from "./structured-db-query";

const MAX_CONTEXT_CHARS = 6000; // ~1500 tokens at 4 chars/token
const MAX_PASSAGE_CHARS = 800;

// ──────────────────────────────────────────────────────────────────────────────
// Document passage filtering
// ──────────────────────────────────────────────────────────────────────────────

export function filterPassages(passages: RetrievedPassage[]): RetrievedPassage[] {
  const seen = new Set<string>();
  const filtered: RetrievedPassage[] = [];
  let budget = MAX_CONTEXT_CHARS;

  for (const p of passages) {
    // Dedup by first 120 chars
    const key = p.text.slice(0, 120).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const trimmed = p.text.length > MAX_PASSAGE_CHARS
      ? p.text.slice(0, MAX_PASSAGE_CHARS) + "…"
      : p.text;

    if (budget - trimmed.length < 0) break;
    budget -= trimmed.length;

    filtered.push({ ...p, text: trimmed });
  }

  return filtered;
}

// ──────────────────────────────────────────────────────────────────────────────
// Structured DB result serialization
// ──────────────────────────────────────────────────────────────────────────────

export function serializeDBResults(results: DBResult[]): string {
  if (!results.length) return "No database records found.";

  const parts: string[] = [];
  for (const r of results) {
    const json = JSON.stringify(r.data, null, 2);
    parts.push(`### ${r.label}\n${json}`);
  }

  const full = parts.join("\n\n");
  // Trim if over budget
  return full.length > MAX_CONTEXT_CHARS
    ? full.slice(0, MAX_CONTEXT_CHARS) + "\n… (truncated)"
    : full;
}
