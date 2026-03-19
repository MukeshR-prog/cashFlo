"use client";

import { useEffect, useState } from "react";
import { FileText, Edit3, Clock, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface DraftInvoice { id: string; client: string; amount: number; lastEdited: string; created: string; }

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reports/data", { cache: "no-store", credentials: "include" });
        const json = await res.json();
        if (!res.ok) { toast.error("Error", json.error ?? "Failed to load."); return; }
        setDrafts(json.draftInvoices ?? []);
      } catch { toast.error("Network error", "Could not reach the server."); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/invoices", label: "All Invoices" },
          { href: "/freelancer/invoices/create", label: "Create" },
          { href: "/freelancer/invoices/drafts", label: "Drafts" },
          { href: "/freelancer/invoices/sent", label: "Sent & Due" },
          { href: "/freelancer/invoices/timeline", label: "Timeline" },
          { href: "/freelancer/invoices/reports", label: "Reports" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/invoices/drafts" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{loading ? "Loading..." : `${drafts.length} draft invoices pending completion`}</p>
        <Link href="/freelancer/invoices/create" className="btn btn-primary btn-sm gap-1.5">
          <Plus size={14} /> New Invoice
        </Link>
      </div>

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="chart-card text-center py-12">
          <FileText size={32} className="text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No draft invoices found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((draft, i) => (
            <div key={draft.id} className="card-hover animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <FileText size={18} className="text-muted-foreground" />
                </div>
                <span className="badge badge-neutral">Draft</span>
              </div>
              <p className="text-base font-bold text-foreground mb-0.5">{draft.id}</p>
              <p className="text-sm text-muted-foreground mb-4">{draft.client}</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><Clock size={11} /> Created: {draft.created}</p>
                <p className="flex items-center gap-1.5"><Edit3 size={11} /> Last edited: {draft.lastEdited}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-base font-bold stat-number text-foreground">₹{draft.amount.toLocaleString("en-IN")}</p>
                <Link href="/freelancer/invoices/create" className="btn btn-primary btn-sm gap-1">
                  <Edit3 size={12} /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
