import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { AppUser, Role } from "@/lib/auth"
import { ROLES } from "@/lib/auth"

function toSafe(u: any): AppUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as Role,
    branchId: u.branchId,
    active: u.active,
    avatarColor: u.avatarColor,
    phone: u.phone,
    lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
  }
}

// GET /api/users
export async function GET() {
  const users = await db.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] })
  return NextResponse.json({ users: users.map(toSafe) })
}

// POST /api/users — create a new user
export async function POST(req: Request) {
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
  const existing = await db.user.findUnique({ where: { email: body.email.toLowerCase().trim() } })
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 })
  }
  const colors: Record<Role, string> = {
    owner: "var(--chart-5)", admin: "var(--chart-1)", manager: "var(--chart-3)",
    cashier: "var(--chart-2)", chef: "var(--chart-4)", rider: "var(--chart-3)", viewer: "var(--muted-foreground)",
  }
  const user = await db.user.create({
    data: {
      id: `U-${Date.now().toString(36).toUpperCase()}`,
      name: body.name,
      email: body.email.toLowerCase().trim(),
      password: body.password,
      role: body.role,
      branchId: body.branchId || null,
      phone: body.phone ?? null,
      active: true,
      avatarColor: colors[body.role],
    },
  })
  return NextResponse.json({ ok: true, user: toSafe(user) })
}
