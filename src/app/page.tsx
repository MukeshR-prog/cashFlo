/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ThemeLogo } from "@/components/branding/ThemeLogo";
import {
  ArrowRight, BarChart3, Shield, Zap, CheckCircle,
  LineChart, Receipt, Brain, ChevronRight, Star, Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#insights", label: "Insights" },
  { href: "#pricing", label: "Pricing" },
];

const features = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    body: "Professional charts and heatmaps give you instant clarity on where your money goes — no guesswork needed.",
    color: "var(--primary)",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    body: "Pattern detection flags spending spikes, unusual activity, and trends before they become problems.",
    color: "var(--accent)",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    body: "End-to-end encryption and secure session management ensures your financial data stays private.",
    color: "var(--success)",
  },
  {
    icon: LineChart,
    title: "Budget Tracking",
    body: "Set monthly budgets per category and track progress in real-time with visual progress indicators.",
    color: "var(--primary)",
  },
  {
    icon: Receipt,
    title: "Expense Management",
    body: "Log expenses in seconds with smart category detection, multi-device sync, and rich filtering.",
    color: "var(--accent)",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    body: "Get notified the moment you hit budget limits or when unusual spending patterns are detected.",
    color: "var(--warning)",
  },
];

const testimonials = [
  {
    quote: "cashFlo completely changed how I manage finances. The insights are incredibly sharp and the UI is beautiful.",
    name: "Aryan Mehta",
    role: "Freelance Designer",
    initials: "AM",
  },
  {
    quote: "I used to track expenses in spreadsheets. Now I open cashFlo every morning. It's become a daily ritual.",
    name: "Priya Nair",
    role: "Startup Founder",
    initials: "PN",
  },
  {
    quote: "The analytics page alone is worth it. The heatmap and stacked charts make spending patterns obvious.",
    name: "Rohit Sharma",
    role: "Software Engineer",
    initials: "RS",
  },
];

const stats = [
  { value: "5,200+", label: "Active users" },
  { value: "₹12Cr+", label: "Expenses tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "User rating" },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/mo",
    features: ["Up to 50 expenses/month", "Basic charts", "3 months history", "Email support"],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/mo",
    features: ["Unlimited expenses", "All analytics & insights", "AI pattern detection", "12 months history", "Priority support", "CSV export"],
    cta: "Start Pro trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "₹799",
    period: "/mo",
    features: ["Everything in Pro", "Up to 5 team members", "Shared dashboards", "Admin controls", "Dedicated support"],
    cta: "Contact sales",
    highlighted: false,
  },
];

const trustBrands = ["Razorpay", "Freshworks", "Zerodha", "Groww", "CRED", "Razorpay", "Freshworks", "Zerodha", "Groww", "CRED"];

