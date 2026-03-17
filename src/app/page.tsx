"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { isFirebaseConfigured } from "@/lib/firebase";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  TrendingUp,
  Wallet,
  Receipt,
  Scale,
  Landmark,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Cash Flow Command Center",
    desc: "Live runway tracker, 13-week rolling forecast, and automatic burn-rate alerts before liquidity crises emerge.",
    color: "var(--chart-1)",
  },
  {
    icon: Receipt,
    title: "Automated Collections Hub",
    desc: "Track every outstanding invoice, send automated payment reminders, and eliminate revenue leakage.",
    color: "var(--success)",
  },
  {
    icon: Scale,
    title: "Scenario Planning Engine",
    desc: "Simulate hiring plans, fundraise delays, and market scenarios. See your 12-24 month runway impact instantly.",
    color: "var(--chart-3)",
  },
  {
    icon: Landmark,
    title: "Cap Table & Equity Simulator",
    desc: "Model dilution from any funding round before signing a term sheet. Protect founder ownership with data.",
    color: "var(--chart-5)",
  },
  {
    icon: ShieldCheck,
    title: "Compliance & Tax Alerts",
    desc: "Automated filing calendar, R&D tax credit tracking, and audit risk detection across all deadlines.",
    color: "var(--warning)",
  },
  {
    icon: BrainCircuit,
    title: "AI Financial Copilot",
    desc: "Ask your finances questions in plain English. Get instant answers on burn, runway, and vendor risks.",
    color: "var(--accent)",
  },
];

const stats = [
  { value: "6", label: "Financial modules" },
  { value: "2x", label: "Faster decisions" },
  { value: "13wk", label: "Cash forecast horizon" },
  { value: "AI", label: "Powered insights" },
];

const whyItMatters = [
  "Cash flow problems cause 82% of startup failures",
  "Delayed receivables drain runway silently each month",
  "Founders spend 15h/week on manual financial reporting",
  "Most startups miss tax deadlines due to poor tracking",
];

