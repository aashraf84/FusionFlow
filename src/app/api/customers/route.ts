import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/customers
export async function GET() {
  const customers = await db.customer.findMany({ orderBy: { totalSpent: "desc" } })
  return NextResponse.json({ customers })
}
