"use client";

import { useState } from "react";
import {
  Search, Filter, Plus, ChevronDown, ChevronLeft, ChevronRight,
  ArrowUpDown, Download, Trash2, Pencil,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";

const CATEGORIES = ["All", "Food & Dining", "Shopping", "Transport", "Entertainment", "Utilities", "Health", "Income"];
const PAYMENT_MODES = ["All Modes", "UPI", "Credit Card", "Debit Card", "Cash", "Net Banking"];

const expenses = [
  { id: 1,  date: "Mar 17, 2025", title: "Swiggy Order",         category: "Food & Dining",  amount: 620,   mode: "UPI",         notes: "Dinner" },
  { id: 2,  date: "Mar 16, 2025", title: "Amazon Purchase",       category: "Shopping",       amount: 3480,  mode: "Credit Card", notes: "Headphones" },
  { id: 3,  date: "Mar 15, 2025", title: "Salary",               category: "Income",         amount: 85000, mode: "Net Banking", notes: "" },
  { id: 4,  date: "Mar 14, 2025", title: "Metro Card Recharge",   category: "Transport",      amount: 500,   mode: "UPI",         notes: "" },
  { id: 5,  date: "Mar 13, 2025", title: "Netflix Subscription",  category: "Entertainment",  amount: 649,   mode: "Credit Card", notes: "Monthly" },
  { id: 6,  date: "Mar 12, 2025", title: "Electricity Bill",      category: "Utilities",      amount: 2300,  mode: "Net Banking", notes: "Mar bill" },
  { id: 7,  date: "Mar 11, 2025", title: "Gym Membership",        category: "Health",         amount: 1800,  mode: "UPI",         notes: "" },
  { id: 8,  date: "Mar 11, 2025", title: "Zomato",               category: "Food & Dining",  amount: 385,   mode: "UPI",         notes: "Lunch" },
  { id: 9,  date: "Mar 10, 2025", title: "Petrol",               category: "Transport",      amount: 1200,  mode: "Cash",        notes: "" },
  { id: 10, date: "Mar 9, 2025",  title: "Flipkart",             category: "Shopping",       amount: 2100,  mode: "Debit Card",  notes: "Clothes" },
];

const categoryColors: Record<string, string> = {
  "Food & Dining":  "badge-primary",
  "Shopping":       "badge-accent",
  "Transport":      "badge-neutral",
  "Entertainment":  "badge-warning",
  "Utilities":      "badge-secondary",
  "Health":         "badge-success",
  "Income":         "badge-success",
};

export default function ExpensesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All Modes");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("Food & Dining");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [notes, setNotes] = useState("");

  const filtered = expenses
    .filter((e) => selectedCategory === "All" || e.category === selectedCategory)
    .filter((e) => selectedMode === "All Modes" || e.mode === selectedMode)
    .filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortAsc ? a.amount - b.amount : b.amount - a.amount);

  const handleAddExpense = () => {
    if (!amount || !date) return;
    toast.success("Expense added", `₹${parseFloat(amount).toLocaleString("en-IN")} · ${category}`);
    setShowAddForm(false);
    setAmount(""); setDescription(""); setNotes("");
  };

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">All Expenses</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} entries · March 2025</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm gap-1.5">
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary btn-sm gap-1.5"
          >
            <Plus size={14} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field-input pl-9 py-2 text-sm h-9"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="field-input h-9 pr-8 appearance-none cursor-pointer text-sm"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Payment mode filter */}
        <div className="relative">
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="field-input h-9 pr-8 appearance-none cursor-pointer text-sm"
          >
            {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <button className="btn btn-outline btn-sm gap-1.5">
          <Filter size={13} />
          More filters
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-fade-up delay-100">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => setSortAsc(!sortAsc)}
                  >
                    Amount <ArrowUpDown size={11} />
                  </button>
                </th>
                <th>Payment Mode</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((expense, i) => (
                <tr
                  key={expense.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="text-muted-foreground text-xs whitespace-nowrap">{expense.date}</td>
                  <td>
                    <p className="font-medium text-foreground">{expense.title}</p>
                  </td>
                  <td>
                    <span className={`badge ${categoryColors[expense.category] ?? "badge-neutral"}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td>
                    <span className={`font-bold stat-number text-sm ${expense.category === "Income" ? "text-success" : "text-foreground"}`}>
                      {expense.category === "Income" ? "+" : "-"}₹{expense.amount.toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-muted-foreground">{expense.mode}</span>
                  </td>
                  <td>
                    <span className="text-xs text-muted-foreground">{expense.notes || "—"}</span>
                  </td>
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing <strong>{filtered.length}</strong> of <strong>{expenses.length}</strong> results
          </p>
          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-icon p-1.5">
              <ChevronLeft size={15} />
            </button>
            <button className="btn btn-primary btn-icon p-1.5 w-7 h-7 text-xs">1</button>
            <button className="btn btn-ghost btn-icon p-1.5 w-7 h-7 text-xs text-muted-foreground">2</button>
            <button className="btn btn-ghost btn-icon p-1.5">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Expense Slide-in panel */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowAddForm(false)}
          />
          <div className="relative ml-auto h-full w-full max-w-md bg-card border-l border-border shadow-xl animate-slide-in-right flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">New Entry</p>
                <h3 className="text-lg font-bold text-foreground">Add Expense</h3>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn btn-ghost btn-icon text-muted-foreground"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="field-label">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="field-input text-2xl font-bold stat-number"
                />
              </div>
              <div>
                <label className="field-label">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="field-input pr-8 appearance-none"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="field-label">Description</label>
                <input
                  type="text"
                  placeholder="What was this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Payment Mode</label>
                <div className="relative">
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="field-input pr-8 appearance-none"
                  >
                    {PAYMENT_MODES.filter((m) => m !== "All Modes").map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="field-label">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
                <textarea
                  placeholder="Any additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="field-input resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="btn btn-primary flex-1"
                disabled={!amount}
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
