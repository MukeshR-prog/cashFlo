import { NextRequest, NextResponse } from "next/server";

import {
  getAlertsData,
  getCapTableData,
  getCashFlowData,
  getComplianceAlertsData,
  getDashboardMetrics,
  getInvoicesData,
} from "@/lib/db";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildContextSummary(data: {
  metrics: Awaited<ReturnType<typeof getDashboardMetrics>>;
  alerts: Awaited<ReturnType<typeof getAlertsData>>;
  invoices: Awaited<ReturnType<typeof getInvoicesData>>;
  cashflow: Awaited<ReturnType<typeof getCashFlowData>>;
  capTable: Awaited<ReturnType<typeof getCapTableData>>;
  compliance: Awaited<ReturnType<typeof getComplianceAlertsData>>;
}) {
  const invoices =
    (data.invoices as Array<{ status?: string; amount?: number; client?: string; dueDate?: string }>) ?? [];
  const cashflow = (data.cashflow as Array<{ inflow?: number; outflow?: number }>) ?? [];
  const capTable = (data.capTable as Array<{ holder?: string; ownershipPct?: number }>) ?? [];
  const compliance = (data.compliance as Array<Record<string, unknown>>) ?? [];
  const alerts = (data.alerts as Array<{ severity?: string; title?: string; description?: string }>) ?? [];

  const overdueInvoices = invoices.filter((invoice) => invoice.status === "overdue");
  const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0);
  const pendingInvoices = invoices.filter((invoice) => invoice.status === "pending");
  const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0);
  const totalOutflow = cashflow.reduce((sum, point) => sum + (point.outflow ?? 0), 0);
  const totalInflow = cashflow.reduce((sum, point) => sum + (point.inflow ?? 0), 0);

  return {
    metrics: data.metrics,
    alerts: alerts.slice(0, 6),
    overdueSummary: {
      count: overdueInvoices.length,
      amount: overdueAmount,
      top: overdueInvoices.slice(0, 3).map((invoice) => ({
        client: invoice.client,
        dueDate: invoice.dueDate,
        amount: invoice.amount,
      })),
    },
    pendingSummary: {
      count: pendingInvoices.length,
      amount: pendingAmount,
    },
    cashflowSummary: {
      periods: cashflow.length,
      inflow: totalInflow,
      outflow: totalOutflow,
      net: totalInflow - totalOutflow,
    },
    capTableTop: capTable.slice(0, 5).map((row) => ({
      holder: row.holder,
      ownershipPct: row.ownershipPct,
    })),
    complianceTop: compliance.slice(0, 5),
  };
}

export async function POST(request: NextRequest) {
  try {
    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey) {
      return NextResponse.json(
        {
          error: "GROQ_API_KEY is missing. Add it to your environment variables.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      userId?: string;
      message?: string;
      history?: ChatMessage[];
    };

    if (!body.userId || !body.message) {
      return NextResponse.json({ error: "userId and message are required" }, { status: 400 });
    }

    const [metrics, alerts, invoices, cashflow, capTable, compliance] = await Promise.all([
      getDashboardMetrics(body.userId),
      getAlertsData(body.userId),
      getInvoicesData(body.userId),
      getCashFlowData(body.userId),
      getCapTableData(body.userId),
      getComplianceAlertsData(body.userId),
    ]);

    const contextSummary = buildContextSummary({
      metrics,
      alerts,
      invoices,
      cashflow,
      capTable,
      compliance,
    });

    const recentHistory = (body.history ?? []).slice(-6).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    const systemPrompt = [
      "You are FundSight, an India-focused CFO copilot for startup founders.",
      "Use ONLY the provided dashboard context. Do not invent any numbers.",
      "Use INR and Indian financial language where relevant (runway, burn, AR, GST/TDS compliance).",
      "Keep answers concise and decision-oriented.",
      "When advice is requested, structure as: What happened, Why it matters, Next 3 actions.",
      "If data is missing, say what is missing and what to check in the dashboard.",
      `Context JSON: ${JSON.stringify({
        ...contextSummary,
        formatted: {
          totalCash: formatINR((contextSummary.metrics as { totalCash?: number })?.totalCash ?? 0),
          monthlyBurn: formatINR((contextSummary.metrics as { monthlyBurn?: number })?.monthlyBurn ?? 0),
          overdueAR: formatINR(contextSummary.overdueSummary.amount),
          pendingAR: formatINR(contextSummary.pendingSummary.amount),
        },
      })}`,
    ].join(" ");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.2,
        max_tokens: 900,
        messages: [
          { role: "system", content: systemPrompt },
          ...recentHistory,
          { role: "user", content: body.message },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: "Groq request failed",
          details: errorText,
        },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const answer = payload.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json({ error: "No response from model" }, { status: 502 });
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("[COPILOT_ROUTE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
