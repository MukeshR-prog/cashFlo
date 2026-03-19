"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import {
  Bell, Sun, Moon, ChevronDown, Search, Menu, X, LogOut, Settings, User as UserIcon,
  CheckCheck, AlertCircle, Info, TrendingDown,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  "/freelancer/dashboard": { title: "Dashboard", subtitle: "Overview of your freelance finances" },
  "/freelancer/dashboard/cashflow": { title: "Cash Flow", subtitle: "Inflow, outflow, and real-time cash position" },
  "/freelancer/dashboard/income": { title: "Income Analytics", subtitle: "Settled and expected monthly income trends" },
  "/freelancer/dashboard/profitability": { title: "Profitability", subtitle: "Profit/loss and business expense impact" },
  "/freelancer/dashboard/insights": { title: "Smart Insights", subtitle: "AI-powered financial recommendations" },
  "/freelancer/invoices": { title: "Invoices", subtitle: "All invoices · create, manage, track" },
  "/freelancer/invoices/create": { title: "Create Invoice", subtitle: "Generate a new invoice for your client" },
  "/freelancer/invoices/drafts": { title: "Draft Invoices", subtitle: "Incomplete invoices saved as drafts" },
  "/freelancer/invoices/sent": { title: "Sent & Due", subtitle: "Sent invoices and upcoming due dates" },
  "/freelancer/invoices/timeline": { title: "Invoice Timeline", subtitle: "Chronological event log for invoices" },
  "/freelancer/invoices/reports": { title: "Invoice Reports", subtitle: "Lifecycle reports with export options" },
  "/freelancer/payments": { title: "Payments", subtitle: "All payment records and transactions" },
  "/freelancer/payments/partial": { title: "Partial Payments", subtitle: "Invoices with installment payment history" },
  "/freelancer/payments/settlements": { title: "Settlements", subtitle: "Fully settled and closed invoices" },
  "/freelancer/payments/acknowledgements": { title: "Acknowledgements", subtitle: "Payment confirmation log" },
  "/freelancer/clients": { title: "Clients", subtitle: "Manage your client roster and relationships" },
  "/freelancer/clients/behavior": { title: "Payment Behavior", subtitle: "Client payment patterns and delays" },
  "/freelancer/clients/reliability": { title: "Reliability Insights", subtitle: "Client risk analysis and recommendations" },
  "/freelancer/expenses": { title: "Expenses", subtitle: "Track business and personal spending" },
  "/freelancer/expenses/add": { title: "Add Expense", subtitle: "Log a new expense entry" },
  "/freelancer/expenses/categories": { title: "Expense Categories", subtitle: "Breakdown by spending category" },
  "/freelancer/expenses/business-personal": { title: "Business vs Personal", subtitle: "Split view of expense types" },
  "/freelancer/reports": { title: "Reports", subtitle: "Monthly, annual, and tax-ready reports" },
  "/freelancer/reports/annual": { title: "Annual Report", subtitle: "Full-year financial overview" },
  "/freelancer/reports/tax": { title: "Tax Summary", subtitle: "Tax-ready expense and income summary" },
  "/freelancer/reports/invoice-completion": { title: "Invoice Completion", subtitle: "Lifecycle completion report" },
  "/freelancer/settings": { title: "Settings", subtitle: "Account preferences and configuration" },
};

const dataCaptureQuickLinks = [
  { href: "/freelancer/payments/upload", label: "Upload" },
  { href: "/freelancer/payments/transactions", label: "Transactions" },
  { href: "/freelancer/payments/reminders", label: "Reminders" },
];

interface NotifItem {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const typeIcon = (type: string) => {
  switch (type) {
    case "overdue":   return { Icon: AlertCircle,  cls: "text-destructive",  bg: "bg-destructive/8" };
    case "payment":   return { Icon: CheckCheck,    cls: "text-success",      bg: "bg-success/8" };
    case "expense":   return { Icon: TrendingDown,  cls: "text-warning",      bg: "bg-warning/8" };
    default:          return { Icon: Info,           cls: "text-primary",      bg: "bg-primary/8" };
  }
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export function FreelancerHeader({ onMobileMenuToggle, mobileMenuOpen }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifs, setNotifs]             = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [authExpired, setAuthExpired]   = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);

  const pageInfo = pathname.startsWith("/freelancer/clients/")
    ? { title: "Client Profile", subtitle: "Client details, invoices, and payment history" }
    : routeTitles[pathname] ?? { title: "Dashboard", subtitle: "cashFlo workspace" };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "F";

