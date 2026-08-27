import { NextResponse } from "next/server"
import { resolveTenant, isTenantError } from "@/lib/api-helpers"
import ZAI from "z-ai-web-dev-sdk"

// GET /api/insights?branchId=
// Generates AI-powered predictions for the restaurant using the LLM skill.
export async function GET(req: Request) {
  const tdb = await resolveTenant(req)
  if (isTenantError(tdb)) return tdb

  const { searchParams } = new URL(req.url)
  const branchId = searchParams.get("branchId") || undefined
  const rangeHours = 48
  const since = new Date(Date.now() - rangeHours * 3600000)

  const branchWhere = branchId ? { branchId } : {}

  // Gather context for the model
  const recentOrders = await tdb.order.findMany({
    where: { ...branchWhere, createdAt: { gte: since } },
    include: { items: true },
  })
  const branch = branchId ? await tdb.branch.findUnique({ where: { id: branchId } }) : null

  // Product performance
  const productStats: Record<string, { name: string; qty: number; revenue: number }> = {}
  const hourlyOrders: Record<string, number> = {}
  for (const o of recentOrders) {
    const hr = new Date(o.createdAt).getHours()
    hourlyOrders[hr] = (hourlyOrders[hr] ?? 0) + 1
    for (const it of o.items) {
      if (!productStats[it.productId]) productStats[it.productId] = { name: it.name, qty: 0, revenue: 0 }
      productStats[it.productId].qty += it.quantity
      productStats[it.productId].revenue += it.quantity * it.price
    }
  }
  const topProducts = Object.values(productStats).sort((a, b) => b.qty - a.qty).slice(0, 5)
  const slowProducts = Object.values(productStats).sort((a, b) => a.qty - b.qty).slice(0, 5)
  const peakHour = Object.entries(hourlyOrders).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "19"

  const inventory = await tdb.inventoryItem.findMany({ where: branchWhere })
  const lowStock = inventory.filter((i) => i.quantity <= i.minStock).map((i) => `${i.name} (${i.quantity}${i.unit})`)

  const customers = await tdb.customer.findMany({ orderBy: { totalSpent: "desc" }, take: 10 })
  const churnRisk = customers.filter((c) => c.lastOrderAt && Date.now() - c.lastOrderAt.getTime() > 14 * 86400000).slice(0, 4)

  const delivered = recentOrders.filter((o) => o.status === "delivered")
  const totalSales = delivered.reduce((s, o) => s + o.total, 0)

  const context = {
    restaurant: branch ? `${branch.brand} — ${branch.name} (${branch.city})` : "All branches",
    rangeHours,
    totalOrders: recentOrders.length,
    deliveredOrders: delivered.length,
    totalSales,
    avgOrderValue: delivered.length ? Math.round(totalSales / delivered.length) : 0,
    topProducts: topProducts.map((p) => `${p.name} (${p.qty} sold, Rs ${p.revenue})`),
    slowProducts: slowProducts.map((p) => `${p.name} (${p.qty} sold)`),
    peakHour: `${peakHour}:00`,
    lowStockItems: lowStock,
    customersAtChurnRisk: churnRisk.map((c) => `${c.name} (last order ${c.lastOrderAt ? Math.floor((Date.now() - c.lastOrderAt.getTime()) / 86400000) : 0}d ago, ${c.tier} tier)`),
    hourlyDistribution: Object.entries(hourlyOrders).map(([h, c]) => `${h}h:${c} orders`).join(", "),
  }

  const systemPrompt = `You are FusionFlow AI, the predictive intelligence engine of an enterprise restaurant ERP (pizza, burger, fried chicken, cloud kitchen & franchise chains in Pakistan, prices in PKR).
Analyze the live operational data and produce actionable predictions & recommendations.
Respond with STRICT valid JSON only (no markdown, no prose) matching this TypeScript type:
{
  "executiveSummary": string,            // 2-3 sentence plain-English overview of current performance
  "bestSellers": { "item": string; "reason": string; "trend": "up" | "stable" | "down" }[],
  "slowMovers": { "item": string; "action": string }[],
  "demandForecast": { "item": string; "expectedDemand": string; "prepAdvice": string }[],
  "staffing": { "peakWindow": string; "recommendation": string }[],
  "wasteRisk": { "item": string; "risk": "low" | "medium" | "high"; "advice": string }[],
  "churnRisk": { "customer": string; "winback": string }[],
  "dynamicPricing": { "item": string; "suggestion": string; "expectedImpact": string }[],
  "marketing": { "campaign": string; "channel": string; "segment": string; "expectedROI": string }[],
  "confidenceScore": number              // 0-100
}`

  const zai = await ZAI.create()
  let insights
  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: `Live operational data (last ${rangeHours}h):\n\n${JSON.stringify(context, null, 2)}` },
      ],
      thinking: { type: "disabled" },
    })
    const raw = completion.choices[0]?.message?.content ?? ""
    // strip code fences if present
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim()
    insights = JSON.parse(cleaned)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: "AI generation failed", details: message, context },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true, context, insights })
}
