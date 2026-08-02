import { NextResponse } from "next/server"
import { getTenantDbFromRequest } from "@/lib/db-manager"

// GET /api/menu
export async function GET(req: Request) {
  let tdb
  try {
    tdb = await getTenantDbFromRequest(req)
  } catch {
    return NextResponse.json({ error: "Tenant not configured" }, { status: 403 })
  }
  const products = await tdb.product.findMany({ orderBy: [{ category: "asc" }, { popular: "desc" }, { name: "asc" }] })
  const categories = Array.from(new Set(products.map((p) => p.category)))
  return NextResponse.json({ products, categories })
}
