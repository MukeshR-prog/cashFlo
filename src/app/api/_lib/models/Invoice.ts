import mongoose, { Document, Model, Schema } from "mongoose";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "due"
  | "overdue"
  | "partially_paid"
  | "paid";

interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface IInvoice extends Document {
  userId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: IInvoiceItem[];
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  paymentLink?: string;
  notes?: string;
  isDemo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    invoiceNumber: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    items: { type: [InvoiceItemSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    amountDue: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["draft", "sent", "due", "overdue", "partially_paid", "paid"],
      default: "draft",
      index: true,
    },
    paymentLink: { type: String, trim: true },
    notes: { type: String, trim: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

InvoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ dueDate: 1 });

const Invoice: Model<IInvoice> = mongoose.models.Invoice ?? mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
