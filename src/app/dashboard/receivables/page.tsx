"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getInvoicesData, markInvoiceAsPaid } from "@/lib/db";
import { Invoice } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, FileText, Send, Database, CheckCircle2, Loader2 } from "lucide-react";

export default function ReceivablesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || !user.id) return;
      try {
        const data = await getInvoicesData(user.id);
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
      await markInvoiceAsPaid(user.id, invoiceId);
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
     return <div className="animate-pulse space-y-6">Loading AR Ledger from Firestore...</div>;
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-1">Accounts Receivable</h2>
          <p className="text-sm text-neutral-400">Automated collections and invoice aging tracking based on the &apos;Delayed Payment Epidemic&apos; analysis.</p>
        </div>
      </div>

      {/* AR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-neutral-400 mb-1">Total Outstanding (MRR Illusion)</p>
            <h3 className="text-3xl font-bold text-white mb-2">${totalUncollected.toLocaleString()}</h3>
            <p className="text-xs text-neutral-500">Contracted, but acting as an unsecured loan to clients.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-950/20 border-red-900/40 ring-1 ring-red-500/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-red-400 mb-1 flex items-center gap-2">
              <AlertCircle size={16} />
              Severely Overdue
            </p>
            <h3 className="text-3xl font-bold text-red-400 mb-2">${totalOverdue.toLocaleString()}</h3>
            <p className="text-xs text-red-500/80">Immediate runway impact. Requires immediate escalation.</p>
          </CardContent>
        </Card>

        <Card className="bg-indigo-950/20 border-indigo-900/40">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-indigo-400 mb-1">Collection Efficiency</p>
            <h3 className="text-3xl font-bold text-indigo-400 mb-2">{Math.min(currentEfficiency, 100)}%</h3>
            <p className="text-xs text-indigo-500/80">Industry benchmark is 85%.</p>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Invoices List */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Active Receivables Ledger</CardTitle>
          <CardDescription className="text-neutral-400">Real-time tracking of contractual obligations versus actual liquidity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-neutral-950 text-neutral-400 border-b border-neutral-800">
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
                  <tr key={i} className={`border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors ${invoice.status === 'paid' ? 'opacity-60 bg-neutral-950 flex-none' : ''}`}>
                    <td className="px-4 py-4 text-neutral-300 font-medium flex items-center gap-2">
                      <FileText size={16} className="text-neutral-500" />
                      {invoice.id}
                    </td>
                    <td className="px-4 py-4 text-white font-medium">{invoice.client}</td>
                    <td className="px-4 py-4 text-neutral-400">{invoice.issueDate}</td>
                    <td className="px-4 py-4 text-neutral-400">{invoice.dueDate}</td>
                    <td className="px-4 py-4 text-white font-medium text-right">${invoice.amount.toLocaleString()}</td>
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
                             className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 hover:text-white h-9 px-3 py-2 transition-colors"
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
