import { NextResponse } from "next/server"
import { getTenantDbFromRequest, MissingTenantError } from "./db-manager"
import type { PrismaClient } from "@prisma/client"

// Shared helper: resolve the tenant DB from a request, returning a
// proper HTTP response on failure instead of throwing.
//
// Usage in API routes:
//   const tdb = await resolveTenant(req)
//   if (tdd instanceof NextResponse) return tdb  // <-- typo-safe pattern
//   if (!tdb) return ... // unreachable
//
// Better usage:
//   const res = await resolveTenant(req)
//   if ("status" in res) return res       // error response
//   const tdb = res                       // PrismaClient
//
// Returns:
//   - PrismaClient on success
//   - NextResponse (status 401) when the x-tenant-id header is missing
//   - NextResponse (status 403) when the tenant doesn't exist / is inactive
//   - NextResponse (status 503) when the database is unreachable (retryable)
export async function resolveTenant(req: Request): Promise<PrismaClient | NextResponse> {
  try {
    const tdb = await getTenantDbFromRequest(req)
    return tdb
  } catch (err: any) {
    const code = err?.code

    if (err instanceof MissingTenantError || code === "MISSING_TENANT") {
      return NextResponse.json(
        { error: "Authentication required", code: "MISSING_TENANT" },
        { status: 401 }
      )
    }

    if (code === "TENANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Tenant not found. Please sign in again.", code: "TENANT_NOT_FOUND" },
        { status: 403 }
      )
    }

    if (code === "TENANT_INACTIVE") {
      return NextResponse.json(
        { error: "Tenant account suspended. Contact support.", code: "TENANT_INACTIVE" },
        { status: 403 }
      )
    }

    // DB_ERROR or any other unexpected error — this is a server-side issue,
    // NOT an auth problem. Return 503 so the client knows to retry.
    console.error("[resolveTenant] DB error:", err)
    return NextResponse.json(
      { error: "Database temporarily unavailable. Retrying...", code: "DB_ERROR" },
      { status: 503, headers: { "Retry-After": "2" } }
    )
  }
}

// Type guard: did resolveTenant return an error response?
export function isTenantError(res: PrismaClient | NextResponse): res is NextResponse {
  return res instanceof NextResponse
}
