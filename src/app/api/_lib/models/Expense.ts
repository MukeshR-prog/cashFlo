import mongoose, { Document, Model, Schema } from "mongoose";

export type ExpenseType = "BUSINESS" | "PERSONAL";

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  date: Date;
  type: ExpenseType;
  paymentMode?: string;
  isDemo?: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true, index: true },
    date: { type: Date, required: true, index: true },
    type: { type: String, enum: ["BUSINESS", "PERSONAL"], default: "PERSONAL", index: true },
    paymentMode: { type: String, trim: true },
    notes: { type: String, trim: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ExpenseSchema.index({ userId: 1, date: -1 });

const Expense: Model<IExpense> = mongoose.models.Expense ?? mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
