"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Receipt,
  Lightbulb,
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/dashboard/expenses",  label: "Expenses",   icon: Receipt },
  { href: "/dashboard/insights",  label: "Insights",   icon: Lightbulb },
  { href: "/dashboard/analytics", label: "Analytics",  icon: BarChart3 },
  { href: "/dashboard/balance",   label: "Balance",    icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside
      suppressHydrationWarning
      className={`
        relative flex flex-col border-r border-sidebar-border bg-sidebar
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? "w-[68px]" : "w-[260px]"}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-sidebar-border ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <TrendingUp size={16} className="text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground leading-none">
              Iteryx
            </p>
            <p className="text-sm font-bold text-foreground leading-tight">Finance</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full border border-border bg-card shadow-sm
                   flex items-center justify-center text-muted-foreground hover:text-foreground
                   transition-all duration-150 hover:shadow-md"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
            Navigation
          </p>
        )}
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`
                nav-item
                ${isActive ? "nav-item-active" : ""}
                ${collapsed ? "justify-center px-0 py-3 mx-1" : ""}
              `}
              title={collapsed ? label : undefined}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              {!collapsed && (
                <span className={`text-sm ${isActive ? "text-primary" : ""}`}>{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={`border-t border-sidebar-border px-2 py-3 space-y-0.5`}>
        <Link
          href="/dashboard/settings"
          className={`nav-item ${collapsed ? "justify-center px-0 py-3 mx-1" : ""}`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={17} className="shrink-0 text-muted-foreground" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={logout}
          className={`nav-item w-full text-left ${collapsed ? "justify-center px-0 py-3 mx-1" : ""}`}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={17} className="shrink-0 text-muted-foreground" />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* User avatar */}
        {!collapsed && (
          <div className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5 bg-muted/50 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 ring-2 ring-primary/20">
              {user?.image ? (
                <img src={user.image} alt={user.name ?? ""} className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name ?? "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mt-2 flex justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center ring-2 ring-primary/20">
              {user?.image ? (
                <img src={user.image} alt={user.name ?? ""} className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
