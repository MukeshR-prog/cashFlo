/**
 * POST /api/chat
 * ──────────────
 * Main chatbot endpoint. Accepts { sessionId?, userMessage } and returns
 * the AI answer along with metadata.
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import { runRAGPipeline } from "@/app/api/_lib/rag/rag-pipeline";
import { createSessionId } from "@/app/api/_lib/rag/session-memory";

export async function POST(req: NextRequest) {
  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    // ── Parse body ────────────────────────────────────────────────────────────
    let body: { sessionId?: string; userMessage?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const userMessage = body.userMessage?.trim();
    if (!userMessage) {
      return NextResponse.json({ error: "userMessage is required" }, { status: 400 });
    }

    const sessionId = body.sessionId ?? createSessionId();

    // ── DB ────────────────────────────────────────────────────────────────────
    await connectDB();

    // ── Run RAG pipeline ──────────────────────────────────────────────────────
    const result = await runRAGPipeline({
      sessionId,
      userMessage,
      userId: auth.userId,
    });

    return NextResponse.json({
      sessionId: result.sessionId,
      answer: result.answer,
      meta: {
        queryType: result.queryType,
        intent: result.intent,
      },
    });
  } catch (error) {
    console.error("[CHAT_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/chat
 * ─────────────────
 * Clears a chat session (user clicked "New chat" or browser closed).
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    await connectDB();

    const { deleteSession } = await import("@/app/api/_lib/rag/session-memory");
    await deleteSession(sessionId, auth.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHAT_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
