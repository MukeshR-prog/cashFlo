import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * EmbeddedDocument stores text chunks + their vector embeddings
 * so we can do cosine-similarity retrieval (document RAG path).
 *
 * For the Groq / local deployment that doesn't ship a dedicated vector DB,
 * we store the embedding as a plain number array and do similarity in JS.
 * When you add a real vector DB (Pinecone, Atlas Vector Search) you can
 * replace the lookup step while keeping this schema as metadata store.
 */
export interface IEmbeddedDocument extends Document {
  userId: mongoose.Types.ObjectId;
  sourceType:
    | "expense_summary"
    | "invoice_summary"
    | "payment_summary"
    | "client_summary"
    | "cashflow_summary"
    | "general";
  sourceId?: mongoose.Types.ObjectId; // optional – links back to source record
  title: string;
  text: string;                     // raw passage (≤ 1500 chars)
  embedding: number[];              // 1536-dim float array (or whatever model)
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const EmbeddedDocumentSchema = new Schema<IEmbeddedDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sourceType: {
      type: String,
      enum: [
        "expense_summary",
        "invoice_summary",
        "payment_summary",
        "client_summary",
        "cashflow_summary",
        "general",
      ],
      required: true,
      index: true,
    },
    sourceId: { type: Schema.Types.ObjectId },
    title: { type: String, required: true, trim: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

EmbeddedDocumentSchema.index({ userId: 1, sourceType: 1 });
EmbeddedDocumentSchema.index({ userId: 1, updatedAt: -1 });

const EmbeddedDocument: Model<IEmbeddedDocument> =
  mongoose.models.EmbeddedDocument ??
  mongoose.model<IEmbeddedDocument>("EmbeddedDocument", EmbeddedDocumentSchema);

export default EmbeddedDocument;
