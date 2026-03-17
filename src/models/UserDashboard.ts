import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserDashboard extends Document {
  userId: string;
  metrics?: Record<string, unknown>;
  revenue?: unknown[];
  cashflow?: unknown[];
  invoices?: unknown[];
  alerts?: unknown[];
  scenarioAssumptions?: unknown[];
  scenarioRunway?: unknown[];
  capTable?: unknown[];
  dilutionScenario?: Record<string, unknown>;
  compliance?: unknown[];
  createdAt: Date;
  updatedAt: Date;
}

const UserDashboardSchema = new Schema<IUserDashboard>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    metrics: { type: Schema.Types.Mixed },
    revenue: { type: [Schema.Types.Mixed] },
    cashflow: { type: [Schema.Types.Mixed] },
    invoices: { type: [Schema.Types.Mixed] },
    alerts: { type: [Schema.Types.Mixed] },
    scenarioAssumptions: { type: [Schema.Types.Mixed] },
    scenarioRunway: { type: [Schema.Types.Mixed] },
    capTable: { type: [Schema.Types.Mixed] },
    dilutionScenario: { type: Schema.Types.Mixed },
    compliance: { type: [Schema.Types.Mixed] },
  },
  { timestamps: true }
);

const UserDashboard: Model<IUserDashboard> =
  mongoose.models.UserDashboard ??
  mongoose.model<IUserDashboard>("UserDashboard", UserDashboardSchema);

export default UserDashboard;
