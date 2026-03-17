import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPaymentSettlement extends Document {
  invoiceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMode: string;
  transactionId?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSettlementSchema = new Schema<IPaymentSettlement>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMode: { type: String, required: true, trim: true },
    transactionId: { type: String, trim: true },
    payerName: { type: String, trim: true },
    payerEmail: { type: String, trim: true, lowercase: true },
    payerPhone: { type: String, trim: true },
  },
  { timestamps: true }
);

PaymentSettlementSchema.index({ userId: 1, paymentDate: -1 });

const PaymentSettlement: Model<IPaymentSettlement> =
  mongoose.models.PaymentSettlement ?? mongoose.model<IPaymentSettlement>("PaymentSettlement", PaymentSettlementSchema);

export default PaymentSettlement;
