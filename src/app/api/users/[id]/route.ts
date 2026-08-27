import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ROLES, type Role } from "@/lib/auth"

// PATCH /api/users/[id] — update user
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const tenantId = req.headers.get("x-tenant-id")
  if (!tenantId) {
    return NextResponse.json({ error: "Authentication required", code: "MISSING_TENANT" }, { status: 401 })
  }

  const { id } = await params
  const body = (await req.json()) as {
    name?: string
    role?: Role
    active?: boolean
    phone?: string
    password?: string
  }

  // Verify user belongs to this tenant
  let existing
  try {
    existing = await db.tenantUser.findFirst({ where: { id, tenantId } })
  } catch (err) {
    console.error("[users/[id]] DB error:", err)
    return NextResponse.json({ error: "Database temporarily unavailable", code: "DB_ERROR" }, { status: 503, headers: { "Retry-After": "2" } })
  }

  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (body.name) data.name = body.name
  if (body.role) {
    if (!ROLES.find((r) => r.id === body.role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    data.role = body.role
  }
  if (body.active !== undefined) data.active = body.active
  if (body.phone !== undefined) data.phone = body.phone
  if (body.password) data.password = body.password

  try {
    const user = await db.tenantUser.update({ where: { id }, data })
    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active },
    })
  } catch (err) {
    console.error("[users/[id]] DB error:", err)
    return NextResponse.json({ error: "Database temporarily unavailable", code: "DB_ERROR" }, { status: 503, headers: { "Retry-After": "2" } })
  }
}

// DELETE /api/users/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const tenantId = req.headers.get("x-tenant-id")
  if (!tenantId) {
    return NextResponse.json({ error: "Authentication required", code: "MISSING_TENANT" }, { status: 401 })
  }

  const { id } = await params
  // Verify user belongs to this tenant
  let existing
  try {
    existing = await db.tenantUser.findFirst({ where: { id, tenantId } })
  } catch (err) {
    console.error("[users/[id]] DB error:", err)
    return NextResponse.json({ error: "Database temporarily unavailable", code: "DB_ERROR" }, { status: 503, headers: { "Retry-After": "2" } })
  }
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  try {
    await db.tenantUser.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[users/[id]] DB error:", err)
    return NextResponse.json({ error: "Database temporarily unavailable", code: "DB_ERROR" }, { status: 503, headers: { "Retry-After": "2" } })
  }
}
