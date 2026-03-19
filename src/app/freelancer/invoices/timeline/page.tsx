"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Edit3, Send, DollarSign, Bell, AlertTriangle, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  status: string;
}

interface TimelineEvent {
  type: "created" | "sent" | "reminder" | "payment" | "overdue" | "paid";
  description: string;
  date: string;
  actor: string;
  amount?: number;
}

const eventIcons: Record<string, typeof CheckCircle> = {
  created: Edit3,
  sent: Send,
  reminder: Bell,
  payment: DollarSign,
  overdue: AlertTriangle,
  paid: CheckCircle,
};

const eventColors: Record<string, string> = {
  created: "var(--primary)",
  sent: "var(--chart-1)",
  reminder: "var(--warning)",
  payment: "var(--chart-3)",
  overdue: "var(--destructive)",
  paid: "var(--success)",
};

export default function InvoiceTimelinePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [invoiceStatus, setInvoiceStatus] = useState("");

  // Load invoices list
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/invoices", { cache: "no-store", credentials: "include" });
        const data = await res.json();
        if (res.ok && data.invoices?.length > 0) {
          setInvoices(data.invoices);
          setSelectedId(data.invoices[0].id);
        }
      } catch {
        toast.error("Network error", "Could not load invoices.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  // Load timeline for selected invoice
  useEffect(() => {
    if (!selectedId) return;
    const loadTimeline = async () => {
      setTimelineLoading(true);
      try {
        const res = await fetch(`/api/invoices/${selectedId}/timeline`, { cache: "no-store", credentials: "include" });
        const data = await res.json();
        if (res.ok) {
          setEvents(data.events ?? []);
          setInvoiceStatus(data.status ?? "");
        } else {
          toast.error("Could not load timeline", data.error ?? "Please try again.");
          setEvents([]);
        }
      } catch {
        toast.error("Network error", "Could not load timeline.");
        setEvents([]);
      } finally {
        setTimelineLoading(false);
      }
    };
    void loadTimeline();
  }, [selectedId]);

  const statusBadge = invoiceStatus === "paid" ? "badge-success" : invoiceStatus === "overdue" ? "badge-danger" : "badge-secondary";

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
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/invoices/timeline" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="chart-card flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading invoices...</span>
        </div>
      ) : invoices.length === 0 ? (
        <div className="chart-card text-center py-12">
          <p className="text-sm text-muted-foreground">No invoices found. Create your first invoice to see the timeline.</p>
        </div>
      ) : (
        <>
          <div>
            <label className="field-label">Select Invoice</label>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-9 w-full max-w-xs items-center gap-2 rounded-xl border border-input bg-card px-3 text-sm text-foreground transition-colors hover:bg-muted/70">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">{invoices.find((inv) => inv.id === selectedId)?.invoiceNumber ?? "Select"} — {invoices.find((inv) => inv.id === selectedId)?.clientName ?? ""}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Select Invoice</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={selectedId} onValueChange={setSelectedId}>
                    {invoices.map((inv) => (
                      <DropdownMenuRadioItem key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {inv.clientName}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="chart-card">
            <div className="flex items-center gap-2 mb-6">
              <p className="text-sm font-bold text-foreground">
                {invoices.find((i) => i.id === selectedId)?.invoiceNumber ?? ""} — Event Timeline
              </p>
              {invoiceStatus && (
                <span className={`badge ${statusBadge} capitalize`}>{invoiceStatus.replace("_", " ")}</span>
              )}
            </div>

            {timelineLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No events recorded for this invoice yet.</p>
            ) : (
              <div className="relative space-y-0">
                {events.map((ev, i) => {
                  const Icon = eventIcons[ev.type] ?? Edit3;
                  const color = eventColors[ev.type] ?? "var(--muted-foreground)";
                  const isLast = i === events.length - 1;
                  const dateStr = new Date(ev.date).toLocaleString("en-IN", {
                    year: "numeric", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  });
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: `color-mix(in oklch, ${color} 15%, transparent)` }}
                        >
                          <Icon size={14} style={{ color }} />
                        </div>
                        {!isLast && (
                          <div className="flex-1 w-px bg-border my-1" style={{ minHeight: 24 }} />
                        )}
                      </div>
                      <div className="pb-4 flex-1">
                        <p className="text-sm font-semibold text-foreground">{ev.description}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span>{dateStr}</span>
                          <span>·</span>
                          <span>{ev.actor}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
