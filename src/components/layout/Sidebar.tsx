"use client"

import { useState } from "react"
import {
  LayoutDashboard, MonitorSmartphone, Pizza, ChefHat, Bike, Boxes, UtensilsCrossed,
  Users, BarChart3, Store, Sparkles, X, ShieldCheck, ChevronDown, Table2, Car,
  ClipboardList, Megaphone, Wallet, Crown, Cog, ShoppingBag, Lock, UserCog,
  ShoppingCart, ShieldCheck as ShieldCheckIcon,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { canAccess, getRoleDef } from "@/lib/auth"
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
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleGroup = (label: string) => setCollapsed((c) => ({ ...c, [label]: !c[label] }))

  const roleDef = user ? getRoleDef(user.role as any) : null
  const initials = user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "U"

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 lg:z-auto h-screen w-[268px] shrink-0 flex flex-col transition-transform duration-300 border-r",
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0",
        )}
        style={{
          background: "linear-gradient(180deg, oklch(0.2 0.03 40) 0%, oklch(0.17 0.025 42) 50%, oklch(0.15 0.02 44) 100%)",
          borderColor: "oklch(0.28 0.03 40)",
        }}
      >
        {/* Brand header */}
        <div className="relative h-16 border-b shrink-0 flex items-center px-4 overflow-hidden" style={{ borderColor: "oklch(0.28 0.03 40)" }}>
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: "radial-gradient(ellipse at top left, oklch(0.55 0.2 28 / 0.25), transparent 70%)" }} />
          <Logo size={40} variant="icon" className="relative drop-shadow-md" />
          <div className="relative leading-tight ml-2.5">
            <div className="font-extrabold tracking-tight text-[15px] text-white flex items-center gap-1.5">
              Crave
              <span className="text-[8px] font-bold px-1 py-0.5 rounded text-white" style={{ background: "oklch(0.55 0.2 28)" }}>ERP</span>
            </div>
            <div className="text-[10px] font-medium" style={{ color: "oklch(0.96 0.01 70 / 0.55)" }}>Restaurant Operating System</div>
          </div>
          <button
            className="relative ml-auto lg:hidden p-1.5 rounded-md hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            style={{ color: "oklch(0.96 0.01 70 / 0.7)" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto pf-scroll px-2.5 py-3 space-y-1">
          {NAV_GROUPS.map((group) => {
            const visible = group.items.filter((item) => user ? canAccess(user.role as any, item.id) : false)
            if (visible.length === 0) return null
            const isCollapsed = collapsed[group.label]
            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
                  style={{ color: "oklch(0.96 0.01 70 / 0.4)" }}
                >
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isCollapsed && "-rotate-90")} />
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 mt-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const active = activeModule === item.id
                      const allowed = user ? canAccess(user.role as any, item.id) : false
                      if (!allowed) return null
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveModule(item.id); setSidebarOpen(false) }}
                          className={cn(
                            "group relative w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all",
                            active ? "text-white shadow-md" : "hover:bg-white/8",
                          )}
                          style={active ? {
                            background: "linear-gradient(90deg, oklch(0.55 0.2 28) 0%, oklch(0.6 0.18 38) 100%)",
                            boxShadow: "0 4px 12px oklch(0.55 0.2 28 / 0.4)",
                          } : { color: "oklch(0.96 0.01 70 / 0.78)" }}
                          title={item.desc}
                        >
                          {active && <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-white" />}
                          <Icon className={cn("h-[17px] w-[17px] shrink-0 transition-colors", active ? "text-white" : "")} style={!active ? { color: "oklch(0.96 0.01 70 / 0.55)" } : undefined} />
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.hot && !active && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: "oklch(0.7 0.16 75)" }} />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "oklch(0.7 0.16 75)" }} />
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
        <div className="border-t p-2.5 space-y-2" style={{ borderColor: "oklch(0.28 0.03 40)" }}>
          <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2" style={{ background: "oklch(0.24 0.03 42 / 0.6)" }}>
            <div className="grid place-items-center h-8 w-8 rounded-lg shrink-0 font-bold text-[10px] text-white" style={{ background: roleDef?.color ?? "var(--primary)" }}>
              {initials}
            </div>
            <div className="leading-tight min-w-0 flex-1">
              <div className="text-[11px] font-semibold truncate text-white">{user?.name ?? "Guest"}</div>
              <div className="text-[9px] flex items-center gap-1" style={{ color: "oklch(0.96 0.01 70 / 0.5)" }}>
                <ShieldCheck className="h-2.5 w-2.5" /> {roleDef?.label ?? "—"}
              </div>
            </div>
            <button
              onClick={logout}
              className="text-[9px] font-semibold px-2 py-1 rounded hover:bg-white/10 transition-colors"
              style={{ color: "oklch(0.96 0.01 70 / 0.7)" }}
              title="Sign out"
            >
              Logout
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-1 text-[9px]" style={{ color: "oklch(0.96 0.01 70 / 0.4)" }}>
            <Lock className="h-2.5 w-2.5" /> Crave ERP v3.0 · RBAC secured
          </div>
        </div>
      </aside>
    </>
  )
}
