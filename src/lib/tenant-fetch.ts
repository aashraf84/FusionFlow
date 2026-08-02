"use client"

import { useAuthStore } from "@/lib/auth-store"

// Wrapper around fetch that automatically includes the x-tenant-id header
// for multi-tenant database routing. Use this instead of fetch for API calls.
export function tenantFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const tenantId = useAuthStore.getState().tenant?.id
  const headers = new Headers(options.headers)
  if (tenantId) {
    headers.set("x-tenant-id", tenantId)
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  return fetch(url, { ...options, headers })
}
