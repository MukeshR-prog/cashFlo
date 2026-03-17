/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight, TrendingUp, BarChart3, Shield, Zap, CheckCircle,
  LineChart, Receipt, Brain, ChevronRight, Star,
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
    color: "var(--chart-1)",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    body: "Pattern detection flags spending spikes, unusual activity, and trends before they become problems.",
    color: "var(--chart-2)",
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
    color: "var(--chart-3)",
  },
  {
    icon: Receipt,
    title: "Expense Management",
    body: "Log expenses in seconds with smart category detection, multi-device sync, and rich filtering.",
    color: "var(--chart-4)",
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
    quote: "Iteryx completely changed how I manage finances. The insights are incredibly sharp and the UI is beautiful.",
    name: "Aryan Mehta",
    role: "Freelance Designer",
    initials: "AM",
  },
  {
    quote: "I used to track expenses in spreadsheets. Now I open Iteryx every morning. It's become a daily ritual.",
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

export default function LandingPage() {
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <TrendingUp size={16} className="text-primary-foreground" />
            </div>
            <span className="text-base font-bold text-foreground">Iteryx</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-all duration-150"
              >
                {link.label}
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
              <Link href="/dashboard" className="btn btn-primary btn-sm gap-1.5">
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
        {/* Subtle grid */}
        <div className="absolute inset-0 grid-pattern pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground mb-8 animate-fade-down shadow-sm">
            <span className="pulse-dot" />
            <span>New: AI spending pattern detection is live</span>
            <ChevronRight size={12} />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight text-balance mb-6 animate-fade-up">
            Take control of your{" "}
            <span className="text-gradient">finances</span>
            <br />
            with clarity
          </h1>

          {/* Sub */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance animate-fade-up delay-100">
            Iteryx turns raw expense data into actionable intelligence. Track spending, spot patterns, and make confident financial decisions — all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16 animate-fade-up delay-200">
            <Link href="/signup" className="btn btn-primary btn-lg gap-2 shadow-md hover:shadow-lg">
              Start for free
              <ArrowRight size={17} />
            </Link>
            <Link href="/dashboard" className="btn btn-outline btn-lg gap-2">
              See the dashboard
              <BarChart3 size={16} />
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fade-up delay-300">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold stat-number text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Dashboard preview card */}
          <div className="mt-16 relative max-w-4xl mx-auto animate-fade-up delay-400">
            <div className="absolute -inset-2 rounded-3xl opacity-20 blur-2xl"
                 style={{ background: "radial-gradient(ellipse at center, var(--primary), transparent 70%)" }} />
            <div className="relative rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
              {/* Fake dashboard header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-sidebar">
                <div className="w-3 h-3 rounded-full bg-destructive opacity-60" />
                <div className="w-3 h-3 rounded-full bg-warning opacity-60" />
                <div className="w-3 h-3 rounded-full bg-success opacity-60" />
                <div className="flex-1 mx-8 h-5 rounded-full bg-muted/80" />
              </div>
              {/* Fake dashboard content */}
              <div className="p-5 grid grid-cols-4 gap-3">
                {["₹48,750", "₹26,400", "47", "Food"].map((v, i) => (
                  <div key={i} className="rounded-xl bg-muted/60 p-3.5 space-y-2">
                    <div className="h-2 w-12 rounded skeleton" />
                    <p className="text-base font-bold stat-number text-foreground">{v}</p>
                    <div className="h-1.5 w-8 rounded skeleton" />
                  </div>
                ))}
                <div className="col-span-3 rounded-xl bg-muted/60 p-3.5 h-28 skeleton" />
                <div className="col-span-1 rounded-xl bg-muted/60 p-3.5 h-28 skeleton" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust logos ───────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
            Trusted by professionals at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {["Razorpay", "Freshworks", "Zerodha", "Groww", "CRED"].map((name) => (
              <span key={name} className="text-sm font-bold text-muted-foreground">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
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
                className="card-hover group animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `color-mix(in oklch, ${f.color} 12%, transparent)` }}
                >
                  <Icon size={19} style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section id="insights" className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-eyebrow mb-3">Testimonials</p>
            <h2 className="section-title">Loved by finance-conscious people</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="card-hover flex flex-col gap-4 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
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
              className={`relative rounded-2xl border p-6 transition-all duration-200 animate-fade-up ${
                plan.highlighted
                  ? "border-primary bg-primary/4 shadow-lg ring-1 ring-primary/30"
                  : "border-border bg-card hover:shadow-md"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow">
                    Most popular
                  </span>
                </div>
              )}
              <p className="text-sm font-bold text-muted-foreground mb-2">{plan.name}</p>
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
                className={`btn w-full ${plan.highlighted ? "btn-primary" : "btn-outline"}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border bg-primary py-20 text-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 dot-pattern" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary-foreground mb-5 tracking-tight">
            Start tracking smarter today
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join 5,200+ people who have taken control of their finances with Iteryx.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="btn btn-lg gap-2 bg-white text-primary hover:bg-white/90 font-bold shadow-md"
            >
              Create free account
              <ArrowRight size={17} />
            </Link>
            <Link href="/dashboard" className="btn btn-lg gap-2 bg-transparent border border-primary-foreground/30 text-primary-foreground hover:bg-white/10">
              Explore dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <TrendingUp size={12} className="text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground">Iteryx</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-xs text-muted-foreground">© 2025 Iteryx. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
