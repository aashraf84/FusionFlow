import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/orders?status=&branchId=&active=true
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const branchId = searchParams.get("branchId")
  const active = searchParams.get("active") === "true"
  const limit = Number(searchParams.get("limit") ?? 100)

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (branchId) where.branchId = branchId
  if (active) where.status = { in: ["pending", "preparing", "ready", "dispatched"] }

  const orders = await db.order.findMany({
    where,
    include: { items: true, branch: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
  return NextResponse.json({ orders })
}

// POST /api/orders — create a new order (POS checkout)
export async function POST(req: Request) {
  const body = await req.json()
  const { branchId, type, table, customerName, customerPhone, customerAddress, items, paymentMethod, notes } = body as {
    branchId: string
    type: string
    table?: string
    customerName?: string
    customerPhone?: string
    customerAddress?: string
    items: { productId: string; name: string; price: number; quantity: number; customizations?: string }[]
    paymentMethod?: string
    notes?: string
  }

  if (!branchId || !items?.length) {
    return NextResponse.json({ error: "branchId and items are required" }, { status: 400 })
  }

  // derive station from first item
  const firstProduct = await db.product.findUnique({ where: { id: items[0].productId } })
  const station = firstProduct?.station ?? "pizza"

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax = Math.round(subtotal * 0.13)
  const total = subtotal + tax

  // next order number
  const lastOrder = await db.order.findFirst({ orderBy: { number: "desc" } })
  const number = (lastOrder?.number ?? 1000) + 1

  const order = await db.order.create({
    data: {
      id: `O-${branchId}-${number}`,
      number,
      branchId,
      type,
      status: "pending",
      station,
      table: table ?? null,
      customerName: customerName ?? null,
      customerPhone: customerPhone ?? null,
      customerAddress: customerAddress ?? null,
      subtotal,
      tax,
      total,
      paymentMethod: paymentMethod ?? null,
      paymentStatus: paymentMethod ? "paid" : "unpaid",
      notes: notes ?? null,
      items: {
        create: items.map((i, idx) => ({
          id: `OI-O-${branchId}-${number}-${idx + 1}`,
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          customizations: i.customizations ?? null,
        })),
      },
    },
    include: { items: true },
  })

  return NextResponse.json({ ok: true, order })
}
