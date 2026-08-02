import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// POST /api/auth/login — authenticate user against master DB TenantUser
export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email: string; password: string }
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  const user = await db.tenantUser.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { tenant: true },
  })

  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }
  if (!user.active) {
    return NextResponse.json({ error: "Account disabled. Contact your administrator." }, { status: 403 })
  }
  if (user.tenant.status !== "active") {
    return NextResponse.json({ error: "Tenant account suspended. Contact support." }, { status: 403 })
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
