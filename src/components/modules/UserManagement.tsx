"use client"

import { useState } from "react"
import { useFetch } from "@/hooks/use-fetch"
import { useAuthStore } from "@/lib/auth-store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ROLES, PERMISSIONS, type Role, type AppUser } from "@/lib/auth"
import type { ModuleId } from "@/lib/data"
import {
  UserCog, Plus, Search, Mail, Phone, Shield, Trash2, Power, Key, Check, X,
  Lock, Unlock, Crown, ShieldCheck, Users as UsersIcon,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

const MODULE_LIST: { id: ModuleId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "pos", label: "POS" },
  { id: "pizza-builder", label: "Pizza Builder" },
  { id: "kds", label: "KDS" },
  { id: "production", label: "Production" },
  { id: "delivery", label: "Delivery" },
  { id: "tables", label: "Tables" },
  { id: "drive-thru", label: "Drive-Thru" },
  { id: "inventory", label: "Inventory" },
  { id: "purchasing", label: "Purchasing" },
  { id: "menu", label: "Menu" },
  { id: "online", label: "Online Ordering" },
  { id: "crm", label: "CRM" },
  { id: "marketing", label: "Marketing" },
  { id: "analytics", label: "Analytics" },
  { id: "compliance", label: "Compliance" },
  { id: "franchise", label: "Franchise" },
  { id: "hr", label: "HR" },
  { id: "finance", label: "Finance" },
  { id: "ai", label: "AI Insights" },
  { id: "users", label: "User Mgmt" },
  { id: "owner", label: "Owner Portal" },
]

const ROLE_COLORS: Record<Role, string> = {
  owner: "var(--chart-5)", admin: "var(--chart-1)", manager: "var(--chart-3)",
  cashier: "var(--chart-2)", chef: "var(--chart-4)", rider: "var(--chart-3)", viewer: "var(--muted-foreground)",
}

