/**
 * prompt-builder.ts
 * ─────────────────
 * Constructs the fully structured prompt sent to Groq.
 * Internal context structure is hidden from the user-facing response.
 */

import { IChatMessage } from "@/app/api/_lib/models/ChatSession";
import { RetrievedPassage } from "./vector-retrieval";

const MAX_HISTORY_MESSAGES = 8; // last 8 messages (4 turns)

// ──────────────────────────────────────────────────────────────────────────────

export function buildPrompt(params: {
  userQuestion: string;
  dbContext?: string;
  passages?: RetrievedPassage[];
  history?: IChatMessage[];
}): { systemPrompt: string; userContent: string } {
  const {
    userQuestion,
    dbContext = "",
    passages = [],
    history = [],
  } = params;

  // ────────────────────────────────────────────────────────────────────────────
  // SYSTEM PROMPT
  // Defines assistant behavior and safety rules
  // ────────────────────────────────────────────────────────────────────────────

  const systemPrompt = `
You are Iteryx AI, a friendly financial assistant for freelancers and students using the Iteryx platform.

Your role is to help users understand their finances including:
• invoices
• payments
• expenses
• clients
• income
• cash flow

You answer questions using real account data provided in the prompt.

DATA PRIORITY (highest → lowest):
1. Account data (authoritative)
2. Conversation history
3. Additional context documents
4. General knowledge

Always rely on account data when financial numbers are involved.

STRICT RULES (follow ALL):

1. NEVER mention internal labels such as:
   "Account data"
   "Additional context"
   "Database results"
   "Retrieved documents"

2. NEVER say things like:
   "the database shows"
   "the system retrieved"

3. If financial sections contain zero records, respond naturally.
Example:
"You don't have any unpaid invoices yet."

4. NEVER fabricate financial numbers.
Only use amounts present in the provided data.

5. Currency formatting:
Use the currency shown in the account data.
If currency is not specified, assume ₹ (Indian Rupee).

6. Format numbers clearly:
₹1,50,000
₹50K

7. Keep responses concise and conversational.
Maximum length: 200 words.

8. For lists, use bullet points with emojis.

Example format:
📄 Invoice #INV-001 — ₹25,000 — Overdue

9. Maintain conversation context and refer to earlier messages when relevant.

10. If the user asks a general question unrelated to finances,
answer briefly using general knowledge.
`.trim();

  // ────────────────────────────────────────────────────────────────────────────
  // HISTORY BLOCK
  // ────────────────────────────────────────────────────────────────────────────

  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const historyBlock = recentHistory.length
    ? recentHistory
        .map((m) =>
          `${m.role === "user" ? "User" : "Assistant"} → ${m.content}`
        )
        .join("\n")
    : "";

  // ────────────────────────────────────────────────────────────────────────────
  // VECTOR PASSAGES BLOCK
  // ────────────────────────────────────────────────────────────────────────────

  const passagesBlock =
    passages.length > 0
      ? passages
          .map((p) => {
            const title = p.title ? `${p.title}: ` : "";
            return `${title}${p.text}`;
          })
          .join("\n\n")
      : "";

  // ────────────────────────────────────────────────────────────────────────────
  // ACCOUNT DATA BLOCK
  // ────────────────────────────────────────────────────────────────────────────

  const accountDataBlock = dbContext
    ? dbContext
    : "This user's account currently has no financial records.";

  // ────────────────────────────────────────────────────────────────────────────
  // FINAL USER CONTENT
  // (This is the context sent alongside the question)
  // ────────────────────────────────────────────────────────────────────────────

  const userContent = [
    historyBlock ? `Conversation history:\n${historyBlock}` : "",
    `Account records:\n${accountDataBlock}`,
    passagesBlock ? `Helpful reference information:\n${passagesBlock}` : "",
    `User question:\n${userQuestion}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { systemPrompt, userContent };
}