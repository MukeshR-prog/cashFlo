"use client";

import { useAuth } from "@/context/AuthContext";
import { User, Bell, Shield, Palette, CreditCard } from "lucide-react";
import { useTheme } from "next-themes";

const settingsSections = [
  { icon: User,       label: "Profile",       desc: "Manage your name, email, and avatar." },
  { icon: Bell,       label: "Notifications", desc: "Configure alerts and spending reminders." },
  { icon: Shield,     label: "Security",      desc: "Password, 2FA, and session management." },
  { icon: Palette,    label: "Appearance",    desc: "Theme, color scheme, and display density." },
  { icon: CreditCard, label: "Billing",       desc: "Plan details, invoices, and upgrades." },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile header */}
      <div className="card flex items-center gap-5 animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary text-xl font-bold flex items-center justify-center ring-2 ring-primary/20 shrink-0">
          {user?.image ? (
            <img src={user.image} alt="" className="w-full h-full rounded-2xl object-cover" />
          ) : initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground">{user?.name ?? "User"}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge badge-primary">Free plan</span>
            <span className="badge badge-neutral capitalize">{user?.provider ?? "email"}</span>
          </div>
        </div>
        <button className="btn btn-outline btn-sm">Edit profile</button>
      </div>

      {/* Settings sections grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {settingsSections.map((section, i) => {
          const Icon = section.icon;
          return (
            <button
              key={section.label}
              className="card-hover text-left group animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <Icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{section.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{section.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Appearance section */}
      <div className="card animate-fade-up delay-200">
        <h3 className="text-base font-bold text-foreground mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Color theme</p>
            <p className="text-xs text-muted-foreground mt-0.5">Choose between light and dark mode.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted p-1">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                  resolvedTheme === t || (t === "system")
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
