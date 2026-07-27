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
import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Loader2 } from "lucide-react"

export default function Home() {
  const activeModule = useAppStore((s) => s.activeModule)
  const [seeded, setSeeded] = useState(false)

  // Check DB count; auto-seed if empty (first run)
  const { data: counts, refresh } = useFetch<{ orders: number }>("/api/seed", {})
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
        // re-poll counts so the effect can retry on next tick
        setTimeout(() => refresh(), 1500)
      })
  }, [needsSeed, refresh])

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6">
          {/* First-run seeding overlay */}
          {seeding && (
            <div className="rounded-xl border-2 border-dashed p-6 mb-4 flex items-center gap-3 bg-muted/20">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <div className="font-semibold text-sm">Initializing PizzaFlow ERP database…</div>
                <div className="text-[11px] text-muted-foreground">Seeding branches, menu, inventory, riders, customers & sample orders</div>
              </div>
            </div>
          )}
          {activeModule === "dashboard" && <Dashboard />}
          {activeModule === "pos" && <POS />}
          {activeModule === "pizza-builder" && <PizzaBuilder />}
          {activeModule === "kds" && <KDS />}
          {activeModule === "production" && <Production />}
          {activeModule === "delivery" && <Delivery />}
          {activeModule === "tables" && <Tables />}
          {activeModule === "drive-thru" && <DriveThru />}
          {activeModule === "inventory" && <Inventory />}
          {activeModule === "menu" && <MenuModule />}
          {activeModule === "online" && <OnlineOrdering />}
          {activeModule === "crm" && <CRM />}
          {activeModule === "marketing" && <Marketing />}
          {activeModule === "analytics" && <Analytics />}
          {activeModule === "franchise" && <Franchise />}
          {activeModule === "hr" && <HR />}
          {activeModule === "finance" && <Finance />}
          {activeModule === "ai" && <AIInsights />}
          {activeModule === "owner" && <OwnerPortal />}
        </main>
        <Footer />
      </div>
    </div>
  )
}
