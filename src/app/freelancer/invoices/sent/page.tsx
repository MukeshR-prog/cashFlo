"use client";

import { Clock, AlertTriangle, AlertCircle, Mail } from "lucide-react";
import Link from "next/link";

const groups = [
  {
    label: "Overdue",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/8",
    borderColor: "border-destructive/20",
    items: [
      { id: "INV-020", client: "TrueVen Co.", amount: 18500, dueDate: "2026-03-10", sentDate: "2026-02-22", daysOverdue: 7, reminderSent: true },
      { id: "INV-018", client: "Riya Mehta", amount: 12000, dueDate: "2026-02-28", sentDate: "2026-02-10", daysOverdue: 17, reminderSent: false },
    ],
  },
  {
    label: "Due Today",
    icon: AlertCircle,
    color: "text-warning-foreground",
    bgColor: "bg-warning/8",
    borderColor: "border-warning/20",
    items: [
      { id: "INV-023", client: "CodeBase Inc.", amount: 15500, dueDate: "2026-03-17", sentDate: "2026-03-08", daysOverdue: 0, reminderSent: true },
    ],
  },
  {
    label: "Due Soon",
    icon: Clock,
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/15",
    items: [
      { id: "INV-024", client: "Pixel Studio", amount: 28000, dueDate: "2026-03-25", sentDate: "2026-03-10", daysOverdue: -8, reminderSent: false },
      { id: "INV-022", client: "Arjun Dev", amount: 9200, dueDate: "2026-03-30", sentDate: "2026-03-05", daysOverdue: -13, reminderSent: false },
    ],
  },
];

export default function SentDuePage() {
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

      {groups.map((group) => {
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
                <div
                  key={inv.id}
                  className={`rounded-xl border px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${group.bgColor} ${group.borderColor}`}
                >
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
                      <p className="text-base font-bold stat-number text-foreground">
                        ₹{inv.amount.toLocaleString("en-IN")}
                      </p>
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
      })}
    </div>
  );
}
