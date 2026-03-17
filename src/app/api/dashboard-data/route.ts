import { NextRequest, NextResponse } from "next/server";
import {
  getAlertsData,
  getCapTableData,
  getCashFlowData,
  getComplianceAlertsData,
  getDashboardMetrics,
  getDilutionScenarioData,
  getInvoicesData,
  getScenarioAssumptionsData,
  getScenarioRunwayData,
  markInvoiceAsPaid,
} from "@/lib/db";

type DataType =
  | "metrics"
  | "cashflow"
  | "invoices"
  | "alerts"
  | "scenarioAssumptions"
  | "scenarioRunway"
  | "capTable"
  | "dilutionScenario"
  | "compliance";

async function fetchByType(type: DataType, userId: string) {
  switch (type) {
    case "metrics":
      return getDashboardMetrics(userId);
    case "cashflow":
      return getCashFlowData(userId);
    case "invoices":
      return getInvoicesData(userId);
    case "alerts":
      return getAlertsData(userId);
    case "scenarioAssumptions":
      return getScenarioAssumptionsData(userId);
    case "scenarioRunway":
      return getScenarioRunwayData(userId);
    case "capTable":
      return getCapTableData(userId);
    case "dilutionScenario":
      return getDilutionScenarioData(userId);
    case "compliance":
      return getComplianceAlertsData(userId);
    default:
      throw new Error("Unsupported dashboard data type");
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") as DataType | null;

    if (!userId || !type) {
      return NextResponse.json({ error: "userId and type are required" }, { status: 400 });
    }

    const data = await fetchByType(type, userId);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[DASHBOARD_DATA_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, invoiceId } = body as {
      action?: string;
      userId?: string;
      invoiceId?: string;
    };

    if (action !== "markInvoicePaid") {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    if (!userId || !invoiceId) {
      return NextResponse.json({ error: "userId and invoiceId are required" }, { status: 400 });
    }

    await markInvoiceAsPaid(userId, invoiceId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DASHBOARD_DATA_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
