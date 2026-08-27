import { NextResponse } from "next/server"
import { resolveTenant, isTenantError } from "@/lib/api-helpers"

// GET /api/menu
export async function GET(req: Request) {
  const tdb = await resolveTenant(req)
  if (isTenantError(tdb)) return tdb

  const products = await tdb.product.findMany({ orderBy: [{ category: "asc" }, { popular: "desc" }, { name: "asc" }] })
  const categories = Array.from(new Set(products.map((p) => p.category)))
  return NextResponse.json({ products, categories })
}
