"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const priorities = [
  { title: "Finalize onboarding copy", owner: "Design", state: "Today" },
  { title: "Review auth env setup", owner: "Engineering", state: "High impact" },
  { title: "Plan sprint demo", owner: "Product", state: "Tomorrow" },
];

const metrics = [
  { label: "Milestones", value: "08", detail: "3 due this week" },
  { label: "Open tasks", value: "21", detail: "7 awaiting review" },
  { label: "Team members", value: "06", detail: "2 external collaborators" },
  { label: "Release health", value: "92%", detail: "No blockers reported" },
];

const activity = [
  "Auth session flow updated to remove JWT cookies.",
  "Landing and auth pages replaced with cleaner templates.",
  "Dashboard now reads the same session state as the API.",
  "Firebase configuration moved out of source code into env vars.",
];

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="dashboard-loading shell-gradient">
        <div className="loading-card">
          <div className="loading-spinner" />
          <p>Loading your workspace...</p>
        </div>
      </main>
    );
  }

  const displayName = user.name ?? user.email ?? "Workspace owner";
  const initials = displayName
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="dashboard-shell shell-gradient">
      <header className="dashboard-header page-section">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>{displayName}&apos;s workspace</h1>
          <p className="supporting-copy small">Your session is active and tied to the backend cookie session.</p>
        </div>

        <div className="dashboard-userbar">
          <div className="avatar-badge">{initials}</div>
          <div>
            <strong>{displayName}</strong>
            <span>{user.email}</span>
          </div>
          <button className="ghost-button" onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </header>

      <section className="page-section kpi-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="dashboard-card metric-surface">
            <span className="muted-label">{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="page-section dashboard-grid">
        <article className="dashboard-card dashboard-main-card">
          <div className="card-heading-row">
            <div>
              <p className="eyebrow">Priorities</p>
              <h2>Current focus</h2>
            </div>
            <span className="status-chip status-warm">This week</span>
          </div>

          <div className="list-stack">
            {priorities.map((item) => (
              <div key={item.title} className="list-row">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.owner}</p>
                </div>
                <span className="status-chip">{item.state}</span>
              </div>
            ))}
          </div>

          <div className="progress-panel">
            <div className="card-heading-row compact-row">
              <strong>Launch readiness</strong>
              <span>72%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: "72%" }} />
            </div>
            <p className="muted-copy">Authentication, page structure, and session handling are now aligned.</p>
          </div>
        </article>

        <aside className="dashboard-side-column">
          <article className="dashboard-card">
            <p className="eyebrow">Recent updates</p>
            <h2>Session and UI changes</h2>
            <ul className="simple-list compact-list">
              {activity.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="dashboard-card accent-card">
            <p className="eyebrow">Account</p>
            <h2>{user.provider === "google" ? "Google session active" : "Credentials session active"}</h2>
            <p className="muted-copy">
              {user.provider === "google"
                ? "Your Google account is connected through Firebase and mirrored to the app session."
                : "Your email and password session is stored with an httpOnly cookie and validated by the backend."}
            </p>
          </article>
        </aside>
      </section>
    </main>
  );
}
