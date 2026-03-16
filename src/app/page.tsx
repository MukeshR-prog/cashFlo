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
    },
    {
      title: "Frictionless auth",
      desc: "Use email and password or Google sign-in with one consistent session flow across the app.",
    },
    {
      title: "Execution dashboard",
      desc: "Keep milestones, team activity, and delivery health visible without a cluttered interface.",
    },
    {
      title: "Production-ready structure",
      desc: "A cleaner template with less hardcoded logic so you can extend it safely instead of fighting it.",
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
    <main className="site-shell shell-gradient">
      <header className="topbar page-section">
        <div className="brand-lockup">
          <div className="brand-mark">Ix</div>
          <div>
            <p className="eyebrow">Iteryx</p>
            <h1 className="brand-title">Product Workspace</h1>
          </div>
        </div>

        <div className="topbar-actions">
          {user ? (
            <button className="pill-button" onClick={() => router.push("/dashboard")}>
              Open dashboard
            </button>
          ) : (
            <>
              <Link href="/login" className="ghost-button">
                Log in
              </Link>
              <Link href="/signup" className="pill-button">
                Create account
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="page-section hero-grid">
        <div className="hero-copy animate-fade-up">
          <p className="eyebrow">Standard Next.js app template</p>
          <h2 className="display-title">
            Clean product pages with one auth system that actually signs users in.
          </h2>
          <p className="supporting-copy">
            This template gives you a more maintainable landing page, login page, signup page, and dashboard,
            while removing the JWT dependency and fixing the broken sign-in state.
          </p>
          <div className="action-row">
            {user ? (
              <button className="pill-button" onClick={() => router.push("/dashboard")}>
                Go to dashboard
              </button>
            ) : (
              <>
                <Link href="/signup" className="pill-button">
                  Start with email
                </Link>
                <Link href="/login" className="ghost-button">
                  Existing account
                </Link>
              </>
            )}
          </div>
          {!user && isFirebaseConfigured ? (
            <button className="text-button" onClick={!loading ? signInWithGoogle : undefined} disabled={loading}>
              {loading ? "Preparing sign-in..." : "Use Google sign-in instead"}
            </button>
          ) : null}
        </div>

        <div className="hero-panel animate-fade-up-delay-2">
          <div className="hero-panel-header">
            <span className="status-chip status-live">Live session flow</span>
            <span className="muted-label">Credentials + Google</span>
          </div>
          <div className="hero-metric-grid">
            {stats.map((item) => (
              <div key={item.label} className="metric-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="stack-card">
            <p className="stack-card-title">What changed</p>
            <ul className="simple-list">
              <li>Server-managed session cookies replace JWT cookies.</li>
              <li>Credential sign-in and Google sign-in now update the same app session.</li>
              <li>Page templates are responsive and much less hardcoded.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="page-section info-band animate-fade-up-delay-3">
        {stats.map((item) => (
          <div key={item.label} className="info-band-item">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section className="page-section section-block">
        <div className="section-heading">
          <p className="eyebrow">Core benefits</p>
          <h3>Built to give you a stable starting point</h3>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <p className="feature-kicker">Template</p>
              <h4>{feature.title}</h4>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section split-band">
        <div className="section-heading compact">
          <p className="eyebrow">Workflow</p>
          <h3>How this setup is intended to be used</h3>
        </div>
        <div className="workflow-list">
          {workflow.map((item, index) => (
            <div key={item} className="workflow-step">
              <span>{`0${index + 1}`}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section cta-panel">
        <div>
          <p className="eyebrow">Ready to continue</p>
          <h3>Use the template as a clean base and extend from here.</h3>
        </div>
        <div className="action-row">
          {user ? (
            <button className="pill-button" onClick={() => router.push("/dashboard")}>
              Open dashboard
            </button>
          ) : (
            <>
              <Link href="/signup" className="pill-button">
                Create account
              </Link>
              <Link href="/login" className="ghost-button">
                Log in
              </Link>
            </>
          )}
        </div>
      </section>
      <footer className="page-footer">
        <span>Iteryx product workspace template</span>
        <span>{new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
