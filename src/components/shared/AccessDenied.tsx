"use client"

import { Button } from "@/components/ui/button"
import { Lock, ArrowLeft } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { getRoleDef } from "@/lib/auth"

export function AccessDenied({ module }: { module: string }) {
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const user = useAuthStore((s) => s.user)
  const roleDef = user ? getRoleDef(user.role as any) : null

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center max-w-sm space-y-4">
        <div className="grid place-items-center h-16 w-16 rounded-2xl bg-destructive/10 text-destructive mx-auto">
          <Lock className="h-8 w-8" />
        </div>
        <div>
          <h2 className="font-extrabold text-xl">Access Restricted</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Your role <strong className="text-foreground">{roleDef?.label}</strong> does not have permission to access the <strong className="text-foreground capitalize">{module.replace("-", " ")}</strong> module.
          </p>
          <p className="text-[11px] text-muted-foreground mt-2">
            Contact your administrator if you believe this is an error.
          </p>
        </div>
        <Button onClick={() => setActiveModule("dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
