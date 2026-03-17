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
      <main className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center">
        <div className="card text-center">
          <div className="w-10 h-10 rounded-full border-4 border-border border-t-accent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your workspace...</p>
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
    <main className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-8 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="animate-fade-in-up">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">Dashboard</p>
            <h1 className="text-3xl font-bold text-foreground">{displayName}&apos;s workspace</h1>
            <p className="text-sm text-muted-foreground mt-1">Your session is active and tied to the backend cookie session.</p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card self-start">
            <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <strong className="block text-foreground truncate">{displayName}</strong>
              <span className="text-xs text-muted-foreground truncate block">{user.email}</span>
            </div>
            <button className="btn btn-ghost btn-sm flex-shrink-0" onClick={logout} type="button">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <div
              key={metric.label}
              className="card hover:shadow-lg transition-shadow animate-fade-in-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                {metric.label}
              </p>
              <strong className="block text-3xl font-bold text-accent mb-1">{metric.value}</strong>
              <p className="text-xs text-muted-foreground">{metric.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-in-up">
            <div className="card">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-1">Priorities</p>
                  <h2 className="text-2xl font-bold text-foreground">Current focus</h2>
                </div>
                <p className="badge badge-accent">This week</p>
              </div>

              <div className="space-y-3 mb-6">
                {priorities.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <strong className="block text-foreground">{item.title}</strong>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.owner}</p>
                    </div>
                    <p className="badge badge-secondary flex-shrink-0">{item.state}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg border border-border bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <strong className="text-foreground">Launch readiness</strong>
                  <span className="text-sm font-semibold text-accent">72%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full w-[72%] bg-gradient-to-r from-accent to-accent/70 rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Authentication, page structure, and session handling are now aligned.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 animate-fade-in-up">
            <div className="card">
              <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">Recent updates</p>
              <h2 className="text-xl font-bold text-foreground mb-4">Session and UI changes</h2>
              <ul className="space-y-2">
                {activity.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
              <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-2">Account</p>
              <h2 className="text-xl font-bold text-foreground mb-3">
                {user.provider === "google" ? "Google session active" : "Credentials session active"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {user.provider === "google"
                  ? "Your Google account is connected through Firebase and mirrored to the app session."
                  : "Your email and password session is stored with an httpOnly cookie and validated by the backend."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
