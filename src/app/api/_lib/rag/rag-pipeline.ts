/**
 * rag-pipeline.ts
 * ───────────────
 * Orchestrates the full RAG flow:
 *   Session Retrieval → Query Understanding → Router →
 *   [Structured DB | Vector Docs | General] →
 *   Context Filter → Prompt Build → Groq → Post-Process → Session Update
 */

import mongoose, { Types } from "mongoose";
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
  userId: string;  // string from auth, cast to ObjectId internally
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

  // ── Step 1: Retrieve session history ──────────────────────────────────────
  const history = await getSessionHistory(sessionId, userId);

  // ── Step 2: Query understanding ───────────────────────────────────────────
  const queryIntent = understandQuery(userMessage);
  const { queryType, intent } = queryIntent;

  let dbContext = "No database results.";
  let passages: RetrievedPassage[] = [];

  // ── Step 3: Route to appropriate retrieval path ───────────────────────────
  if (queryType === "structured_db") {
    // Structured MongoDB queries
    const dbResults = await executeStructuredQuery(userId, queryIntent);
    dbContext = serializeDBResults(dbResults);

    // Also do light document retrieval for additional context
    const rawPassages = await retrieveDocuments(userId, userMessage, 2);
    passages = filterPassages(rawPassages);

  } else if (queryType === "document_rag") {
    // Vector/document retrieval only
    const rawPassages = await retrieveDocuments(userId, userMessage, 5);
    passages = filterPassages(rawPassages);

  }
  // For "general_ai" – no retrieval, just LLM with history

  // ── Step 4: Build prompt ──────────────────────────────────────────────────
  const { systemPrompt, userContent } = buildPrompt({
    userQuestion: userMessage,
    dbContext,
    passages,
    history,
  });

  // ── Step 5: Call Groq ─────────────────────────────────────────────────────
  const rawAnswer = await callGroq(systemPrompt, userContent);

  // ── Step 6: Post-process (light cleanup) ──────────────────────────────────
  const answer = rawAnswer
    .replace(/^(AI:|Assistant:|Iteryx AI:)\s*/i, "")
    .trim();

  // ── Step 7: Update session memory ────────────────────────────────────────
  await appendMessages(sessionId, userId, userMessage, answer);

  return { answer, queryType, intent, sessionId };
}
