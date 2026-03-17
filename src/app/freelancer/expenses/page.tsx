"use client";

import { useState } from "react";
import { Plus, Download } from "lucide-react";
import Link from "next/link";

const expenses = [
  { id: "EXP-021", title: "Adobe CC", amount: 4999, category: "Software", date: "2026-03-01", type: "BUSINESS", notes: "Design software subscription", createdDate: "2026-03-01", addedBy: "You" },
  { id: "EXP-020", title: "AWS EC2", amount: 3200, category: "Infrastructure", date: "2026-03-01", type: "BUSINESS", notes: "Cloud hosting", createdDate: "2026-03-01", addedBy: "You" },
  { id: "EXP-019", title: "Gym Membership", amount: 1800, category: "Health", date: "2026-03-01", type: "PERSONAL", notes: "", createdDate: "2026-03-01", addedBy: "You" },
  { id: "EXP-018", title: "Figma", amount: 1500, category: "Software", date: "2026-03-01", type: "BUSINESS", notes: "Design tool", createdDate: "2026-03-01", addedBy: "You" },
  { id: "EXP-017", title: "Swiggy", amount: 620, category: "Food", date: "2026-03-05", type: "PERSONAL", notes: "", createdDate: "2026-03-05", addedBy: "You" },
  { id: "EXP-016", title: "Slack", amount: 750, category: "Communication", date: "2026-03-01", type: "BUSINESS", notes: "", createdDate: "2026-03-01", addedBy: "You" },
  { id: "EXP-015", title: "Metro Recharge", amount: 500, category: "Travel", date: "2026-03-08", type: "PERSONAL", notes: "", createdDate: "2026-03-08", addedBy: "You" },
  { id: "EXP-014", title: "Google Workspace", amount: 660, category: "Software", date: "2026-03-01", type: "BUSINESS", notes: "", createdDate: "2026-03-01", addedBy: "You" },
];

const categories = ["All", "Software", "Infrastructure", "Health", "Food", "Travel", "Communication", "Marketing", "Misc"];
const types = ["All", "BUSINESS", "PERSONAL"];

export default function FreelancerExpensesPage() {
  const [catFilter, setCatFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = expenses.filter((e) => {
    return (catFilter === "All" || e.category === catFilter) &&
           (typeFilter === "All" || e.type === typeFilter) &&
           (monthFilter === "All" || e.date.startsWith(monthFilter)) &&
           (!fromDate || e.date >= fromDate) &&
           (!toDate || e.date <= toDate);
  });

  const totals = {
    business: expenses.filter((e) => e.type === "BUSINESS").reduce((s, e) => s + e.amount, 0),
    personal: expenses.filter((e) => e.type === "PERSONAL").reduce((s, e) => s + e.amount, 0),
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
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/expenses" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2">
        <button className="btn btn-outline btn-sm gap-1.5"><Download size={14} /> Export</button>
        <Link href="/freelancer/expenses/add" className="btn btn-primary btn-sm gap-1.5">
          <Plus size={14} /> Add Expense
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
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

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                catFilter === c ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="field-input h-9 text-xs w-[170px]" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option value="All">All months</option>
            <option value="2026-01">Jan 2026</option>
            <option value="2026-02">Feb 2026</option>
            <option value="2026-03">Mar 2026</option>
          </select>
          <input className="field-input h-9 text-xs" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input className="field-input h-9 text-xs" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
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
            {filtered.map((exp) => (
              <tr key={exp.id}>
                <td className="font-medium text-foreground">{exp.title}</td>
                <td className="stat-number font-semibold">₹{exp.amount.toLocaleString("en-IN")}</td>
                <td><span className="badge badge-secondary">{exp.category}</span></td>
                <td className="text-xs text-muted-foreground">{exp.date}</td>
                <td className="text-xs text-muted-foreground">{exp.createdDate}</td>
                <td className="text-xs text-muted-foreground">{exp.addedBy}</td>
                <td>
                  <span className={`badge text-[10px] ${exp.type === "BUSINESS" ? "badge-primary" : "badge-neutral"}`}>
                    {exp.type}
                  </span>
                </td>
                <td className="text-xs text-muted-foreground max-w-[160px] truncate">{exp.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
