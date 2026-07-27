"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  MonitorSmartphone,
  Pizza,
  ChefHat,
  Bike,
  Boxes,
  UtensilsCrossed,
  Users,
  BarChart3,
  Store,
  Sparkles,
  X,
  ShieldCheck,
  ChevronDown,
  Table2,
  Car,
  ClipboardList,
  Megaphone,
  Wallet,
  Cpu,
  Cog,
  ShoppingBag,
  Crown,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import type { ModuleId } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface NavItem {
  id: ModuleId
  label: string
  icon: typeof LayoutDashboard
  desc: string
  badge?: string
  hot?: boolean
}
interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Executive overview" },
      { id: "pos", label: "Point of Sale", icon: MonitorSmartphone, desc: "Touch POS terminal" },
      { id: "pizza-builder", label: "Pizza Builder", icon: Pizza, desc: "Custom pizzas" },
      { id: "kds", label: "Kitchen Display", icon: ChefHat, desc: "Live KDS", hot: true },
      { id: "production", label: "Production", icon: Cog, desc: "Batch & prep planning" },
      { id: "tables", label: "Tables & Floor", icon: Table2, desc: "Floor plan & reservations" },
      { id: "drive-thru", label: "Drive-Thru", icon: Car, desc: "Queue & pickup" },
    ],
  },
  {
    label: "Logistics",
    items: [
      { id: "delivery", label: "Delivery", icon: Bike, desc: "Riders & routes", hot: true },
      { id: "inventory", label: "Inventory", icon: Boxes, desc: "Stock & batches" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { id: "menu", label: "Menu & Recipes", icon: UtensilsCrossed, desc: "Products & costing" },
      { id: "online", label: "Online Ordering", icon: ShoppingBag, desc: "Storefront & QR" },
      { id: "crm", label: "CRM & Loyalty", icon: Users, desc: "Customers & rewards" },
      { id: "marketing", label: "Marketing", icon: Megaphone, desc: "Campaigns & promos" },
    ],
  },
  {
    label: "Insights & Admin",
    items: [
      { id: "analytics", label: "Analytics", icon: BarChart3, desc: "Reports" },
      { id: "franchise", label: "Franchise", icon: Store, desc: "Multi-branch" },
      { id: "hr", label: "Human Resources", icon: ClipboardList, desc: "Staff & payroll" },
      { id: "finance", label: "Finance", icon: Wallet, desc: "Accounting & P&L" },
      { id: "ai", label: "AI Insights", icon: Sparkles, desc: "Predictions", badge: "AI", hot: true },
      { id: "owner", label: "Owner Portal", icon: Crown, desc: "SaaS & tenants" },
    ],
  },
]

export function Sidebar() {
  const activeModule = useAppStore((s) => s.activeModule)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleGroup = (label: string) =>
    setCollapsed((c) => ({ ...c, [label]: !c[label] }))

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 lg:z-auto h-screen w-[264px] shrink-0 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 border-r border-sidebar-border",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50 pointer-events-none" />
          <div className="relative grid place-items-center h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Pizza className="h-5 w-5" />
          </div>
          <div className="relative leading-tight">
            <div className="font-extrabold tracking-tight text-[15px] flex items-center gap-1.5">
              PizzaFlow
              <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-primary/30 text-primary-foreground/90">ERP</span>
            </div>
            <div className="text-[10px] text-sidebar-foreground/55 font-medium">Enterprise Restaurant OS</div>
          </div>
          <button
            className="relative ml-auto lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground p-1.5 rounded-md hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto pf-scroll px-2.5 py-3 space-y-1">
          {NAV_GROUPS.map((group) => {
            const isCollapsed = collapsed[group.label]
            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors"
                >
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isCollapsed && "-rotate-90")} />
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 mt-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const active = activeModule === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveModule(item.id)
                            setSidebarOpen(false)
                          }}
                          className={cn(
                            "group relative w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all",
                            active
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                          title={item.desc}
                        >
                          {active && (
                            <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary-foreground" />
                          )}
                          <Icon className={cn("h-[17px] w-[17px] shrink-0 transition-colors", active ? "text-primary-foreground" : "text-sidebar-foreground/55 group-hover:text-sidebar-accent-foreground")} />
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.hot && !active && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-chart-3 opacity-75 animate-ping" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-chart-3" />
                            </span>
                          )}
                          {item.badge && (
                            <Badge variant="secondary" className="h-4 px-1 text-[8px] font-bold bg-sidebar-accent text-sidebar-accent-foreground border-0">
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer of sidebar */}
        <div className="border-t border-sidebar-border p-2.5 space-y-2">
          <div className="flex items-center gap-2.5 rounded-lg bg-gradient-to-br from-sidebar-accent to-sidebar-accent/50 px-2.5 py-2">
            <div className="grid place-items-center h-8 w-8 rounded-lg bg-chart-3/20 text-chart-3 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="leading-tight min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-sidebar-accent-foreground flex items-center gap-1">
                Enterprise Tier <Cpu className="h-2.5 w-2.5" />
              </div>
              <div className="text-[9px] text-sidebar-foreground/50">Multi-tenant · RBAC · 2FA active</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-1">
            <div className="grid place-items-center h-7 w-7 rounded-full bg-primary/20 text-primary text-[10px] font-bold">AK</div>
            <div className="leading-tight min-w-0 flex-1">
              <div className="text-[11px] font-semibold truncate">Ahsan Khan</div>
              <div className="text-[9px] text-sidebar-foreground/50">Regional Manager</div>
            </div>
            <div className="text-[9px] text-sidebar-foreground/40">v2.4</div>
          </div>
        </div>
      </aside>
    </>
  )
}
