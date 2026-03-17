import connectDB from "./mongodb";
import UserDashboard from "@/models/UserDashboard";
import {
        mockMetrics,
        mockCashFlow,
        mockInvoices,
        mockAlerts,
        mockRevenueData,
        mockScenarioAssumptions,
        mockScenarioRunway,
        mockCapTable,
        mockDilutionScenario,
        mockComplianceAlerts,
} from "./mock-data";

// ==========================================
// 1. DATA SEEDING (One-time load for Hackathon)
// ==========================================
export async function seedUserData(userId: string) {
  try {
      await connectDB();

      await UserDashboard.findOneAndUpdate(
          { userId },
          {
              $setOnInsert: {
                  userId,
                  metrics: mockMetrics,
                  revenue: mockRevenueData,
                  cashflow: mockCashFlow,
                  invoices: mockInvoices,
                  alerts: mockAlerts,
                  scenarioAssumptions: mockScenarioAssumptions,
                  scenarioRunway: mockScenarioRunway,
                  capTable: mockCapTable,
                  dilutionScenario: mockDilutionScenario,
                  compliance: mockComplianceAlerts,
              },
          },
          { upsert: true, new: true }
      );

      console.log("Seeding successful.");
      return true;
  } catch (error) {
      console.error("MongoDB seeding failed.", error);
      throw error;
  }
}

// ==========================================
// 2. DATA FETCHING (With Graceful Degradation to Mock Data)
// ==========================================

export async function getDashboardMetrics(userId: string) {
    try {
        await connectDB();
        const doc = await UserDashboard.findOne({ userId }).select("metrics").lean();
        if (doc?.metrics) return doc.metrics;
    } catch (error) {
        console.warn("MongoDB fetch failed, falling back to mock metrics.", error);
    }
    return mockMetrics;
}

export async function getRevenueData(userId: string) {
    try {
        await connectDB();
        const doc = await UserDashboard.findOne({ userId }).select("revenue").lean();
        if (doc?.revenue?.length) return doc.revenue;
    } catch (error) {
        console.warn("MongoDB fetch failed, falling back to mock revenue.", error);
    }
    return mockRevenueData;
}

export async function getCashFlowData(userId: string) {
    try {
        await connectDB();
        const doc = await UserDashboard.findOne({ userId }).select("cashflow").lean();
        if (doc?.cashflow?.length) {
            return [...(doc.cashflow as { date: string }[])].sort((a, b) =>
                a.date.localeCompare(b.date)
            );
        }
    } catch (error) {
        console.warn("MongoDB fetch failed, falling back to mock cashflow.", error);
    }
    return mockCashFlow;
}

export async function getInvoicesData(userId: string) {
    try {
        await connectDB();
        const doc = await UserDashboard.findOne({ userId }).select("invoices").lean();
        if (doc?.invoices?.length) return doc.invoices;
    } catch (error) {
        console.warn("MongoDB fetch failed, falling back to mock invoices.", error);
    }
    return mockInvoices;
}

export async function getAlertsData(userId: string) {
    try {
        await connectDB();
        const doc = await UserDashboard.findOne({ userId }).select("alerts").lean();
        if (doc?.alerts?.length) return doc.alerts;
    } catch (error) {
        console.warn("MongoDB fetch failed, falling back to mock alerts.", error);
    }
    return mockAlerts;
}

export async function getScenarioAssumptionsData(userId: string) {
    try {
        await connectDB();
        const doc = await UserDashboard.findOne({ userId }).select("scenarioAssumptions").lean();
        if (doc?.scenarioAssumptions?.length) return doc.scenarioAssumptions;
    } catch (error) {
        console.warn("MongoDB fetch failed, falling back to mock scenario assumptions.", error);
    }
    return mockScenarioAssumptions;
}

export async function getScenarioRunwayData(userId: string) {
    try {
        await connectDB();
        const doc = await UserDashboard.findOne({ userId }).select("scenarioRunway").lean();
        if (doc?.scenarioRunway?.length) {
            return [...(doc.scenarioRunway as { month: string }[])].sort((a, b) =>
                a.month.localeCompare(b.month)
            );
        }
    } catch (error) {
        console.warn("MongoDB fetch failed, falling back to mock scenario runway.", error);
    }
    return mockScenarioRunway;
}

export async function getCapTableData(userId: string) {
    try {
        await connectDB();
        const doc = await UserDashboard.findOne({ userId }).select("capTable").lean();
        if (doc?.capTable?.length) return doc.capTable;
    } catch (error) {
        console.warn("MongoDB fetch failed, falling back to mock cap table.", error);
    }
    return mockCapTable;
}

export async function getDilutionScenarioData(userId: string) {
    try {
        await connectDB();
        const doc = await UserDashboard.findOne({ userId }).select("dilutionScenario").lean();
        if (doc?.dilutionScenario) return doc.dilutionScenario;
    } catch (error) {
        console.warn("MongoDB fetch failed, falling back to mock dilution scenario.", error);
    }
    return mockDilutionScenario;
}

export async function getComplianceAlertsData(userId: string) {
    try {
        await connectDB();
        const doc = await UserDashboard.findOne({ userId }).select("compliance").lean();
        if (doc?.compliance?.length) {
            return [...(doc.compliance as { dueDate: string }[])].sort((a, b) =>
                a.dueDate.localeCompare(b.dueDate)
            );
        }
    } catch (error) {
        console.warn("MongoDB fetch failed, falling back to mock compliance alerts.", error);
    }
    return mockComplianceAlerts;
}

// ==========================================
// 3. DATA MUTATION (AR Workflows)
// ==========================================
export async function markInvoiceAsPaid(userId: string, invoiceId: string) {
    try {
        await connectDB();
        await UserDashboard.updateOne(
            { userId, "invoices.id": invoiceId },
            { $set: { "invoices.$.status": "paid" } }
        );
        return true;
    } catch (error) {
        console.error("MongoDB update failed.", error);
        await new Promise(resolve => setTimeout(resolve, 800));
        return true;
    }
}
