"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAlertsData, getDashboardMetrics } from "@/lib/db";
import { AnomalyAlert } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Send, Sparkles, TrendingDown, AlertTriangle, Database } from "lucide-react";

type DashboardMetrics = {
  monthlyBurn: number;
  predictedRunwayMonths: number;
};

export default function CopilotPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user || !user.id) return;
      try {
        const [a, m] = await Promise.all([
          getAlertsData(user.id),
          getDashboardMetrics(user.id)
        ]);
        setAlerts(a as AnomalyAlert[]);
        setMetrics(m as DashboardMetrics);
      } catch (error) {
        console.error("Error loading Copilot Data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
     return <div className="animate-pulse space-y-6">Starting AI Analysis Engine...</div>;
  }

  if (!metrics) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <Database size={48} className="text-neutral-600 mb-4" />
          <h2 className="text-2xl font-display font-medium text-white">No Financial Data Found</h2>
          <p className="text-neutral-400">Head back to the Command Center and click &quot;Seed Data&quot; first.</p>
        </div>
      );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white mb-1">FundSight AI Copilot</h2>
        <p className="text-sm text-neutral-400">Query your financial data using natural language instead of pivot tables.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Side - Context & Suggestions */}
        <div className="space-y-4 overflow-y-auto pr-2">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-300 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" />
                Suggested Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full text-left p-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-neutral-300 hover:border-indigo-500/50 hover:bg-neutral-800 transition-colors">
                What is our zero cash date if we hire 3 engineers at $120k next month?
              </button>
              <button className="w-full text-left p-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-neutral-300 hover:border-indigo-500/50 hover:bg-neutral-800 transition-colors">
                Which vendors are increasing prices faster than our MRR growth?
              </button>
              <button className="w-full text-left p-3 rounded-md bg-neutral-950 border border-neutral-800 text-sm text-neutral-300 hover:border-indigo-500/50 hover:bg-neutral-800 transition-colors">
                Show me all enterprise clients who consistently pay past Net-60.
              </button>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-300 flex items-center gap-2">
                <TrendingDown size={16} className="text-red-400" />
                Active Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Current Runway</span>
                <span className="text-red-400 font-medium">{metrics.predictedRunwayMonths} Months</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Burn Rate</span>
                <span className="text-white">${metrics.monthlyBurn.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Active Anomalies</span>
                <span className="text-amber-400">{alerts.length} Detected</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Chat Interface */}
        <Card className="md:col-span-2 bg-neutral-900 border-neutral-800 flex flex-col h-full">
          <CardHeader className="border-b border-neutral-800 pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <BrainCircuit className="text-indigo-400" size={20} />
              Financial Intelligence
            </CardTitle>
            <CardDescription className="text-neutral-400">AI is analyzing your ledger, cap table, and AR in real-time.</CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Mock Initial Message Based on DB Data */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <BrainCircuit size={16} className="text-indigo-400" />
              </div>
              <div className="space-y-2 max-w-[80%]">
                <div className="p-3 rounded-2xl rounded-tl-sm bg-neutral-800 text-sm text-neutral-200 leading-relaxed">
                  Hi Founder. I&apos;ve analyzed your latest P&L and cash flow matrix. 
                  <br/><br/>
                  I&apos;m currently tracking <strong className="text-amber-400">{alerts.length} structural anomalies</strong> attached to your {metrics.predictedRunwayMonths} months of runway. 
                  <br/><br/>
                  How can I help you scenario plan today?
                </div>
              </div>
            </div>
            
            {alerts.length > 0 && alerts[0].severity === 'critical' && (
              <div className="pl-12">
                <div className="p-3 rounded-lg border border-red-900/50 bg-red-950/20 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-xs font-semibold text-red-400">System Alert</span>
                  </div>
                  <p className="text-xs text-red-300">{alerts[0].description}</p>
                  <div className="mt-2 flex gap-2">
                    <button className="text-[10px] px-2 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded transition-colors">Draft Escalatation Email</button>
                    <button className="text-[10px] px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors">Simulate Bridge Loan</button>
                  </div>
                </div>
              </div>
            )}
            
          </CardContent>

          <div className="p-4 border-t border-neutral-800 bg-neutral-950/50 rounded-b-xl">
            <div className="relative">
              <Input 
                placeholder="Ask about your runway, burn rate, or specific vendors..." 
                className="w-full bg-neutral-900 border-neutral-700 text-white pl-4 pr-12 py-6 rounded-xl focus-visible:ring-indigo-500/50"
              />
              <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-600 h-9 w-9 rounded-lg">
                <Send size={16} />
              </Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
