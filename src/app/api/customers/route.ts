import { NextResponse } from "next/server"
import { getTenantDbFromRequest } from "@/lib/db-manager"

// GET /api/customers
export async function GET(req: Request) {
  const tdb = await getTenantDbFromRequest(req)
  const customers = await tdb.customer.findMany({ orderBy: { totalSpent: "desc" } })
  return NextResponse.json({ customers })
}
