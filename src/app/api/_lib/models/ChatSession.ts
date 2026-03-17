import mongoose, { Document, Model, Schema } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  sessionId: string;          // UUID generated on first message
  userId: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema<IChatSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true }
);

// TTL index: auto-expire sessions after 30 minutes of inactivity
ChatSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 1800 });
// Compound index for quick session + user lookup
ChatSessionSchema.index({ sessionId: 1, userId: 1 });

const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession ??
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);

export default ChatSession;
