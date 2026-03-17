/**
 * rag-pipeline.ts
 * ───────────────
 * Orchestrates the full RAG flow following the spec order:
 *   1. Session Memory Retrieval (conversation history)
 *   2. Query Understanding (intent + entity extraction, no LLM cost)
 *   3. Primary: Structured MongoDB query (financial data)
 *   4. Secondary: Vector/document retrieval (help content, light context)
 *   5. Context Filtering
 *   6. Prompt Building (DB results + docs + history → Groq)
 *   7. Groq LLM Call
 *   8. Session Memory Update
 */

import mongoose, { Types } from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import { understandQuery } from "./query-understanding";
import { executeStructuredQuery } from "./structured-db-query";
import { retrieveDocuments, RetrievedPassage } from "./vector-retrieval";
import { filterPassages, serializeDBResults } from "./context-filter";
import { buildPrompt } from "./prompt-builder";
import { callGroq } from "./groq-llm";
import { getSessionHistory, appendMessages } from "./session-memory";

// ──────────────────────────────────────────────────────────────────────────────

export interface RAGInput {
  sessionId: string;
  userMessage: string;
  userId: string;
}

export interface RAGOutput {
  answer: string;
  queryType: string;
  intent: string;
  sessionId: string;
}

// ──────────────────────────────────────────────────────────────────────────────

export async function runRAGPipeline(input: RAGInput): Promise<RAGOutput> {
  const { sessionId, userMessage } = input;
  const userId = new Types.ObjectId(input.userId);

  // Ensure DB connection before any queries
  await connectDB();

  // ── Step 1: Retrieve short-term conversation history ──────────────────────
  const history = await getSessionHistory(sessionId, userId);

  // ── Step 2: Intent detection + entity extraction (zero LLM cost) ──────────
  const queryIntent = understandQuery(userMessage);
  const { queryType, intent } = queryIntent;

  let dbContext = "No database results.";
  let passages: RetrievedPassage[] = [];

  // ── Step 3 (PRIMARY): Structured MongoDB query ────────────────────────────
  //    Always attempt DB lookup for structured_db and as default fallback.
  //    MongoDB is the authoritative source for all financial data.
  if (queryType === "structured_db") {
    const dbResults = await executeStructuredQuery(userId, queryIntent);
    dbContext = serializeDBResults(dbResults);

    // ── Step 4 (SECONDARY): Lightweight vector retrieval for help context ──
    //    At most 2 passages to augment DB results with documentation/help text.
    const rawPassages = await retrieveDocuments(userId, userMessage, 2);
    passages = filterPassages(rawPassages);

  } else if (queryType === "document_rag") {
    // Documentation/report questions: vector retrieval is primary
    const rawPassages = await retrieveDocuments(userId, userMessage, 5);
    passages = filterPassages(rawPassages);

    // Also pull a broad DB summary so the LLM has real numbers
    const dbResults = await executeStructuredQuery(userId, queryIntent);
    dbContext = serializeDBResults(dbResults);

  } else {
    // general_ai: no structured retrieval, no vector — LLM uses history only
    dbContext = "No database query needed for this question.";
  }

  // ── Step 5: Build structured prompt (DB + docs + conversation history) ────
  const { systemPrompt, userContent } = buildPrompt({
    userQuestion: userMessage,
    dbContext,
    passages,
    history,
  });

  // ── Step 6: Call Groq LLM ─────────────────────────────────────────────────
  const rawAnswer = await callGroq(systemPrompt, userContent);

  // ── Step 7: Light cleanup ─────────────────────────────────────────────────
  const answer = rawAnswer
    .replace(/^(AI:|Assistant:|Iteryx AI:)\s*/i, "")
    .trim();

  // ── Step 8: Persist to session memory (MongoDB ChatSession) ──────────────
  await appendMessages(sessionId, userId, userMessage, answer);

  return { answer, queryType, intent, sessionId };
}
