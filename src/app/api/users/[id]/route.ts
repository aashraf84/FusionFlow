import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { Role } from "@/lib/auth"
import { ROLES } from "@/lib/auth"

// PATCH /api/users/[id] — update user (role, active, branchId, name, phone, password)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = (await req.json()) as {
    name?: string
    role?: Role
    branchId?: string | null
    active?: boolean
    phone?: string
    password?: string
  }
  const data: Record<string, unknown> = {}
  if (body.name) data.name = body.name
  if (body.role) {
    if (!ROLES.find((r) => r.id === body.role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    data.role = body.role
  }
  if (body.branchId !== undefined) data.branchId = body.branchId || null
  if (body.active !== undefined) data.active = body.active
  if (body.phone !== undefined) data.phone = body.phone
  if (body.password) data.password = body.password

  const user = await db.user.update({ where: { id }, data })
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, active: user.active } })
}

// DELETE /api/users/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
