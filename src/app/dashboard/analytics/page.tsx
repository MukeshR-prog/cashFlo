"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { format } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CategoryItem { name: string; value: number }
interface CategoryData  { categories: CategoryItem[] }

interface MonthlyRow  { month: string; [category: string]: number | string }
interface MonthlyData { monthly: MonthlyRow[] }

interface TrendRow  { month: string; amount: number }
interface TrendData { trend: TrendRow[] }

interface HeatEntry { date: string; value: number }
interface HeatData  { heatmap: HeatEntry[] }

// ── Mock fallback data ─────────────────────────────────────────────────────────

const MOCK_CATEGORIES: CategoryData = {
  categories: [
    { name: "Food & Dining",  value: 8200 },
    { name: "Shopping",       value: 6500 },
    { name: "Transport",      value: 3800 },
    { name: "Entertainment",  value: 2900 },
    { name: "Utilities",      value: 5000 },
  ],
};

const MOCK_MONTHLY: MonthlyData = {
  monthly: [
    { month: "Oct", "Food & Dining": 6200, Shopping: 4100, Transport: 2300, Utilities: 4800 },
    { month: "Nov", "Food & Dining": 7800, Shopping: 5900, Transport: 3100, Utilities: 5200 },
    { month: "Dec", "Food & Dining": 9100, Shopping: 7200, Transport: 2800, Utilities: 4800 },
    { month: "Jan", "Food & Dining": 5200, Shopping: 3800, Transport: 2100, Utilities: 4500 },
    { month: "Feb", "Food & Dining": 6100, Shopping: 4200, Transport: 2500, Utilities: 4700 },
    { month: "Mar", "Food & Dining": 8200, Shopping: 6500, Transport: 3800, Utilities: 5000 },
  ],
};

const MOCK_TREND: TrendData = {
  trend: [
    { month: "Aug", amount: 18200 },
    { month: "Sep", amount: 22400 },
    { month: "Oct", amount: 24200 },
    { month: "Nov", amount: 31800 },
    { month: "Dec", amount: 28500 },
    { month: "Jan", amount: 19200 },
    { month: "Feb", amount: 22800 },
    { month: "Mar", amount: 26400 },
  ],
};

// 28-day generated heatmap used as fallback
const MOCK_HEATMAP: HeatData = {
  heatmap: Array.from({ length: 28 }, (_, i) => ({
    date: format(new Date(Date.now() - (27 - i) * 86400000), "yyyy-MM-dd"),
    value: Math.round(Math.random() * 5000 + 200),
  })),
};

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const ALL_CATS     = ["Food & Dining", "Shopping", "Transport", "Entertainment", "Utilities"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function monthLabel(raw: string) {
  if (raw.length === 7) {
    try { return format(new Date(`${raw}-01`), "MMM"); } catch { return raw; }
  }
  return raw;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-foreground">{p.name}: ₹{Number(p.value).toLocaleString("en-IN")}</p>
      ))}
    </div>
  );
}

