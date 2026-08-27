import { NextResponse } from "next/server"
import { resolveTenant, isTenantError } from "@/lib/api-helpers"

// GET /api/dashboard?branchId=&range=24h
// Aggregates everything the frontend dashboards need in one call.
export async function GET(req: Request) {
  const tdb = await resolveTenant(req)
  if (isTenantError(tdb)) return tdb

  const { searchParams } = new URL(req.url)
  const branchId = searchParams.get("branchId") // optional single branch filter
  const rangeHours = Number(searchParams.get("range") ?? 24)
  const since = new Date(Date.now() - rangeHours * 3600000)

  const branchWhere = branchId ? { branchId } : {}

  // ── KPIs ──
  const todayOrders = await tdb.order.findMany({
    where: { ...branchWhere, createdAt: { gte: since } },
    include: { items: true },
  })
  const deliveredToday = todayOrders.filter((o) => o.status === "delivered")
  const todaysSales = deliveredToday.reduce((s, o) => s + o.total, 0)
  const todaysOrders = todayOrders.length
  const avgOrder = todaysOrders ? Math.round(todaysSales / Math.max(deliveredToday.length, 1)) : 0
  const foodCost = deliveredToday.reduce(
    (s, o) => s + o.items.reduce((cs, it) => cs + (it.quantity * (it.price * 0.32)), 0),
    0
  )
  const grossProfit = todaysSales - foodCost

  // ── Hourly sales (last range hours) ──
  const buckets = 24
  const hourly: { hour: string; sales: number; orders: number }[] = []
  for (let i = buckets - 1; i >= 0; i--) {
    const start = new Date(Date.now() - (i + 1) * 3600000)
    const end = new Date(Date.now() - i * 3600000)
    const inBucket = todayOrders.filter((o) => o.createdAt >= start && o.createdAt < end)
    hourly.push({
      hour: `${String(end.getHours()).padStart(2, "0")}:00`,
      sales: inBucket.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0),
      orders: inBucket.length,
    })
  }

  // ── Active/live orders ──
  const activeOrders = await tdb.order.findMany({
    where: { ...branchWhere, status: { in: ["pending", "preparing", "ready", "dispatched"] } },
    include: { items: true, branch: true },
    orderBy: { createdAt: "asc" },
  })

  // ── Kitchen station load ──
  const stationLoad: Record<string, number> = {}
  for (const o of activeOrders) stationLoad[o.station] = (stationLoad[o.station] ?? 0) + 1

  // ── Top products (last range) ──
  const productCounts: Record<string, { name: string; qty: number; revenue: number }> = {}
  for (const o of todayOrders) {
    for (const it of o.items) {
      if (!productCounts[it.productId]) productCounts[it.productId] = { name: it.name, qty: 0, revenue: 0 }
      productCounts[it.productId].qty += it.quantity
      productCounts[it.productId].revenue += it.quantity * it.price
    }
  }
  const topProducts = Object.values(productCounts).sort((a, b) => b.qty - a.qty).slice(0, 6)

  // ── Order type breakdown ──
  const typeMap: Record<string, number> = {}
  for (const o of todayOrders) typeMap[o.type] = (typeMap[o.type] ?? 0) + 1

  // ── Branch comparison (franchise view) ──
  const allBranches = await tdb.branch.findMany()
  const branchStats = []
  for (const b of allBranches) {
    const orders = await tdb.order.findMany({ where: { branchId: b.id, createdAt: { gte: since } } })
    const sales = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0)
    branchStats.push({
      id: b.id,
      name: b.name,
      brand: b.brand,
      city: b.city,
      type: b.type,
      status: b.status,
      isOpen: b.isOpen,
      manager: b.manager,
      royaltyPct: b.royaltyPct,
      franchisee: b.franchisee,
      sales,
      orders: orders.length,
      avg: orders.length ? Math.round(sales / Math.max(orders.filter((o) => o.status === "delivered").length, 1)) : 0,
    })
  }
  branchStats.sort((a, b) => b.sales - a.sales)

  // ── Riders ──
  const riders = await tdb.rider.findMany({
    where: branchId ? { branchId } : {},
    include: { branch: true },
  })

  // ── Inventory alerts ──
  const inventory = await tdb.inventoryItem.findMany({
    where: branchId ? { branchId } : {},
    include: { branch: true },
  })
  const lowStock = inventory.filter((i) => i.quantity <= i.minStock)
  const expiringSoon = inventory.filter((i) => i.expiry && new Date(i.expiry).getTime() - Date.now() < 4 * 86400000)

  // ── Customers summary ──
  const customers = await tdb.customer.findMany({ orderBy: { totalSpent: "desc" }, take: 6 })
  const totalCustomers = await tdb.customer.count()

  // ── Employees present ──
  const employees = await tdb.employee.findMany({ where: branchId ? { branchId } : {} })
  const presentCount = employees.filter((e) => e.attendance === "present" || e.attendance === "late").length

  // ── Dine-in occupancy (mock from active dine_in orders) ──
  const dineInActive = activeOrders.filter((o) => o.type === "dine_in").length
  const occupancyPct = Math.min(100, Math.round((dineInActive / 14) * 100))

  return NextResponse.json({
    rangeHours,
    kpis: {
      todaysSales,
      todaysOrders,
      avgOrder,
      foodCost,
      grossProfit,
      activeOrders: activeOrders.length,
      totalCustomers,
      presentStaff: presentCount,
      occupancyPct,
      lowStockCount: lowStock.length,
    },
    hourly,
    activeOrders: activeOrders.slice(0, 30),
    stationLoad,
    topProducts,
    orderTypes: Object.entries(typeMap).map(([name, value]) => ({ name, value })),
    branchStats,
    riders,
    lowStock: lowStock.slice(0, 12),
    expiringSoon: expiringSoon.slice(0, 8),
    inventory,
    customers,
    employees,
  })
}
