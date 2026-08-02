import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ROLES, type Role } from "@/lib/auth"

// GET /api/auth/switch?role=manager — demo helper: returns first active user with role
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role") as Role | null
  if (!role || !ROLES.find((r) => r.id === role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const user = await db.tenantUser.findFirst({
    where: { role, active: true },
    include: { tenant: true },
  })

  if (!user) {
    return NextResponse.json({ error: "No active user with that role" }, { status: 404 })
  }
  if (user.tenant.status !== "active") {
    return NextResponse.json({ error: "Tenant account suspended" }, { status: 403 })
  }

  await db.tenantUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      avatarColor: user.avatarColor,
      phone: user.phone,
      lastLoginAt: new Date().toISOString(),
    },
    tenant: {
      id: user.tenant.id,
      name: user.tenant.name,
      dbName: user.tenant.dbName,
      brand: user.tenant.brand,
      plan: user.tenant.plan,
      status: user.tenant.status,
    },
  })
}
