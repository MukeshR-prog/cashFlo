"use client";

import { useState } from "react";
import { Save, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = ["Software", "Travel", "Internet", "Hardware", "Marketing", "Food", "Health", "Communication", "Misc"];
const types = ["BUSINESS", "PERSONAL"];

export default function AddExpensePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Software");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"BUSINESS" | "PERSONAL">("BUSINESS");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          amount: Number(amount),
          category,
          date,
          type,
          paymentMode: "UPI",
          notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to save expense" }));
        toast.error("Could not save expense", err.error ?? "Please try again.");
        return;
      }

      toast.success("Expense saved", `${title} added successfully.`);
      router.push("/freelancer/expenses");
    } catch {
      toast.error("Network error", "Could not reach the server.");
    } finally {
      setSaving(false);
    }
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
            <DatePickerInput
              value={date}
              onChange={setDate}
              placeholder="Select date"
              required
            />
          </div>
        </div>

        <div>
          <label className="field-label">Category</label>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 w-full items-center gap-2 rounded-xl border border-input bg-card px-3 text-sm text-foreground transition-colors hover:bg-muted/70">
              <Tag className="h-4 w-4" />
              {category}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Select Category</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={category} onValueChange={setCategory}>
                  {categories.map((c) => (
                    <DropdownMenuRadioItem key={c} value={c}>{c}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <label className="field-label">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea className="field-input h-20 resize-none" placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary w-full gap-2" disabled={saving}>
          <Save size={15} /> {saving ? "Saving..." : "Save Expense"}
        </button>
      </form>
      </div>
    </div>
  );
}
