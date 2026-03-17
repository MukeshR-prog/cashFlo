"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center text-muted-foreground">Loading login...</main>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { user, signInWithGoogle, loginWithCredentials, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirect);
    }
  }, [loading, redirect, router, user]);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await loginWithCredentials(email, password);
      router.push(redirect);
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
      router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Sidebar */}
        <div className="space-y-8 animate-fade-in-up order-2 lg:order-1">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold">
              Ix
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Iteryx</p>
              <h1 className="text-lg font-bold">Welcome back</h1>
            </div>
          </Link>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">Log in to your workspace</h2>
            <p className="text-muted-foreground leading-relaxed">
              Use your email and password or continue with Google if Firebase is configured for this project.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card space-y-3">
            <p className="font-semibold text-sm text-foreground">This screen now fixes</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>✓ Credential login not updating the app session</li>
              <li>✓ Redirect loops caused by client-only auth state</li>
              <li>✓ Hard dependency on JWT for basic sign-in</li>
            </ul>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="card animate-fade-in-up order-1 lg:order-2 max-w-md mx-auto w-full">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">Login</p>
            <h2 className="text-2xl font-bold text-foreground mb-2">Access your account</h2>
            <p className="text-muted-foreground text-sm">Enter the same credentials you used during signup.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCredentials} className="space-y-4 mb-6">
            <div className="form-group">
              <label htmlFor="login-email" className="label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="founder@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting || loading}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            className="btn btn-outline w-full mb-6"
            onClick={handleGoogle}
            disabled={!isFirebaseConfigured || submitting || loading}
            type="button"
          >
            {isFirebaseConfigured ? "Continue with Google" : "Google sign-in not configured"}
          </button>

          <p className="text-sm text-center text-muted-foreground">
            Need an account?{" "}
            <Link href="/signup" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
