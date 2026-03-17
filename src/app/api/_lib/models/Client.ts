import mongoose, { Document, Model, Schema } from "mongoose";

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

ClientSchema.index({ userId: 1, email: 1 });

const Client: Model<IClient> = mongoose.models.Client ?? mongoose.model<IClient>("Client", ClientSchema);

export default Client;
