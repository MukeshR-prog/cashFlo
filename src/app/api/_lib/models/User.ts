import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;         // hashed — used for auth
  plainPassword?: string;    // plain-text — stored on demo accounts only, never used for auth
  image?: string;
  provider: "google" | "credentials";
  providerId?: string;       // Google UID
  sessionTokenHash?: string;
  sessionExpiresAt?: Date;
  role?: "student" | "freelancer" | null;
  onboardingCompleted?: boolean;
  loginCount?: number;
  isDemo?: boolean;          // marks an account as a pre-seeded demo
  profile?: any;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    plainPassword: { type: String },
    image: { type: String },
    provider: { type: String, enum: ["google", "credentials"], default: "credentials" },
    providerId: { type: String, index: true, sparse: true },
    sessionTokenHash: { type: String, index: true, sparse: true },
    sessionExpiresAt: { type: Date },
    role: { type: String, enum: ["student", "freelancer"], default: null },
    onboardingCompleted: { type: Boolean, default: false },
    loginCount: { type: Number, default: 0 },
    isDemo: { type: Boolean, default: false },
    profile: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
