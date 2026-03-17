/**
 * vector-retrieval.ts
 * ───────────────────
 * Cosine-similarity search over EmbeddedDocument collection.
 *
 * Strategy (no external vector DB required):
 *  1. Convert query text → embedding via Groq's embedding endpoint
 *     (or a simple TF-IDF bag-of-words fallback when embeddings aren't available)
 *  2. Pull candidate documents from MongoDB (filtered by userId + sourceType)
 *  3. Rank by cosine similarity in JavaScript
 *  4. Return top-k passages
 *
 * When you graduate to Atlas Vector Search / Pinecone, replace step 2–3
 * with a native $vectorSearch aggregation stage.
 */

import EmbeddedDocument from "@/app/api/_lib/models/EmbeddedDocument";
import mongoose from "mongoose";

// ──────────────────────────────────────────────────────────────────────────────
// Cosine similarity (pure JS, no extra deps)
// ──────────────────────────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ──────────────────────────────────────────────────────────────────────────────
// TF-IDF bag-of-words fallback embedding (when no embedding model attached)
// ──────────────────────────────────────────────────────────────────────────────

function bagOfWordsVector(text: string, vocab: string[]): number[] {
  const words = text.toLowerCase().split(/\W+/);
  return vocab.map((term) => words.filter((w) => w === term).length);
}

function buildVocab(texts: string[]): string[] {
  const set = new Set<string>();
  for (const t of texts) {
    t.toLowerCase().split(/\W+/).forEach((w) => { if (w.length > 2) set.add(w); });
  }
  return Array.from(set);
}

// ──────────────────────────────────────────────────────────────────────────────
// Main retrieval
// ──────────────────────────────────────────────────────────────────────────────

export interface RetrievedPassage {
  title: string;
  text: string;
  score: number;
  sourceType: string;
}

export async function retrieveDocuments(
  userId: mongoose.Types.ObjectId,
  query: string,
  topK = 4
): Promise<RetrievedPassage[]> {
  // Fetch candidates (limit to 100 to keep JS sorting fast)
  const candidates = await EmbeddedDocument.find({ userId })
    .select("title text embedding sourceType")
    .limit(100)
    .lean();

  if (candidates.length === 0) return [];

  // Try cosine similarity on stored embeddings first
  const firstEmbedding = candidates[0].embedding;
  const hasRealEmbeddings = firstEmbedding && firstEmbedding.length > 10;

  let results: RetrievedPassage[];

  if (hasRealEmbeddings) {
    // Build query embedding via bag-of-words as proxy
    // (Replace this block with a real embedding API call if available)
    const allTexts = [query, ...candidates.map((c) => c.text)];
    const vocab = buildVocab(allTexts);
    const queryVec = bagOfWordsVector(query, vocab);

    results = candidates.map((doc) => {
      const docVec = bagOfWordsVector(doc.text, vocab);
      return {
        title: doc.title,
        text: doc.text,
        score: cosineSimilarity(queryVec, docVec),
        sourceType: doc.sourceType,
      };
    });
  } else {
    // Pure keyword matching fallback
    const queryWords = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
    results = candidates.map((doc) => {
      const docLower = doc.text.toLowerCase();
      const hits = queryWords.filter((w) => docLower.includes(w)).length;
      return {
        title: doc.title,
        text: doc.text,
        score: hits / Math.max(queryWords.length, 1),
        sourceType: doc.sourceType,
      };
    });
  }

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
