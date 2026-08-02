import { NextResponse } from "next/server"
import { getTenantDbFromRequest } from "@/lib/db-manager"

// GET /api/customers
export async function GET(req: Request) {
  let tdb
  try {
    tdb = await getTenantDbFromRequest(req)
  } catch {
    return NextResponse.json({ error: "Tenant not configured" }, { status: 403 })
  }
  const customers = await tdb.customer.findMany({ orderBy: { totalSpent: "desc" } })
  return NextResponse.json({ customers })
}
