"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function LandingPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  const features = [
    {
      title: "Focused roadmap",
      desc: "Turn rough ideas into clear priorities with a workspace that keeps product, design, and delivery aligned.",
      icon: "📊",
    },
    {
      title: "Frictionless auth",
      desc: "Use email and password or Google sign-in with one consistent session flow across the app.",
      icon: "🔐",
    },
    {
      title: "Execution dashboard",
      desc: "Keep milestones, team activity, and delivery health visible without a cluttered interface.",
      icon: "📈",
    },
    {
      title: "Production-ready structure",
      desc: "A cleaner template with less hardcoded logic so you can extend it safely instead of fighting it.",
      icon: "⚙️",
    },
  ];

  const stats = [
    { value: "4", label: "Core screens" },
    { value: "2", label: "Auth methods" },
    { value: "1", label: "Shared session flow" },
    { value: "0", label: "JWT required" },
  ];

  const workflow = [
    "Start from a landing page that explains the product clearly.",
    "Let users sign in with credentials or Google through the same backend session model.",
    "Give the team a dashboard that surfaces the next actions instead of filler widgets.",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-3 animate-fade-in-up">
          <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold">
            Ix
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Iteryx</p>
            <h1 className="text-lg font-bold">Product Workspace</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="btn btn-primary"
            >
              Open dashboard
            </button>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-accent">
                Create account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-3">
              Standard Next.js template
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-foreground">
              Clean product pages with one auth system that actually works
            </h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            This template gives you a more maintainable landing page, login page, signup page, and dashboard,
            while removing the JWT dependency and fixing the broken sign-in state.
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            {user ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="btn btn-primary btn-lg"
              >
                Go to dashboard
              </button>
            ) : (
              <>
                <Link href="/signup" className="btn btn-accent btn-lg">
                  Start with email
                </Link>
                <Link href="/login" className="btn btn-outline btn-lg">
                  Existing account
                </Link>
              </>
            )}
          </div>

          {!user && isFirebaseConfigured && (
            <button
              className="text-accent hover:text-accent/80 font-medium transition-colors"
              onClick={!loading ? signInWithGoogle : undefined}
              disabled={loading}
            >
              {loading ? "Preparing sign-in..." : "Or use Google sign-in →"}
            </button>
          )}
        </div>

        {/* Stats Card */}
        <div className="animate-fade-in-up space-y-6">
          <div className="card">
            <div className="mb-6 flex items-center justify-between">
              <p className="badge badge-accent">Live session flow</p>
              <span className="text-xs text-muted-foreground">Credentials + Google</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {stats.map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-muted/20 border border-border">
                  <strong className="block text-2xl font-bold text-foreground">{item.value}</strong>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="font-semibold text-sm text-foreground mb-2">What changed</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Server-managed session cookies replace JWT</li>
                <li>✓ Credential and Google sign-in sync seamlessly</li>
                <li>✓ Page templates are responsive and clean</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="bg-card border-y border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((item) => (
            <div key={item.label} className="text-center animate-fade-in-up">
              <strong className="block text-3xl font-bold text-accent">{item.value}</strong>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-3">Core benefits</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground">
              Built to give you a stable starting point
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="card hover:shadow-lg transition-shadow animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="text-xl font-bold text-foreground mb-2">{feature.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-3">Workflow</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground">
              How this setup is intended to be used
            </h3>
          </div>

          <div className="space-y-4">
            {workflow.map((item, index) => (
              <div
                key={item}
                className="flex gap-4 items-start p-6 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <p className="text-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-3">Ready to continue</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground">
              Use the template as a clean base and extend from here.
            </h3>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="btn btn-primary btn-lg"
              >
                Open dashboard
              </button>
            ) : (
              <>
                <Link href="/signup" className="btn btn-accent btn-lg">
                  Create account
                </Link>
                <Link href="/login" className="btn btn-outline btn-lg">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>Iteryx product workspace template</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
