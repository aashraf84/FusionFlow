"use client"

import { useEffect, useState } from "react"
import { Bell, Menu, Moon, Search, Sun, ChevronDown, Store, Wifi, Command, Plus, Zap, Users, LogOut, CheckCircle2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import { ROLES, getRoleDef, type Role } from "@/lib/auth"
import { useFetch } from "@/hooks/use-fetch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface BranchInfo {
  id: string
  name: string
  brand: string
  city: string
  type: string
  status: string
  isOpen: boolean
}

const MODULE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Executive Dashboard", subtitle: "Real-time view across all branches" },
  pos: { title: "Point of Sale", subtitle: "Ultra-fast touch ordering terminal" },
  "pizza-builder": { title: "Pizza Builder", subtitle: "Build custom pizzas with live pricing" },
  kds: { title: "Kitchen Display System", subtitle: "Live kitchen stations & order routing" },
  production: { title: "Kitchen Production", subtitle: "Batch planning, dough, sauces & prep" },
  delivery: { title: "Delivery Operations", subtitle: "Riders, routes & proof of delivery" },
  tables: { title: "Tables & Floor Plan", subtitle: "Live occupancy, reservations & merging" },
  "drive-thru": { title: "Drive-Thru Module", subtitle: "Queue monitoring & pickup window" },
  inventory: { title: "Inventory & Stock", subtitle: "Raw, semi-finished & packaging" },
  purchasing: { title: "Purchasing & Procurement", subtitle: "Purchase orders, vendors & goods receiving" },
  menu: { title: "Menu & Recipe Costing", subtitle: "Products, recipes, margins" },
  online: { title: "Online Ordering", subtitle: "Storefront, QR ordering & kiosks" },
  crm: { title: "CRM & Loyalty", subtitle: "Customers, points & tiers" },
  marketing: { title: "Marketing Engine", subtitle: "Campaigns, promos & channels" },
  analytics: { title: "Analytics & Reports", subtitle: "Sales, performance & profitability" },
  compliance: { title: "Quality & Compliance", subtitle: "HACCP, food safety & inspections" },
  franchise: { title: "Franchise Network", subtitle: "Branches, royalties & compliance" },
  hr: { title: "Human Resources", subtitle: "Staff, attendance, payroll & shifts" },
  finance: { title: "Finance & Accounting", subtitle: "P&L, cash flow, AR/AP & expenses" },
  ai: { title: "AI Intelligence", subtitle: "Predictions, forecasting & recommendations" },
  users: { title: "User Management", subtitle: "Accounts, roles & permissions (RBAC)" },
  owner: { title: "Owner Portal", subtitle: "SaaS tenants, subscriptions & licensing" },
}

const QUICK_ACTIONS = [
  { label: "New Dine-In Order", module: "pos" as const, hint: "POS" },
  { label: "Build Custom Pizza", module: "pizza-builder" as const, hint: "Builder" },
  { label: "View Kitchen Display", module: "kds" as const, hint: "KDS" },
  { label: "Check Inventory Alerts", module: "inventory" as const, hint: "Stock" },
  { label: "Open AI Insights", module: "ai" as const, hint: "AI" },
  { label: "Delivery Fleet", module: "delivery" as const, hint: "Riders" },
]