export default function LandingPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">

      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-md" style={{ background: "color-mix(in oklch, var(--background) 85%, transparent)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 animate-fade-in">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "var(--primary)" }}>
              <TrendingUp size={18} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">FundSight</p>
              <p className="text-sm font-bold text-foreground leading-tight">Financial DSS</p>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {["Features", "Why it works", "Get started"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <button onClick={() => router.push("/dashboard")} className="btn btn-primary btn-sm" id="nav-open-dashboard">
                Open Dashboard
              </button>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex" id="nav-login">
                  Log in
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm" id="nav-signup">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 sm:py-32" id="get-started">
        {/* Background mesh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 40% at 50% 0%, color-mix(in oklch, var(--primary) 10%, transparent), transparent)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Copy */}
            <div className="space-y-8 animate-fade-up">
              <div className="space-y-2">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold border"
                  style={{
                    background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                    borderColor: "color-mix(in oklch, var(--primary) 25%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  <Zap size={11} />
                  Built for Startup Founders
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
                  Financial clarity.{" "}
                  <span className="text-gradient">No spreadsheets</span>{" "}
                  required.
                </h1>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                FundSight gives startup founders real-time financial visibility, AI-powered insights, and scenario modeling — all in one intelligent dashboard.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {user ? (
                  <button onClick={() => router.push("/dashboard")} className="btn btn-primary btn-lg" id="hero-open-dashboard">
                    Open my dashboard <ArrowRight size={16} />
                  </button>
                ) : (
                  <>
                    <Link href="/signup" className="btn btn-primary btn-lg" id="hero-signup">
                      Start for free <ArrowRight size={16} />
                    </Link>
                    <Link href="/login" className="btn btn-outline btn-lg" id="hero-login">
                      Log in
                    </Link>
                  </>
                )}
              </div>

              {!user && isFirebaseConfigured && (
                <button
                  className="text-sm font-medium transition-colors"
                  style={{ color: "var(--primary)" }}
                  onClick={!loading ? signInWithGoogle : undefined}
                  disabled={loading}
                  id="hero-google-signin"
                >
                  {loading ? "Preparing sign-in…" : "Or continue with Google →"}
                </button>
              )}

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                {whyItMatters.slice(0, 2).map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 size={12} style={{ color: "var(--success)" }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard preview card */}
            <div className="animate-fade-up delay-200">
              <div
                className="rounded-2xl border p-6 space-y-4 shadow-lg"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                {/* Mini header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
                      <TrendingUp size={12} className="text-primary-foreground" />
                    </div>
                    <span className="text-sm font-bold text-foreground">FundSight</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: "color-mix(in oklch, var(--destructive) 10%, transparent)",
                      color: "var(--destructive)",
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--destructive)" }} />
                    Runway: 6.8 mo
                  </div>
                </div>

                {/* Mini KPI grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Cash Balance", value: "₹17.8 Cr", color: "var(--chart-1)", up: true },
                    { label: "Monthly Burn", value: "₹31.2 L", color: "var(--destructive)", up: false },
                    { label: "MRR", value: "₹8.9 L", color: "var(--success)", up: true },
                    { label: "Overdue AR", value: "₹14.3 L", color: "var(--warning)", up: false },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="rounded-xl p-3 border"
                      style={{
                        background: "color-mix(in oklch, var(--background) 60%, transparent)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        {kpi.label}
                      </p>
                      <p className="text-lg font-bold" style={{ color: kpi.color }}>
                        {kpi.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mini chart placeholder */}
                <div
                  className="rounded-xl p-4 border"
                  style={{ background: "color-mix(in oklch, var(--muted) 30%, transparent)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <BarChart3 size={12} style={{ color: "var(--primary)" }} />
                      Cash Trend
                    </span>
                    <span className="text-[10px] text-muted-foreground">6 months</span>
                  </div>
                  <div className="h-20 flex items-end gap-1.5">
                    {[85, 78, 72, 65, 60, 60].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm transition-all"
                        style={{
                          height: `${h}%`,
                          background: i === 5
                            ? "var(--primary)"
                            : `color-mix(in oklch, var(--primary) 40%, transparent)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Band ────────────────────────────────────── */}
      <section className="border-y border-border py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={stat.label} className="text-center animate-fade-up" style={{ animationDelay: `${idx * 80}ms` }}>
              <p className="text-3xl sm:text-4xl font-bold text-gradient">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-24" id="features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 animate-fade-up">
            <p className="section-eyebrow mb-3">Everything you need</p>
            <h2 className="section-title max-w-2xl mx-auto text-balance">
              Your complete financial command center
            </h2>
            <p className="section-body mt-4 max-w-xl mx-auto">
              Six powerful modules that give startup founders enterprise-grade financial intelligence — without the enterprise complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border p-6 hover:shadow-md transition-all duration-200 animate-fade-up"
                style={{
                  background: "var(--card)",
                  animationDelay: `${idx * 60}ms`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-200"
                  style={{ background: `color-mix(in oklch, ${feature.color} 12%, transparent)` }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why it matters ────────────────────────────────── */}
      <section className="py-24 border-y border-border" id="why-it-works" style={{ background: "color-mix(in oklch, var(--primary) 3%, var(--background))" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-up">
              <p className="section-eyebrow mb-3">The problem</p>
              <h2 className="section-title max-w-lg text-balance">
                Cash flow problems kill startups. Clarity prevents them.
              </h2>
              <p className="section-body mt-4 max-w-md">
                Most founders track finances reactively — only discovering problems when it&apos;s too late to course correct. FundSight shifts you from reactive to predictive.
              </p>

              <div className="mt-8 space-y-3">
                {whyItMatters.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "color-mix(in oklch, var(--destructive) 12%, transparent)" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--destructive)" }} />
                    </div>
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-up delay-200 space-y-4">
              {[
                { title: "From spreadsheets", subtitle: "Manual, error-prone, 8h/week", bad: true },
                { title: "To live dashboards", subtitle: "Automated, real-time, AI-assisted", bad: false },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border p-6 flex items-center gap-4"
                  style={{
                    background: item.bad
                      ? "color-mix(in oklch, var(--destructive) 5%, var(--card))"
                      : "color-mix(in oklch, var(--success) 5%, var(--card))",
                    borderColor: item.bad
                      ? "color-mix(in oklch, var(--destructive) 20%, transparent)"
                      : "color-mix(in oklch, var(--success) 20%, transparent)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                    style={{
                      background: item.bad
                        ? "color-mix(in oklch, var(--destructive) 12%, transparent)"
                        : "color-mix(in oklch, var(--success) 12%, transparent)",
                    }}
                  >
                    {item.bad
                      ? <Scale size={18} style={{ color: "var(--destructive)" }} />
                      : <TrendingUp size={18} style={{ color: "var(--success)" }} />
                    }
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8 animate-fade-up">
          <div>
            <p className="section-eyebrow mb-3">Get started today</p>
            <h2 className="section-title text-balance">
              Take control of your startup&apos;s financial future
            </h2>
            <p className="section-body mt-4 max-w-xl mx-auto">
              Join founders who use FundSight to make confident financial decisions, prevent cash crises, and scale sustainably.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <button onClick={() => router.push("/dashboard")} className="btn btn-primary btn-lg" id="cta-open-dashboard">
                Open my dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link href="/signup" className="btn btn-primary btn-lg" id="cta-signup">
                  Start for free <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="btn btn-outline btn-lg" id="cta-login">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--primary)" }}>
              <TrendingUp size={12} className="text-primary-foreground" />
            </div>
            <span>FundSight</span>
          </div>
          <span>Financial Decision Support for Startups · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
