"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, logout, loading } = useAuth();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-slate-50">
      <section className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Iteryx</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Auth Boilerplate</h1>
        <p className="mt-3 text-slate-600">
          This branch keeps only authentication flows: login, signup, Google sign-in, and session APIs.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {!user && (
            <>
              <Link href="/login" className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Login
              </Link>
              <Link href="/signup" className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
                Signup
              </Link>
            </>
          )}

          {user && (
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              Logout
            </button>
          )}
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p>
            <span className="font-semibold">Session state:</span>{" "}
            {loading ? "Checking..." : user ? `Logged in as ${user.email}` : "Not logged in"}
          </p>
        </div>
      </section>
    </main>
  );
}
