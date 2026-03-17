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
    return <div className="animate-pulse">Loading forecasting model...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">Scenario Planning & Budget Engine</h2>
        <p className="text-sm text-neutral-400">Stress-test hiring and fundraising assumptions before committing cash.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-neutral-900 border-neutral-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">12-Month Runway Projection</CardTitle>
            <CardDescription className="text-neutral-400">Base, stress, and growth scenarios update from your planning assumptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={runway}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="month" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", color: "#fff" }} />
                  <Legend />
                  <Line type="monotone" dataKey="baseRunway" stroke="#60a5fa" strokeWidth={2} dot={false} name="Base" />
                  <Line type="monotone" dataKey="stressRunway" stroke="#f59e0b" strokeWidth={2} dot={false} name="Stress" />
                  <Line type="monotone" dataKey="growthRunway" stroke="#34d399" strokeWidth={2} dot={false} name="Growth" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">What-If Controls</CardTitle>
            <CardDescription className="text-neutral-400">Rapidly model key decisions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-wide text-neutral-500">Planned New Hires</label>
              <input
                type="range"
                min={0}
                max={8}
                value={newHires}
                onChange={(e) => setNewHires(Number(e.target.value))}
                className="w-full mt-2"
              />
              <p className="text-sm text-neutral-300 mt-2">{newHires} hires</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-neutral-500">Fundraise Delay (Months)</label>
              <input
                type="range"
                min={0}
                max={6}
                value={fundraiseDelayMonths}
                onChange={(e) => setFundraiseDelayMonths(Number(e.target.value))}
                className="w-full mt-2"
              />
              <p className="text-sm text-neutral-300 mt-2">{fundraiseDelayMonths} months</p>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
              <div className="flex items-center gap-2 mb-2 text-neutral-300 text-sm font-medium">
                <Calculator size={14} className="text-indigo-400" />
                Modeled Impact
              </div>
              <p className="text-sm text-neutral-400">Incremental burn: <span className="text-red-400">${modeledImpact.burnDelta.toLocaleString()}/month</span></p>
              <p className="text-sm text-neutral-400">Estimated runway post-change: <span className="text-emerald-400">{modeledImpact.adjustedRunway.toFixed(1)} months</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniCard title="Budget Assumptions" value={`${assumptions.length}`} caption="Driver variables tracked" icon={<Target size={16} className="text-blue-400" />} />
        <MiniCard title="Decision Velocity" value="< 5 mins" caption="To run a forecast test" icon={<ArrowRightLeft size={16} className="text-amber-400" />} />
        <MiniCard title="Founder Guidance" value="AI-assisted" caption="Narrative explanation layer" icon={<Lightbulb size={16} className="text-emerald-400" />} />
      </div>
    </div>
  );
}

function MiniCard({ title, value, caption, icon }: { title: string; value: string; caption: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-neutral-400">{title}</p>
          {icon}
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-neutral-500">{caption}</p>
      </CardContent>
    </Card>
  );
}
