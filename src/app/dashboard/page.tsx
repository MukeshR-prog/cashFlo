"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDashboardMetrics, getCashFlowData, getRevenueData, getAlertsData, seedUserData } from "@/lib/db";
import { AnomalyAlert, CashFlowDay } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle, TrendingDown, TrendingUp, AlertCircle, Clock, Database } from "lucide-react";

type DashboardMetrics = {
  totalCash: number;
  monthlyBurn: number;
  predictedRunwayMonths: number;
  uncollectedAR: number;
  runwayZeroDate: string;
};

type RevenuePoint = {
  month: string;
  cashBookings: number;
  accrualRevenue: number;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowDay[]>([]);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user || !user.id) return;
      try {
        const [m, c, r, a] = await Promise.all([
          getDashboardMetrics(user.id),
          getCashFlowData(user.id),
          getRevenueData(user.id),
          getAlertsData(user.id)
        ]);
        
        setMetrics(m as DashboardMetrics);
        setCashFlow(c as CashFlowDay[]);
        setRevenue(r as RevenuePoint[]);
        setAlerts(a as AnomalyAlert[]);
      } catch (error) {
        console.error("Error loading Dashboard Data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleSeed = async () => {
    if (!user || !user.id) return;
    setIsSeeding(true);
    try {
      await seedUserData(user.id);
      window.location.reload(); // Reload to fetch fresh data
    } catch (error) {
       console.error("Error seeding data:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-6">Loading Financial Data from Firestore...</div>;
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <Database size={48} className="text-neutral-600 mb-4" />
        <h2 className="text-2xl font-display font-medium text-white">No Financial Data Found</h2>
        <p className="text-neutral-400 max-w-md">Your Firebase Firestore database is empty. For this hackathon MVP, we need to seed the database with the &quot;Financial Crucible&quot; problem set data.</p>
        <button 
          onClick={handleSeed}
          disabled={isSeeding}
          className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          {isSeeding ? "Seeding Database..." : "Seed Hackathon Mock Data to Firestore"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Cash" 
          value={`$${metrics.totalCash.toLocaleString()}`} 
          trend="-12.5% from last month"
          icon={<TrendingDown className="text-red-400" size={20} />}
        />
        <MetricCard 
          title="Monthly Burn Rate" 
          value={`$${metrics.monthlyBurn.toLocaleString()}`} 
          trend="+5.2% from last month (Warning)"
          icon={<AlertTriangle className="text-amber-400" size={20} />}
          isWarning
        />
        <MetricCard 
          title="Predicted Runway" 
          value={`${metrics.predictedRunwayMonths} Months`} 
          trend={`Zero Date: ${metrics.runwayZeroDate}`}
          icon={<Clock className="text-blue-400" size={20} />}
        />
        <MetricCard 
          title="Uncollected A/R" 
          value={`$${metrics.uncollectedAR.toLocaleString()}`} 
          trend="3 Invoices Overdue"
          icon={<TrendingUp className="text-indigo-400" size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Issue 1: Cash vs Accrual */}
        <Card className="lg:col-span-2 bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Revenue Reality Check</CardTitle>
            <CardDescription className="text-neutral-400">Cash Inflows (Bookings) vs GAAP Accrual Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAccrual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                  <Area type="monotone" dataKey="cashBookings" name="Cash Bookings (Illusion)" stroke="#10b981" fillOpacity={1} fill="url(#colorCash)" />
                  <Area type="monotone" dataKey="accrualRevenue" name="Accrual Revenue (Reality)" stroke="#6366f1" fillOpacity={1} fill="url(#colorAccrual)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 rounded-md bg-neutral-800/50 border border-neutral-700/50 text-sm text-neutral-300">
              <span className="font-semibold text-white">Insight:</span> The massive cash spike in April is a 12-month upfront enterprise contract. It does not represent sustained profitability.
            </div>
          </CardContent>
        </Card>

        {/* AI Copilot Alerts */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BrainCircuit className="text-indigo-400" size={20} />
              AI Copilot Alerts
            </CardTitle>
            <CardDescription className="text-neutral-400">Systemic risks detected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 rounded-lg border border-neutral-800 bg-neutral-950">
                <div className="flex items-start gap-3">
                  {alert.severity === 'critical' ? (
                    <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
                  ) : alert.severity === 'high' ? (
                    <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={18} />
                  ) : (
                    <AlertCircle className="text-blue-500 mt-0.5 shrink-0" size={18} />
                  )}
                  <div>
                    <h4 className={`text-sm font-semibold mb-1 ${alert.severity === 'critical' ? 'text-red-400' : 'text-neutral-200'}`}>
                      {alert.title}
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {alert.description}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-2">{alert.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Core Issue 2: 13-Week Cash Flow */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">13-Week Liquidity Trap Predictor</CardTitle>
          <CardDescription className="text-neutral-400">Visualizing structural misalignment between inflows and non-negotiable obligations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Week Of</th>
                  <th className="px-4 py-3 font-medium">Starting</th>
                  <th className="px-4 py-3 font-medium text-emerald-400">Inflow</th>
                  <th className="px-4 py-3 font-medium text-red-400">Outflow</th>
                  <th className="px-4 py-3 font-medium">Ending</th>
                  <th className="px-4 py-3 font-medium">Critical Event Trigger</th>
                </tr>
              </thead>
              <tbody>
                {cashFlow.map((row, i) => (
                  <tr key={i} className={`border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors ${row.endingBalance < 600000 ? 'bg-red-950/20' : ''}`}>
                    <td className="px-4 py-3 text-neutral-300 font-medium">{row.date}</td>
                    <td className="px-4 py-3 text-neutral-400">${row.startingBalance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-400">{row.inflow > 0 ? `+ $${row.inflow.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3 text-red-400">-${(row.outflow).toLocaleString()}</td>
                    <td className={`px-4 py-3 font-bold ${row.endingBalance < 600000 ? 'text-red-400' : 'text-white'}`}>
                      ${row.endingBalance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {row.hasCriticalEvent ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                          <AlertTriangle size={12} className={row.inflow > 0 ? 'text-emerald-400' : 'text-amber-400'} />
                          {row.criticalEventName}
                        </span>
                      ) : (
                        <span className="text-neutral-600">-</span>
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

function MetricCard({ title, value, trend, icon, isWarning = false }: { title: string, value: string, trend: string, icon: React.ReactNode, isWarning?: boolean }) {
  return (
    <Card className={`bg-neutral-900 border-neutral-800 ${isWarning ? 'ring-1 ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-neutral-400">{title}</p>
          <div className="p-2 bg-neutral-950 rounded-md border border-neutral-800">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
          <p className={`text-xs ${isWarning ? 'text-red-400 font-medium' : 'text-neutral-500'}`}>
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function BrainCircuit(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-5.224 4.668A4 4 0 0 0 5.94 18.25a3 3 0 1 0 5.939-.125 4 4 0 0 0 5.224-4.668A4 4 0 0 0 12.06 5.75A3 3 0 1 0 12 5z" /><path d="M16.5 13H19a2 2 0 0 0 2-2v-2" /><path d="M12 18.5V21" /><path d="M12 8.5V11" /><path d="M8.5 15H11" /><path d="M16 8.5H13.5" /></svg>
}
