"use client"

import { useEffect, useRef, useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { Footer } from "@/components/layout/Footer"
import { Dashboard } from "@/components/modules/Dashboard"
import { POS } from "@/components/modules/POS"
import { PizzaBuilder } from "@/components/modules/PizzaBuilder"
import { KDS } from "@/components/modules/KDS"
import { Delivery } from "@/components/modules/Delivery"
import { Inventory } from "@/components/modules/Inventory"
import { MenuModule } from "@/components/modules/MenuModule"
import { CRM } from "@/components/modules/CRM"
import { Analytics } from "@/components/modules/Analytics"
import { Franchise } from "@/components/modules/Franchise"
import { Tables } from "@/components/modules/Tables"
import { DriveThru } from "@/components/modules/DriveThru"
import { Production } from "@/components/modules/Production"
import { HR } from "@/components/modules/HR"
import { Finance } from "@/components/modules/Finance"
import { Marketing } from "@/components/modules/Marketing"
import { OnlineOrdering } from "@/components/modules/OnlineOrdering"
import { OwnerPortal } from "@/components/modules/OwnerPortal"
import { AIInsights } from "@/components/modules/AIInsights"
import { UserManagement } from "@/components/modules/UserManagement"
import { Purchasing } from "@/components/modules/Purchasing"
import { Compliance } from "@/components/modules/Compliance"
import { Reports } from "@/components/modules/Reports"
import { SettingsModule } from "@/components/modules/Settings"
import { LoginScreen } from "@/components/auth/LoginScreen"
import { AccessDenied } from "@/components/shared/AccessDenied"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { canAccess } from "@/lib/auth"
import { useFetch } from "@/hooks/use-fetch"
import { Loader2 } from "lucide-react"
import type { ModuleId } from "@/lib/data"

export default function Home() {
  const activeModule = useAppStore((s) => s.activeModule)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const [seeded, setSeeded] = useState(false)
  const user = useAuthStore((s) => s.user)

  // Check DB count; auto-seed if empty (first run)
  const { data: counts, refresh } = useFetch<{ orders: number; users: number }>("/api/seed", {})
  const startedRef = useRef(false)
  const needsSeed = !!counts && counts.orders === 0 && !seeded
  const seeding = needsSeed

  useEffect(() => {
    if (!needsSeed || startedRef.current) return
    startedRef.current = true
    fetch("/api/seed", { method: "POST" })
      .then((r) => r.json())
      .then(() => {
        setSeeded(true)
        refresh()
      })
      .catch(() => {
        startedRef.current = false
        setTimeout(() => refresh(), 1500)
      })
  }, [needsSeed, refresh])

  // If user's active module is not permitted (e.g. after role switch), bounce to dashboard
  useEffect(() => {
    if (user && activeModule !== "dashboard" && !canAccess(user.role as any, activeModule as ModuleId)) {
      setActiveModule("dashboard")
    }
  }, [user, activeModule, setActiveModule])

  // Not logged in → show login screen (after seeding check completes)
  if (!user && !seeding) {
    return <LoginScreen />
  }

  // While seeding and not logged in, show splash
  if (!user && seeding) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <div className="font-semibold text-sm">Initializing FusionFlow ERP database…</div>
          <div className="text-[11px] text-muted-foreground max-w-xs">
            Seeding branches, menu, inventory, riders, customers, users & sample orders
          </div>
        </div>
      </div>
    )
  }

  const hasAccess = user ? canAccess(user.role as any, activeModule as ModuleId) : false

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6">
          {!hasAccess ? (
            <AccessDenied module={activeModule} />
          ) : (
            <>
              {activeModule === "dashboard" && <Dashboard />}
              {activeModule === "pos" && <POS />}
              {activeModule === "pizza-builder" && <PizzaBuilder />}
              {activeModule === "kds" && <KDS />}
              {activeModule === "production" && <Production />}
              {activeModule === "delivery" && <Delivery />}
              {activeModule === "tables" && <Tables />}
              {activeModule === "drive-thru" && <DriveThru />}
              {activeModule === "inventory" && <Inventory />}
              {activeModule === "purchasing" && <Purchasing />}
              {activeModule === "menu" && <MenuModule />}
              {activeModule === "online" && <OnlineOrdering />}
              {activeModule === "crm" && <CRM />}
              {activeModule === "marketing" && <Marketing />}
              {activeModule === "analytics" && <Analytics />}
              {activeModule === "compliance" && <Compliance />}
              {activeModule === "franchise" && <Franchise />}
              {activeModule === "hr" && <HR />}
              {activeModule === "finance" && <Finance />}
              {activeModule === "ai" && <AIInsights />}
              {activeModule === "reports" && <Reports />}
              {activeModule === "settings" && <SettingsModule />}
              {activeModule === "users" && <UserManagement />}
              {activeModule === "owner" && <OwnerPortal />}
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  )
}
