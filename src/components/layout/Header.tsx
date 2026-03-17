"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Search,
  Menu,
  X,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface NotifItem {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/expenses": "Expenses",
  "/dashboard/insights": "Insights",
  "/dashboard/analytics": "Analytics",
  "/dashboard/balance": "Balance",
  "/dashboard/settings": "Settings",
};

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export function Header({ onMobileMenuToggle, mobileMenuOpen }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [todayText, setTodayText]       = useState("");
  const [notifs, setNotifs]             = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);

  // Fetch real notifications every 30s
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setNotifs(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpenNotifPanel = async () => {
    setNotifOpen(true);
    if (unreadCount > 0) {
      try {
        await fetch("/api/notifications", { method: "PATCH" });
        setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      } catch {}
    }
  };

  const pageTitle = routeTitles[pathname] ?? "Dashboard";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

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

  useEffect(() => {
    setTodayText(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6"
      style={{ boxShadow: "0 1px 0 var(--border)" }}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden btn btn-ghost btn-icon"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-foreground tracking-tight truncate">
          {pageTitle}
        </h1>
        <p className="hidden text-xs text-muted-foreground sm:block">
          {todayText}
        </p>
      </div>

      {/* Search (desktop) */}
      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/60 text-sm text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
           style={{ minWidth: 200 }}>
        <Search size={14} />
        <span>Search...</span>
        <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded border border-border bg-background font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="btn btn-ghost btn-icon text-muted-foreground hover:text-foreground"
        aria-label="Toggle theme"
      >
        {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => notifOpen ? setNotifOpen(false) : handleOpenNotifPanel()}
          className="relative btn btn-ghost btn-icon text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-[9px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-popover shadow-lg animate-scale-in overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <button onClick={() => fetch("/api/notifications", { method: "PATCH" }).then(() => { setNotifs((p) => p.map((n) => ({ ...n, read: true }))); setUnreadCount(0); })} className="text-xs text-primary hover:underline">Mark all read</button>
            </div>
            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
              {notifs.length === 0 && (
                <div className="text-center py-8">
                  <Bell size={20} className="text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-xs text-muted-foreground">No notifications yet</p>
                </div>
              )}
              {notifs.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${n.read ? "hover:bg-muted/50" : "hover:bg-muted bg-muted/30"}`}>
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.type === "overdue" ? "bg-destructive" : n.type === "payment" ? "bg-success" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${n.read ? "text-muted-foreground" : "font-medium text-foreground"}`}>{n.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-border">
              <button className="text-xs text-primary hover:underline w-full text-center">View all notifications</button>
            </div>
          </div>
        )}
      </div>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-lg hover:bg-muted px-2 py-1.5 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center ring-2 ring-primary/20 shrink-0">
            {user?.image ? (
              <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[100px]">
              {user?.name ?? "User"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">
              {user?.email}
            </p>
          </div>
          <ChevronDown
            size={14}
            className={`text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-popover shadow-lg animate-scale-in overflow-hidden">
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-xs font-semibold text-foreground">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <div className="p-1.5 space-y-0.5">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <UserIcon size={15} />
                Profile
              </Link>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings size={15} />
                Settings
              </Link>
              <div className="h-px bg-border my-1" />
              <button
                onClick={() => { setDropdownOpen(false); logout(); }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/8 transition-colors w-full text-left"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
