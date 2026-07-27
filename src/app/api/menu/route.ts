import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/menu — full menu with products grouped by category
export async function GET() {
  const products = await db.product.findMany({ orderBy: [{ category: "asc" }, { popular: "desc" }, { name: "asc" }] })
  const categories = Array.from(new Set(products.map((p) => p.category)))
  return NextResponse.json({ products, categories })
}
