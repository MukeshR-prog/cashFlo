"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, CalendarDays, Receipt, BrainCircuit, LogOut, Scale, ShieldCheck, Landmark } from "lucide-react";
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

const navigationItems = [
  { href: "/dashboard", label: "Command Center", icon: LayoutDashboard, isActive: (pathname: string) => pathname === "/dashboard" },
  { href: "/dashboard/cashflow", label: "13-Week Cash Flow", icon: CalendarDays, isActive: (pathname: string) => pathname.startsWith("/dashboard/cashflow") },
  { href: "/dashboard/receivables", label: "Collections Hub", icon: Receipt, isActive: (pathname: string) => pathname.startsWith("/dashboard/receivables") },
  { href: "/dashboard/planning", label: "Scenario Planning", icon: Scale, isActive: (pathname: string) => pathname.startsWith("/dashboard/planning") },
  { href: "/dashboard/captable", label: "Cap Table", icon: Landmark, isActive: (pathname: string) => pathname.startsWith("/dashboard/captable") },
  { href: "/dashboard/compliance", label: "Compliance", icon: ShieldCheck, isActive: (pathname: string) => pathname.startsWith("/dashboard/compliance") },
  { href: "/dashboard/copilot", label: "AI Copilot", icon: BrainCircuit, isActive: (pathname: string) => pathname.startsWith("/dashboard/copilot") },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-black text-white">Loading FundSight...</div>;
  }

  if (!user) return null;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="inset" className="border-r border-neutral-800">
        <SidebarHeader className="h-16 border-b border-neutral-800 px-4 justify-center">
          <div className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">FS</div>
            <span>FundSight</span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupLabel>Financial Modules</SidebarGroupLabel>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={item.isActive(pathname)}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                    className="text-neutral-300 hover:text-white data-[active=true]:bg-indigo-500/10 data-[active=true]:text-indigo-300"
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-neutral-800 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar size="default" className="bg-neutral-800">
              <AvatarFallback className="bg-neutral-800 text-neutral-200 border border-neutral-700">
                {user.email?.[0].toUpperCase() || "U"}
              </AvatarFallback>
              <AvatarBadge className="bg-emerald-500" />
            </Avatar>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-white truncate">{user.name || "Founder"}</p>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button onClick={logout} variant="ghost" className="w-full justify-start text-neutral-300 hover:text-white hover:bg-neutral-800">
            <LogOut size={16} />
            <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
          </Button>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-neutral-950 text-neutral-100">
        <header className="h-16 flex items-center px-8 border-b border-neutral-800 bg-neutral-900/20 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger className="mr-2 text-neutral-300 hover:text-white" />
          <h1 className="text-lg font-medium text-neutral-200">Financial Command Center</h1>
          <div className="ml-auto flex items-center gap-4">
            <Badge variant="destructive" className="h-auto px-3 py-1.5 text-xs gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Runway Alert: 6.8 Months
            </Badge>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
