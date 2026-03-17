"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import Link from "next/link";

const categories = ["Software", "Travel", "Internet", "Hardware", "Marketing", "Food", "Health", "Communication", "Misc"];
const types = ["BUSINESS", "PERSONAL"];

export default function AddExpensePage() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Software");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"BUSINESS" | "PERSONAL">("BUSINESS");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Expense saved: ${title} — ₹${amount} (${type})`);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/expenses", label: "All Expenses" },
          { href: "/freelancer/expenses/add", label: "Add Expense" },
          { href: "/freelancer/expenses/categories", label: "Categories" },
          { href: "/freelancer/expenses/business-personal", label: "Business vs Personal" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/expenses/add" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="max-w-xl">
      <form onSubmit={handleSubmit} className="card space-y-5">
        <p className="text-sm font-bold text-foreground border-b border-border pb-3">Add New Expense</p>

        {/* Type Toggle */}
        <div>
          <label className="field-label">Expense Type</label>
          <div className="flex gap-2">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t as "BUSINESS" | "PERSONAL")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-150 ${
                  type === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Title</label>
          <input type="text" className="field-input" placeholder="e.g. Adobe CC, Flights to Mumbai..." value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Amount (₹)</label>
            <input type="number" className="field-input" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" />
          </div>
          <div>
            <label className="field-label">Date</label>
            <input type="date" className="field-input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="field-label">Category</label>
          <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="field-label">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea className="field-input h-20 resize-none" placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary w-full gap-2">
          <Save size={15} /> Save Expense
        </button>
      </form>
      </div>
    </div>
  );
}
