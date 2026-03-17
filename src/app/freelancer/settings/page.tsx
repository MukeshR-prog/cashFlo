"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Mail, Briefcase, Globe, Clock } from "lucide-react";

export default function FreelancerSettingsPage() {
  const { user } = useAuth();

  const profile = (user?.profile ?? {}) as Record<string, unknown>;
  const skills = Array.isArray(profile.skills) ? (profile.skills as string[]).join(", ") : "—";
  const hourlyRate = profile.hourlyRate ? `₹${profile.hourlyRate}/hr` : "—";
  const portfolioUrl = profile.portfolioUrl ? String(profile.portfolioUrl) : "—";

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      {/* Profile Card */}
      <div className="card space-y-5">
        <p className="text-sm font-bold text-foreground border-b border-border pb-3">Freelancer Profile</p>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/15 text-primary text-xl font-bold flex items-center justify-center ring-2 ring-primary/20">
            {user?.image ? (
              <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "F"
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{user?.name ?? "—"}</p>
            <span className="badge badge-primary">Freelancer</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: User, label: "Full Name", value: user?.name ?? "—" },
            { icon: Mail, label: "Email", value: user?.email ?? "—" },
            { icon: Briefcase, label: "Skills", value: skills },
            { icon: Clock, label: "Hourly Rate", value: hourlyRate },
            { icon: Globe, label: "Portfolio URL", value: portfolioUrl },
          ].map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.label}>
                <label className="field-label flex items-center gap-1.5">
                  <Icon size={12} className="text-primary" /> {field.label}
                </label>
                <div className="field-input bg-muted/40 text-muted-foreground cursor-not-allowed">
                  {field.value}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          To update your profile information, please contact support or re-complete onboarding.
        </p>
      </div>

      {/* Account Info */}
      <div className="card space-y-4">
        <p className="text-sm font-bold text-foreground border-b border-border pb-3">Account</p>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-foreground">Sign in provider</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.provider ?? "—"}</p>
          </div>
          <span className="badge badge-secondary capitalize">{user?.provider ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-border">
          <div>
            <p className="text-sm font-medium text-foreground">Plan</p>
            <p className="text-xs text-muted-foreground">Free — 50 expenses/month</p>
          </div>
          <button className="btn btn-primary btn-sm">Upgrade</button>
        </div>
      </div>
    </div>
  );
}