export function TopBar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<Date | null>(null)
  const [cmdOpen, setCmdOpen] = useState(false)
  const activeModule = useAppStore((s) => s.activeModule)
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const setActiveBranch = useAppStore((s) => s.setActiveBranch)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

  const { data } = useFetch<{ branchStats: BranchInfo[] }>("/api/dashboard", { intervalMs: 30000 })
  const branches = data?.branchStats ?? []
  const current = branches.find((b) => b.id === activeBranchId)
  const allBranchesActive = activeBranchId === "__ALL__"

  // Auth / current user
  const user = useAuthStore((s) => s.user)
  const switchRole = useAuthStore((s) => s.switchRole)
  const logout = useAuthStore((s) => s.logout)
  const currentRole = (user?.role ?? "viewer") as Role
  const roleDef = getRoleDef(currentRole)
  const userName = user?.name ?? "Guest"
  const userEmail = user?.email ?? ""
  const userInitials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const userAvatarColor = user?.avatarColor ?? "var(--primary)"
  const userRoleColor = roleDef.color
  const userRoleLabel = roleDef.label
  const ROLE_SWITCH = ROLES

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag + clock init for client-only rendering
    setMounted(true)
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // keyboard shortcut for command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const meta = MODULE_TITLES[activeModule] ?? { title: "Crave ERP", subtitle: "" }
  const timeStr = now?.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) ?? ""

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/85 backdrop-blur-md flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6">
      <button
        className="lg:hidden grid place-items-center h-10 w-10 rounded-lg hover:bg-accent shrink-0"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="font-bold text-[14px] lg:text-base truncate leading-tight">{meta.title}</h1>
        <p className="text-[10px] lg:text-[11px] text-muted-foreground truncate hidden sm:block leading-tight">{meta.subtitle}</p>
      </div>

      {/* Command / Search trigger */}
      <button
        onClick={() => setCmdOpen(true)}
        className="hidden md:flex items-center gap-2 h-9 w-44 lg:w-56 rounded-lg bg-muted/60 hover:bg-muted border border-transparent hover:border-border px-3 text-xs text-muted-foreground transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border bg-background px-1 py-0.5 text-[9px] font-mono font-semibold">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Branch switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 h-9 px-2.5 sm:px-3 max-w-[150px] sm:max-w-[200px] shrink-0">
            <span className={cn("h-2 w-2 rounded-full shrink-0", allBranchesActive ? "bg-primary" : current?.isOpen ? "bg-chart-3" : "bg-muted-foreground/50")} />
            <Store className="h-4 w-4 text-primary shrink-0 hidden sm:block" />
            <span className="truncate text-xs font-semibold">
              {allBranchesActive ? "All Branches" : current ? current.name.split(" ").slice(0, 2).join(" ") : "Select"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center justify-between text-xs">
            <span>Select Branch</span>
            <Badge variant="secondary" className="text-[10px]">{branches.filter(b => b.isOpen).length}/{branches.length} open</Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setActiveBranch("__ALL__")}
            className={cn(allBranchesActive && "bg-accent")}
          >
            <Store className="h-4 w-4 mr-2" /> All Branches
            <Badge variant="outline" className="ml-auto text-[9px]">Network</Badge>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="max-h-72 overflow-y-auto pf-scroll">
            {branches.map((b) => (
              <DropdownMenuItem
                key={b.id}
                onClick={() => setActiveBranch(b.id)}
                className={cn("flex items-start gap-2 py-2", activeBranchId === b.id && "bg-accent")}
              >
                <span className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", b.isOpen ? "bg-chart-3" : "bg-muted-foreground/40")} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{b.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{b.brand} · {b.city}</div>
                </div>
                <Badge variant="outline" className="text-[9px] capitalize shrink-0">{b.type.replace("_", " ")}</Badge>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Live clock */}
      <div className="hidden xl:flex items-center gap-2 px-2.5 h-9 rounded-lg bg-muted/50">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-chart-3 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-3" />
        </span>
        <span className="text-[10px] font-bold tracking-wide">LIVE</span>
        <span className="text-[11px] text-muted-foreground font-mono tabular-nums">{timeStr}</span>
      </div>

      {/* Quick new */}
      <Button size="sm" className="h-9 hidden sm:flex shrink-0" onClick={() => { setActiveModule("pos"); toast.success("New POS session") }}>
        <Plus className="h-4 w-4 mr-1" /> <span className="hidden lg:inline">New Order</span>
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="h-9 w-9 relative shrink-0" aria-label="Notifications">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
      </Button>

      {/* Theme */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        {mounted && theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </Button>

      {/* User chip with role switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l shrink-0 h-10 px-1 rounded-lg hover:bg-accent">
            <div className="grid place-items-center h-8 w-8 rounded-full text-white text-[11px] font-bold shrink-0" style={{ background: userAvatarColor }}>
              {userInitials}
            </div>
            <div className="hidden md:block leading-tight text-left">
              <div className="text-xs font-semibold">{userName}</div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: userRoleColor }} />
                {userRoleLabel}
              </div>
            </div>
            <ChevronDown className="h-3 w-3 opacity-50 hidden md:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <div className="grid place-items-center h-8 w-8 rounded-full text-white text-[11px] font-bold" style={{ background: userAvatarColor }}>{userInitials}</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{userName}</div>
              <div className="text-[11px] text-muted-foreground truncate">{userEmail}</div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Switch role (demo)</DropdownMenuLabel>
          {ROLE_SWITCH.map((r) => (
            <DropdownMenuItem
              key={r.id}
              onClick={() => switchRole(r.id)}
              className="gap-2"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
              <span className="font-semibold flex-1">{r.label}</span>
              {currentRole === r.id && <CheckCircle2 className="h-3.5 w-3.5 text-chart-3" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => { setActiveModule("users"); }}
            className="gap-2"
          >
            <Users className="h-4 w-4" /> User Management
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Command palette */}
      <Dialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <DialogContent className="sm:max-w-lg top-[20%] translate-y-0 p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Quick actions</DialogTitle>
            <DialogDescription>Search commands and jump to any module quickly.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 px-4 h-12 border-b">
            <Zap className="h-4 w-4 text-primary" />
            <Input placeholder="Type a command or search…" className="border-0 h-9 focus-visible:ring-0" autoFocus />
          </div>
          <div className="p-2">
            <div className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">Quick Actions</div>
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.label}
                onClick={() => { setActiveModule(a.module); setCmdOpen(false) }}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent text-left transition-colors"
              >
                <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium">{a.label}</span>
                <Badge variant="outline" className="text-[9px]">{a.hint}</Badge>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