export function UserManagement() {
  const currentUser = useAuthStore((s) => s.user)
  const { data, loading, refresh } = useFetch<{ users: AppUser[] }>("/api/users", {})
  const [search, setSearch] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [permRole, setPermRole] = useState<Role>("cashier")

  const users = (data?.users ?? []).filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search))
  const roleCounts = ROLES.map((r) => ({ ...r, count: (data?.users ?? []).filter((u) => u.role === r.id).length }))

  const toggleActive = async (u: AppUser) => {
    if (u.id === currentUser?.id) { toast.error("You cannot disable your own account"); return }
    try {
      await fetch(`/api/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !u.active }) })
      toast.success(`${u.name} ${u.active ? "disabled" : "enabled"}`)
      refresh()
    } catch { toast.error("Update failed") }
  }

  const changeRole = async (u: AppUser, role: Role) => {
    try {
      await fetch(`/api/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) })
      toast.success(`${u.name} → ${role}`)
      refresh()
    } catch { toast.error("Role change failed") }
  }

  const deleteUser = async (u: AppUser) => {
    if (u.id === currentUser?.id) { toast.error("You cannot delete your own account"); return }
    try {
      await fetch(`/api/users/${u.id}`, { method: "DELETE" })
      toast.success(`${u.name} removed`)
      refresh()
    } catch { toast.error("Delete failed") }
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {roleCounts.map((r) => (
          <Card key={r.id} className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
              <span className="text-[10px] font-bold uppercase text-muted-foreground">{r.label}</span>
            </div>
            <div className="text-xl font-extrabold">{r.count}</div>
          </Card>
        ))}
      </div>

      {/* Permissions matrix preview */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm">Role Permissions Matrix</h3>
          <span className="text-[11px] text-muted-foreground ml-2">Click a role to preview its module access</span>
          <div className="ml-auto flex items-center gap-1">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => setPermRole(r.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors",
                  permRole === r.id ? "text-white" : "bg-muted/60 hover:bg-muted"
                )}
                style={permRole === r.id ? { background: r.color } : undefined}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-1.5">
            {MODULE_LIST.map((m) => {
              const perm = PERMISSIONS[permRole]?.[m.id]
              const allowed = perm !== undefined
              const ro = perm === "ro"
              return (
                <span
                  key={m.id}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold border",
                    allowed ? (ro ? "bg-chart-4/10 text-chart-4 border-chart-4/30" : "bg-chart-3/10 text-chart-3 border-chart-3/30") : "bg-muted/40 text-muted-foreground/50 border-border"
                  )}
                >
                  {allowed ? (ro ? <Lock className="h-2.5 w-2.5" /> : <Check className="h-2.5 w-2.5" />) : <X className="h-2.5 w-2.5" />}
                  {m.label}
                </span>
              )
            })}
          </div>
          <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="h-2.5 w-2.5 text-chart-3" /> Full access</span>
            <span className="flex items-center gap-1"><Lock className="h-2.5 w-2.5 text-chart-4" /> Read-only</span>
            <span className="flex items-center gap-1"><X className="h-2.5 w-2.5" /> No access</span>
          </div>
        </div>
      </Card>

      {/* Users table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-2">
          <h3 className="font-bold text-sm flex items-center gap-1.5"><UsersIcon className="h-4 w-4" /> Users & Access</h3>
          <div className="sm:ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="h-8 w-48 pl-8 text-xs" />
            </div>
            <Button size="sm" className="h-8" onClick={() => setShowAdd(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add User
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">User</th>
                  <th className="text-left px-4 py-2 font-semibold">Role</th>
                  <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-2 font-semibold hidden lg:table-cell">Last Login</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => {
                  const roleDef = ROLES.find((r) => r.id === u.role)!
                  const initials = u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                  const isSelf = u.id === currentUser?.id
                  return (
                    <tr key={u.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="grid place-items-center h-8 w-8 rounded-full text-white text-[10px] font-bold shrink-0" style={{ background: ROLE_COLORS[u.role] }}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs flex items-center gap-1">
                              {u.name}
                              {isSelf && <Badge variant="outline" className="text-[8px] py-0 h-3.5">YOU</Badge>}
                              {u.role === "owner" && <Crown className="h-3 w-3 text-chart-5" />}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border" style={{ background: `color-mix(in oklch, ${ROLE_COLORS[u.role]} 12%, transparent)`, color: ROLE_COLORS[u.role], borderColor: `color-mix(in oklch, ${ROLE_COLORS[u.role]} 30%, transparent)` }}>
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: ROLE_COLORS[u.role] }} />
                              {roleDef.label}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuLabel className="text-[10px] uppercase">Change role</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {ROLES.map((r) => (
                              <DropdownMenuItem key={r.id} onClick={() => changeRole(u, r.id)} className="gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                                <span className="font-semibold">{r.label}</span>
                                {u.role === r.id && <Check className="h-3 w-3 ml-auto text-chart-3" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">
                        {u.phone ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-muted-foreground">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : "Never"}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={cn("text-[9px]", u.active ? "text-chart-3 border-chart-3/30 bg-chart-3/10" : "text-muted-foreground")}>
                          {u.active ? <Unlock className="h-2.5 w-2.5 mr-0.5" /> : <Lock className="h-2.5 w-2.5 mr-0.5" />}
                          {u.active ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1 justify-end">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleActive(u)} title={u.active ? "Disable" : "Enable"} disabled={isSelf}>
                            <Power className={cn("h-3.5 w-3.5", u.active ? "text-chart-4" : "text-chart-3")} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteUser(u)} title="Delete" disabled={isSelf}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddUserDialog open={showAdd} onOpenChange={setShowAdd} onCreated={refresh} />
    </div>
  )
}

function AddUserDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("crave123")
  const [role, setRole] = useState<Role>("cashier")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!name || !email || !password) { toast.error("Fill all required fields"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, phone: phone || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed")
      toast.success(`${name} added as ${role}`)
      setName(""); setEmail(""); setPassword("crave123"); setRole("cashier"); setPhone("")
      onOpenChange(false)
      onCreated()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add user")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserCog className="h-5 w-5 text-primary" /> Add New User</DialogTitle>
          <DialogDescription>Create a new account with role-based access.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block">Full name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ahmed Raza" className="h-9" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Email *</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@crave.dev" className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold mb-1 block">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92…" className="h-9" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Password *</label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} className="h-9" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Role *</label>
            <div className="grid grid-cols-3 gap-1.5">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 rounded-lg border-2 transition-all",
                    role === r.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                  <span className="text-[10px] font-bold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            <Key className="h-4 w-4 mr-1.5" /> {saving ? "Creating…" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
