/**
 * prompt-builder.ts
 * ─────────────────
 * Constructs the fully structured prompt sent to Groq.
 */

import { IChatMessage } from "@/app/api/_lib/models/ChatSession";
import { RetrievedPassage } from "./vector-retrieval";

const MAX_HISTORY_MESSAGES = 8; // keep last 8 (4 turns)

// ──────────────────────────────────────────────────────────────────────────────

export function buildPrompt(params: {
  userQuestion: string;
  dbContext: string;
  passages: RetrievedPassage[];
  history: IChatMessage[];
}): { systemPrompt: string; userContent: string } {
  const { userQuestion, dbContext, passages, history } = params;

  const systemPrompt = `You are Iteryx AI, a smart financial assistant for freelancers and startups.
You help users understand their expenses, invoices, payments, clients, and cashflow.

Guidelines:
- Be concise, friendly, and professional.
- Always base your answers on the provided DATABASE RESULTS and RETRIEVED DOCUMENTS.
- Do NOT fabricate numbers or make up data not present in the context.
- When presenting financial figures, format them clearly (e.g., ₹10,000 or $500).
- If the context does not contain enough information, say so honestly.
- For list-type answers, use numbered or bullet-point formatting.
- Keep responses under 300 words unless explicitly asked for more detail.`;

  // Build conversation history block
  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);
  const historyBlock = recentHistory.length
    ? recentHistory.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")
    : "No prior conversation.";

  // Build passages block
  const passagesBlock = passages.length
    ? passages.map((p, i) => `[${i + 1}] ${p.title}\n${p.text}`).join("\n\n")
    : "No additional documents retrieved.";

  const userContent = `## DATABASE RESULTS
${dbContext}

## RETRIEVED DOCUMENTS
${passagesBlock}

## CONVERSATION HISTORY
${historyBlock}

## USER QUESTION
${userQuestion}`;

  return { systemPrompt, userContent };
}
