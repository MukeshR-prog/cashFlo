"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCapTableData, getDilutionScenarioData } from "@/lib/db";
import { CapTableMember, DilutionScenario } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePercent, ShieldCheck } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#38bdf8", "#4ade80", "#f59e0b", "#f43f5e", "#a78bfa"];

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
          getCapTableData(user.id),
          getDilutionScenarioData(user.id),
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">Cap Table & Dilution Simulator</h2>
        <p className="text-sm text-neutral-400">Review ownership impact before accepting any term sheet.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-neutral-900 border-neutral-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Ownership Distribution</CardTitle>
            <CardDescription className="text-neutral-400">Secure ledger of founders, investors, and option pools.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rows} dataKey="ownershipPct" nameKey="holder" outerRadius={100}>
                    {rows.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value ?? 0)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div key={row.id} className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <p className="text-sm text-neutral-300 truncate">{row.holder}</p>
                  </div>
                  <p className="text-sm text-white font-medium">{row.ownershipPct}%</p>
                </div>
              ))}
              <div className="text-xs text-neutral-500 pt-2">Total shares outstanding: {totalShares.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Dilution Preview</CardTitle>
            <CardDescription className="text-neutral-400">{dilution?.roundName || "Proposed financing"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4 space-y-2">
              <p className="text-sm text-neutral-400">Pre-money valuation</p>
              <p className="text-xl text-white font-bold">${dilution?.preMoney?.toLocaleString() || 0}</p>
              <p className="text-sm text-neutral-400">Raise amount</p>
              <p className="text-xl text-white font-bold">${dilution?.raiseAmount?.toLocaleString() || 0}</p>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-300 text-sm font-medium">
                <BadgePercent size={14} />
                Founder Ownership Shift
              </div>
              <p className="text-sm text-neutral-300">Before: <span className="text-white">{dilution?.founderOwnershipBeforePct || 0}%</span></p>
              <p className="text-sm text-neutral-300">After: <span className="text-red-400">{dilution?.founderOwnershipAfterPct || 0}%</span></p>
            </div>

            <div className="text-xs text-neutral-500 flex items-center gap-2">
              <ShieldCheck size={13} className="text-emerald-400" />
              Use this simulator as a pre-signing sanity check, not legal advice.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Ownership Ledger</CardTitle>
          <CardDescription className="text-neutral-400">Audit-friendly table for governance and board reporting.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Holder</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Shares</th>
                  <th className="px-4 py-3 text-right">Ownership</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20">
                    <td className="px-4 py-3 text-white">{row.holder}</td>
                    <td className="px-4 py-3 text-neutral-400 capitalize">{row.type}</td>
                    <td className="px-4 py-3 text-right text-neutral-300">{row.shares.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">{row.ownershipPct}%</td>
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
