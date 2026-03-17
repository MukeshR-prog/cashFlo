/**
 * useDashboardData
 *
 * Generic fetch hook that:
 *  1. Calls the given API route on mount (and when `url` changes).
 *  2. If the response is empty/null/zero-length, falls back to the provided
 *     `mockData` so the UI always has something to show.
 *  3. Exposes { data, loading, error, isEmpty, refetch }.
 *
 * mockData and isEmpty are stored in refs so changing them between renders
 * never triggers an extra effect cycle (preventing the infinite-loop bug).
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseDashboardDataOptions<T> {
  /** The API path to fetch, e.g. "/api/dashboard/summary" */
  url: string;
  /** Static mock data used when the real API returns empty */
  mockData: T;
  /**
   * Optional predicate that decides whether the fetched data counts as
   * "empty".  Return true → use mockData instead.
   * Default: checks for null / undefined / empty array / all-zero object.
   */
  isEmpty?: (data: T) => boolean;
}

function defaultIsEmpty<T>(data: T): boolean {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data) && data.length === 0) return true;
  if (typeof data === "object" && data !== null) {
    const vals = Object.values(data as Record<string, unknown>);
    if (vals.length === 0) return true;
    // Only treat as empty if EVERY leaf is falsy / 0 / []
    return vals.every(
      (v) =>
        v === null ||
        v === undefined ||
        v === 0 ||
        (Array.isArray(v) && v.length === 0)
    );
  }
  return false;
}

type State<T> =
  | { status: "loading" }
  | { status: "ok"; data: T; isEmpty: boolean };

export function useDashboardData<T>({
  url,
  mockData,
  isEmpty: isEmptyFn,
}: UseDashboardDataOptions<T>) {
  const [state, setState] = useState<State<T>>({ status: "loading" });

  // ── Store non-primitive args in refs so they never cause effect re-runs ──
  const mockRef    = useRef<T>(mockData);
  const emptyRef   = useRef(isEmptyFn);
  // keep refs in sync on every render (safe — writing a ref is synchronous)
  mockRef.current  = mockData;
  emptyRef.current = isEmptyFn;

  // ── Stable fetch function ─────────────────────────────────────────────────
  const run = useCallback(
    async (signal: AbortSignal) => {
      setState({ status: "loading" });
      try {
        const res = await fetch(url, { cache: "no-store", signal });
        if (!res.ok) {
          // Auth error / server error → fall back to mock silently
          setState({ status: "ok", data: mockRef.current, isEmpty: true });
          return;
        }
        const json = (await res.json()) as T;
        const checkEmpty = emptyRef.current ?? defaultIsEmpty;
        const empty = checkEmpty(json);
        setState({
          status: "ok",
          data: empty ? mockRef.current : json,
          isEmpty: empty,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // unmount cleanup — ignore
        setState({ status: "ok", data: mockRef.current, isEmpty: true });
      }
    },
    [url] // ← ONLY url; mockData/isEmptyFn live in refs
  );

  useEffect(() => {
    const controller = new AbortController();
    void run(controller.signal);
    return () => controller.abort();
  }, [run]); // run is stable unless url changes

  // Public refetch — no abort needed; user-triggered
  const refetch = useCallback(() => {
    const controller = new AbortController();
    void run(controller.signal);
  }, [run]);

  if (state.status === "loading") {
    return { data: null as T | null, loading: true, isEmpty: false, refetch };
  }
  return { data: state.data as T, loading: false, isEmpty: state.isEmpty, refetch };
}
