"use client";

import { useState } from "react";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "@/components/ui/Toaster";
import { DatePickerInput } from "@/components/ui/DatePickerInput";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: "BUSINESS" | "PERSONAL";
  notes: string;
}

interface ExpenseResponse {
  expenses: Expense[];
}

const MOCK_EXPENSES: ExpenseResponse = { expenses: [] };

const categories = ["All", "Software", "Infrastructure", "Health", "Food", "Travel", "Communication", "Marketing", "Misc"];
const types = ["All", "BUSINESS", "PERSONAL"];

export default function FreelancerExpensesPage() {
  const [catFilter, setCatFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const hasActiveFilters = typeFilter !== "All" || catFilter !== "All" || Boolean(dateFilter);

  const params = new URLSearchParams();
  params.set("limit", "100");
  if (catFilter !== "All") params.set("category", catFilter);
  if (typeFilter !== "All") params.set("type", typeFilter);
  if (dateFilter) {
    params.set("from", dateFilter);
    params.set("to", dateFilter);
  }

  const { data, loading } = useDashboardData<ExpenseResponse>({
    url: `/api/expenses?${params.toString()}`,
    mockData: MOCK_EXPENSES,
    isEmpty: (d) => !d?.expenses,
  });

  const expenses = data?.expenses ?? [];

  const filtered = expenses.filter((e) =>
    (catFilter === "All" || e.category === catFilter) &&
    (typeFilter === "All" || e.type === typeFilter)
  );

  const totals = {
    business: filtered.filter((e) => e.type === "BUSINESS").reduce((s, e) => s + e.amount, 0),
    personal: filtered.filter((e) => e.type === "PERSONAL").reduce((s, e) => s + e.amount, 0),
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/freelancer/export?type=expenses&format=csv", { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        toast.error("Export failed", err.error ?? "Please try again.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "freelancer-expenses.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export ready", "Expenses CSV downloaded.");
    } catch {
      toast.error("Network error", "Could not reach the server.");
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { href: "/freelancer/expenses", label: "All Expenses" },
            { href: "/freelancer/expenses/add", label: "Add Expense" },
            { href: "/freelancer/expenses/categories", label: "Categories" },
            { href: "/freelancer/expenses/business-personal", label: "Business vs Personal" },
          ].map((tab) => (
            <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/expenses" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm gap-1.5" onClick={handleExport}><Download size={14} /> Export</button>
          <Link href="/freelancer/expenses/add" className="btn btn-primary btn-sm gap-1.5">
            <Plus size={14} /> Add Expense
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Business</p>
          <p className="kpi-value text-xl text-primary">₹{totals.business.toLocaleString("en-IN")}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Personal</p>
          <p className="kpi-value text-xl text-foreground">₹{totals.personal.toLocaleString("en-IN")}</p>
        </div>
        <div className="kpi-card py-3 px-4">
          <p className="kpi-label mb-1">Total</p>
          <p className="kpi-value text-xl">₹{(totals.business + totals.personal).toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="premium-card rounded-2xl px-4 py-4 md:px-5 md:py-5 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            {/* <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary/75">Smart Filters</p> */}
            <p className="text-sm font-semibold text-foreground">Refine expense results</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-muted-foreground">Date</span>
            <DatePickerInput
              className="w-44"
              inputClassName="text-xs"
              value={dateFilter}
              onChange={setDateFilter}
              ariaLabel="Filter by date"
              title="Filter by date"
            />
            <button
              type="button"
              onClick={() => {
                setTypeFilter("All");
                setCatFilter("All");
                setDateFilter("");
              }}
              disabled={!hasActiveFilters}
              className="btn btn-ghost btn-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                typeFilter === t
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
          <div className="flex items-center gap-1.5 w-max pr-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  catFilter === c
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="chart-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Created</th>
              <th>Added By</th>
              <th>Type</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-sm text-muted-foreground">Loading expenses...</td></tr>
            ) : filtered.map((exp) => (
              <tr key={exp.id}>
                <td className="font-medium text-foreground">{exp.title}</td>
                <td className="stat-number font-semibold">₹{exp.amount.toLocaleString("en-IN")}</td>
                <td><span className="badge badge-secondary">{exp.category}</span></td>
                <td className="text-xs text-muted-foreground">{new Date(exp.date).toISOString().split("T")[0]}</td>
                <td className="text-xs text-muted-foreground">{new Date(exp.date).toISOString().split("T")[0]}</td>
                <td className="text-xs text-muted-foreground">You</td>
                <td>
                  <span className={`badge text-[10px] ${exp.type === "BUSINESS" ? "badge-primary" : "badge-neutral"}`}>
                    {exp.type}
                  </span>
                </td>
                <td className="max-w-40 truncate text-xs text-muted-foreground">{exp.notes || "—"}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-sm text-muted-foreground">No expenses found for the selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