  // ── Fetch notifications ──────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (authExpired) return;
    try {
      const res = await fetch("/api/notifications", { cache: "no-store", credentials: "include" });
      if (res.status === 401) {
        setAuthExpired(true);
        setNotifs([]);
        setUnreadCount(0);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      setNotifs(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silently fail
    }
  }, [authExpired]);

  useEffect(() => {
    if (authExpired) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications, authExpired]);

  useEffect(() => {
    if (!authExpired) return;
    router.replace("/login");
  }, [authExpired, router]);

  // ── Mark all as read when panel opens ────────────────────────────────────────
  const handleOpenNotifPanel = async () => {
    setNotifOpen(true);
    if (unreadCount > 0) {
      try {
        await fetch("/api/notifications", { method: "PATCH", credentials: "include" });
        setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      } catch {
        // silently fail
      }
    }
  };

  // ── Click outside ────────────────────────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-6"
      style={{ boxShadow: "0 1px 0 var(--border)" }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden btn btn-ghost btn-icon relative"
        aria-label="Toggle menu"
      >
        <span className={`absolute transition-all duration-200 ${mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`}>
          <X size={20} />
        </span>
        <span className={`transition-all duration-200 ${mobileMenuOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}`}>
          <Menu size={20} />
        </span>
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold text-foreground tracking-tight truncate leading-tight">
          {pageInfo.title}
        </h1>
        <p className="text-[11px] text-muted-foreground hidden sm:block truncate leading-tight">
          {pageInfo.subtitle}
        </p>
      </div>

      {/* High-visibility data capture shortcuts */}
      <div className="hidden lg:flex items-center gap-1.5">
        {dataCaptureQuickLinks.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
              title={item.label}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Search bar */}
      <div
        className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm text-muted-foreground cursor-pointer transition-all duration-200 ${
          searchFocused ? "border-primary bg-card shadow-sm" : "border-border bg-muted/50 hover:bg-muted"
        }`}
        style={{ minWidth: 200, boxShadow: searchFocused ? "0 0 0 3px color-mix(in oklch, var(--ring) 12%, transparent)" : undefined }}
        tabIndex={0}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
      >
        <Search size={14} className={searchFocused ? "text-primary" : ""} />
        <span className="flex-1">Search...</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-background font-mono text-muted-foreground">⌘K</kbd>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="btn btn-ghost btn-icon text-muted-foreground hover:text-foreground"
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => notifOpen ? setNotifOpen(false) : handleOpenNotifPanel()}
          className="relative btn btn-ghost btn-icon text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-[9px] font-bold text-destructive-foreground animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 rounded-xl border border-border bg-popover shadow-xl animate-scale-in overflow-hidden" style={{ width: 320 }}>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <span className="text-[10px] badge badge-primary">{notifs.length} total</span>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {notifs.length === 0 && (
                <div className="text-center py-8">
                  <Bell size={22} className="text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted-foreground">No notifications yet</p>
                </div>
              )}
              {notifs.map((n) => {
                const { Icon, cls, bg } = typeIcon(n.type);
                return (
                  <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${n.read ? "hover:bg-muted/50" : "hover:bg-muted bg-muted/30"}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${bg}`}>
                      <Icon size={14} className={cls} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.message}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full shrink-0 bg-primary" />}
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-border bg-muted/30">
              <button
                onClick={() => fetch("/api/notifications", { method: "PATCH", credentials: "include" }).then(() => { setNotifs((p) => p.map((n) => ({ ...n, read: true }))); setUnreadCount(0); })}
                className="text-xs text-primary hover:underline w-full text-center font-medium"
              >
                Mark all as read
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-xl hover:bg-muted px-2 py-1.5 transition-colors cursor-pointer"
        >
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center ring-2 ring-primary/20 shrink-0">
              {user?.image ? <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" /> : initials}
            </div>
            <span className="online-dot" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[96px]">{user?.name ?? "cashFlo User"}</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[96px]">{user?.email}</p>
          </div>
          <ChevronDown size={13} className={`text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover shadow-xl animate-scale-in overflow-hidden">
            <div className="px-3.5 py-3 border-b border-border">
              <p className="text-xs font-semibold text-foreground">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              <span className="badge badge-primary text-[10px] mt-1.5">cashFlo Pro</span>
            </div>
            <div className="p-1.5 space-y-0.5">
              <Link href="/freelancer/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" onClick={() => setDropdownOpen(false)}>
                <UserIcon size={15} className="text-primary" /> Profile
              </Link>
              <Link href="/freelancer/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" onClick={() => setDropdownOpen(false)}>
                <Settings size={15} className="text-muted-foreground" /> Settings
              </Link>
              <div className="h-px bg-border my-1" />
              <button onClick={() => { setDropdownOpen(false); logout(); }} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/8 transition-colors w-full text-left">
                <LogOut size={15} /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
