"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp, GraduationCap, Briefcase, ArrowRight,
  ArrowLeft, CheckCircle, Building2, BookOpen, Globe,
} from "lucide-react";

type Role = "student" | "freelancer" | "";
type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const { user, refreshSession } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<Role>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Student fields
  const [school, setSchool] = useState("");
  const [course, setCourse] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  // Freelancer fields
  const [skills, setSkills] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const steps = [
    { label: "Role", num: 1 },
    { label: "Profile", num: 2 },
    { label: "Done", num: 3 },
  ];

  const handleNext = () => {
    if (step === 1 && !role) {
      setError("Please select your role.");
      return;
    }
    if (step === 2) {
      if (role === "student" && (!school || !course)) {
        setError("Please fill in your school and course.");
        return;
      }
      if (role === "freelancer" && !skills) {
        setError("Please list at least one skill.");
        return;
      }
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, 3) as Step);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const profile =
        role === "student"
          ? { school, course, graduationYear: graduationYear || null }
          : {
              skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
              hourlyRate: hourlyRate ? Number(hourlyRate) : null,
              portfolioUrl: portfolioUrl || null,
            };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, profile }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Onboarding failed");

      await refreshSession();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <TrendingUp size={18} className="text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Iteryx</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step > s.num
                      ? "bg-success text-success-foreground"
                      : step === s.num
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.num ? <CheckCircle size={14} /> : s.num}
                </div>
                <p className={`text-[10px] mt-1 font-medium ${step === s.num ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-24 h-px mx-2 mb-4 transition-colors duration-300 ${step > s.num ? "bg-success" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card shadow-md animate-scale-in">
          {/* ── Step 1: Role ─────────────────────────────── */}
          {step === 1 && (
            <div>
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Step 1 of 3</p>
                <h2 className="text-2xl font-bold text-foreground">
                  Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
                </h2>
                <p className="text-muted-foreground text-sm mt-1.5">
                  Let us know a bit about you to personalize your experience.
                </p>
              </div>

              <p className="text-sm font-semibold text-foreground mb-4">I am a...</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student card */}
                <button
                  type="button"
                  onClick={() => { setRole("student"); setError(""); }}
                  className={`
                    relative p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer group
                    ${role === "student"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/40"
                    }
                  `}
                >
                  {role === "student" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle size={12} className="text-primary-foreground" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    role === "student" ? "bg-primary/15" : "bg-muted group-hover:bg-muted"
                  }`}>
                    <GraduationCap size={20} className={role === "student" ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <p className="font-semibold text-foreground">Student</p>
                  <p className="text-xs text-muted-foreground mt-1">Track education expenses and manage a student budget.</p>
                </button>

                {/* Freelancer card */}
                <button
                  type="button"
                  onClick={() => { setRole("freelancer"); setError(""); }}
                  className={`
                    relative p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer group
                    ${role === "freelancer"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/40"
                    }
                  `}
                >
                  {role === "freelancer" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle size={12} className="text-primary-foreground" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    role === "freelancer" ? "bg-primary/15" : "bg-muted group-hover:bg-muted"
                  }`}>
                    <Briefcase size={20} className={role === "freelancer" ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <p className="font-semibold text-foreground">Freelancer</p>
                  <p className="text-xs text-muted-foreground mt-1">Track client income, project costs, and business expenses.</p>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Profile details ───────────────────── */}
          {step === 2 && (
            <div>
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Step 2 of 3</p>
                <h2 className="text-2xl font-bold text-foreground">Tell us about yourself</h2>
                <p className="text-muted-foreground text-sm mt-1.5">
                  This helps us tailor your dashboard and suggestions.
                </p>
              </div>

              {role === "student" && (
                <div className="space-y-4">
                  <div>
                    <label className="field-label flex items-center gap-2">
                      <Building2 size={14} className="text-primary" /> School / College
                    </label>
                    <input
                      className="field-input"
                      placeholder="e.g. IIT Bombay"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label flex items-center gap-2">
                      <BookOpen size={14} className="text-primary" /> Course / Major
                    </label>
                    <input
                      className="field-input"
                      placeholder="e.g. B.Tech Computer Science"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label">
                      Graduation Year <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      className="field-input"
                      placeholder="e.g. 2026"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      type="number"
                      min="2024"
                      max="2032"
                    />
                  </div>
                </div>
              )}

              {role === "freelancer" && (
                <div className="space-y-4">
                  <div>
                    <label className="field-label flex items-center gap-2">
                      <Briefcase size={14} className="text-primary" /> Skills
                    </label>
                    <input
                      className="field-input"
                      placeholder="e.g. React, UI Design, Copywriting"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      required
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Comma-separated list</p>
                  </div>
                  <div>
                    <label className="field-label">
                      Hourly Rate (₹) <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      className="field-input"
                      placeholder="e.g. 2000"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="field-label flex items-center gap-2">
                      <Globe size={14} className="text-primary" /> Portfolio URL{" "}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      className="field-input"
                      placeholder="https://yourportfolio.com"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      type="url"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Confirmation ──────────────────────── */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">You're all set!</h2>
              <p className="text-muted-foreground text-sm mb-7 max-w-sm mx-auto">
                Your account is ready. Head to your dashboard to start tracking expenses and exploring your financial insights.
              </p>

              {/* Summary */}
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-left mb-7">
                <p className="text-xs font-semibold text-foreground mb-2">Account summary</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p><span className="font-medium text-foreground">Name:</span> {user?.name}</p>
                  <p><span className="font-medium text-foreground">Role:</span> {role === "student" ? "Student" : "Freelancer"}</p>
                  <p><span className="font-medium text-foreground">Plan:</span> Free (50 expenses/month)</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm flex items-center gap-2 animate-fade-down">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Navigation buttons */}
          <div className={`flex gap-3 mt-7 ${step === 1 ? "justify-end" : "justify-between"}`}>
            {step > 1 && (
              <button
                type="button"
                onClick={() => { setStep((p) => Math.max(p - 1, 1) as Step); setError(""); }}
                className="btn btn-outline gap-2"
              >
                <ArrowLeft size={15} /> Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary gap-2"
                disabled={step === 1 && !role}
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary gap-2 px-8"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Go to Dashboard <ArrowRight size={15} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Skip link */}
        {step < 3 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="hover:text-foreground transition-colors underline"
            >
              Skip setup for now
            </button>
          </p>
        )}
      </div>
    </main>
  );
}
