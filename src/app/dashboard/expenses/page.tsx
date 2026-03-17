"use client";

import { useState } from "react";
import {
  Search, Filter, Plus, ChevronDown, ChevronLeft, ChevronRight,
  ArrowUpDown, Download, Trash2, Pencil, Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "@/components/ui/Toaster";

// ── Types / constants ─────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Food & Dining", "Shopping", "Transport", "Entertainment", "Utilities", "Health", "Income"];
const PAYMENT_MODES = ["All Modes", "UPI", "Credit Card", "Debit Card", "Cash", "Net Banking"];

interface Expense {
  id: string;
  date: string;
  title: string;
  category: string;
  amount: number;
  paymentMode: string | null;
  notes: string;
  type: "BUSINESS" | "PERSONAL";
}

interface ExpenseResponse {
  expenses: Expense[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// ── Mock Fallback ─────────────────────────────────────────────────────────────

const MOCK_EXPENSES: ExpenseResponse = {
  expenses: [
    { id: "1",  date: new Date().toISOString(),                   title: "Swiggy Order",         category: "Food & Dining",  amount: 620,   paymentMode: "UPI",         notes: "Dinner",    type: "PERSONAL" },
    { id: "2",  date: new Date(Date.now()-86400000).toISOString(),  title: "Amazon Purchase",      category: "Shopping",       amount: 3480,  paymentMode: "Credit Card", notes: "Headphones",type: "PERSONAL" },
    { id: "3",  date: new Date(Date.now()-172800000).toISOString(), title: "Metro Card Recharge",  category: "Transport",      amount: 500,   paymentMode: "UPI",         notes: "",          type: "PERSONAL" },
    { id: "4",  date: new Date(Date.now()-259200000).toISOString(), title: "Netflix Subscription", category: "Entertainment",  amount: 649,   paymentMode: "Credit Card", notes: "Monthly",   type: "PERSONAL" },
    { id: "5",  date: new Date(Date.now()-345600000).toISOString(), title: "Electricity Bill",      category: "Utilities",      amount: 2300,  paymentMode: "Net Banking", notes: "Mar bill",  type: "PERSONAL" },
    { id: "6",  date: new Date(Date.now()-432000000).toISOString(), title: "Gym Membership",        category: "Health",         amount: 1800,  paymentMode: "UPI",         notes: "",          type: "PERSONAL" },
    { id: "7",  date: new Date(Date.now()-518400000).toISOString(), title: "Petrol",               category: "Transport",      amount: 1200,  paymentMode: "Cash",        notes: "",          type: "PERSONAL" },
    { id: "8",  date: new Date(Date.now()-604800000).toISOString(), title: "Zomato",               category: "Food & Dining",  amount: 385,   paymentMode: "UPI",         notes: "Lunch",     type: "PERSONAL" },
    { id: "9",  date: new Date(Date.now()-691200000).toISOString(), title: "Flipkart",             category: "Shopping",       amount: 2100,  paymentMode: "Debit Card",  notes: "Clothes",   type: "PERSONAL" },
  ],
  pagination: { page: 1, limit: 20, total: 9, totalPages: 1 },
};

const categoryBadge: Record<string, string> = {
  "Food & Dining": "badge-primary", Shopping: "badge-accent", Transport: "badge-neutral",
  Entertainment: "badge-warning", Utilities: "badge-secondary", Health: "badge-success",
  Income: "badge-success",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const [page, setPage]                     = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery]       = useState("");
  const [showAddForm, setShowAddForm]       = useState(false);
  const [sortAsc, setSortAsc]              = useState(false);

  // Form state
  const [amount, setAmount]           = useState("");
  const [date, setDate]               = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory]       = useState("Food & Dining");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [notes, setNotes]             = useState("");
  const [submitting, setSubmitting]   = useState(false);

  // Build URL with filters
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "20");
  if (selectedCategory !== "All") params.set("category", selectedCategory);
  if (searchQuery)                 params.set("search", searchQuery);

  const { data, loading, isEmpty, refetch } = useDashboardData<ExpenseResponse>({
    url: `/api/expenses?${params.toString()}`,
    mockData: MOCK_EXPENSES,
    isEmpty: (d) => !d?.expenses?.length,
  });

  const expenses = (data?.expenses ?? []).sort((a, b) =>
    sortAsc ? a.amount - b.amount : b.amount - a.amount
  );
  const pagination = data?.pagination ?? MOCK_EXPENSES.pagination;

  // ── Add expense ──────────────────────────────────────────────────────────
  const handleAddExpense = async () => {
    if (!amount || !date) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: description || category,
          amount: parseFloat(amount),
          category,
          date,
          paymentMode,
          notes,
          type: "PERSONAL",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error("Failed to add expense", err.error ?? "Unknown error");
        return;
      }
      toast.success("Expense added", `₹${parseFloat(amount).toLocaleString("en-IN")} · ${category}`);
      setShowAddForm(false);
      setAmount(""); setDescription(""); setNotes("");
      void refetch();
    } catch {
      toast.error("Network error", "Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">All Expenses</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${pagination.total} entries · ${isEmpty ? "Sample data" : "Live"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm gap-1.5">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary btn-sm gap-1.5">
            <Plus size={14} /> Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search expenses…" value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="field-input pl-9 py-2 text-sm h-9" />
        </div>
        <div className="relative">
          <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="field-input h-9 pr-8 appearance-none cursor-pointer text-sm">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <button className="btn btn-outline btn-sm gap-1.5">
          <Filter size={13} /> More filters
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-fade-up delay-100">
        {loading ? (
          <div className="p-6 space-y-3">
            {[0,1,2,3,4].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-muted/50 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => setSortAsc(!sortAsc)}>
                      Amount <ArrowUpDown size={11} />
                    </button>
                  </th>
                  <th>Mode</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      No expenses found. Try adjusting filters.
                    </td>
                  </tr>
                ) : expenses.map((expense, i) => (
                  <tr key={expense.id} className="animate-fade-in group" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="text-muted-foreground text-xs whitespace-nowrap">
                      {format(new Date(expense.date), "MMM d, yyyy")}
                    </td>
                    <td><p className="font-medium text-foreground">{expense.title}</p></td>
                    <td>
                      <span className={`badge ${categoryBadge[expense.category] ?? "badge-neutral"}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold stat-number text-sm text-foreground">
                        −₹{expense.amount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td><span className="text-xs text-muted-foreground">{expense.paymentMode ?? "—"}</span></td>
                    <td><span className="text-xs text-muted-foreground">{expense.notes || "—"}</span></td>
                    <td>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="btn btn-ghost btn-icon p-1.5 text-muted-foreground hover:text-foreground">
                          <Pencil size={13} />
                        </button>
                        <button className="btn btn-ghost btn-icon p-1.5 text-muted-foreground hover:text-destructive">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing <strong>{expenses.length}</strong> of <strong>{pagination.total}</strong> results
          </p>
          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-icon p-1.5" onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`btn btn-icon p-1.5 w-7 h-7 text-xs ${p === page ? "btn-primary" : "btn-ghost text-muted-foreground"}`}>
                {p}
              </button>
            ))}
            <button className="btn btn-ghost btn-icon p-1.5" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Add Expense slide-in ──────────────────────────────────────────── */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
               onClick={() => setShowAddForm(false)} />
          <div className="relative ml-auto h-full w-full max-w-md bg-card border-l border-border shadow-xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">New Entry</p>
                <h3 className="text-lg font-bold text-foreground">Add Expense</h3>
              </div>
              <button onClick={() => setShowAddForm(false)} className="btn btn-ghost btn-icon text-muted-foreground">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="field-label">Amount (₹)</label>
                <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="field-input text-2xl font-bold stat-number" />
              </div>
              <div>
                <label className="field-label">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field-input" />
              </div>
              <div>
                <label className="field-label">Category</label>
                <div className="relative">
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="field-input pr-8 appearance-none">
                    {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="field-label">Description</label>
                <input type="text" placeholder="What was this for?" value={description}
                  onChange={(e) => setDescription(e.target.value)} className="field-input" />
              </div>
              <div>
                <label className="field-label">Payment Mode</label>
                <div className="relative">
                  <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
                    className="field-input pr-8 appearance-none">
                    {PAYMENT_MODES.filter((m) => m !== "All Modes").map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="field-label">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea placeholder="Any additional details…" value={notes} onChange={(e) => setNotes(e.target.value)}
                  rows={3} className="field-input resize-none" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex gap-3">
              <button onClick={() => setShowAddForm(false)} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={handleAddExpense} className="btn btn-primary flex-1 gap-2" disabled={!amount || submitting}>
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Add Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
