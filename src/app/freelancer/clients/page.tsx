"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ArrowUpRight, Phone, Mail, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients", { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to load clients" }));
        toast.error("Could not load clients", err.error ?? "Please try again.");
        setClients([]);
        return;
      }
      const data = await res.json();
      setClients(data.clients ?? []);
    } catch {
      toast.error("Network error", "Could not reach the server.");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClients();
  }, []);

  const handleAddClient = async () => {
    if (!name.trim()) {
      toast.error("Client name required", "Please enter a client name.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to add client" }));
        toast.error("Could not add client", err.error ?? "Please try again.");
        return;
      }

      toast.success("Client added", `${name.trim()} was added.`);
      setShowAdd(false);
      setName("");
      setEmail("");
      setPhone("");
      await loadClients();
    } catch {
      toast.error("Network error", "Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.email ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [clients, search]
  );

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { href: "/freelancer/clients", label: "All Clients" },
          { href: "/freelancer/clients/behavior", label: "Payment Behavior" },
          { href: "/freelancer/clients/reliability", label: "Reliability Insights" },
        ].map((tab) => (
          <Link key={tab.href} href={tab.href} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab.href === "/freelancer/clients" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients..."
            className="field-input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm gap-1.5" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Client
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Clients", value: clients.length, color: "text-foreground" },
          { label: "Visible", value: filtered.length, color: "text-foreground" },
          { label: "With Email", value: clients.filter((c) => !!c.email).length, color: "text-success" },
          { label: "With Phone", value: clients.filter((c) => !!c.phone).length, color: "text-warning-foreground" },
        ].map((s) => (
          <div key={s.label} className="kpi-card py-3 px-4">
            <p className="kpi-label mb-1">{s.label}</p>
            <p className={`text-2xl font-bold stat-number ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Client Cards */}
      {loading ? (
        <div className="chart-card text-sm text-muted-foreground">Loading clients...</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((client, i) => (
          <div
            key={client.id}
            className="card-hover group animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <span className="badge badge-neutral text-[10px]">Client</span>
            </div>

            <p className="text-base font-bold text-foreground mb-0.5">{client.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
              <Mail size={10} /> {client.email ?? "No email"}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
              <Phone size={10} /> {client.phone ?? "No phone"}
            </p>

            <div className="grid grid-cols-3 gap-2 text-center border-t border-border pt-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Invoices</p>
                <p className="text-sm font-bold stat-number text-foreground">--</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Paid</p>
                <p className="text-sm font-bold stat-number text-success">--</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Pending</p>
                <p className="text-sm font-bold stat-number text-muted-foreground">--</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Client profile</p>
              <Link href={`/freelancer/clients/${client.id}`} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                Profile <ArrowUpRight size={11} />
              </Link>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="chart-card text-sm text-muted-foreground">No clients found.</div>
        )}
      </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-5 space-y-3">
            <p className="text-base font-bold text-foreground">Add Client</p>
            <div>
              <label className="field-label">Name</label>
              <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." />
            </div>
            <div className="flex gap-2 pt-2">
              <button className="btn btn-outline flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={handleAddClient} disabled={saving}>
                {saving ? "Saving..." : "Add Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
