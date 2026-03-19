"use client";

import { useRef, useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, TrendingUp, TrendingDown, Wallet, Plus, WalletIcon, ArrowDownUp } from "lucide-react";
import Link from "next/link";
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

interface ParsedTransaction {
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  balance: number | null;
}

function fmt(n: number | null) {
  if (n === null) return "—";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function UploadStatementPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [imported, setImported] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [parsed, setParsed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Manual wallet entry state
  const [showManual, setShowManual] = useState(false);
  const [manualAmount, setManualAmount] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualDirection, setManualDirection] = useState<"credit" | "debit">("credit");
  const [manualSource, setManualSource] = useState<"wallet" | "manual">("wallet");
  const [manualSaving, setManualSaving] = useState(false);

  const handleFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "csv") {
      toast.error("Invalid file", "Please upload a PDF or CSV bank statement.");
      return;
    }
    setFile(f);
    setParsed(false);
    setConfirmed(false);
    setTransactions([]);
    setSelected(new Set());
    setImported(0);
    setSkipped(0);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("persist", "false"); // Preview mode — don't save yet

      const ext = file.name.split(".").pop()?.toLowerCase();
      const endpoint = ext === "csv" ? "/api/transactions/parse-csv" : "/api/transactions/parse-pdf";

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Parsing failed", data.error ?? "Could not parse the file.");
        return;
      }
      const txns = data.transactions ?? [];
      setTransactions(txns);
      setSelected(new Set(txns.map((_: ParsedTransaction, i: number) => i)));
      setParsed(true);
      if (txns.length === 0) {
        toast.error(
          "No transactions found",
          "The parser could not detect transaction rows. Try a different format or manual entry."
        );
      } else {
        toast.success("Preview ready", `${txns.length} transactions extracted. Review and confirm below.`);
      }
    } catch {
      toast.error("Network error", "Could not reach the server.");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!file || selected.size === 0) return;
    setConfirming(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("persist", "true");

      const ext = file.name.split(".").pop()?.toLowerCase();
      const endpoint = ext === "csv" ? "/api/transactions/parse-csv" : "/api/transactions/parse-pdf";

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Import failed", data.error ?? "Could not import transactions.");
        return;
      }
      setImported(data.imported ?? 0);
      setSkipped(data.skipped ?? 0);
      setConfirmed(true);
      toast.success("Import complete", `${data.imported ?? 0} imported, ${data.skipped ?? 0} skipped (duplicates).`);
    } catch {
      toast.error("Network error", "Could not reach the server.");
    } finally {
      setConfirming(false);
    }
  };

  const handleManualSave = async () => {
    if (!manualAmount || !manualDesc || !manualDate) {
      toast.error("All fields required", "Please fill in amount, description, and date.");
      return;
    }
    setManualSaving(true);
    try {
      const res = await fetch("/api/transactions/parse-csv", {
        method: "POST",
        body: (() => {
          const csvContent = `Date,Description,${manualDirection === "credit" ? "Credit" : "Debit"},${manualDirection === "credit" ? "Debit" : "Credit"}\n${manualDate},${manualDesc},${manualAmount},0`;
          const blob = new Blob([csvContent], { type: "text/csv" });
          const fd = new FormData();
          fd.append("file", blob, `manual_${manualSource}_entry.csv`);
          fd.append("persist", "true");
          return fd;
        })(),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Save failed", data.error ?? "Could not save transaction.");
        return;
      }
      toast.success("Transaction added", `${manualSource === "wallet" ? "Wallet" : "Manual"} transaction saved successfully.`);
      setManualAmount("");
      setManualDesc("");
      setManualDate("");
      setShowManual(false);
    } catch {
      toast.error("Network error", "Could not reach the server.");
    } finally {
      setManualSaving(false);
    }
  };

  const toggleRow = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === transactions.length) setSelected(new Set());
    else setSelected(new Set(transactions.map((_, i) => i)));
  };

  const totalCredit = transactions.reduce((s, t) => s + (t.credit ?? 0), 0);
  const totalDebit = transactions.reduce((s, t) => s + (t.debit ?? 0), 0);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Sub-nav */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/payments", label: "All Payments" },
          { href: "/freelancer/payments/upload", label: "Upload Statement" },
          { href: "/freelancer/payments/transactions", label: "Transactions" },
          { href: "/freelancer/payments/reminders", label: "Reminders" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab.href === "/freelancer/payments/upload"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Manual Entry Button */}
      <div className="flex gap-2">
        <button className="btn btn-outline btn-sm gap-1.5" onClick={() => setShowManual(!showManual)}>
          <Wallet size={14} />
          {showManual ? "Hide" : "Add"} Wallet / Manual Entry
        </button>
      </div>

      {/* Manual Entry Form */}
      {showManual && (
        <div className="chart-card space-y-3 animate-fade-up">
          <p className="text-sm font-bold text-foreground flex items-center gap-2">
            <Plus size={14} className="text-primary" /> Add Manual Transaction
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="field-label">Source</label>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-9 w-full items-center gap-2 rounded-xl border border-input bg-card px-3 text-sm text-foreground transition-colors hover:bg-muted/70">
                  <WalletIcon className="h-4 w-4" />
                  {manualSource === "wallet" ? "Wallet (Paytm, PhonePe, etc.)" : "Manual / Cash"}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Select Source</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={manualSource} onValueChange={(v) => setManualSource(v as "wallet" | "manual")}>
                      <DropdownMenuRadioItem value="wallet"><WalletIcon className="mr-2 h-4 w-4" />Wallet (Paytm, PhonePe, etc.)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="manual"><FileText className="mr-2 h-4 w-4" />Manual / Cash</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label className="field-label">Direction</label>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-9 w-full items-center gap-2 rounded-xl border border-input bg-card px-3 text-sm text-foreground transition-colors hover:bg-muted/70">
                  <ArrowDownUp className="h-4 w-4" />
                  {manualDirection === "credit" ? "Cash In (Credit)" : "Cash Out (Debit)"}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Select Direction</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={manualDirection} onValueChange={(v) => setManualDirection(v as "credit" | "debit")}>
                      <DropdownMenuRadioItem value="credit"><TrendingUp className="mr-2 h-4 w-4" />Cash In (Credit)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="debit"><TrendingDown className="mr-2 h-4 w-4" />Cash Out (Debit)</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label className="field-label">Amount (₹)</label>
              <input className="field-input" type="number" placeholder="1000" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Date</label>
              <DatePickerInput value={manualDate} onChange={setManualDate} placeholder="Select date" />
            </div>
          </div>
          <div>
            <label className="field-label">Description</label>
            <input className="field-input" placeholder="e.g. Paytm wallet transfer from client" value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm gap-1.5" onClick={handleManualSave} disabled={manualSaving}>
            {manualSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Save Transaction"}
          </button>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`chart-card flex flex-col items-center justify-center gap-4 py-12 text-center border-2 border-dashed transition-colors cursor-pointer ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Upload size={28} className="text-primary" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">Upload Bank Statement</p>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop or click to select a PDF or CSV export from your bank
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Supports: PDF (SBI, HDFC, ICICI, Axis, Kotak) and CSV files
          </p>
        </div>

        {file && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText size={16} />
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      {/* Parse Button */}
      {file && !parsed && (
        <button
          className="btn btn-primary gap-2 w-full"
          onClick={handleParse}
          disabled={parsing}
        >
          {parsing ? (
            <><Loader2 size={16} className="animate-spin" /> Parsing...</>
          ) : (
            <><FileText size={16} /> Extract &amp; Preview Transactions</>
          )}
        </button>
      )}

      {/* Preview Results */}
      {parsed && !confirmed && (
        <div className="space-y-4 animate-fade-up">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1">Transactions Found</p>
              <p className="text-2xl font-bold stat-number text-foreground">{transactions.length}</p>
            </div>
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1 flex items-center gap-1"><TrendingUp size={12} className="text-success" /> Total Credits</p>
              <p className="text-2xl font-bold stat-number text-success">{fmt(totalCredit)}</p>
            </div>
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1 flex items-center gap-1"><TrendingDown size={12} className="text-destructive" /> Total Debits</p>
              <p className="text-2xl font-bold stat-number text-destructive">{fmt(totalDebit)}</p>
            </div>
          </div>

          {transactions.length > 0 ? (
            <div className="chart-card overflow-x-auto">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-success" />
                <p className="text-sm font-bold text-foreground">Preview — Select Transactions to Import</p>
                <button onClick={toggleAll} className="ml-auto text-xs text-primary hover:underline">
                  {selected.size === transactions.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-8">
                      <input type="checkbox" checked={selected.size === transactions.length} onChange={toggleAll} className="accent-[var(--primary)]" />
                    </th>
                    <th>Date</th>
                    <th>Description</th>
                    <th className="text-right">Credit</th>
                    <th className="text-right">Debit</th>
                    <th className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={i} className={selected.has(i) ? "" : "opacity-40"}>
                      <td>
                        <input type="checkbox" checked={selected.has(i)} onChange={() => toggleRow(i)} className="accent-[var(--primary)]" />
                      </td>
                      <td className="text-xs text-muted-foreground whitespace-nowrap">{t.date}</td>
                      <td className="text-sm text-foreground max-w-[200px] truncate" title={t.description}>{t.description}</td>
                      <td className="text-right stat-number text-success text-sm">{fmt(t.credit)}</td>
                      <td className="text-right stat-number text-destructive text-sm">{fmt(t.debit)}</td>
                      <td className="text-right stat-number text-muted-foreground text-sm">{fmt(t.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="chart-card flex flex-col items-center gap-3 py-10 text-center">
              <AlertCircle size={32} className="text-warning-foreground" />
              <p className="text-sm font-semibold text-foreground">No transactions could be detected</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Your bank&apos;s format may not be supported. Use manual entry above.
              </p>
            </div>
          )}

          {transactions.length > 0 && (
            <div className="flex gap-2">
              <button
                className="btn btn-outline flex-1"
                onClick={() => { setFile(null); setParsed(false); setTransactions([]); setSelected(new Set()); }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary flex-1 gap-1.5"
                onClick={handleConfirmImport}
                disabled={confirming || selected.size === 0}
              >
                {confirming ? <><Loader2 size={14} className="animate-spin" /> Importing...</> : `Confirm & Import ${selected.size} Transaction${selected.size !== 1 ? "s" : ""}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Post-Import Results */}
      {confirmed && (
        <div className="space-y-4 animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1">Imported</p>
              <p className="text-2xl font-bold stat-number text-success">{imported}</p>
            </div>
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1">Skipped (Duplicates)</p>
              <p className="text-2xl font-bold stat-number text-muted-foreground">{skipped}</p>
            </div>
            <div className="kpi-card py-3 px-4">
              <p className="kpi-label mb-1">Total Processed</p>
              <p className="text-2xl font-bold stat-number text-foreground">{transactions.length}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-outline flex-1"
              onClick={() => { setFile(null); setParsed(false); setConfirmed(false); setTransactions([]); setSelected(new Set()); setImported(0); setSkipped(0); }}
            >
              Upload Another
            </button>
            <Link href="/freelancer/payments/transactions" className="btn btn-primary flex-1 text-center">
              View Imported Transactions
            </Link>
          </div>
        </div>
      )}

      {/* Info Cards */}
      {!parsed && !showManual && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              title: "Supported Formats",
              desc: "PDF bank statements from major Indian banks, and CSV files with Date, Description, Debit, Credit columns.",
            },
            {
              title: "Preview Before Import",
              desc: "Extracted transactions are shown for your review. Select which rows to import before saving.",
            },
            {
              title: "Manual Entry Available",
              desc: "For wallet (Paytm, PhonePe, GPay) or cash transactions, use the manual entry form above.",
            },
          ].map((card) => (
            <div key={card.title} className="kpi-card py-4 px-4">
              <p className="text-xs font-bold text-foreground mb-1">{card.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
