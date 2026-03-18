"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ThemeLogo } from "@/components/branding/ThemeLogo";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Waves,
  BarChart2,
  Scale,
} from "lucide-react";
import { useState } from "react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/freelancer/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/freelancer/dashboard/cashflow", label: "Cash Flow", icon: Waves },
      { href: "/freelancer/dashboard/income", label: "Income Analytics", icon: BarChart2 },
      { href: "/freelancer/dashboard/profitability", label: "Profitability", icon: Scale },
      { href: "/freelancer/dashboard/insights", label: "Insights", icon: Lightbulb },
    ],
  },
  {
    label: "cashFlo",
    items: [
      { href: "/freelancer/invoices", label: "Invoices", icon: FileText },
      { href: "/freelancer/payments", label: "Payments", icon: CreditCard },
      { href: "/freelancer/clients", label: "Clients", icon: Users },
    ],
  },
  {
    label: "Spending",
    items: [
      { href: "/freelancer/expenses", label: "Expenses", icon: Receipt },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/freelancer/reports", label: "Reports", icon: BarChart3 },
    ],
  },
];

export function FreelancerSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "F";

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      suppressHydrationWarning
      className={`relative flex shrink-0 flex-col border-r border-sidebar-border sidebar-bg transition-all duration-300 ease-in-out ${collapsed ? "w-[68px]" : "w-[260px]"}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-1.5 overflow-hidden h-[60px] border-b border-sidebar-border shrink-0 px-4 ${collapsed ? "justify-center px-0" : ""}`}>
        <ThemeLogo width={collapsed ? 28 : 28} height={collapsed ? 28 : 28} priority />
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="text-lg font-bold text-foreground leading-tight tracking-tight">cashFlo</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-[70px] z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-all duration-200 hover:text-foreground hover:shadow-lg hover:scale-105"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-hide space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`nav-item group ${active ? "nav-item-active" : ""} ${collapsed ? "justify-center px-0 py-3 mx-1" : ""}`}
                    title={collapsed ? label : undefined}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors duration-200 ${
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    {!collapsed && (
                      <span className={`text-sm transition-colors duration-200 ${active ? "text-primary" : "group-hover:text-foreground"}`}>{label}</span>
                    )}
                    {active && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary/60 animate-fade-in" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border px-2 py-3 space-y-0.5 shrink-0">
        <Link
          href="/freelancer/settings"
          className={`nav-item group ${collapsed ? "justify-center px-0 py-3 mx-1" : ""}`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={17} className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
          {!collapsed && <span className="group-hover:text-foreground transition-colors">Settings</span>}
        </Link>

        <button
          onClick={logout}
          className={`nav-item w-full text-left group hover:text-destructive hover:bg-destructive/8 ${collapsed ? "justify-center px-0 py-3 mx-1" : ""}`}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={17} className="shrink-0 text-muted-foreground group-hover:text-destructive transition-colors" />
          {!collapsed && <span className="group-hover:text-destructive transition-colors">Sign out</span>}
        </button>

        {/* User profile card */}
        {!collapsed && (
          <div className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/40 border border-border/50 animate-fade-in">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                {user?.image ? (
                  <img src={user.image} alt={user.name ?? ""} className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <span className="online-dot" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">{user?.name ?? "cashFlo User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <span className="badge badge-primary text-[9px] px-1.5 py-0.5 shrink-0">Pro</span>
          </div>
        )}

        {collapsed && (
          <div className="mt-2 flex justify-center">
            <div className="relative w-8 h-8">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center ring-2 ring-primary/20">
                {user?.image ? (
                  <img src={user.image} alt={user.name ?? ""} className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <span className="online-dot" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
