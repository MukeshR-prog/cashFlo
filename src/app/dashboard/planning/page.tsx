"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getScenarioAssumptionsData, getScenarioRunwayData } from "@/lib/db";
import { ScenarioAssumption, ScenarioPoint } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, Calculator, Lightbulb, Target } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

export default function PlanningPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assumptions, setAssumptions] = useState<ScenarioAssumption[]>([]);
  const [runway, setRunway] = useState<ScenarioPoint[]>([]);
  const [newHires, setNewHires] = useState(3);
  const [fundraiseDelayMonths, setFundraiseDelayMonths] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const [assumptionRows, runwayRows] = await Promise.all([
          getScenarioAssumptionsData(user.id),
          getScenarioRunwayData(user.id),
        ]);
        setAssumptions(assumptionRows as ScenarioAssumption[]);
        setRunway(runwayRows as ScenarioPoint[]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const modeledImpact = useMemo(() => {
    const avgBurnPerHire = assumptions.find((a) => a.label.includes("Fully Loaded"))?.value || 11000;
    const burnDelta = newHires * avgBurnPerHire;
    const delayPenalty = fundraiseDelayMonths * 0.35;
    const latest = runway[runway.length - 1]?.baseRunway || 6;
    const adjustedRunway = Math.max(latest - burnDelta / 100000 - delayPenalty, 0);
    return { burnDelta, adjustedRunway };
  }, [assumptions, fundraiseDelayMonths, newHires, runway]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground">Scenario Planning & Budget Engine</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Stress-test hiring and fundraising assumptions before committing cash.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="border-border lg:col-span-2 animate-fade-up delay-100" id="runway-projection-chart">
          <CardHeader>
            <CardTitle className="text-lg font-bold">12-Month Runway Projection</CardTitle>
            <CardDescription>
              Base, stress, and growth scenarios update from your planning assumptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={runway}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", color: "var(--muted-foreground)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseRunway"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={false}
                    name="Base"
                  />
                  <Line
                    type="monotone"
                    dataKey="stressRunway"
                    stroke="var(--warning)"
                    strokeWidth={2.5}
                    dot={false}
                    name="Stress"
                    strokeDasharray="6 3"
                  />
                  <Line
                    type="monotone"
                    dataKey="growthRunway"
                    stroke="var(--success)"
                    strokeWidth={2.5}
                    dot={false}
                    name="Growth"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* What-If Controls */}
        <Card className="border-border animate-fade-up delay-200" id="what-if-controls">
          <CardHeader>
            <CardTitle className="text-lg font-bold">What-If Controls</CardTitle>
            <CardDescription>Rapidly model key decisions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* New Hires Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Planned New Hires
                </label>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "color-mix(in oklch, var(--primary) 12%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  {newHires}
                </span>
              </div>
              <input
                id="new-hires-slider"
                type="range"
                min={0}
                max={8}
                value={newHires}
                onChange={(e) => setNewHires(Number(e.target.value))}
                className="w-full mt-1 accent-primary cursor-pointer"
                style={{ accentColor: "var(--primary)" }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0</span><span>4</span><span>8</span>
              </div>
            </div>

            {/* Fundraise Delay */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Fundraise Delay
                </label>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "color-mix(in oklch, var(--warning) 12%, transparent)",
                    color: "var(--warning)",
                  }}
                >
                  {fundraiseDelayMonths} mo
                </span>
              </div>
              <input
                id="fundraise-delay-slider"
                type="range"
                min={0}
                max={6}
                value={fundraiseDelayMonths}
                onChange={(e) => setFundraiseDelayMonths(Number(e.target.value))}
                className="w-full mt-1 cursor-pointer"
                style={{ accentColor: "var(--warning)" }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0 mo</span><span>3 mo</span><span>6 mo</span>
              </div>
            </div>

            {/* Modeled Impact */}
            <div
              className="rounded-xl border p-4 space-y-2"
              style={{
                background: "color-mix(in oklch, var(--primary) 5%, var(--card))",
                borderColor: "color-mix(in oklch, var(--primary) 20%, transparent)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Calculator size={14} style={{ color: "var(--primary)" }} />
                <span className="text-sm font-semibold text-foreground">Modeled Impact</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Additional burn/month</span>
                <span className="text-xs font-bold" style={{ color: "var(--destructive)" }}>
                  ${modeledImpact.burnDelta.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Adjusted runway</span>
                <span className="text-xs font-bold" style={{ color: "var(--success)" }}>
                  {modeledImpact.adjustedRunway.toFixed(1)} months
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Budget Assumptions",
            value: `${assumptions.length}`,
            caption: "Driver variables tracked",
            icon: Target,
            color: "var(--chart-1)",
            id: "budget-assumptions-card",
          },
          {
            title: "Decision Velocity",
            value: "< 5 mins",
            caption: "To run a forecast test",
            icon: ArrowRightLeft,
            color: "var(--warning)",
            id: "decision-velocity-card",
          },
          {
            title: "Founder Guidance",
            value: "AI-assisted",
            caption: "Narrative explanation layer",
            icon: Lightbulb,
            color: "var(--success)",
            id: "founder-guidance-card",
          },
        ].map((card, idx) => (
          <div
            key={card.id}
            id={card.id}
            className="kpi-card animate-fade-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="kpi-label">{card.title}</p>
              <div
                className="p-2 rounded-lg"
                style={{ background: `color-mix(in oklch, ${card.color} 12%, transparent)` }}
              >
                <card.icon size={14} style={{ color: card.color }} />
              </div>
            </div>
            <p className="kpi-value text-xl mb-1">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
