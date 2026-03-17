/**
 * session-memory.ts
 * ─────────────────
 * CRUD helpers for chat session memory backed by MongoDB ChatSession model.
 * Redis-free: uses MongoDB with a 30-min TTL index for automatic cleanup.
 */

import { v4 as uuid } from "uuid";
import mongoose from "mongoose";
import ChatSession, { IChatMessage } from "@/app/api/_lib/models/ChatSession";

type UserIdInput = mongoose.Types.ObjectId | string;

function toObjectId(id: UserIdInput): mongoose.Types.ObjectId {
  return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
}

const MAX_HISTORY = 10; // keep last 10 messages (5 turns)

// ──────────────────────────────────────────────────────────────────────────────

/** Retrieve the last N messages for a session. Creates session if missing. */
export async function getSessionHistory(
  sessionId: string,
  userId: UserIdInput
): Promise<IChatMessage[]> {
  const session = await ChatSession.findOne({ sessionId, userId: toObjectId(userId) }).lean();
  if (!session) return [];
  return session.messages.slice(-MAX_HISTORY) as IChatMessage[];
}

/** Append a user message and assistant reply; trim to MAX_HISTORY. */
export async function appendMessages(
  sessionId: string,
  userId: UserIdInput,
  userMessage: string,
  assistantReply: string
): Promise<void> {
  const oid = toObjectId(userId);
  const now = new Date();
  const newMessages: IChatMessage[] = [
    { role: "user", content: userMessage, timestamp: now },
    { role: "assistant", content: assistantReply, timestamp: now },
  ];

  await ChatSession.findOneAndUpdate(
    { sessionId, userId: oid },
    {
      $push: {
        messages: {
          $each: newMessages,
          $slice: -MAX_HISTORY,
        },
      },
      $setOnInsert: { sessionId, userId: oid },
    },
    { upsert: true, new: true }
  );
}

/** Create a brand-new session ID. */
export function createSessionId(): string {
  return uuid();
}

/** Explicitly delete a session (e.g., user clicked "New chat"). */
export async function deleteSession(
  sessionId: string,
  userId: UserIdInput
): Promise<void> {
  await ChatSession.deleteOne({ sessionId, userId: toObjectId(userId) });
}
