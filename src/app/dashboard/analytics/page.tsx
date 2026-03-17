"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const categoryPie = [
  { name: "Food & Dining",  value: 8200 },
  { name: "Shopping",       value: 6500 },
  { name: "Transport",      value: 3800 },
  { name: "Entertainment",  value: 2900 },
  { name: "Utilities",      value: 5000 },
];

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const monthlyBarData = [
  { month: "Oct", "Food & Dining": 6200, Shopping: 4100, Transport: 2300, Utilities: 4800 },
  { month: "Nov", "Food & Dining": 7800, Shopping: 5900, Transport: 3100, Utilities: 5200 },
  { month: "Dec", "Food & Dining": 9100, Shopping: 7200, Transport: 2800, Utilities: 4800 },
  { month: "Jan", "Food & Dining": 5200, Shopping: 3800, Transport: 2100, Utilities: 4500 },
  { month: "Feb", "Food & Dining": 6100, Shopping: 4200, Transport: 2500, Utilities: 4700 },
  { month: "Mar", "Food & Dining": 8200, Shopping: 6500, Transport: 3800, Utilities: 5000 },
];

const trendLineData = [
  { month: "Aug", amount: 18200 },
  { month: "Sep", amount: 22400 },
  { month: "Oct", amount: 24200 },
  { month: "Nov", amount: 31800 },
  { month: "Dec", amount: 28500 },
  { month: "Jan", amount: 19200 },
  { month: "Feb", amount: 22800 },
  { month: "Mar", amount: 26400 },
];

// Heatmap data — daily intensity across 4 weeks
const heatmapData = Array.from({ length: 28 }, (_, i) => ({
  day: i + 1,
  value: Math.round(Math.random() * 5000 + 200),
}));

const heatmapMax = Math.max(...heatmapData.map((d) => d.value));

function HeatmapCell({ value, max }: { value: number; max: number }) {
  const intensity = value / max;
  const opacity = 0.08 + intensity * 0.85;
  return (
    <div
      title={`₹${value.toLocaleString("en-IN")}`}
      className="rounded aspect-square cursor-pointer hover:scale-110 transition-transform duration-150"
      style={{
        background: `color-mix(in oklch, var(--chart-1) ${(opacity * 100).toFixed(0)}%, var(--muted))`,
        minWidth: "28px",
        minHeight: "28px",
      }}
    />
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: {value: number; name: string}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-foreground">{p.name}: ₹{p.value.toLocaleString("en-IN")}</p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("Last 6 months");
  const total = categoryPie.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-5">
      {/* Header + filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground">Deep-dive into your spending data</p>
        </div>
        <div className="relative">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="field-input h-9 pr-8 appearance-none cursor-pointer text-sm"
          >
            {["This month", "Last 3 months", "Last 6 months", "This year"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Row 1: Donut + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Donut */}
        <div className="chart-card lg:col-span-2 animate-fade-up delay-100">
          <p className="chart-card-title">Category Distribution</p>
          <p className="chart-card-subtitle">Current month · ₹{total.toLocaleString("en-IN")} total</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryPie} cx="50%" cy="50%" innerRadius={60} outerRadius={82}
                   paddingAngle={3} dataKey="value" strokeWidth={0}>
                {categoryPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {categoryPie.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-foreground">₹{c.value.toLocaleString("en-IN")}</span>
                  <span className="text-muted-foreground w-8 text-right">{Math.round((c.value / total) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar comparison */}
        <div className="chart-card lg:col-span-3 animate-fade-up delay-200">
          <p className="chart-card-title">Category Comparison by Month</p>
          <p className="chart-card-subtitle">Grouped bar — Oct–Mar</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyBarData} barCategoryGap="30%" barGap={2} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                     tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} width={44} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
              <Bar dataKey="Food & Dining" fill="var(--chart-1)" radius={[3,3,0,0]} />
              <Bar dataKey="Shopping"      fill="var(--chart-2)" radius={[3,3,0,0]} />
              <Bar dataKey="Transport"     fill="var(--chart-3)" radius={[3,3,0,0]} />
              <Bar dataKey="Utilities"     fill="var(--chart-5)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Line chart */}
      <div className="chart-card animate-fade-up delay-300">
        <p className="chart-card-title">8-Month Spending Trend</p>
        <p className="chart-card-subtitle">Total monthly expenditure · Line chart</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trendLineData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                   tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} width={44} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="amount" stroke="var(--chart-1)" strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--card)" }} activeDot={{ r: 5.5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Daily heatmap */}
      <div className="chart-card animate-fade-up delay-400">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="chart-card-title">Daily Spending Intensity</p>
            <p className="chart-card-subtitle">Heatmap — March 2025 · Hover for amount</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Low</span>
            <div className="flex gap-0.5">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
                <div key={o} className="w-4 h-4 rounded-sm"
                     style={{ background: `color-mix(in oklch, var(--chart-1) ${(o * 100).toFixed(0)}%, var(--muted))` }} />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {heatmapData.map((d) => (
            <HeatmapCell key={d.day} value={d.value} max={heatmapMax} />
          ))}
        </div>
        <div className="flex gap-1 mt-1 flex-wrap">
          {heatmapData.map((d) => (
            <div key={d.day} className="text-[9px] text-muted-foreground/60 text-center" style={{ minWidth: 28 }}>
              {d.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
