"use client"

/* eslint-disable react-hooks/set-state-in-effect -- data-fetching hook legitimately synchronizes loading/data state with an external fetch system */

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
    setLoading(true)
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    const headers: Record<string, string> = {}
    if (tenant?.id) {
      headers["x-tenant-id"] = tenant.id
    }

    fetch(url, { signal: ac.signal, cache: "no-store", headers })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`)
        const json = await r.json()
        if (!ac.signal.aborted) {
          setData(json)
          setError(null)
        }
      })
      .catch((e) => {
        if (e?.name === "AbortError") return
        if (!ac.signal.aborted) setError(e?.message ?? "Fetch error")
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false)
      })

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
