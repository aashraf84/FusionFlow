import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ROLES, type Role } from "@/lib/auth"

// GET /api/users — list users for the current tenant (from master DB)
export async function GET(req: Request) {
  const tenantId = req.headers.get("x-tenant-id")
  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenant ID" }, { status: 400 })
  }

  const users = await db.tenantUser.findMany({
    where: { tenantId },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  })

  const safe = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as Role,
    branchId: null,
    active: u.active,
    avatarColor: u.avatarColor,
    phone: u.phone,
    lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
  }))

  return NextResponse.json({ users: safe })
}

// POST /api/users — create a new user in the tenant
export async function POST(req: Request) {
  const tenantId = req.headers.get("x-tenant-id")
  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenant ID" }, { status: 400 })
  }

  const body = (await req.json()) as {
    name: string
    email: string
    password: string
    role: Role
    branchId?: string | null
    phone?: string
  }

  if (!body.name || !body.email || !body.password || !body.role) {
    return NextResponse.json({ error: "name, email, password and role are required" }, { status: 400 })
  }
  if (!ROLES.find((r) => r.id === body.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const existing = await db.tenantUser.findUnique({ where: { email: body.email.toLowerCase().trim() } })
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 })
  }

  const colors: Record<Role, string> = {
    owner: "var(--chart-5)", admin: "var(--chart-1)", manager: "var(--chart-3)",
    cashier: "var(--chart-2)", chef: "var(--chart-4)", rider: "var(--chart-3)", viewer: "var(--muted-foreground)",
  }

  const user = await db.tenantUser.create({
    data: {
      email: body.email.toLowerCase().trim(),
      password: body.password,
      name: body.name,
      role: body.role,
      tenantId,
      phone: body.phone ?? null,
      active: true,
      avatarColor: colors[body.role],
    },
  })

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    },
  })
}
