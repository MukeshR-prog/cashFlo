"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id?: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  provider: "google" | "credentials" | null;
  role?: "student" | "freelancer" | null;
  /** Whether the user has completed the onboarding wizard */
  onboardingCompleted?: boolean;
  /** True only on the very first sign-up / first Google OAuth */
  isNewUser?: boolean;
  /** Number of times the user has logged in (incremented server-side) */
  loginCount?: number;
  profile?: Record<string, unknown> | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  signupWithCredentials: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

// ── Onboarding routing decision ───────────────────────────────────────────────

/**
 * Pure deterministic routing rule.
 *
 * Input:  { is_new_user, onboarding_completed, login_count? }
 * Output: { action, ... }
 */
function resolveOnboardingRoute(user: AuthUser): { route: string } {
  const isNewUser          = user.isNewUser          ?? false;
  const onboardingCompleted = user.onboardingCompleted ?? false;

  if (isNewUser || !onboardingCompleted) {
    return { route: "/onboarding" };
  }
  return { route: "/dashboard" };
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ── Bootstrap: restore session from cookie on mount ──────────────────────
  useEffect(() => {
    let isMounted = true;

    const refreshSessionState = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) {
          if (isMounted) setUser(null);
          return;
        }
        const data = await response.json();
        if (isMounted) setUser(data.user as AuthUser);
      } catch {
        if (isMounted) setUser(null);
      }
    };

    const syncGoogleUser = async (firebaseUser: FirebaseUser) => {
      if (!firebaseUser.email) return;

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          image: firebaseUser.photoURL,
        }),
      });

      if (!response.ok) throw new Error("Google sign-in failed");

      const data = await response.json();
      if (isMounted) setUser(data.user as AuthUser);
    };

    const initialize = async () => {
      await refreshSessionState();
      if (isMounted) setLoading(false);
    };

    void initialize();

    // Sync Firebase Google user if they're already authenticated in Firebase
    const unsubscribe = auth
      ? onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (
            !firebaseUser ||
            !firebaseUser.providerData.some((p) => p.providerId === "google.com")
          ) {
            return;
          }
          try {
            await syncGoogleUser(firebaseUser);
          } catch {
            if (isMounted) {
              setUser({
                name: firebaseUser.displayName,
                email: firebaseUser.email,
                image: firebaseUser.photoURL,
                provider: "google",
              });
            }
          }
        })
      : undefined;

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  // ── refreshSession ────────────────────────────────────────────────────────
  const refreshSession = async () => {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    if (!response.ok) {
      setUser(null);
      return;
    }
    const data = await response.json();
    setUser(data.user as AuthUser);
  };

  // ── loginWithCredentials ──────────────────────────────────────────────────
  const loginWithCredentials = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Login failed");

    const authUser = data.user as AuthUser;
    setUser(authUser);

    // Deterministic routing rule
    const { route } = resolveOnboardingRoute(authUser);
    router.push(route);
  };

  // ── signupWithCredentials ─────────────────────────────────────────────────
  const signupWithCredentials = async (name: string, email: string, password: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Signup failed");

    const authUser = data.user as AuthUser;
    setUser(authUser);

    // New users always go to onboarding (isNewUser=true, onboardingCompleted=false)
    const { route } = resolveOnboardingRoute(authUser);
    router.push(route);
  };

  // ── signInWithGoogle ──────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (!auth || !googleProvider || !isFirebaseConfigured) {
      throw new Error("Google sign-in is not configured.");
    }

    const result = await signInWithPopup(auth, googleProvider);
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        image: result.user.photoURL,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Google sign-in failed");

    const authUser = data.user as AuthUser;
    setUser(authUser);

    // Same deterministic routing rule — works for both new and returning Google users
    const { route } = resolveOnboardingRoute(authUser);
    router.push(route);
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    if (auth?.currentUser) await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithCredentials,
        signupWithCredentials,
        signInWithGoogle,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
