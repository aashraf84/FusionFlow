import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// PATCH /api/orders/[id] — advance / change order status, assign rider
// body: { status?: string, riderId?: string }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.status) data.status = body.status
  if (body.riderId !== undefined) data.riderId = body.riderId
  if (body.paymentStatus) data.paymentStatus = body.paymentStatus

  const order = await db.order.update({ where: { id }, data })
  return NextResponse.json({ ok: true, order })
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await db.order.findUnique({ where: { id }, include: { items: true, branch: true } })
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json({ order })
}
