"use client"

import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { canAccess } from "@/lib/auth"
import { getModuleTheme } from "@/lib/module-themes"
import type { ModuleId } from "@/lib/data"
import { cn } from "@/lib/utils"
import { LayoutDashboard, MonitorSmartphone, ChefHat, Bike, MoreHorizontal, Pizza } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  LayoutDashboard as Dash, MonitorSmartphone as POS, Pizza as PizzaIcon, ChefHat as KDS,
  Bike as Delivery, Boxes as Inventory, UtensilsCrossed as Menu, Users as CRM,
  BarChart3 as Analytics, Wallet as Finance, ClipboardList as HR, Store as Franchise,
  Sparkles as AI, Settings as SettingsIcon, FileBarChart as Reports, Megaphone as Marketing,
  Table2 as Tables, Car as DriveThru, Cog as Production, ShoppingBag as Online,
  ShoppingCart as Purchasing, ShieldCheck as Compliance, UserCog as Users, Crown as Owner,
} from "lucide-react"

const PRIMARY_TABS: { id: ModuleId; label: string; icon: typeof Dash }[] = [
  { id: "dashboard", label: "Home", icon: Dash },
  { id: "pos", label: "POS", icon: POS },
  { id: "kds", label: "Kitchen", icon: KDS },
  { id: "delivery", label: "Delivery", icon: Delivery },
]

const ALL_MODULES: { id: ModuleId; label: string; icon: typeof Dash; group: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: Dash, group: "Operations" },
  { id: "pos", label: "Point of Sale", icon: POS, group: "Operations" },
  { id: "pizza-builder", label: "Pizza Builder", icon: PizzaIcon, group: "Operations" },
  { id: "kds", label: "Kitchen Display", icon: KDS, group: "Operations" },
  { id: "production", label: "Production", icon: Production, group: "Operations" },
  { id: "tables", label: "Tables & Floor", icon: Tables, group: "Operations" },
  { id: "drive-thru", label: "Drive-Thru", icon: DriveThru, group: "Operations" },
  { id: "delivery", label: "Delivery", icon: Delivery, group: "Logistics" },
  { id: "inventory", label: "Inventory", icon: Inventory, group: "Logistics" },
  { id: "purchasing", label: "Purchasing", icon: Purchasing, group: "Logistics" },
  { id: "compliance", label: "Compliance", icon: Compliance, group: "Logistics" },
  { id: "menu", label: "Menu & Recipes", icon: Menu, group: "Commerce" },
  { id: "online", label: "Online Ordering", icon: Online, group: "Commerce" },
  { id: "crm", label: "CRM & Loyalty", icon: CRM, group: "Commerce" },
  { id: "marketing", label: "Marketing", icon: Marketing, group: "Commerce" },
  { id: "analytics", label: "Analytics", icon: Analytics, group: "Insights" },
  { id: "franchise", label: "Franchise", icon: Franchise, group: "Insights" },
  { id: "hr", label: "Human Resources", icon: HR, group: "Insights" },
  { id: "finance", label: "Finance", icon: Finance, group: "Insights" },
  { id: "ai", label: "AI Insights", icon: AI, group: "Insights" },
  { id: "reports", label: "Reports Center", icon: Reports, group: "Insights" },
  { id: "settings", label: "Settings", icon: SettingsIcon, group: "Insights" },
  { id: "users", label: "User Management", icon: Users, group: "Insights" },
  { id: "owner", label: "Owner Portal", icon: Owner, group: "Insights" },
]

export function MobileBottomNav() {
  const activeModule = useAppStore((s) => s.activeModule)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const user = useAuthStore((s) => s.user)
  const [moreOpen, setMoreOpen] = useState(false)

  const visiblePrimary = PRIMARY_TABS.filter(t => user ? canAccess(user.role as any, t.id) : false)
  const visibleAll = ALL_MODULES.filter(m => user ? canAccess(user.role as any, m.id) : false)
  const groups = Array.from(new Set(visibleAll.map(m => m.group)))

  const activeTheme = getModuleTheme(activeModule as ModuleId)

  return (
    <>
      {/* Bottom tab bar — native mobile app style */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass-header border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch h-14">
          {visiblePrimary.map(tab => {
            const Icon = tab.icon
            const active = activeModule === tab.id
            const theme = getModuleTheme(tab.id)
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModule(tab.id)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors"
              >
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full" style={{ background: theme.color }} />}
                <Icon
                  className={cn("h-5 w-5 transition-colors", active ? "" : "text-muted-foreground")}
                  style={active ? { color: theme.color } : undefined}
                />
                <span
                  className={cn("text-[9px] font-semibold transition-colors", active ? "" : "text-muted-foreground")}
                  style={active ? { color: theme.color } : undefined}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors"
          >
            <span className="absolute top-0 h-0.5 w-8 rounded-full" style={{ background: moreOpen ? activeTheme.color : "transparent" }} />
            <MoreHorizontal className={cn("h-5 w-5", moreOpen ? "" : "text-muted-foreground")} style={moreOpen ? { color: activeTheme.color } : undefined} />
            <span className={cn("text-[9px] font-semibold", moreOpen ? "" : "text-muted-foreground")} style={moreOpen ? { color: activeTheme.color } : undefined}>More</span>
          </button>
        </div>
      </nav>

      {/* More sheet — full module list */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="h-[75vh] p-0">
          <SheetHeader className="px-4 pt-4 pb-2 border-b">
            <SheetTitle className="text-sm">All Modules</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto pf-scroll p-4 space-y-4">
            {groups.map(group => {
              const modules = visibleAll.filter(m => m.group === group)
              if (modules.length === 0) return null
              return (
                <div key={group}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{group}</div>
                  <div className="grid grid-cols-4 gap-2">
                    {modules.map(m => {
                      const Icon = m.icon
                      const active = activeModule === m.id
                      const theme = getModuleTheme(m.id)
                      return (
                        <button
                          key={m.id}
                          onClick={() => { setActiveModule(m.id); setMoreOpen(false) }}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all",
                            active ? "border-2" : "border-border hover:border-primary/30"
                          )}
                          style={active ? { background: theme.colorLight, borderColor: theme.color } : undefined}
                        >
                          <div
                            className="grid place-items-center h-9 w-9 rounded-lg shrink-0"
                            style={{ background: active ? theme.color : "var(--muted)", color: active ? "white" : "var(--muted-foreground)" }}
                          >
                            <Icon className="h-[18px] w-[18px]" />
                          </div>
                          <span className={cn("text-[9px] font-semibold text-center leading-tight", active ? "" : "text-muted-foreground")} style={active ? { color: theme.colorDark } : undefined}>
                            {m.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
