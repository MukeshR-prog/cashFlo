"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { ThemeLogo } from "@/components/branding/ThemeLogo";
import { TrendingUp, ArrowRight, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";

const LOGIN_DEMO_ACCOUNTS = [
  {
    label: "Freelancer demo",
    email: "freelancer@cashflo.com",
    password: "Demo@2024",
    destination: "/freelancer/dashboard",
    role: "freelancer" as const,
  },
  {
    label: "Student demo",
    email: "student@cashflo.com",
    password: "Demo@2024",
    destination: "/dashboard",
    role: "student" as const,
  },
] as const;

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { user, signInWithGoogle, loginWithCredentials, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const destination =
        user.onboardingCompleted === false
          ? "/onboarding"
          : user.role === "freelancer"
            ? "/freelancer/dashboard"
            : "/dashboard";
      router.replace(destination);
    }
  }, [loading, router, user]);

  useEffect(() => {
    const demo = searchParams.get("demo");
    if (!demo) return;

    const selected = LOGIN_DEMO_ACCOUNTS.find((account) => account.role === demo);
    if (!selected) return;

    setEmail(selected.email);
    setPassword(selected.password);
  }, [searchParams]);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginWithCredentials(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  };

  const fillDemoCredentials = (account: (typeof LOGIN_DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  const trustPoints = [
    "Bank-grade security & end-to-end encryption",
    "No credit card required to start",
    "Cancel or delete your account anytime",
  ];

  return (
    <main className="min-h-screen bg-mesh flex overflow-x-hidden">
      {/* ── Left: Brand Panel ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col gap-10 w-[460px] shrink-0 border-r border-border bg-card px-10 py-12 relative overflow-hidden">
        {/* Background blob */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full opacity-10 blur-3xl"
             style={{ background: "radial-gradient(circle, var(--primary), transparent)" }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full opacity-8 blur-3xl"
             style={{ background: "radial-gradient(circle, var(--accent), transparent)" }} />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 group relative z-10">
          <ThemeLogo width={50} height={40} priority className="transition-transform duration-200 group-hover:scale-[1.02]" />
          <div>
            <p className="text-[20px] font-bold uppercase tracking-[0.18em] text-muted-foreground leading-none">cashFlo Platform</p>
          </div>
        </Link>

        {/* Headline */}
        <div className="space-y-7 animate-fade-in-up relative z-10">
          <div>
            <p className="section-eyebrow mb-3">Welcome back</p>
            <h1 className="text-4xl font-bold text-foreground leading-tight text-balance tracking-tight">
              Your finances,{" "}
              <span className="text-gradient">at a glance</span>
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
              Sign in to access your personalized dashboard, spending insights, and financial analytics.
            </p>
          </div>

          {/* Preview card mockup */}
          <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Current Balance</p>
                <p className="text-2xl font-bold stat-number text-foreground">₹48,750</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-primary" />
              </div>
            </div>
            <div className="flex gap-1 h-10 items-end">
              {[40, 60, 50, 80, 55, 70, 65, 90, 75, 85].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{
                  height: `${h}%`,
                  background: `color-mix(in oklch, var(--primary) ${30 + i * 7}%, transparent)`,
                }} />
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-[11px] text-success font-medium">↑ 12% vs last month</p>
              <div className="flex items-center gap-1">
                <span className="pulse-dot" />
                <p className="text-[10px] text-muted-foreground">Live</p>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="space-y-2.5">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-start gap-2.5">
                <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-auto text-xs text-muted-foreground relative z-10">© 2026 cashFlo · Privacy · Terms</p>
      </div>

      {/* ── Right: Form ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 relative overflow-hidden">
        {/* Decorative circle for depth */}
        <div className="absolute top-[-120px] right-[-120px] w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
             style={{ background: "radial-gradient(circle, var(--primary), transparent)" }} />

        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
          <ThemeLogo width={108} height={30} priority />
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-7 animate-fade-up">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary mb-2">Sign in</p>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Access your account</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your credentials below to continue.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="premium-alert premium-alert-danger mb-5 flex items-start gap-2 text-sm text-destructive animate-fade-down">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="mb-5 rounded-xl border border-border bg-muted/35 p-4 animate-fade-up">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-semibold text-foreground tracking-tight">Demo Access (Atlas)</p>
              <span className="badge badge-neutral text-[10px]">Prototype</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Try the app instantly with ready demo accounts for Student and Freelancer.
            </p>
            <div className="space-y-2">
              {LOGIN_DEMO_ACCOUNTS.map((account) => (
                <div
                  key={account.email}
                  className="rounded-lg border border-border/70 bg-background/80 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">{account.label}</p>
                    <button
                      type="button"
                      onClick={() => fillDemoCredentials(account)}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Use this account
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{account.email}</p>
                  <p className="text-xs text-muted-foreground">Password: {account.password}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Google button */}
          <button
            className="btn btn-outline w-full mb-5 gap-3 h-11 animate-fade-up hover:bg-muted/60 group"
            onClick={handleGoogle}
            disabled={!isFirebaseConfigured || submitting || loading}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {isFirebaseConfigured ? "Continue with Google" : "Google not configured"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5 animate-fade-up delay-75">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium px-1">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleCredentials} className="space-y-4 animate-fade-up delay-150">
            <div>
              <label htmlFor="login-email" className="field-label">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="founder@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="field-label mb-0">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary w-full h-11 gap-2 animate-fade-up delay-200 group"
              disabled={submitting || loading}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6 animate-fade-up delay-300">
            Need an account?{" "}
            <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
