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
              <h1 className="text-lg font-bold">Create an account</h1>
            </div>
          </Link>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">Start with a stable auth flow</h2>
            <p className="text-muted-foreground leading-relaxed">
              New users are now signed in immediately after signup through the same cookie session used by the rest of the app.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card space-y-3">
            <p className="font-semibold text-sm text-foreground">Included in this template</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>✓ Email signup with password validation</li>
              <li>✓ Optional Google signup when Firebase env vars are present</li>
              <li>✓ Automatic redirect into the dashboard after account creation</li>
            </ul>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="card animate-fade-in-up order-1 lg:order-2 max-w-md mx-auto w-full">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">Signup</p>
            <h2 className="text-2xl font-bold text-foreground mb-2">Create your workspace</h2>
            <p className="text-muted-foreground text-sm">Use a real email and a password with at least 8 characters.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4 mb-6">
            <div className="form-group">
              <label htmlFor="signup-name" className="label">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                className="input"
                placeholder="Aarav Sharma"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email" className="label">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                className="input"
                placeholder="team@startup.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password" className="label">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                className="input"
                placeholder="Create a strong password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters.</p>
            </div>

            <button
              id="signup-submit"
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting || loading}
            >
              {submitting ? "Creating account..." : "Create account"}
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
            {isFirebaseConfigured ? "Sign up with Google" : "Google sign-up not configured"}
          </button>

          <p className="text-sm text-center text-muted-foreground">
            Already registered?{" "}
            <Link href="/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
