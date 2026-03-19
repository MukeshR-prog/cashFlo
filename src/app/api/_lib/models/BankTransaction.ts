import mongoose, { Document, Model, Schema } from "mongoose";

export type BankTransactionDirection = "credit" | "debit";
export type BankTransactionSource = "bank_statement_pdf" | "upi" | "bank_transfer" | "wallet" | "manual";

export interface IBankTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  source: BankTransactionSource;
  direction: BankTransactionDirection;
  amount: number;
  currency: string;
  transactionDate: Date;
  description: string;
  reference?: string;
  fingerprint: string;
  raw?: string;
  linkedExpenseId?: mongoose.Types.ObjectId;
  linkedSettlementId?: mongoose.Types.ObjectId;
  isDemo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BankTransactionSchema = new Schema<IBankTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source: {
      type: String,
      enum: ["bank_statement_pdf", "upi", "bank_transfer", "wallet", "manual"],
      default: "bank_statement_pdf",
      required: true,
      index: true,
    },
    direction: { type: String, enum: ["credit", "debit"], required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: "INR", trim: true, uppercase: true },
    transactionDate: { type: Date, required: true, index: true },
    description: { type: String, required: true, trim: true },
    reference: { type: String, trim: true },
    fingerprint: { type: String, required: true, trim: true },
    raw: { type: String, trim: true },
    linkedExpenseId: { type: Schema.Types.ObjectId, ref: "Expense" },
    linkedSettlementId: { type: Schema.Types.ObjectId, ref: "PaymentSettlement" },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BankTransactionSchema.index({ userId: 1, fingerprint: 1 }, { unique: true });
BankTransactionSchema.index({ userId: 1, direction: 1, transactionDate: -1 });

const BankTransaction: Model<IBankTransaction> =
  mongoose.models.BankTransaction ?? mongoose.model<IBankTransaction>("BankTransaction", BankTransactionSchema);

export default BankTransaction;
