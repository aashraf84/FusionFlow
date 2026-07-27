"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AppUser, Role } from "@/lib/auth"
import { canAccess } from "@/lib/auth"
import type { ModuleId } from "@/lib/data"

interface AuthState {
  user: AppUser | null
  setUser: (u: AppUser | null) => void
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  switchRole: (role: Role) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      login: async (email, password) => {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })
          const json = await res.json()
          if (!res.ok || !json.user) return { ok: false, error: json.error ?? "Login failed" }
          set({ user: json.user })
          return { ok: true }
        } catch {
          return { ok: false, error: "Network error" }
        }
      },
      logout: () => {
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
        set({ user: null })
      },
      switchRole: async (role) => {
        // Demo helper: fetch a user with the given role and set as current
        try {
          const res = await fetch(`/api/auth/switch?role=${role}`)
          const json = await res.json()
          if (json.user) set({ user: json.user })
        } catch {
          /* ignore */
        }
      },
    }),
    {
      name: "crave-auth",
      partialize: (s) => ({ user: s.user }),
    }
  )
)

// Convenience: gate a module for the current user
export function useCanAccess(module: ModuleId): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  return canAccess(user.role as Role, module)
}
