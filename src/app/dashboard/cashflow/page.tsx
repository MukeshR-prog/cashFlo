"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCashFlowData, getDashboardMetrics } from "@/lib/db";
import { CashFlowDay } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CalendarClock, TrendingDown, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DashboardMetrics = {
  totalCash: number;
};

export default function CashflowPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CashFlowDay[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const [cashRows, m] = await Promise.all([getCashFlowData(user.id), getDashboardMetrics(user.id)]);
        setRows(cashRows as CashFlowDay[]);
        setMetrics(m as DashboardMetrics);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const overview = useMemo(() => {
    const totalInflow = rows.reduce((sum, row) => sum + (row.inflow || 0), 0);
    const totalOutflow = rows.reduce((sum, row) => sum + (row.outflow || 0), 0);
    const minBalance = rows.reduce((min, row) => Math.min(min, row.endingBalance || 0), Number.POSITIVE_INFINITY);
    const criticalWeeks = rows.filter((row) => row.hasCriticalEvent || row.endingBalance < 600000).length;

    return {
      totalInflow,
      totalOutflow,
      minBalance: Number.isFinite(minBalance) ? minBalance : 0,
      criticalWeeks,
    };
  }, [rows]);

  if (loading) {
    return <div className="animate-pulse">Loading 13-week liquidity timeline...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">Rolling 13-Week Cash Flow</h2>
        <p className="text-sm text-neutral-400">Plan around payroll, tax, and vendor obligations before liquidity stress appears.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Opening Cash" value={`$${metrics?.totalCash?.toLocaleString() || 0}`} detail="Real-time treasury snapshot" icon={<Wallet className="text-emerald-400" size={18} />} />
        <SummaryCard title="Forecast Inflow" value={`$${overview.totalInflow.toLocaleString()}`} detail="Expected receipts this cycle" icon={<TrendingDown className="text-blue-400" size={18} />} />
        <SummaryCard title="Forecast Outflow" value={`$${overview.totalOutflow.toLocaleString()}`} detail="Non-negotiable obligations" icon={<CalendarClock className="text-red-400" size={18} />} />
        <SummaryCard title="Critical Weeks" value={`${overview.criticalWeeks}`} detail={`Min balance $${overview.minBalance.toLocaleString()}`} icon={<AlertTriangle className="text-amber-400" size={18} />} />
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Inflow vs Outflow</CardTitle>
          <CardDescription className="text-neutral-400">Weekly mismatch highlights timing risk, not just total profitability.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" fontSize={12} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", color: "#fff" }}
                  formatter={(value) => `$${Number(value ?? 0).toLocaleString()}`}
                />
                <Bar dataKey="inflow" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Liquidity Grid</CardTitle>
          <CardDescription className="text-neutral-400">Use this view for daily treasury standups and escalation workflows.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Week</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3 text-emerald-400">Inflow</th>
                  <th className="px-4 py-3 text-red-400">Outflow</th>
                  <th className="px-4 py-3">End</th>
                  <th className="px-4 py-3">Event</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className={`border-b border-neutral-800/50 ${row.endingBalance < 600000 ? "bg-red-950/20" : "hover:bg-neutral-800/20"}`}>
                    <td className="px-4 py-3 text-neutral-300">{row.date}</td>
                    <td className="px-4 py-3 text-neutral-400">${row.startingBalance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-400">{row.inflow ? `+$${row.inflow.toLocaleString()}` : "-"}</td>
                    <td className="px-4 py-3 text-red-400">-${row.outflow.toLocaleString()}</td>
                    <td className={`px-4 py-3 font-semibold ${row.endingBalance < 600000 ? "text-red-400" : "text-white"}`}>${row.endingBalance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-neutral-400">{row.criticalEventName || "-"}</td>
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

function SummaryCard({ title, value, detail, icon }: { title: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-neutral-400">{title}</p>
          <div className="p-2 rounded-md bg-neutral-950 border border-neutral-800">{icon}</div>
        </div>
        <p className="text-2xl text-white font-bold">{value}</p>
        <p className="text-xs text-neutral-500 mt-1">{detail}</p>
      </CardContent>
    </Card>
  );
}
