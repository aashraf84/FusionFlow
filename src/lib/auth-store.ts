"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AppUser, Role } from "@/lib/auth"
import { canAccess } from "@/lib/auth"
import type { ModuleId } from "@/lib/data"

export interface TenantInfo {
  id: string
  name: string
  dbName: string
  brand: string
  plan: string
  status: string
}

interface AuthState {
  user: AppUser | null
  tenant: TenantInfo | null
  setUser: (u: AppUser | null) => void
  setTenant: (t: TenantInfo | null) => void
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  switchRole: (role: Role) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      setUser: (u) => set({ user: u }),
      setTenant: (t) => set({ tenant: t }),
      login: async (email, password) => {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })
          // Handle non-OK response
          if (!res.ok) {
            try {
              const errorJson = await res.json()
              return { ok: false, error: errorJson.error ?? `Login failed (${res.status})` }
            } catch {
              return { ok: false, error: `Login failed (${res.status})` }
            }
          }
          const json = await res.json()
          if (!json.user) return { ok: false, error: "Invalid response from server" }
          set({ user: json.user, tenant: json.tenant ?? null })
          return { ok: true }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Connection failed"
          return { ok: false, error: msg.includes("fetch") || msg.includes("network") ? "Cannot connect to server" : msg }
        }
      },
      logout: () => {
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
        set({ user: null, tenant: null })
      },
      switchRole: async (role) => {
        try {
          const res = await fetch(`/api/auth/switch?role=${role}`)
          const json = await res.json()
          if (json.user) {
            set({ user: json.user, tenant: json.tenant ?? get().tenant })
          }
        } catch {
          /* ignore */
        }
      },
    }),
    {
      name: "fusionflow-auth",
      partialize: (s) => ({ user: s.user, tenant: s.tenant }),
    }
  )
)

// Convenience: gate a module for the current user
export function useCanAccess(module: ModuleId): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  return canAccess(user.role as Role, module)
}

// Get the current tenant ID for API headers
export function useTenantId(): string | null {
  const tenant = useAuthStore((s) => s.tenant)
  return tenant?.id ?? null
}
