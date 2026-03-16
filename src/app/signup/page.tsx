"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function SignupPage() {
  const { user, signInWithGoogle, signupWithCredentials, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signupWithCredentials(name, email, password);
      router.push("/dashboard");
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
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
    }
  };

  return (
    <main className="auth-shell shell-gradient alt-accent">
      <section className="auth-panel animate-fade-up">
        <aside className="auth-aside">
          <Link href="/" className="brand-lockup solo">
            <div className="brand-mark">Ix</div>
            <div>
              <p className="eyebrow">Iteryx</p>
              <h1 className="brand-title">Create an account</h1>
            </div>
          </Link>

          <div className="aside-copy">
            <h2>Start with a stable auth flow.</h2>
            <p>
              New users are now signed in immediately after signup through the same cookie session used by the rest of the app.
            </p>
          </div>

          <div className="stack-card">
            <p className="stack-card-title">Included in this template</p>
            <ul className="simple-list">
              <li>Email signup with password validation.</li>
              <li>Optional Google signup when Firebase env vars are present.</li>
              <li>Automatic redirect into the dashboard after account creation.</li>
            </ul>
          </div>
        </aside>

        <div className="form-card">
          <div className="form-heading">
            <p className="eyebrow">Signup</p>
            <h2>Create your workspace</h2>
            <p>Use a real email and a password with at least 8 characters.</p>
          </div>

          {error ? <div className="alert-error">{error}</div> : null}

          <form onSubmit={handleSignup} className="form-stack">
            <label className="field">
              <span className="field-label">Full name</span>
              <input
                id="signup-name"
                type="text"
                className="field-input"
                placeholder="Aarav Sharma"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Email</span>
              <input
                id="signup-email"
                type="email"
                className="field-input"
                placeholder="team@startup.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <input
                id="signup-password"
                type="password"
                className="field-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <span className="field-help">Minimum 8 characters.</span>
            </label>

            <button id="signup-submit" type="submit" className="pill-button full-width" disabled={submitting || loading}>
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="form-divider">or</div>

          <button
            className="ghost-button full-width"
            onClick={handleGoogle}
            disabled={!isFirebaseConfigured || submitting || loading}
            type="button"
          >
            {isFirebaseConfigured ? "Sign up with Google" : "Google sign-up not configured"}
          </button>

          <p className="form-footnote">
            Already registered? <Link href="/login">Log in here</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
