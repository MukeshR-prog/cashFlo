"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp, GraduationCap, Briefcase, ArrowRight,
  ArrowLeft, CheckCircle, Building2, BookOpen, AlertTriangle,
  Target, Layers, IndianRupee, ChevronDown,
} from "lucide-react";

type Role = "student" | "freelancer" | "";
type Step = 1 | 2 | 3;

const EXP_LEVELS = [
  { value: "beginner",     label: "Beginner",     sub: "0–1 years of freelancing" },
  { value: "intermediate", label: "Intermediate",  sub: "1–4 years, steady clients" },
  { value: "expert",       label: "Expert",        sub: "4+ years, full-time freelancer" },
];

const PRIMARY_SERVICES = [
  "Software Development", "UI/UX Design", "Content Writing",
  "Digital Marketing", "Video Editing", "Graphic Design",
  "Data Science / AI", "Consulting", "Photography", "Other",
];

export default function OnboardingPage() {
  const { user, refreshSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.onboardingCompleted) {
      router.replace(user.role === "freelancer" ? "/freelancer/dashboard" : "/dashboard");
    }
  }, [router, user]);

  const [step, setStep]         = useState<Step>(1);
  const [role, setRole]         = useState<Role>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");

  // Student fields
  const [school, setSchool]                   = useState("");
  const [course, setCourse]                   = useState("");
  const [monthlyBudget, setMonthlyBudget]     = useState("");

  // Freelancer fields
  const [primaryService, setPrimaryService]   = useState("");
  const [expLevel, setExpLevel]               = useState("");
  const [monthlyGoal, setMonthlyGoal]         = useState("");
  const [skills, setSkills]                   = useState("");

  const steps = [
    { label: "Role",    num: 1 },
    { label: "Profile", num: 2 },
    { label: "Done",    num: 3 },
  ];

  const handleNext = () => {
    if (step === 1 && !role) { setError("Please select your role to continue."); return; }
    if (step === 2) {
      if (role === "student" && (!school || !course)) {
        setError("Please fill in your school and course.");
        return;
      }
      if (role === "freelancer" && !primaryService) {
        setError("Please select your primary service.");
        return;
      }
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, 3) as Step);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const profile =
        role === "student"
          ? {
              school,
              course,
              monthlyBudget: monthlyBudget ? Number(monthlyBudget) : null,
            }
          : {
              primaryService,
              experienceLevel: expLevel || "beginner",
              monthlyIncomeGoal: monthlyGoal ? Number(monthlyGoal) : null,
              skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
              portfolioUrl: "",
            };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, profile }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Onboarding failed");

      await refreshSession();
      router.push(role === "freelancer" ? "/freelancer/dashboard" : "/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const progressPct = ((step - 1) / 2) * 100;

  return (
    <main className="min-h-screen bg-mesh flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="hero-blob w-[450px] h-[450px] bg-primary top-[-150px] left-[-100px] opacity-8" />
      <div className="hero-blob w-[300px] h-[300px] bg-accent bottom-[-80px] right-[-60px] opacity-6" style={{ animationDelay: "3s" }} />
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-down">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <TrendingUp size={20} className="text-primary-foreground" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground leading-none">Iteryx</p>
            <p className="text-base font-bold text-foreground leading-tight tracking-tight">Finance Platform</p>
          </div>
        </div>

        {/* Progress stepper */}
        <div className="flex items-center justify-center gap-0 mb-8 animate-fade-up">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step > s.num
                      ? "bg-success text-success-foreground shadow-sm"
                      : step === s.num
                      ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/15"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.num ? <CheckCircle size={15} /> : s.num}
                </div>
                <p className={`text-[10px] mt-1.5 font-semibold tracking-wide ${step === s.num ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="relative w-28 h-0.5 mx-2 mb-5 bg-border overflow-hidden rounded-full">
                  <div
                    className="absolute left-0 top-0 h-full bg-success rounded-full transition-all duration-500"
                    style={{ width: step > s.num ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="premium-card p-7 animate-scale-in">
          {/* ── Step 1: Role ─────────────────────────────────── */}
          {step === 1 && (
            <div>
              <div className="mb-7">
                <p className="section-eyebrow mb-2">Step 1 of 3</p>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
                </h2>
                <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                  Tell us how you use money so we can personalize your financial dashboard.
                </p>
              </div>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">I am a...</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Student */}
                <button
                  type="button"
                  onClick={() => { setRole("student"); setError(""); }}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer group ${
                    role === "student"
                      ? "border-primary bg-primary/4 shadow-sm"
                      : "border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  {role === "student" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                      <CheckCircle size={12} className="text-primary-foreground" />
                    </div>
                  )}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-200 ${
                    role === "student" ? "bg-primary/12 scale-105" : "bg-muted"
                  }`}>
                    <GraduationCap size={22} className={role === "student" ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <p className="font-bold text-foreground tracking-tight">Student</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Track education expenses, set budgets, and manage student finances.
                  </p>
                </button>

                {/* Freelancer */}
                <button
                  type="button"
                  onClick={() => { setRole("freelancer"); setError(""); }}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer group ${
                    role === "freelancer"
                      ? "border-primary bg-primary/4 shadow-sm"
                      : "border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  {role === "freelancer" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                      <CheckCircle size={12} className="text-primary-foreground" />
                    </div>
                  )}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-200 ${
                    role === "freelancer" ? "bg-primary/12 scale-105" : "bg-muted"
                  }`}>
                    <Briefcase size={22} className={role === "freelancer" ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <p className="font-bold text-foreground tracking-tight">Freelancer</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Manage invoices, track income, monitor cash flow, and grow your business.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Profile ───────────────────────────────── */}
          {step === 2 && (
            <div>
              <div className="mb-7">
                <p className="section-eyebrow mb-2">Step 2 of 3</p>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  {role === "student" ? "Your academic profile" : "Your freelancer profile"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1.5">
                  This helps us tailor your dashboard and AI insights.
                </p>
              </div>

              {/* Student fields */}
              {role === "student" && (
                <div className="space-y-4">
                  <div>
                    <label className="field-label flex items-center gap-2">
                      <Building2 size={14} className="text-primary" /> School / College
                    </label>
                    <input
                      className="field-input"
                      placeholder="e.g. IIT Bombay, VIT Vellore..."
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
                    <label className="field-label flex items-center gap-2">
                      <IndianRupee size={14} className="text-primary" /> Monthly Budget{" "}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      className="field-input"
                      placeholder="e.g. 15000"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      type="number"
                      min="0"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Your estimated monthly spending limit in ₹</p>
                  </div>
                </div>
              )}

              {/* Freelancer fields */}
              {role === "freelancer" && (
                <div className="space-y-4">
                  {/* Primary Service dropdown */}
                  <div>
                    <label className="field-label flex items-center gap-2">
                      <Layers size={14} className="text-primary" /> Primary Service <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <select
                        className="field-select"
                        value={primaryService}
                        onChange={(e) => setPrimaryService(e.target.value)}
                        required
                      >
                        <option value="">Select your main service...</option>
                        {PRIMARY_SERVICES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Experience level — visual cards */}
                  <div>
                    <label className="field-label">Experience Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {EXP_LEVELS.map((lvl) => (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => setExpLevel(lvl.value)}
                          className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                            expLevel === lvl.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border bg-muted/20 hover:border-primary/30 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <p className="text-xs font-bold">{lvl.label}</p>
                          <p className="text-[10px] mt-0.5 opacity-75 leading-tight">{lvl.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Monthly income goal */}
                  <div>
                    <label className="field-label flex items-center gap-2">
                      <Target size={14} className="text-primary" /> Monthly Income Goal (₹){" "}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      className="field-input"
                      placeholder="e.g. 100000"
                      value={monthlyGoal}
                      onChange={(e) => setMonthlyGoal(e.target.value)}
                      type="number"
                      min="0"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Helps us track your progress toward financial goals
                    </p>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="field-label">Key Skills <span className="text-muted-foreground font-normal">(optional, comma-separated)</span></label>
                    <input
                      className="field-input"
                      placeholder="e.g. React, Figma, Copywriting"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Confirmation ──────────────────────────── */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-success/12 flex items-center justify-center mx-auto mb-5 ring-4 ring-success/15 animate-scale-in">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">You&apos;re all set!</h2>
              <p className="text-muted-foreground text-sm mb-7 max-w-xs mx-auto leading-relaxed">
                {role === "freelancer"
                  ? "Your freelancer workspace is ready. Head to your dashboard to manage invoices and track income."
                  : "Your student finance tracker is ready. Start logging expenses and exploring insights."}
              </p>

              {/* Summary card */}
              <div className="rounded-xl border border-border bg-muted/40 px-5 py-4 text-left mb-2">
                <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Account Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-semibold text-foreground">{user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <span className={`font-semibold badge ${role === "freelancer" ? "badge-primary" : "badge-success"}`}>
                      {role === "student" ? "Student" : "Freelancer"}
                    </span>
                  </div>
                  {role === "freelancer" && primaryService && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-semibold text-foreground">{primaryService}</span>
                    </div>
                  )}
                  {role === "freelancer" && monthlyGoal && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Goal</span>
                      <span className="font-semibold text-foreground">₹{Number(monthlyGoal).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {role === "student" && school && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">School</span>
                      <span className="font-semibold text-foreground truncate max-w-[160px] text-right">{school}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-semibold text-foreground">Free</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="premium-alert premium-alert-danger mt-5 flex items-center gap-2 text-sm text-destructive animate-fade-down">
              <AlertTriangle size={14} className="shrink-0" /> {error}
            </div>
          )}

          {/* Navigation */}
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
                className="btn btn-primary gap-2 px-8"
                disabled={step === 1 && !role}
              >
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary gap-2 px-8 group"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Go to Dashboard
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Skip */}
        {step < 3 && (
          <p className="text-center text-xs text-muted-foreground mt-4 animate-fade-up">
            <button
              onClick={() => router.push(role === "freelancer" ? "/freelancer/dashboard" : "/dashboard")}
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
