import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReminder extends Document {
  invoiceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "email" | "whatsapp" | "sms";
  context?: "manual" | "due_soon" | "overdue" | "before_due";
  status: "pending" | "sent" | "failed";
  sentAt?: Date;
  isDemo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["email", "whatsapp", "sms"], required: true },
    context: { type: String, enum: ["manual", "due_soon", "overdue", "before_due"], default: "manual", index: true },
    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending", index: true },
    sentAt: { type: Date },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Reminder: Model<IReminder> = mongoose.models.Reminder ?? mongoose.model<IReminder>("Reminder", ReminderSchema);

export default Reminder;
