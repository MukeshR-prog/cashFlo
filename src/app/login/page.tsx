"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function LoginPage() {
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
    <main className="auth-shell shell-gradient">
      <section className="auth-panel animate-fade-up">
        <aside className="auth-aside">
          <Link href="/" className="brand-lockup solo">
            <div className="brand-mark">Ix</div>
            <div>
              <p className="eyebrow">Iteryx</p>
              <h1 className="brand-title">Welcome back</h1>
            </div>
          </Link>

          <div className="aside-copy">
            <h2>Log in to your workspace.</h2>
            <p>
              Use your email and password or continue with Google if Firebase is configured for this project.
            </p>
          </div>

          <div className="stack-card">
            <p className="stack-card-title">This screen now fixes</p>
            <ul className="simple-list">
              <li>Credential login not updating the app session.</li>
              <li>Redirect loops caused by client-only auth state.</li>
              <li>Hard dependency on JWT for basic sign-in.</li>
            </ul>
          </div>
        </aside>

        <div className="form-card">
          <div className="form-heading">
            <p className="eyebrow">Login</p>
            <h2>Access your account</h2>
            <p>Enter the same credentials you used during signup.</p>
          </div>

          {error ? <div className="alert-error">{error}</div> : null}

          <form onSubmit={handleCredentials} className="form-stack">
            <label className="field">
              <span className="field-label">Email</span>
              <input
                id="login-email"
                type="email"
                className="field-input"
                placeholder="founder@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <input
                id="login-password"
                type="password"
                className="field-input"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <button id="login-submit" type="submit" className="pill-button full-width" disabled={submitting || loading}>
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="form-divider">or</div>

          <button
            className="ghost-button full-width"
            onClick={handleGoogle}
            disabled={!isFirebaseConfigured || submitting || loading}
            type="button"
          >
            {isFirebaseConfigured ? "Continue with Google" : "Google sign-in not configured"}
          </button>

          <p className="form-footnote">
            Need an account? <Link href="/signup">Create one here</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