function HeatCell({ value, max }: { value: number; max: number }) {
  const intensity = max > 0 ? value / max : 0;
  const opacity = 0.08 + intensity * 0.85;
  return (
    <div
      title={`₹${value.toLocaleString("en-IN")}`}
      className="rounded aspect-square cursor-pointer hover:scale-110 transition-transform duration-150"
      style={{
        background: `color-mix(in oklch, var(--chart-1) ${(opacity * 100).toFixed(0)}%, var(--muted))`,
        minWidth: 28, minHeight: 28,
      }}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("Last 6 months");

  const rangeConfig: Record<string, { monthlyMonths: number; trendMonths: number; heatDays: number; label: string }> = {
    "This month": { monthlyMonths: 1, trendMonths: 3, heatDays: 31, label: "This month" },
    "Last 3 months": { monthlyMonths: 3, trendMonths: 3, heatDays: 90, label: "Last 3 months" },
    "Last 6 months": { monthlyMonths: 6, trendMonths: 6, heatDays: 180, label: "Last 6 months" },
    "This year": { monthlyMonths: 12, trendMonths: 12, heatDays: 365, label: "This year" },
  };

  const selectedRange = rangeConfig[dateRange] ?? rangeConfig["Last 6 months"];

  const { data: catData,     loading: loadingC, isEmpty: emptyC } =
    useDashboardData<CategoryData>({
      url: `/api/analytics/category?months=${selectedRange.monthlyMonths}`,
      mockData: MOCK_CATEGORIES,
      isEmpty: (d) => !d?.categories?.length,
    });

  const { data: monthlyData, loading: loadingM, isEmpty: emptyM } =
    useDashboardData<MonthlyData>({
      url: `/api/analytics/monthly?months=${selectedRange.monthlyMonths}`,
      mockData: MOCK_MONTHLY,
      isEmpty: (d) => !d?.monthly?.length,
    });

  const { data: trendData,   loading: loadingT, isEmpty: emptyT } =
    useDashboardData<TrendData>({
      url: `/api/analytics/trends?months=${selectedRange.trendMonths}`,
      mockData: MOCK_TREND,
      isEmpty: (d) => !d?.trend?.length,
    });

  const { data: heatData,    loading: loadingH, isEmpty: emptyH } =
    useDashboardData<HeatData>({
      url: `/api/analytics/heatmap?days=${selectedRange.heatDays}`,
      mockData: MOCK_HEATMAP,
      isEmpty: (d) => !d?.heatmap?.length,
    });

  const categories = catData?.categories ?? MOCK_CATEGORIES.categories;
  const totalCat   = categories.reduce((s, c) => s + c.value, 0);

  const monthly = (monthlyData?.monthly ?? MOCK_MONTHLY.monthly).map((row) => ({
    ...row,
    month: monthLabel(String(row.month)),
  }));

  const trend = (trendData?.trend ?? MOCK_TREND.trend).map((row) => ({
    ...row,
    month: monthLabel(row.month),
  }));

  const heatmap    = heatData?.heatmap ?? MOCK_HEATMAP.heatmap;
  const heatmapMax = Math.max(...heatmap.map((h) => h.value), 1);

  const isDemo = emptyC || emptyM || emptyT || emptyH;
  const loading = loadingC || loadingM || loadingT || loadingH;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            {isDemo ? "Sample data — add expenses to see your real analytics" : "Deep-dive into your spending data"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDemo && <span className="badge badge-neutral text-[10px]">Demo</span>}
          <div className="relative">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="field-input h-12 pr-8 appearance-none cursor-pointer text-sm">
              {["This month", "Last 3 months", "Last 6 months", "This year"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 1: Donut + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Donut */}
        <div className="chart-card lg:col-span-2 animate-fade-up delay-100">
          <p className="chart-card-title">Category Distribution</p>
          <p className="chart-card-subtitle">
            {loading ? "Loading…" : `₹${totalCat.toLocaleString("en-IN")} total`}
          </p>
          {loadingC ? (
            <div className="h-[200px] bg-muted/50 animate-pulse rounded-lg mt-2" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categories} cx="50%" cy="50%" innerRadius={60} outerRadius={82}
                     paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {categories.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-1.5">
            {categories.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-foreground">₹{c.value.toLocaleString("en-IN")}</span>
                  <span className="text-muted-foreground w-8 text-right">{totalCat ? Math.round((c.value / totalCat) * 100) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grouped Bar */}
        <div className="chart-card lg:col-span-3 animate-fade-up delay-200">
          <p className="chart-card-title">Category Comparison by Month</p>
          <p className="chart-card-subtitle">Grouped bar · {monthly.length} months</p>
          {loadingM ? (
            <div className="h-[280px] bg-muted/50 animate-pulse rounded-lg mt-2" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} barCategoryGap="30%" barGap={2} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={44} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} />
                {ALL_CATS.map((cat, i) => (
                  <Bar key={cat} dataKey={cat} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2: Trend */}
      <div className="chart-card animate-fade-up delay-300">
        <p className="chart-card-title">Spending Trend</p>
        <p className="chart-card-subtitle">Total monthly expenditure · Line chart</p>
        {loadingT ? (
          <div className="h-[180px] bg-muted/50 animate-pulse rounded-lg mt-2" />
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false}
                     tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} width={44} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" stroke="var(--chart-1)" strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--card)" }} activeDot={{ r: 5.5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row 3: Heatmap */}
      <div className="chart-card animate-fade-up delay-400">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="chart-card-title">Daily Spending Intensity</p>
            <p className="chart-card-subtitle">Heatmap · {selectedRange.label} — hover for amount</p>
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
        {loadingH ? (
          <div className="h-[80px] bg-muted/50 animate-pulse rounded-lg" />
        ) : (
          <>
            <div className="flex gap-1 flex-wrap">
              {heatmap.map((d) => <HeatCell key={d.date} value={d.value} max={heatmapMax} />)}
            </div>
            <div className="flex gap-1 mt-1 flex-wrap">
              {heatmap.map((d) => (
                <div key={d.date} className="text-[9px] text-muted-foreground/60 text-center" style={{ minWidth: 28 }}>
                  {new Date(d.date).getDate()}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
