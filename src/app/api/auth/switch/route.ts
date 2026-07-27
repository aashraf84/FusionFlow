import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { AppUser, Role } from "@/lib/auth"
import { ROLES } from "@/lib/auth"

// GET /api/auth/switch?role=manager — demo helper: returns the first user with given role
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role") as Role | null
  if (!role || !ROLES.find((r) => r.id === role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }
  const user = await db.user.findFirst({ where: { role, active: true } })
  if (!user) {
    return NextResponse.json({ error: "No active user with that role" }, { status: 404 })
  }
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  const safe: AppUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    branchId: user.branchId,
    active: user.active,
    avatarColor: user.avatarColor,
    phone: user.phone,
    lastLoginAt: new Date().toISOString(),
  }
  return NextResponse.json({ user: safe })
}
