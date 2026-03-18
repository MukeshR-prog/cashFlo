"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { ThemeLogo } from "@/components/branding/ThemeLogo";
import { ArrowRight, Eye, EyeOff, CheckCircle, Shield, BarChart3, Brain, AlertTriangle, Users } from "lucide-react";

const benefits = [
  { icon: BarChart3, title: "Smart analytics", body: "Visual charts and heatmaps make your spending crystal clear.", color: "var(--primary)" },
  { icon: Brain,     title: "AI insights",     body: "Detect spending spikes and unusual patterns automatically.", color: "var(--accent)" },
  { icon: Shield,    title: "Fully private",   body: "Your financial data is encrypted and never sold.", color: "var(--success)" },
];

const SIGNUP_DEMO_ACCOUNTS = [
  {
    label: "Freelancer demo",
    email: "freelancer@iteryx.com",
    password: "Demo@2024",
    role: "freelancer" as const,
  },
  {
    label: "Student demo",
    email: "student@iteryx.com",
    password: "Demo@2024",
    role: "student" as const,
  },
];

export default function SignupPage() {
  const { user, signInWithGoogle, signupWithCredentials, loading } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<"student" | "freelancer">("student");
  const [name, setName] = useState("");
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

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "var(--destructive)", "var(--warning)", "var(--success)"][passwordStrength];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signupWithCredentials(name, email, password, role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
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

  const openDemoAccount = (demoRole: "student" | "freelancer") => {
    router.push(`/login?demo=${demoRole}`);
  };

  return (
    <main className="min-h-screen bg-mesh flex overflow-x-hidden">
      {/* ── Left: Benefits Panel ──────────────────────────── */}
      <div className="hidden lg:flex flex-col gap-10 w-[460px] shrink-0 border-r border-border bg-card px-10 py-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full opacity-10 blur-3xl"
             style={{ background: "radial-gradient(circle, var(--accent), transparent)" }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full opacity-8 blur-3xl"
             style={{ background: "radial-gradient(circle, var(--primary), transparent)" }} />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group relative z-10">
          <ThemeLogo width={116} height={30} priority className="transition-transform duration-200 group-hover:scale-[1.02]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground leading-none">Finance Platform</p>
          </div>
        </Link>

        {/* Content */}
        <div className="space-y-7 animate-fade-in-up relative z-10">
          {/* Social proof chip */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <span className="pulse-dot" />
            <Users size={11} />
            <span>5,200+ freelancers already joined</span>
          </div>

          <div>
            <p className="section-eyebrow mb-3">New account</p>
            <h1 className="text-4xl font-bold text-foreground leading-tight text-balance tracking-tight">
              Financial clarity{" "}
              <span className="text-gradient">starts here</span>
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
              Join 5,200+ individuals who use Iteryx to understand and optimize their spending habits.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="flex items-start gap-4 group">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `color-mix(in oklch, ${b.color} 10%, transparent)` }}
                  >
                    <Icon size={16} style={{ color: b.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{b.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social proof card */}
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-warning text-xs">★</span>
              ))}
              <span className="text-xs font-semibold text-foreground ml-1">4.9/5</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              &ldquo;The best expense tracker I&apos;ve ever used. The UI is stunning and the insights are genuinely useful.&rdquo;
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">— Aditya K., Freelancer</p>
          </div>
        </div>

        <p className="mt-auto text-xs text-muted-foreground relative z-10">© 2026 Iteryx · Privacy · Terms</p>
      </div>

      {/* ── Right: Form ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-10 relative overflow-hidden">
        {/* Depth circle */}
        <div className="absolute top-[-120px] right-[-120px] w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
             style={{ background: "radial-gradient(circle, var(--accent), transparent)" }} />

        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
          <ThemeLogo width={108} height={30} priority />
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-7 animate-fade-up">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary mb-2">Create account</p>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Get started for free</h2>
            <p className="text-muted-foreground text-sm mt-1">No credit card required.</p>
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
              {SIGNUP_DEMO_ACCOUNTS.map((account) => (
                <div
                  key={account.email}
                  className="rounded-lg border border-border/70 bg-background/80 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground">{account.label}</p>
                    <button
                      type="button"
                      onClick={() => openDemoAccount(account.role)}
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
            className="btn btn-outline w-full mb-5 gap-3 h-11 animate-fade-up"
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
            {isFirebaseConfigured ? "Sign up with Google" : "Google not configured"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5 animate-fade-up delay-75">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium px-1">or sign up with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4 animate-fade-up delay-150">
            {/* Role selector — iOS segmented control style */}
            <div>
              <label className="field-label">I am signing up as</label>
              <div className="segmented-control w-full">
                {[
                  { key: "student", label: "Student" },
                  { key: "freelancer", label: "Freelancer" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setRole(opt.key as "student" | "freelancer")}
                    className={`seg-btn flex-1 ${role === opt.key ? "seg-btn-active" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="signup-name" className="field-label">Full name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="field-label">Email address</label>
              <input
                id="signup-email"
                type="email"
                placeholder="team@startup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="field-label">Create a password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input pr-10"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password strength meter — animated gradient fill */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5 animate-fade-in">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className="flex-1 rounded-full transition-all duration-500"
                        style={{
                          background: passwordStrength >= level
                            ? strengthColor
                            : "var(--muted)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Strength:{" "}
                    <span
                      className="font-semibold transition-colors duration-300"
                      style={{ color: passwordStrength > 0 ? strengthColor : undefined }}
                    >
                      {strengthLabel}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* T&C */}
            <p className="text-xs text-muted-foreground animate-fade-up delay-200">
              By creating an account you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>

            <button
              id="signup-submit"
              type="submit"
              className="btn btn-primary w-full h-11 gap-2 animate-fade-up delay-200 group"
              disabled={submitting || loading}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Free plan perks */}
          <div className="mt-5 p-4 rounded-xl bg-muted/50 border border-border animate-fade-up delay-300">
            <p className="text-xs font-semibold text-foreground mb-2.5 tracking-tight">Free plan includes:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {["50 expenses/month", "Basic charts", "3-month history", "Email support"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle size={11} className="text-success shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-center text-muted-foreground mt-5 animate-fade-up delay-400">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
