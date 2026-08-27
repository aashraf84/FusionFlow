import { NextResponse } from "next/server"
import { resolveTenant, isTenantError } from "@/lib/api-helpers"

// GET /api/customers
export async function GET(req: Request) {
  const tdb = await resolveTenant(req)
  if (isTenantError(tdb)) return tdb

  const customers = await tdb.customer.findMany({ orderBy: { totalSpent: "desc" } })
  return NextResponse.json({ customers })
}
