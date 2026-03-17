import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;       // optional – not needed for OAuth users
  image?: string;
  provider: "google" | "credentials";
  providerId?: string;     // Google UID
  sessionTokenHash?: string;
  sessionExpiresAt?: Date;
  role?: "student" | "freelancer" | null;
  onboardingCompleted?: boolean;
  profile?: any;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    image: { type: String },
    provider: { type: String, enum: ["google", "credentials"], default: "credentials" },
    providerId: { type: String },
    sessionTokenHash: { type: String },
    sessionExpiresAt: { type: Date },
    role: { type: String, enum: ["student", "freelancer"], default: null },
    onboardingCompleted: { type: Boolean, default: false },
    profile: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
