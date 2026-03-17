"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { TrendingUp, ArrowRight, Eye, EyeOff, CheckCircle, Shield, BarChart3, Brain } from "lucide-react";

const benefits = [
  { icon: BarChart3, title: "Smart analytics", body: "Visual charts and heatmaps make your spending crystal clear." },
  { icon: Brain,     title: "AI insights",     body: "Detect spending spikes and unusual patterns automatically." },
  { icon: Shield,    title: "Fully private",   body: "Your financial data is encrypted and never sold." },
];

export default function SignupPage() {
  const { user, signInWithGoogle, signupWithCredentials, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, route based on their onboarding state
  useEffect(() => {
    if (!loading && user) {
      router.replace(
        user.onboardingCompleted === false ? "/onboarding" : "/dashboard"
      );
    }
  }, [loading, router, user]);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-destructive", "bg-warning", "bg-success"][passwordStrength];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      // AuthContext.signupWithCredentials handles the routing decision internally
      await signupWithCredentials(name, email, password);
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

  return (
    <main className="min-h-screen bg-mesh flex">
      {/* ── Left: Benefits Panel ──────────────────────────── */}
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

        {/* Content */}
        <div className="space-y-7 animate-fade-in-up">
          <div>
            <p className="section-eyebrow mb-3">New account</p>
            <h1 className="text-4xl font-bold text-foreground leading-tight text-balance">
              Financial clarity{" "}
              <span className="text-gradient">starts here</span>
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Join 5,200+ individuals who use Iteryx to understand and optimize their spending habits.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{b.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social proof */}
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-warning text-xs">★</span>
              ))}
              <span className="text-xs font-semibold text-foreground ml-1">4.9/5</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              "The best expense tracker I've ever used. The UI is stunning and the insights are genuinely useful."
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">— Aditya K., Freelancer</p>
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
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Create account</p>
            <h2 className="text-2xl font-bold text-foreground">Get started for free</h2>
            <p className="text-muted-foreground text-sm mt-1">No credit card required.</p>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password strength meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1 animate-fade-in">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level ? strengthColor : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Strength: <span className={`font-semibold ${["", "text-destructive", "text-warning", "text-success"][passwordStrength]}`}>{strengthLabel}</span>
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
              className="btn btn-primary w-full h-11 gap-2 animate-fade-up delay-200"
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
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* What's included */}
          <div className="mt-5 p-3.5 rounded-xl bg-muted/60 border border-border animate-fade-up delay-300">
            <p className="text-xs font-semibold text-foreground mb-2">Free plan includes:</p>
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
