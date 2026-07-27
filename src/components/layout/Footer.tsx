"use client"

import { ShieldCheck, Globe, Server, Lock } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { Logo } from "@/components/shared/Logo"

export function Footer() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const user = useAuthStore((s) => s.user)
  return (
    <footer className="mt-auto border-t bg-background/95 backdrop-blur">
      <div className="px-4 lg:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <Logo size={16} variant="icon" />
            FusionFlow ERP
          </span>
          <span className="opacity-60">v3.0.0 · Enterprise Edition</span>
          <span className="hidden sm:inline opacity-40">·</span>
          <span className="hidden sm:inline">Branch: <span className="font-medium text-foreground">{activeBranchId === "__ALL__" ? "All" : activeBranchId}</span></span>
          {user && (
            <>
              <span className="hidden sm:inline opacity-40">·</span>
              <span className="hidden sm:inline">User: <span className="font-medium text-foreground">{user.name}</span> · {user.role}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-chart-3" />
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-chart-3 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-chart-3" />
            </span>
            API: operational
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> RBAC secured
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> SOC2 · GDPR
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> PK · EN
          </span>
        </div>
      </div>
    </footer>
  )
}
