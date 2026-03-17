"use client";

import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Zap, AlertTriangle, Target, Calendar } from "lucide-react";
import { KpiCard } from "@/components/ui/KpiCard";

const monthlyTrendData = [
  { month: "Aug", amount: 18200 },
  { month: "Sep", amount: 22400 },
  { month: "Oct", amount: 24200 },
  { month: "Nov", amount: 31800 },
  { month: "Dec", amount: 28500 },
  { month: "Jan", amount: 19200 },
  { month: "Feb", amount: 22800 },
  { month: "Mar", amount: 26400 },
];

const stackedData = [
  { month: "Jan", "Food & Dining": 5200, Shopping: 3800, Transport: 2100, Others: 8100 },
  { month: "Feb", "Food & Dining": 6100, Shopping: 4200, Transport: 2500, Others: 10000 },
  { month: "Mar", "Food & Dining": 8200, Shopping: 6500, Transport: 3800, Others: 7900 },
];

const patternData = [
  { icon: Zap,          label: "Spending spike detected",       desc: "Your spend on Mar 11 was 2.3× your daily average.",       type: "warning" },
  { icon: TrendingUp,   label: "27% increase this month",       desc: "Compared to February, spending grew by ₹3,600.",          type: "info" },
  { icon: AlertTriangle,label: "Recurring payment due",         desc: "Your Netflix subscription renews in 2 days.",             type: "warning" },
  { icon: Target,       label: "You're on track",               desc: "Projected month-end spend: ₹30,200. Budget: ₹35,000.",   type: "success" },
  { icon: Calendar,     label: "High frequency: Food & Dining", desc: "You've made 18 food transactions this month.",           type: "info" },
];

const colorMap = {
  warning: { bg: "bg-warning/8", icon: "text-warning-foreground", border: "border-warning/20" },
  info:    { bg: "bg-primary/6", icon: "text-primary",            border: "border-primary/20" },
  success: { bg: "bg-success/8", icon: "text-success",            border: "border-success/20" },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: {value: number; name: string}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="text-muted-foreground mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-foreground">
          {p.name}: ₹{p.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total This Month"  value="₹26,400"       delta="+15.8% vs last"       deltaType="down"    delay={0}   />
        <KpiCard label="Avg. per Day"      value="₹880"          delta="Based on 30 days"     deltaType="neutral" delay={75}  />
        <KpiCard label="Top Category"      value="Food & Dining" delta="₹8,200 · 31% share"  deltaType="neutral" delay={150} />
        <KpiCard label="Largest Expense"   value="₹3,480"        delta="Amazon · Mar 16"      deltaType="neutral" delay={225} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spending trend */}
        <div className="chart-card animate-fade-up delay-200">
          <p className="chart-card-title">Spending Trend</p>
          <p className="chart-card-subtitle">8-month view · Line chart</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                     tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} width={44} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" stroke="var(--chart-1)" strokeWidth={2.5}
                    dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--card)" }}
                    activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stacked bar chart */}
        <div className="chart-card animate-fade-up delay-300">
          <p className="chart-card-title">Category Breakdown by Month</p>
          <p className="chart-card-subtitle">Stacked bar · Jan–Mar</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stackedData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                     tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} width={44} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
              <Bar dataKey="Food & Dining" stackId="a" fill="var(--chart-1)" radius={[0,0,0,0]} />
              <Bar dataKey="Shopping"      stackId="a" fill="var(--chart-2)" radius={[0,0,0,0]} />
              <Bar dataKey="Transport"     stackId="a" fill="var(--chart-3)" radius={[0,0,0,0]} />
              <Bar dataKey="Others"        stackId="a" fill="var(--chart-5)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area chart full width */}
      <div className="chart-card animate-fade-up delay-300">
        <p className="chart-card-title">Cumulative Spend Projection</p>
        <p className="chart-card-subtitle">Area chart — March 2025 running total</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={[
              { day: "1", spend: 620 }, { day: "5", spend: 4900 }, { day: "9", spend: 8300 },
              { day: "11", spend: 11900 }, { day: "13", spend: 14700 }, { day: "15", spend: 19500 },
              { day: "17", spend: 26400 },
            ]}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                   label={{ value: "Day of Month", position: "insideBottomRight", offset: -4, style: { fontSize: 10, fill: "var(--muted-foreground)" } }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                   tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} width={44} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="spend" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#areaGrad)"
                  dot={{ r: 3, fill: "var(--chart-1)" }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Spending patterns */}
      <div className="chart-card animate-fade-up delay-400">
        <p className="chart-card-title mb-1">Spending Patterns & Alerts</p>
        <p className="chart-card-subtitle mb-4">AI-detected observations · March 2025</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {patternData.map((pattern, i) => {
            const colors = colorMap[pattern.type as keyof typeof colorMap];
            const Icon = pattern.icon;
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${colors.border} ${colors.bg} animate-fade-up`}
                style={{ animationDelay: `${400 + i * 60}ms` }}
              >
                <div className={`mt-0.5 ${colors.icon} shrink-0`}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{pattern.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{pattern.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
