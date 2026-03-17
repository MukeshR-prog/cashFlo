"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CapTableMember, DilutionScenario } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePercent, ShieldCheck } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

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

export default function CapTablePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CapTableMember[]>([]);
  const [dilution, setDilution] = useState<DilutionScenario | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      try {
        const [capTableRows, dilutionRow] = await Promise.all([
          getDashboardData<CapTableMember[]>(user.id, "capTable"),
          getDashboardData<DilutionScenario>(user.id, "dilutionScenario"),
        ]);
        setRows(capTableRows as CapTableMember[]);
        setDilution(dilutionRow as DilutionScenario);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const totalShares = useMemo(() => rows.reduce((sum, row) => sum + row.shares, 0), [rows]);

  if (loading) {
    return <div className="animate-pulse">Loading ownership ledger...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-2xl font-display font-bold">Cap Table & Dilution Simulator</h2>
        <p className="text-sm text-muted-foreground">Review ownership impact before accepting any term sheet.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ownership Distribution</CardTitle>
            <CardDescription>Secure ledger of founders, investors, and option pools.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <ChartContainer className="h-[280px] w-full" config={{ ownershipPct: { label: "Ownership %", color: "var(--chart-1)" } }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rows} dataKey="ownershipPct" nameKey="holder" outerRadius={100}>
                    {rows.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent valueFormatter={(value) => `${value}%`} />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div key={row.id} className="flex items-center justify-between rounded-md border border-border bg-muted/35 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <p className="text-sm truncate">{row.holder}</p>
                  </div>
                  <p className="text-sm font-medium">{row.ownershipPct}%</p>
                </div>
              ))}
              <div className="text-xs text-muted-foreground pt-2">Total shares outstanding: {totalShares.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dilution Preview</CardTitle>
            <CardDescription>{dilution?.roundName || "Proposed financing"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/35 border border-border p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Pre-money valuation</p>
              <p className="text-xl font-bold">${dilution?.preMoney?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Raise amount</p>
              <p className="text-xl font-bold">${dilution?.raiseAmount?.toLocaleString() || 0}</p>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-300 text-sm font-medium">
                <BadgePercent size={14} />
                Founder Ownership Shift
              </div>
              <p className="text-sm">Before: <span className="font-semibold">{dilution?.founderOwnershipBeforePct || 0}%</span></p>
              <p className="text-sm">After: <span className="text-red-400">{dilution?.founderOwnershipAfterPct || 0}%</span></p>
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck size={13} className="text-emerald-400" />
              Use this simulator as a pre-signing sanity check, not legal advice.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ownership Ledger</CardTitle>
          <CardDescription>Audit-friendly table for governance and board reporting.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Holder</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Shares</th>
                  <th className="px-4 py-3 text-right">Ownership</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-4 py-3">{row.holder}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{row.type}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{row.shares.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">{row.ownershipPct}%</td>
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
