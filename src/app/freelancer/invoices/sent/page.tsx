"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, AlertCircle, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface SentDueInvoice {
  id: string; _id: string; client: string; amount: number;
  dueDate: string; sentDate: string; daysOverdue: number;
  reminderSent: boolean; status: string;
}

export default function SentDuePage() {
  const [invoices, setInvoices] = useState<SentDueInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reports/data", { cache: "no-store", credentials: "include" });
        const json = await res.json();
        if (!res.ok) { toast.error("Error", json.error ?? "Failed to load."); return; }
        setInvoices(json.sentDueInvoices ?? []);
      } catch { toast.error("Network error", "Could not reach the server."); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  const overdueItems = invoices.filter((inv) => inv.daysOverdue > 0);
  const dueTodayItems = invoices.filter((inv) => inv.daysOverdue === 0);
  const dueSoonItems = invoices.filter((inv) => inv.daysOverdue < 0);

  const groups = [
    { label: "Overdue", icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/8", borderColor: "border-destructive/20", items: overdueItems },
    { label: "Due Today", icon: AlertCircle, color: "text-warning-foreground", bgColor: "bg-warning/8", borderColor: "border-warning/20", items: dueTodayItems },
    { label: "Due Soon", icon: Clock, color: "text-primary", bgColor: "bg-primary/5", borderColor: "border-primary/15", items: dueSoonItems },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/invoices", label: "All Invoices" },
          { href: "/freelancer/invoices/create", label: "Create" },
          { href: "/freelancer/invoices/drafts", label: "Drafts" },
          { href: "/freelancer/invoices/sent", label: "Sent & Due" },
          { href: "/freelancer/invoices/timeline", label: "Timeline" },
          { href: "/freelancer/invoices/reports", label: "Reports" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/invoices/sent" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading sent & due invoices...</span>
        </div>
      ) : invoices.length === 0 ? (
        <div className="chart-card text-center py-12">
          <p className="text-sm text-success font-semibold">All invoices are settled ✓</p>
          <p className="text-xs text-muted-foreground">No pending or overdue invoices.</p>
        </div>
      ) : (
        groups.filter((g) => g.items.length > 0).map((group) => {
          const GroupIcon = group.icon;
          return (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-3">
                <GroupIcon size={16} className={group.color} />
                <p className="text-sm font-bold text-foreground">{group.label}</p>
                <span className="badge badge-neutral">{group.items.length}</span>
              </div>
              <div className="space-y-2">
                {group.items.map((inv) => (
                  <div key={inv._id} className={`rounded-xl border px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${group.bgColor} ${group.borderColor}`}>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-bold text-foreground">{inv.id}</p>
                        <p className="text-xs text-muted-foreground">{inv.client}</p>
                      </div>
                      <div className="hidden sm:block h-8 w-px bg-border" />
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Sent: {inv.sentDate}</p>
                        <p>Due: {inv.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-base font-bold stat-number text-foreground">₹{inv.amount.toLocaleString("en-IN")}</p>
                        {inv.daysOverdue > 0 ? (
                          <p className="text-xs text-destructive font-semibold">{inv.daysOverdue}d overdue</p>
                        ) : inv.daysOverdue === 0 ? (
                          <p className="text-xs text-warning-foreground font-semibold">Due today</p>
                        ) : (
                          <p className="text-xs text-primary font-semibold">Due in {Math.abs(inv.daysOverdue)}d</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {inv.reminderSent ? (
                          <span className="badge badge-success text-[10px]">Reminded</span>
                        ) : (
                          <button className="btn btn-outline btn-sm gap-1 text-xs">
                            <Mail size={11} /> Remind
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
