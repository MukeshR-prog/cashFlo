"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BrainCircuit,
  CalendarDays,
  ChevronDown,
  Landmark,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Receipt,
  SlidersHorizontal,
  Scale,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Toaster, ToastItem } from "@/components/ui/toaster";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, isActive: (pathname: string) => pathname === "/dashboard" },
  { href: "/dashboard/cashflow", label: "Cash Flow", icon: CalendarDays, isActive: (pathname: string) => pathname.startsWith("/dashboard/cashflow") },
  { href: "/dashboard/receivables", label: "Collections", icon: Receipt, isActive: (pathname: string) => pathname.startsWith("/dashboard/receivables") },
  { href: "/dashboard/planning", label: "Scenario Planning", icon: Scale, isActive: (pathname: string) => pathname.startsWith("/dashboard/planning") },
  { href: "/dashboard/captable", label: "Cap Table", icon: Landmark, isActive: (pathname: string) => pathname.startsWith("/dashboard/captable") },
  { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheck, isActive: (pathname: string) => pathname.startsWith("/dashboard/compliance") },
  { href: "/dashboard/copilot", label: "AI Assistant", icon: BrainCircuit, isActive: (pathname: string) => pathname.startsWith("/dashboard/copilot") },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, isActive: (pathname: string) => pathname.startsWith("/dashboard/settings") },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pageTitle = useMemo(() => {
    const activeItem = navigationItems.find((item) => item.isActive(pathname));
    return activeItem?.label || "Dashboard";
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const nextToast: ToastItem = {
      id: `toast-${Date.now()}`,
      title: "AI Monitor Active",
      description: "Financial anomaly scan refreshed with latest transactions.",
    };
    setToasts((prev) => [...prev, nextToast]);

    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== nextToast.id));
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-black text-white">Loading FundSight...</div>;
  }

  if (!user) return null;

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border/70">
          <SidebarHeader className="h-16 border-b border-sidebar-border/70 px-4 justify-center">
            <div className="font-display font-bold text-xl tracking-tight text-sidebar-foreground flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,hsl(var(--chart-2))_50%,hsl(var(--chart-4))_100%)] flex items-center justify-center text-sm text-white shadow-md">
                FD
              </div>
              <span className="group-data-[collapsible=icon]:hidden">Financial DSS</span>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4">
            <SidebarGroup>
              <SidebarGroupLabel>Platform Modules</SidebarGroupLabel>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={item.isActive(pathname)}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                      className="text-sidebar-foreground/80 hover:text-sidebar-foreground data-[active=true]:bg-sidebar-primary/14 data-[active=true]:text-sidebar-primary transition-all duration-200"
                    >
                      <item.icon size={17} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border/70 p-3">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar size="default" className="bg-sidebar-accent border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground border border-sidebar-border">
                  {user.email?.[0].toUpperCase() || "U"}
                </AvatarFallback>
                <AvatarBadge className="bg-emerald-500" />
              </Avatar>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name || "Founder"}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
              </div>
            </div>
            <Button onClick={logout} variant="ghost" className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
              <LogOut size={16} />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </Button>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-[radial-gradient(circle_at_top_right,oklch(0.89_0.08_170)_0%,transparent_32%),radial-gradient(circle_at_bottom_left,oklch(0.92_0.04_220)_0%,transparent_24%)] dark:bg-[radial-gradient(circle_at_top_right,oklch(0.26_0.07_170)_0%,transparent_30%),radial-gradient(circle_at_bottom_left,oklch(0.23_0.06_220)_0%,transparent_25%)]">
          <header className="h-16 flex items-center gap-3 px-4 md:px-6 border-b border-border/70 bg-background/80 backdrop-blur-xl sticky top-0 z-20">
            <SidebarTrigger className="text-foreground/80 hover:text-foreground" />
            <h1 className="hidden md:block text-sm font-semibold text-muted-foreground">{pageTitle}</h1>

            <div className="relative ml-auto w-full max-w-md">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search metrics, vendors, invoices..." />
            </div>

            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="icon-sm" />}>
                <Bell size={15} />
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>

            <Dialog>
              <DialogTrigger render={<Button variant="outline" size="icon-sm" />}>
                <Sparkles size={15} />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Founder Insight Brief</DialogTitle>
                  <DialogDescription>
                    Cash runway is stable for 6.8 months. Collections risk is elevated due to two overdue invoices.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon-sm" />}>
                <SlidersHorizontal size={15} />
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Quick Actions</SheetTitle>
                  <SheetDescription>
                    Jump to frequently used workflows for cash flow and compliance operations.
                  </SheetDescription>
                </SheetHeader>
                <div className="p-4 space-y-2">
                  <Button variant="secondary" className="w-full justify-start" onClick={() => router.push("/dashboard/cashflow")}>
                    Open 13-Week Cash Model
                  </Button>
                  <Button variant="secondary" className="w-full justify-start" onClick={() => router.push("/dashboard/receivables")}>
                    Review Overdue Collections
                  </Button>
                  <Button variant="secondary" className="w-full justify-start" onClick={() => router.push("/dashboard/compliance")}>
                    Check Compliance Deadlines
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 hover:bg-muted transition-colors">
                <Avatar size="sm" className="bg-muted">
                  <AvatarFallback className="bg-muted text-foreground">
                    {user.email?.[0].toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown size={14} className="text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name || "Founder"}</DropdownMenuLabel>
                <DropdownMenuLabel className="pt-0 text-[11px] font-normal">{user.email || ""}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/copilot")}>AI Assistant</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline" className="rounded-full border-amber-500/30 text-amber-500 bg-amber-500/10">
                <span className="mr-1 inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Runway Signal: 6.8 months
              </Badge>
              <span className="hidden md:block">Financial Decision Support System for Startups</span>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">{children}</div>
          </div>
          <Toaster toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((item) => item.id !== id))} />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
