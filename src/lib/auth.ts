// FusionFlow ERP — RBAC permissions matrix & role definitions

import type { ModuleId } from "./data"

export type Role = "owner" | "admin" | "manager" | "cashier" | "chef" | "rider" | "viewer"

export interface RoleDef {
  id: Role
  label: string
  description: string
  color: string
  level: number // hierarchy level (higher = more access)
}

export const ROLES: RoleDef[] = [
  { id: "owner", label: "Owner", description: "Full system access incl. Owner Portal & SaaS management", color: "var(--chart-5)", level: 100 },
  { id: "admin", label: "Administrator", description: "Full ERP access except Owner Portal", color: "var(--chart-1)", level: 90 },
  { id: "manager", label: "Branch Manager", description: "Operate a branch — all operational modules", color: "var(--chart-3)", level: 70 },
  { id: "cashier", label: "Cashier", description: "Front-of-house — POS, tables, orders, CRM", color: "var(--chart-2)", level: 40 },
  { id: "chef", label: "Chef / Kitchen", description: "Kitchen operations — KDS, production, inventory", color: "var(--chart-4)", level: 40 },
  { id: "rider", label: "Delivery Rider", description: "Delivery operations only", color: "var(--chart-3)", level: 20 },
  { id: "viewer", label: "Viewer / Auditor", description: "Read-only dashboards & analytics", color: "var(--muted-foreground)", level: 10 },
]

// Module access per role. `true` = full access, `ro` = read-only.
export const PERMISSIONS: Record<Role, Partial<Record<ModuleId, boolean | "ro">>> = {
  owner: {
    dashboard: true, pos: true, "pizza-builder": true, kds: true, production: true, delivery: true,
    tables: true, "drive-thru": true, inventory: true, purchasing: true, menu: true, online: true, crm: true,
    marketing: true, analytics: true, compliance: true, franchise: true, hr: true, finance: true, ai: true, users: true, owner: true,
  },
  admin: {
    dashboard: true, pos: true, "pizza-builder": true, kds: true, production: true, delivery: true,
    tables: true, "drive-thru": true, inventory: true, purchasing: true, menu: true, online: true, crm: true,
    marketing: true, analytics: true, compliance: true, franchise: true, hr: true, finance: true, ai: true, users: true, owner: "ro",
  },
  manager: {
    dashboard: true, pos: true, "pizza-builder": true, kds: true, production: true, delivery: true,
    tables: true, "drive-thru": true, inventory: true, purchasing: true, menu: true, online: true, crm: true,
    marketing: true, analytics: true, compliance: true, franchise: "ro", hr: true, finance: "ro", ai: true, users: "ro",
  },
  cashier: {
    dashboard: true, pos: true, "pizza-builder": true, tables: true, online: true, crm: true,
  },
  chef: {
    dashboard: true, kds: true, production: true, inventory: true, compliance: true,
  },
  rider: {
    dashboard: true, delivery: true,
  },
  viewer: {
    dashboard: true, analytics: "ro", franchise: "ro", inventory: "ro", purchasing: "ro", menu: "ro", crm: "ro", compliance: "ro", hr: "ro", finance: "ro",
  },
}

export function canAccess(role: Role, module: ModuleId): boolean {
  return PERMISSIONS[role]?.[module] !== undefined
}

export function isReadOnly(role: Role, module: ModuleId): boolean {
  return PERMISSIONS[role]?.[module] === "ro"
}

export function getRoleDef(role: Role): RoleDef {
  return ROLES.find((r) => r.id === role) ?? ROLES[ROLES.length - 1]
}

export interface AppUser {
  id: string
  name: string
  email: string
  role: Role
  branchId: string | null
  active: boolean
  avatarColor: string
  phone?: string | null
  lastLoginAt?: string | null
}
