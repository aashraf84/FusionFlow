"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useAuthStore } from "@/lib/auth-store"

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refresh: () => void
}

// Lightweight fetch hook with optional polling.
// Automatically includes x-tenant-id header for multi-tenant DB routing.
//
// Resilience features:
//   - Waits for the tenant to hydrate from localStorage before fetching
//   - Retries on 503 (database unavailable) and network errors, up to 3 times
//   - Auto-refreshes when the tenant changes (e.g. after login)
//   - If the API returns 401/403 (TENANT_NOT_FOUND), clears stale auth state
export function useFetch<T>(url: string | null, opts?: { intervalMs?: number; deps?: unknown[] }): FetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!!url)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const abortRef = useRef<AbortController | null>(null)
  const tenant = useAuthStore((s) => s.tenant)
  const deps = opts?.deps ?? []

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!url) {
      setData(null)
      setLoading(false)
      return
    }

    // Wait for tenant to be available before fetching
    if (!tenant?.id) {
      setLoading(true)
      return
    }

    setLoading(true)
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    const headers: Record<string, string> = {
      "x-tenant-id": tenant.id,
    }

    // Retry helper — retries on 503 and network errors with backoff
    const doFetch = async (attempt: number): Promise<void> => {
      try {
        const r = await fetch(url, { signal: ac.signal, cache: "no-store", headers })
        if (!r.ok) {
          // Retry on 503 (database temporarily unavailable) — Neon cold start
          if (r.status === 503 && attempt < 3 && !ac.signal.aborted) {
            await new Promise((res) => setTimeout(res, 800 * (attempt + 1)))
            return doFetch(attempt + 1)
          }
          // 401 / 403 with TENANT_NOT_FOUND → the tenant in localStorage is
          // stale (e.g. DB was reset). Clear auth state so the user re-logs in.
          if ((r.status === 401 || r.status === 403) && !ac.signal.aborted) {
            try {
              const body = await r.json()
              if (body?.code === "TENANT_NOT_FOUND" || body?.code === "MISSING_TENANT") {
                console.warn("[useFetch] Stale/missing tenant — clearing auth state")
                useAuthStore.getState().setUser(null)
                useAuthStore.getState().setTenant(null)
              }
            } catch { /* ignore JSON parse errors */ }
          }
          throw new Error(`Request failed: ${r.status}`)
        }
        const json = await r.json()
        if (!ac.signal.aborted) {
          setData(json)
          setError(null)
        }
      } catch (e: any) {
        if (e?.name === "AbortError") return
        // Retry on network errors (Neon connection drops, DNS hiccups, etc.)
        if (attempt < 2 && !ac.signal.aborted) {
          await new Promise((res) => setTimeout(res, 600 * (attempt + 1)))
          return doFetch(attempt + 1)
        }
        if (!ac.signal.aborted) setError(e?.message ?? "Fetch error")
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    }

    doFetch(0)

    const intervalMs = opts?.intervalMs
    let timer: ReturnType<typeof setInterval> | undefined
    if (intervalMs && intervalMs > 0) {
      timer = setInterval(() => setTick((t) => t + 1), intervalMs)
    }
    return () => {
      ac.abort()
      if (timer) clearInterval(timer)
    }
  }, [url, tick, opts?.intervalMs, tenant?.id, ...deps])

  return { data, loading, error, refresh }
}
