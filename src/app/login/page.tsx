"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { TrendingUp, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If the user is already logged in (e.g., navigated back to /login),
  // send them to the appropriate destination based on their own onboarding state.
  useEffect(() => {
    if (!loading && user) {
      router.replace(
        user.onboardingCompleted === false ? "/onboarding" : "/dashboard"
      );
    }
  }, [loading, router, user]);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // AuthContext.loginWithCredentials handles the routing decision internally
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

  const trustPoints = [
    "Bank-grade security & end-to-end encryption",
    "No credit card required to start",
    "Cancel or delete your account anytime",
  ];

  return (
    <main className="min-h-screen bg-mesh flex">
      {/* ── Left: Brand Panel ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 border-r border-border bg-card px-10 py-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <TrendingUp size={18} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Iteryx</p>
            <p className="text-sm font-bold text-foreground">Finance</p>
          </div>
        </Link>

        {/* Headline */}
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <p className="section-eyebrow mb-3">Welcome back</p>
            <h1 className="text-4xl font-bold text-foreground leading-tight text-balance">
              Your finances,{" "}
              <span className="text-gradient">at a glance</span>
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Sign in to access your personalized dashboard, spending insights, and financial analytics.
            </p>
          </div>

          {/* Preview card mockup */}
          <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Current Balance</p>
                <p className="text-2xl font-bold stat-number text-foreground">₹48,750</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp size={15} className="text-primary" />
              </div>
            </div>
            <div className="flex gap-1 h-8">
              {[40, 60, 50, 80, 55, 70, 65, 90, 75, 85].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-primary/20 flex items-end">
                  <div className="w-full rounded-sm bg-primary transition-all duration-300 hover:bg-primary/80"
                       style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-success mt-2 font-medium">↑ 12% vs last month</p>
          </div>

          {/* Trust signals */}
          <div className="space-y-2">
            {trustPoints.map((point) => (
              <div key={point} className="flex items-start gap-2.5">
                <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">© 2025 Iteryx · Privacy · Terms</p>
      </div>

      {/* ── Right: Form ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp size={16} className="text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-foreground">Iteryx</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-7 animate-fade-up">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Sign in</p>
            <h2 className="text-2xl font-bold text-foreground">Access your account</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your credentials below to continue.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm flex items-start gap-2 animate-fade-down">
              <span className="shrink-0 mt-0.5">⚠</span>
              {error}
            </div>
          )}

          {/* Google button */}
          <button
            className="btn btn-outline w-full mb-5 gap-3 h-11 animate-fade-up"
            onClick={handleGoogle}
            disabled={!isFirebaseConfigured || submitting || loading}
            type="button"
          >
            {/* Google icon */}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary w-full h-11 gap-2 animate-fade-up delay-200"
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
                  <ArrowRight size={15} />
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
