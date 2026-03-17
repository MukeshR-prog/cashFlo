"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Invoice } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, FileText, Send, Database, CheckCircle2, Loader2 } from "lucide-react";
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

export default function ReceivablesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || !user.id) return;
      try {
        const data = await getDashboardData<Invoice[]>(user.id, "invoices");
        setInvoices(data as Invoice[]);
      } catch (error) {
        console.error("Error loading Invoices Data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleMarkPaid = async (invoiceId: string) => {
    if (!user || !user.id) return;
    setProcessingId(invoiceId);
    try {
      const response = await fetch("/api/dashboard-data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "markInvoicePaid",
          userId: user.id,
          invoiceId,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed to update invoice");
      }

      // Optimistically update the local state without a full reload
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'paid' } : inv
      ));
    } catch (error) {
      console.error("Failed to mark invoice as paid", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
     return <div className="animate-pulse space-y-6">Loading AR Ledger...</div>;
  }

  if (invoices.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <Database size={48} className="text-neutral-600 mb-4" />
          <h2 className="text-2xl font-display font-medium text-white">No Receivables Found</h2>
          <p className="text-neutral-400">Head back to the Command Center and click &quot;Seed Data&quot; first.</p>
        </div>
      );
  }

  // Calculate metrics based on CURRENT state (so they update live when button clicked)
  const activeInvoices = invoices.filter(i => i.status !== 'paid');
  const totalUncollected = activeInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  
  // Fake efficiency calculation for demo
  const totalInvoices = invoices.length;
  const paidInvoicesCount = invoices.filter(i => i.status === 'paid').length;
  const efficiencyBase = 64; 
  const currentEfficiency = totalInvoices > 0 ? efficiencyBase + (paidInvoicesCount * 5) : efficiencyBase;

  const agingData = [
    { bucket: "Current", amount: invoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.amount, 0) },
    { bucket: "30+ Days", amount: invoices.filter((i) => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0) },
    { bucket: "Collected", amount: invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0) },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold mb-1">Accounts Receivable</h2>
          <p className="text-sm text-muted-foreground">Automated collections and invoice aging tracking for better liquidity control.</p>
        </div>
      </div>

      {/* AR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-neutral-400 mb-1">Total Outstanding (MRR Illusion)</p>
            <h3 className="text-3xl font-bold text-white mb-2">{formatINR(totalUncollected)}</h3>
            <p className="text-xs text-neutral-500">Contracted, but acting as an unsecured loan to clients.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-950/20 border-red-900/40 ring-1 ring-red-500/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-red-400 mb-1 flex items-center gap-2">
              <AlertCircle size={16} />
              Severely Overdue
            </p>
            <h3 className="text-3xl font-bold text-red-400 mb-2">{formatINR(totalOverdue)}</h3>
            <p className="text-xs text-red-500/80">Immediate runway impact. Requires immediate escalation.</p>
          </CardContent>
        </Card>

        <Card className="bg-chart-1/10 border-chart-1/30">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-chart-1 mb-1">Collection Efficiency</p>
            <h3 className="text-3xl font-bold text-chart-1 mb-2">{Math.min(currentEfficiency, 100)}%</h3>
            <Progress value={Math.min(currentEfficiency, 100)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Benchmark target is 85% for healthy startup collections.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aging Distribution</CardTitle>
          <CardDescription>Breakdown of receivables by collection stage.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[240px] w-full"
            config={{
              amount: { label: "Amount", color: "var(--chart-1)" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => `$${v.toLocaleString()}`} />} />
                <Bar dataKey="amount" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Outstanding Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Receivables Ledger</CardTitle>
          <CardDescription>Real-time tracking of contractual obligations versus actual liquidity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice ID</th>
                  <th className="px-4 py-3 font-medium">Enterprise Client</th>
                  <th className="px-4 py-3 font-medium">Issue Date</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, i) => (
                  <tr key={i} className={`border-b border-border hover:bg-muted/30 transition-colors ${invoice.status === 'paid' ? 'opacity-60 bg-muted/20' : ''}`}>
                    <td className="px-4 py-4 font-medium flex items-center gap-2">
                      <FileText size={16} className="text-muted-foreground" />
                      {invoice.id}
                    </td>
                    <td className="px-4 py-4 text-white font-medium">{invoice.client}</td>
                    <td className="px-4 py-4 text-neutral-400">{invoice.issueDate}</td>
                    <td className="px-4 py-4 text-neutral-400">{invoice.dueDate}</td>
                    <td className="px-4 py-4 text-white font-medium text-right">{formatINR(invoice.amount)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        invoice.status === 'overdue' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : invoice.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {invoice.status === 'paid' ? (
                        <div className="inline-flex items-center justify-end gap-2 text-emerald-500 text-sm font-medium px-4 py-2 w-full">
                           <CheckCircle2 size={16} /> Paid
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                           <button 
                             className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-border bg-muted hover:bg-secondary h-9 px-3 py-2 transition-colors"
                             title="Automated Escalatation"     
                           >
                             <Send size={14} className="text-amber-400" />
                           </button>
                           <button 
                             disabled={processingId === invoice.id}
                             onClick={() => handleMarkPaid(invoice.id)}
                             className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-indigo-500/50 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 h-9 px-4 py-2 transition-colors disabled:opacity-50"
                           >
                             {processingId === invoice.id ? (
                                <Loader2 size={14} className="animate-spin" />
                             ) : (
                                "Mark Paid"
                             )}
                           </button>
                        </div>
                      )}
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
