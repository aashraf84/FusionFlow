"use client"

import { useState } from "react"
import {
  LayoutDashboard, MonitorSmartphone, Pizza, ChefHat, Bike, Boxes, UtensilsCrossed,
  Users, BarChart3, Store, Sparkles, X, ShieldCheck, ChevronDown, Table2, Car,
  ClipboardList, Megaphone, Wallet, Crown, Cog, ShoppingBag, Lock, UserCog,
  ShoppingCart, ShieldCheck as ShieldCheckIcon, FileBarChart, Settings,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { canAccess, getRoleDef } from "@/lib/auth"
import { getModuleTheme } from "@/lib/module-themes"
import type { ModuleId } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/shared/Logo"

interface NavItem {
  id: ModuleId
  label: string
  icon: typeof LayoutDashboard
  desc: string
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
      { id: "purchasing", label: "Purchasing", icon: ShoppingCart, desc: "POs & vendors" },
      { id: "compliance", label: "Quality & Compliance", icon: ShieldCheckIcon, desc: "HACCP & food safety" },
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
      { id: "hr", label: "Human Resources", icon: ClipboardList, desc: "Staff & payroll", hot: true },
      { id: "finance", label: "Finance", icon: Wallet, desc: "Accounting & P&L", hot: true },
      { id: "ai", label: "AI Insights", icon: Sparkles, desc: "Predictions", hot: true },
      { id: "reports", label: "Reports Center", icon: FileBarChart, desc: "A4 printable reports" },
      { id: "settings", label: "Settings", icon: Settings, desc: "System configuration" },
      { id: "users", label: "User Management", icon: UserCog, desc: "Roles & permissions" },
      { id: "owner", label: "Owner Portal", icon: Crown, desc: "SaaS & tenants" },
    ],
  },
]

export function Sidebar() {
  const activeModule = useAppStore((s) => s.activeModule)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  // Expandable groups — default all expanded
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleGroup = (label: string) => setCollapsed((c) => ({ ...c, [label]: !c[label] }))

  const roleDef = user ? getRoleDef(user.role as any) : null
  const initials = user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U"
  const activeTheme = getModuleTheme(activeModule as ModuleId)

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 lg:z-auto h-screen w-[264px] shrink-0 flex flex-col transition-transform duration-300 border-r bg-sidebar text-sidebar-foreground",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand header */}
        <div className="relative h-16 border-b border-sidebar-border shrink-0 flex items-center px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-60 pointer-events-none bg-gradient-to-r from-primary/8 via-transparent to-transparent" />
          <Logo size={38} variant="icon" className="relative" />
          <div className="relative leading-tight ml-2.5">
            <div className="font-extrabold tracking-tight text-[15px] text-sidebar-foreground flex items-center gap-1.5">
              FusionFlow
              <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-primary text-primary-foreground">ERP</span>
            </div>
            <div className="text-[10px] font-medium text-muted-foreground">Fast Food Operating System</div>
          </div>
          <button
            className="relative ml-auto lg:hidden p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Active module color strip */}
        <div className="h-0.5 w-full transition-colors" style={{ background: activeTheme.color }} />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto pf-scroll px-2 py-2">
          {NAV_GROUPS.map((group) => {
            const visible = group.items.filter((item) => user ? canAccess(user.role as any, item.id) : false)
            if (visible.length === 0) return null
            const isCollapsed = collapsed[group.label]
            const hasActive = visible.some(i => i.id === activeModule)
            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    "w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors rounded-md",
                    hasActive ? "text-sidebar-foreground" : "text-muted-foreground/60 hover:text-muted-foreground"
                  )}
                >
                  <span className="flex-1 text-left">{group.label}</span>
                  <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-muted/60 text-muted-foreground border-0">{visible.length}</Badge>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isCollapsed && "-rotate-90")} />
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 mt-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const active = activeModule === item.id
                      const allowed = user ? canAccess(user.role as any, item.id) : false
                      if (!allowed) return null
                      const theme = getModuleTheme(item.id)
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveModule(item.id); setSidebarOpen(false) }}
                          className={cn(
                            "group relative w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all",
                            active ? "shadow-sm" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                          style={active ? {
                            background: theme.colorLight,
                            color: theme.colorDark,
                          } : undefined}
                          title={item.desc}
                        >
                          {active && (
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full"
                              style={{ background: theme.color }}
                            />
                          )}
                          <div
                            className={cn("grid place-items-center h-6 w-6 rounded-md shrink-0 transition-colors")}
                            style={active ? { background: theme.color, color: "white" } : undefined}
                          >
                            <Icon className={cn("h-[15px] w-[15px]", !active && "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                          </div>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.hot && !active && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75 animate-ping" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-chart-2" />
                            </span>
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

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2 space-y-1.5">
          <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-2 py-1.5">
            <div className="grid place-items-center h-8 w-8 rounded-lg shrink-0 font-bold text-[10px] text-white" style={{ background: roleDef?.color ?? "var(--primary)" }}>
              {initials}
            </div>
            <div className="leading-tight min-w-0 flex-1">
              <div className="text-[11px] font-semibold truncate text-sidebar-accent-foreground">{user?.name ?? "Guest"}</div>
              <div className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                <ShieldCheck className="h-2.5 w-2.5" /> {roleDef?.label ?? "—"}
              </div>
            </div>
            <button
              onClick={logout}
              className="text-[9px] font-semibold px-2 py-1 rounded hover:bg-background/60 transition-colors text-muted-foreground hover:text-foreground"
              title="Sign out"
            >
              Logout
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-1 text-[9px] text-muted-foreground/50">
            <Lock className="h-2.5 w-2.5" /> FusionFlow ERP v3.1 · RBAC secured
          </div>
        </div>
      </aside>
    </>
  )
}
