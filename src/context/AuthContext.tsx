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
  signupWithCredentials: (name: string, email: string, password: string, role: "student" | "freelancer") => Promise<void>;
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
  const onboardingCompleted = user.onboardingCompleted ?? false;

  if (!onboardingCompleted) {
    return { route: "/onboarding" };
  }

  // Role-based routing: freelancers go to their dedicated dashboard
  if (user.role === "freelancer") {
    return { route: "/freelancer/dashboard" };
  }

  return { route: "/dashboard" };
}

async function parseApiResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { error: text } : {};
}

async function getServerSessionUser(): Promise<AuthUser | null> {
  let response: Response;
  try {
    response = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const data = await parseApiResponse(response);
  return (data.user as AuthUser) ?? null;
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
        const sessionUser = await getServerSessionUser();
        if (isMounted) setUser(sessionUser);
      } catch {
        if (isMounted) setUser(null);
      }
    };

    const syncGoogleUser = async (firebaseUser: FirebaseUser) => {
      if (!firebaseUser.email) return;

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
            // Backend session is source of truth for routing/role. Never let
            // Firebase Google state override an active credentials session.
            const backendUser = await getServerSessionUser();
            if (backendUser?.provider === "credentials") {
              return;
            }

            if (
              backendUser?.email &&
              firebaseUser.email &&
              backendUser.email !== firebaseUser.email
            ) {
              return;
            }

            await syncGoogleUser(firebaseUser);
          } catch {
            if (isMounted) {
              const backendUser = await getServerSessionUser();
              setUser(backendUser);
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
    const sessionUser = await getServerSessionUser();
    setUser(sessionUser);
  };

  // ── loginWithCredentials ──────────────────────────────────────────────────
  const loginWithCredentials = async (email: string, password: string) => {
    let response: Response;
    try {
      response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error("Unable to reach the server. Please check your connection and try again.");
    }

    const data = await parseApiResponse(response);
    if (!response.ok) throw new Error(data.error ?? "Login failed");

    if (auth?.currentUser) {
      await signOut(auth);
    }

    const authUser = data.user as AuthUser;
    setUser(authUser);

    // Deterministic routing rule
    const { route } = resolveOnboardingRoute(authUser);
    router.replace(route);
  };

  // ── signupWithCredentials ─────────────────────────────────────────────────
  const signupWithCredentials = async (name: string, email: string, password: string, role: "student" | "freelancer") => {
    let response: Response;
    try {
      response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role }),
      });
    } catch {
      throw new Error("Unable to reach the server. Please check your connection and try again.");
    }

    const data = await parseApiResponse(response);
    if (!response.ok) throw new Error(data.error ?? "Signup failed");

    if (auth?.currentUser) {
      await signOut(auth);
    }

    const authUser = data.user as AuthUser;
    setUser(authUser);

    // New users always go to onboarding (isNewUser=true, onboardingCompleted=false)
    const { route } = resolveOnboardingRoute(authUser);
    router.replace(route);
  };

  // ── signInWithGoogle ──────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (!auth || !googleProvider || !isFirebaseConfigured) {
      throw new Error("Google sign-in is not configured.");
    }

    const result = await signInWithPopup(auth, googleProvider);
    let response: Response;
    try {
      response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          uid: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          image: result.user.photoURL,
        }),
      });
    } catch {
      throw new Error("Unable to finish Google sign-in. Please try again.");
    }

    const data = await parseApiResponse(response);
    if (!response.ok) throw new Error(data.error ?? "Google sign-in failed");

    const authUser = data.user as AuthUser;
    setUser(authUser);

    // Same deterministic routing rule — works for both new and returning Google users
    const { route } = resolveOnboardingRoute(authUser);
    router.replace(route);
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    if (auth?.currentUser) await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE", credentials: "include" });
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
