import { NextResponse } from "next/server"
import { resolveTenant, isTenantError } from "@/lib/api-helpers"

// PATCH /api/orders/[id] — advance / change order status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const tdb = await resolveTenant(req)
  if (isTenantError(tdb)) return tdb

  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.status) data.status = body.status
  if (body.riderId !== undefined) data.riderId = body.riderId
  if (body.paymentStatus) data.paymentStatus = body.paymentStatus

  const order = await tdb.order.update({ where: { id }, data })
  return NextResponse.json({ ok: true, order })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const tdb = await resolveTenant(req)
  if (isTenantError(tdb)) return tdb

  const { id } = await params
  const order = await tdb.order.findUnique({ where: { id }, include: { items: true, branch: true } })
  if (!order) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json({ order })
}
