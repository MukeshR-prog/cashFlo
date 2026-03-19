"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Send, FileDown, Eye, Trash2, User } from "lucide-react";
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

interface ClientOption {
  id: string;
  name: string;
}

interface LineItem {
  id: number;
  description: string;
  qty: number;
  rate: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [client, setClient] = useState("");
  const [invoiceNo] = useState(`INV-${new Date().getTime().toString().slice(-6)}`);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment due within 30 days of invoice date.");
  const [paymentLink, setPaymentLink] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
  const [methods, setMethods] = useState<string[]>(["UPI", "Bank", "PayPal"]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [savingDraft, setSavingDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: "", qty: 1, rate: 0 },
  ]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await fetch("/api/clients", { cache: "no-store", credentials: "include" });
        if (!res.ok) {
          setClients([]);
          return;
        }
        const data = await res.json();
        setClients((data.clients ?? []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      } catch {
        setClients([]);
      }
    };

    void loadClients();
  }, []);

  const addItem = () => {
    setItems((prev) => [...prev, { id: Date.now(), description: "", qty: 1, rate: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
  };

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  // Auto-generate UPI deep link whenever UPI ID, name, or total changes
  const generatedUpiLink = upiId.trim()
    ? `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent(upiName.trim() || "CashFlo")}&am=${total}&tn=${encodeURIComponent(invoiceNo)}&cu=INR`
    : "";

  const effectivePaymentLink = generatedUpiLink || paymentLink;

  const buildPayload = (status: "draft" | "sent") => {
    const cleanItems = items
      .filter((i) => i.description.trim() && i.qty > 0 && i.rate > 0)
      .map((i) => ({ description: i.description.trim(), quantity: i.qty, unitPrice: i.rate }));

    if (!client) {
      throw new Error("Please select a client.");
    }
    if (!dueDate) {
      throw new Error("Please select a due date.");
    }
    if (cleanItems.length === 0) {
      throw new Error("Add at least one valid line item.");
    }

    return {
      clientId: client,
      invoiceNumber: invoiceNo,
      issueDate: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      items: cleanItems,
      paymentLink: effectivePaymentLink || undefined,
      notes: [notes, terms ? `Terms: ${terms}` : "", methods.length ? `Methods: ${methods.join(", ")}` : ""]
        .filter(Boolean)
        .join("\n"),
      status,
    };
  };

  const saveInvoice = async (status: "draft" | "sent") => {
    try {
      const payload = buildPayload(status);
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to save invoice" }));
        throw new Error(err.error ?? "Failed to save invoice");
      }

      toast.success(status === "draft" ? "Draft saved" : "Invoice sent", `${invoiceNo} saved successfully.`);
      router.push("/freelancer/invoices");
    } catch (error) {
      toast.error("Action failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    await saveInvoice("draft");
    setSavingDraft(false);
  };

  const handleSendInvoice = async () => {
    setSending(true);
    await saveInvoice("sent");
    setSending(false);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

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
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/invoices/create" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      {/* ── Left: Form ──────────────────────────────────────── */}
      <div className="space-y-5">

        {/* Invoice Header */}
        <div className="chart-card space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">Invoice Details</p>
            <span className="badge badge-primary font-mono">{invoiceNo}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Client</label>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-9 w-full items-center gap-2 rounded-xl border border-input bg-card px-3 text-sm text-foreground transition-colors hover:bg-muted/70">
                  <User className="h-4 w-4 shrink-0" />
                  <span className="truncate">{clients.find((c) => c.id === client)?.name || "Select client..."}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Select Client</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={client} onValueChange={setClient}>
                      {clients.map((c) => (
                        <DropdownMenuRadioItem key={c.id} value={c.id}>{c.name}</DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label className="field-label">Due Date</label>
              <DatePickerInput
                value={dueDate}
                onChange={setDueDate}
                placeholder="Select due date"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="chart-card space-y-3">
          <p className="text-sm font-bold text-foreground">Line Items</p>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder={`Item ${i + 1} description`}
                  className="field-input col-span-6"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  className="field-input col-span-2 text-center"
                  value={item.qty}
                  min={1}
                  onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))}
                />
                <input
                  type="number"
                  placeholder="Rate (₹)"
                  className="field-input col-span-3"
                  value={item.rate || ""}
                  onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="col-span-1 flex justify-center text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="btn btn-ghost btn-sm gap-1.5 text-primary">
            <Plus size={14} /> Add Item
          </button>
        </div>

        {/* Billing Summary */}
        <div className="chart-card space-y-3">
          <p className="text-sm font-bold text-foreground">Billing Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground stat-number">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST (18%)</span>
              <span className="font-medium text-foreground stat-number">{fmt(tax)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-base font-bold text-foreground">
              <span>Total</span>
              <span className="text-primary stat-number">{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="chart-card space-y-4">
          <p className="text-sm font-bold text-foreground">Notes & Terms</p>
          <div>
            <label className="field-label">Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              className="field-input h-20 resize-none"
              placeholder="Additional notes for the client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Payment Terms</label>
            <textarea
              className="field-input h-16 resize-none"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="chart-card space-y-4">
          <p className="text-sm font-bold text-foreground">Payment Methods</p>

          {/* UPI Auto-Generator */}
          <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs font-semibold text-primary">⚡ UPI Auto-Link Generator</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="field-label">Your UPI ID</label>
                <input
                  className="field-input"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
              </div>
              <div>
                <label className="field-label">Display Name</label>
                <input
                  className="field-input"
                  value={upiName}
                  onChange={(e) => setUpiName(e.target.value)}
                  placeholder="Freelancer Name"
                />
              </div>
            </div>
            {generatedUpiLink && (
              <div className="mt-1">
                <p className="text-[10px] text-muted-foreground mb-1">Generated Link (auto-fills payment link below):</p>
                <code className="block text-[10px] text-primary bg-background border border-border rounded p-2 break-all">{generatedUpiLink}</code>
              </div>
            )}
          </div>

          <div>
            <label className="field-label">Payment Link <span className="text-muted-foreground font-normal">(manual override)</span></label>
            <input
              className="field-input"
              value={effectivePaymentLink}
              onChange={(e) => { setUpiId(""); setPaymentLink(e.target.value); }}
              placeholder="https:// or upi://..."
            />
          </div>
          <div>
            <label className="field-label">Accepted Methods</label>
            <div className="flex items-center gap-2 flex-wrap">
              {["UPI", "Bank", "PayPal", "Card"].map((m) => {
                const active = methods.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      setMethods((prev) => (active ? prev.filter((item) => item !== m) : [...prev, m]))
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-outline gap-2 flex-1" onClick={handleSaveDraft} disabled={savingDraft || sending}><Save size={15} /> {savingDraft ? "Saving..." : "Save Draft"}</button>
          <button className="btn btn-outline gap-2 flex-1" onClick={handleDownloadPdf}><FileDown size={15} /> Download PDF</button>
          <button className="btn btn-primary gap-2 flex-1" onClick={handleSendInvoice} disabled={savingDraft || sending}><Send size={15} /> {sending ? "Sending..." : "Send Invoice"}</button>
        </div>
      </div>

      {/* ── Right: Live Preview ──────────────────────────────── */}
      <div className="xl:sticky xl:top-24 self-start">
        <div className="chart-card h-full space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-primary" />
            <p className="text-sm font-bold text-foreground">Invoice Preview</p>
            <span className="badge badge-neutral ml-auto">Live</span>
          </div>

          {/* Preview Card */}
          <div className="rounded-xl border border-border bg-background/60 p-6 space-y-5">
            {/* Brand + Invoice No */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xl font-bold text-foreground">cashFlo</p>
                <p className="text-xs text-muted-foreground">cashFlo Platform</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Invoice</p>
                <p className="text-lg font-bold text-primary font-mono">{invoiceNo}</p>
              </div>
            </div>

            {/* Client */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Bill To</p>
              <div className="flex items-center gap-2">
                <User size={14} className="text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{clients.find((c) => c.id === client)?.name || "Client Name"}</p>
              </div>
              {dueDate && (
                <p className="text-xs text-muted-foreground mt-1">Due: {dueDate}</p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-12 gap-2 text-[10px] text-muted-foreground uppercase tracking-wider pb-1 border-b border-border">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Rate</span>
                <span className="col-span-2 text-right">Total</span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 text-xs">
                  <span className="col-span-6 text-foreground truncate">{item.description || "—"}</span>
                  <span className="col-span-2 text-center text-muted-foreground">{item.qty}</span>
                  <span className="col-span-2 text-right text-muted-foreground">{item.rate ? fmt(item.rate) : "—"}</span>
                  <span className="col-span-2 text-right font-semibold stat-number">{item.qty && item.rate ? fmt(item.qty * item.rate) : "—"}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 pt-3 border-t border-border text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span className="stat-number">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST (18%)</span><span className="stat-number">{fmt(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground pt-1">
                <span>Total</span>
                <span className="text-primary stat-number">{fmt(total)}</span>
              </div>
            </div>

            {/* Notes */}
            {(notes || terms) && (
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                {notes && <p>{notes}</p>}
                {terms && <p className="italic">{terms}</p>}
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
              <p><span className="text-foreground font-semibold">Payment Link:</span> {effectivePaymentLink || "—"}</p>
              <p><span className="text-foreground font-semibold">Methods:</span> {methods.join(", ") || "None selected"}</p>
            </div>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
