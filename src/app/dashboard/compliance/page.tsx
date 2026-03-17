"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ComplianceAlert } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, FlaskConical, ShieldAlert } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

async function getDashboardData<T>(userId: string, type: string): Promise<T> {
  const response = await fetch(
    `/api/dashboard-data?userId=${encodeURIComponent(userId)}&type=${encodeURIComponent(type)}`,
    { cache: "no-store" }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load dashboard data");
  }

  return payload.data as T;
}

export default function CompliancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const data = await getDashboardData<ComplianceAlert[]>(user.id, "compliance");
        setAlerts(data as ComplianceAlert[]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const counts = useMemo(() => {
    const critical = alerts.filter((a) => a.severity === "critical").length;
    const urgent = alerts.filter((a) => a.severity === "urgent").length;
    const upcoming = alerts.filter((a) => a.severity === "upcoming").length;
    return { critical, urgent, upcoming };
  }, [alerts]);

  if (loading) {
    return <div className="animate-pulse">Loading compliance calendar...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-2xl font-display font-bold">Compliance & Tax Alerts</h2>
        <p className="text-sm text-muted-foreground">Prevent penalties with a proactive calendar across tax, filing, and payroll obligations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Metric title="Critical" value={counts.critical} caption="Immediate response required" tone="critical" icon={<ShieldAlert size={16} />} />
        <Metric title="Urgent" value={counts.urgent} caption="Due in the next few weeks" tone="urgent" icon={<CalendarCheck size={16} />} />
        <Metric title="R&D Tracking" value={alerts.filter((a) => a.category === "r&d").length} caption="Credits and evidence checkpoints" tone="upcoming" icon={<FlaskConical size={16} />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Risk Mix</CardTitle>
          <CardDescription>Distribution of requirements by urgency level.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[220px] w-full"
            config={{
              count: { label: "Count", color: "var(--chart-1)" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { label: "Critical", count: counts.critical },
                  { label: "Urgent", count: counts.urgent },
                  { label: "Upcoming", count: counts.upcoming },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Timeline</CardTitle>
          <CardDescription>Unified reminder system for filing and payment commitments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Requirement</th>
                  <th className="px-4 py-3">Jurisdiction</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Severity</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.jurisdiction}</td>
                    <td className="px-4 py-3 text-muted-foreground uppercase">{item.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${severityClass(item.severity)}`}>
                        {item.severity.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function severityClass(value: string) {
  if (value === "critical") return "bg-red-500/10 text-red-400 border-red-500/20";
  if (value === "urgent") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
}

function Metric({ title, value, caption, tone, icon }: { title: string; value: number; caption: string; tone: "critical" | "urgent" | "upcoming"; icon: React.ReactNode }) {
  const toneClass =
    tone === "critical"
      ? "border-red-900/40 bg-red-950/20 text-red-400"
      : tone === "urgent"
      ? "border-amber-900/40 bg-amber-950/20 text-amber-400"
      : "border-blue-900/40 bg-blue-950/20 text-blue-400";

  return (
    <Card className={`border ${toneClass}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{title}</p>
          {icon}
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-xs text-neutral-400 mt-1">{caption}</p>
      </CardContent>
    </Card>
  );
}
