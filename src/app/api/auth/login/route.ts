import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { AppUser } from "@/lib/auth"

// POST /api/auth/login — authenticate user with email + password
export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email: string; password: string }
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }
  if (!user.active) {
    return NextResponse.json({ error: "Account disabled. Contact your administrator." }, { status: 403 })
  }
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  const safe: AppUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as AppUser["role"],
    branchId: user.branchId,
    active: user.active,
    avatarColor: user.avatarColor,
    phone: user.phone,
    lastLoginAt: new Date().toISOString(),
  }
  return NextResponse.json({ user: safe })
}
