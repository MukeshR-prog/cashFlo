import mongoose, { Document, Model, Schema } from "mongoose";

export type TransactionDirection = "IN" | "OUT";
export type TransactionSource = "PAYMENT" | "EXPENSE" | "BANK" | "WALLET" | "MANUAL" | "INVOICE";

export interface IUnifiedTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  source: TransactionSource;
  type: string;
  amount: number;
  direction: TransactionDirection;
  referenceId?: string;
  date: Date;
  paymentMode?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UnifiedTransactionSchema = new Schema<IUnifiedTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source: {
      type: String,
      enum: ["PAYMENT", "EXPENSE", "BANK", "WALLET", "MANUAL", "INVOICE"],
      required: true,
      index: true,
    },
    type: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    direction: { type: String, enum: ["IN", "OUT"], required: true, index: true },
    referenceId: { type: String, trim: true },
    date: { type: Date, required: true, index: true },
    paymentMode: { type: String, trim: true },
    category: { type: String, trim: true },
  },
  { timestamps: true }
);

UnifiedTransactionSchema.index({ userId: 1, direction: 1, date: -1 });
UnifiedTransactionSchema.index({ userId: 1, source: 1, date: -1 });
UnifiedTransactionSchema.index({ userId: 1, referenceId: 1 }, { sparse: true });

const UnifiedTransaction: Model<IUnifiedTransaction> =
  mongoose.models.UnifiedTransaction ?? mongoose.model<IUnifiedTransaction>("UnifiedTransaction", UnifiedTransactionSchema);

export default UnifiedTransaction;