export default function LandingPage() {
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dashboardHref = user?.role === "freelancer" ? "/freelancer/dashboard" : "/dashboard";

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className={`sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl transition-all duration-300 ${scrolled ? "border-border shadow-sm" : "border-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <ThemeLogo width={112} height={30} priority className="transition-transform duration-200 group-hover:scale-[1.02]" />
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all duration-150 group"
              >
                {link.label}
                <span className="absolute bottom-0.5 left-3.5 right-3.5 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="btn btn-ghost btn-icon text-muted-foreground"
              >
                {resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}
            {user ? (
              <Link href={dashboardHref} className="btn btn-primary btn-sm gap-1.5">
                Dashboard <ArrowRight size={13} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm text-muted-foreground">
                  Sign in
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm gap-1.5">
                  Get started <ArrowRight size={13} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-mesh">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-pattern pointer-events-none" />
        {/* Blurred blobs */}
        <div className="hero-blob w-[600px] h-[600px] bg-primary top-[-200px] left-[-100px]" />
        <div className="hero-blob w-[400px] h-[400px] bg-accent bottom-[-100px] right-[-80px]" style={{ animationDelay: "3s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur px-3.5 py-1.5 text-xs font-semibold text-muted-foreground mb-8 animate-fade-down shadow-sm">
            <span className="pulse-dot" />
            <Sparkles size={11} className="text-primary" />
            <span>New: AI spending pattern detection is live</span>
            <ChevronRight size={12} />
          </div>

          {/* Headline — staggered reveal */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight text-balance mb-6">
            <span className="block animate-fade-up">Take control of your</span>
            <span className="block animate-fade-up delay-75">
              <span className="text-gradient">finances</span>
            </span>
            <span className="block animate-fade-up delay-150">with clarity</span>
          </h1>

          {/* Sub */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance animate-fade-up delay-200">
            cashFlo turns raw expense data into actionable intelligence. Track spending, spot patterns, and make confident financial decisions, all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16 animate-fade-up delay-300">
            <Link href="/signup" className="btn btn-primary btn-lg gap-2 shadow-md hover:shadow-lg group">
              Start for free
              <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
            <Link href={dashboardHref} className="btn btn-outline btn-lg gap-2">
              See the dashboard
              <BarChart3 size={16} />
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto animate-fade-up delay-400">
            {stats.map((s, i) => (
              <div key={s.label} className="text-center animate-count-up" style={{ animationDelay: `${400 + i * 80}ms` }}>
                <p className="text-2xl font-bold stat-number text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Floating dashboard preview — layered cards */}
          <div className="mt-20 relative max-w-4xl mx-auto animate-fade-up delay-500">
            {/* Glow halo */}
            <div className="absolute -inset-4 rounded-3xl opacity-30 blur-3xl"
                 style={{ background: "radial-gradient(ellipse at center, var(--primary), transparent 70%)" }} />

            {/* Shadow card behind */}
            <div className="absolute inset-x-6 -bottom-3 top-3 rounded-2xl border border-border bg-muted/50 opacity-40 blur-sm" />

            {/* Main card */}
            <div className="relative rounded-2xl border border-border bg-card shadow-xl overflow-hidden noise">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-sidebar">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <div className="flex-1 mx-6 h-5 rounded-full bg-muted/80" />
              </div>
              {/* Fake dashboard content */}
              <div className="p-5 grid grid-cols-4 gap-3">
                {[
                  { label: "Total Invoiced", value: "₹2,45,000" },
                  { label: "Cash In", value: "₹1,88,500" },
                  { label: "Pending", value: "₹38,200" },
                  { label: "Overdue", value: "₹18,300" },
                ].map((card, i) => (
                  <div key={i} className="rounded-xl bg-muted/60 p-3.5 space-y-1.5 border border-border/50">
                    <div className="h-1.5 w-14 rounded skeleton" />
                    <p className="text-sm font-bold stat-number text-foreground">{card.value}</p>
                    <div className="h-1.5 w-10 rounded skeleton" />
                  </div>
                ))}
                <div className="col-span-3 rounded-xl bg-muted/60 border border-border/50 p-3.5 h-32">
                  {/* Mini chart bars */}
                  <div className="flex items-end gap-1.5 h-full pb-1">
                    {[45, 70, 50, 85, 60, 90, 72, 80, 65, 95].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{
                        height: `${h}%`,
                        background: `color-mix(in oklch, var(--primary) ${40 + i * 6}%, transparent)`,
                      }} />
                    ))}
                  </div>
                </div>
                <div className="col-span-1 rounded-xl bg-muted/60 border border-border/50 p-3.5 h-32 flex flex-col justify-center items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-4 border-primary" />
                  </div>
                  <div className="h-1.5 w-12 rounded skeleton" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust logos marquee ─────────────────────────────── */}
      <section className="border-y border-border bg-muted/30 py-6 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted by professionals at
          </p>
        </div>
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10" style={{ background: "linear-gradient(to right, var(--background), transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10" style={{ background: "linear-gradient(to left, var(--background), transparent)" }} />
          <div className="flex overflow-hidden">
            <div className="marquee-track">
              {[...trustBrands, ...trustBrands].map((name, i) => (
                <span key={i} className="text-sm font-bold text-muted-foreground/50 px-6 shrink-0">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-eyebrow mb-3">Features</p>
          <h2 className="section-title mb-4">Everything you need to track smarter</h2>
          <p className="section-body max-w-xl mx-auto">
            Built for individuals who want professional-grade financial intelligence without the complexity.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-250 hover:shadow-md hover:-translate-y-1 hover:border-primary/20 overflow-hidden animate-fade-up cursor-pointer"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {/* Subtle gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-sm transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `color-mix(in oklch, ${f.color} 10%, transparent)` }}
                >
                  <Icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section id="insights" className="py-20 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-eyebrow mb-3">Testimonials</p>
            <h2 className="section-title">Loved by cash-conscious people</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="group relative rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-250 hover:shadow-md hover:-translate-y-1 hover:border-primary/20 flex flex-col gap-4 animate-fade-up"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="flex items-center gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 ring-2 ring-primary/15">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="section-eyebrow mb-3">Pricing</p>
          <h2 className="section-title mb-4">Simple, honest pricing</h2>
          <p className="section-body max-w-md mx-auto">
            Start free. Upgrade when you need more power.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 transition-all duration-250 animate-fade-up ${
                plan.highlighted
                  ? "border-primary bg-card shadow-xl ring-2 ring-primary/20 hover:shadow-2xl hover:-translate-y-1"
                  : "border-border bg-card hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20"
              }`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold text-primary-foreground shadow-md tracking-wide">
                    Most popular
                  </span>
                </div>
              )}
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-bold stat-number text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle size={14} className={`mt-0.5 shrink-0 ${plan.highlighted ? "text-primary" : "text-success"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`btn w-full group ${plan.highlighted ? "btn-primary gap-2" : "btn-outline"}`}
              >
                {plan.cta}
                {plan.highlighted && <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />}
              </Link>
              {plan.highlighted && (
                <p className="text-center text-[11px] text-muted-foreground mt-3">✓ 14-day free trial, no credit card</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border py-24 text-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-gradient-x" style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 50%, var(--primary) 100%)",
          backgroundSize: "200% 200%",
        }} />
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 dot-pattern" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight text-balance">
            Start tracking smarter today
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join 5,200+ people who have taken control of their finances with cashFlo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="btn btn-lg gap-2 bg-white text-primary hover:bg-white/95 font-bold shadow-lg group"
            >
              Create free account
              <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href={dashboardHref} className="btn btn-lg gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur">
              Explore dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ThemeLogo width={92} height={24} />
              <span className="text-xs text-muted-foreground ml-1">- Smart Money OS</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              <a href="#" className="hover:text-foreground transition-colors">Blog</a>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 cashFlo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
