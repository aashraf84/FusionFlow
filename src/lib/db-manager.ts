import { PrismaClient } from "@prisma/client"
import { db } from "./db"

// ── Multi-tenant Prisma client manager ──
// Each tenant gets their own database on Neon.
// This manager creates and caches PrismaClient instances per tenant.

const tenantClients: Map<string, PrismaClient> = new Map()

// Build the connection URL for a tenant database on Neon
export function buildTenantDbUrl(dbName: string): string {
  const user = process.env.NEON_USER || "neondb_owner"
  const pass = process.env.NEON_PASS || ""
  const host = process.env.NEON_HOST_POOLER || "localhost"
  return `postgresql://${user}:${pass}@${host}/${dbName}?sslmode=require&channel_binding=require`
}

// Get or create a PrismaClient for a specific tenant database
export async function getTenantDb(tenantId: string): Promise<PrismaClient> {
  // Check cache first
  const cached = tenantClients.get(tenantId)
  if (cached) {
    // Verify the cached client can actually query — Neon closes idle
    // connections after ~5 min, so a stale client will throw on first use.
    try {
      await cached.$queryRaw`SELECT 1`
      return cached
    } catch {
      // Stale connection — drop it and rebuild below
      tenantClients.delete(tenantId)
      try { await cached.$disconnect() } catch { /* ignore */ }
    }
  }

  // Look up tenant info from master DB
  let tenant
  try {
    tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    })
  } catch (err) {
    // Master DB error (connection drop, cold start, etc.) — propagate as
    // a typed error so callers can return 500 instead of 403.
    const e = new Error("Database error looking up tenant")
    ;(e as any).cause = err
    ;(e as any).code = "DB_ERROR"
    throw e
  }

  if (!tenant) {
    const e = new Error(`Tenant not found: ${tenantId}`)
    ;(e as any).code = "TENANT_NOT_FOUND"
    throw e
  }

  if (tenant.status !== "active") {
    const e = new Error(`Tenant suspended or inactive: ${tenant.name}`)
    ;(e as any).code = "TENANT_INACTIVE"
    throw e
  }

  // Create PrismaClient for the tenant database
  const url = buildTenantDbUrl(tenant.dbName)
  const client = new PrismaClient({
    datasources: { db: { url } },
    log: ["error", "warn"],
  })

  // Cache for future requests
  tenantClients.set(tenantId, client)

  return client
}

// Custom error class for missing tenant header
export class MissingTenantError extends Error {
  code = "MISSING_TENANT" as const
  constructor() {
    super("Missing x-tenant-id header")
  }
}

// Get tenant DB from request (reads x-tenant-id header)
export async function getTenantDbFromRequest(req: Request): Promise<PrismaClient> {
  const tenantId = req.headers.get("x-tenant-id")

  if (!tenantId) {
    throw new MissingTenantError()
  }

  return getTenantDb(tenantId)
}

// Create a new tenant database on Neon and initialize its schema
export async function createTenantDatabase(dbName: string): Promise<boolean> {
  try {
    // Use direct connection (not pooler) for CREATE DATABASE
    const directUrl = process.env.NEON_DIRECT_URL
    if (!directUrl) throw new Error("NEON_DIRECT_URL not configured")

    // We need to use a raw connection to create the database
    // Prisma doesn't support CREATE DATABASE, so we use pg module
    // Use sslmode=require without channel_binding for pg module compatibility
    const cleanUrl = directUrl.replace("&channel_binding=require", "")
    const { Client } = await import("pg")
    const client = new Client({
      connectionString: cleanUrl,
      ssl: { rejectUnauthorized: false },
    })
    await client.connect()

    // Check if database already exists
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    )

    if (res.rows.length > 0) {
      await client.end()
      return true // Already exists
    }

    // Create the database
    await client.query(`CREATE DATABASE "${dbName}"`)
    await client.end()

    return true
  } catch (err) {
    console.error("Failed to create tenant database:", err)
    return false
  }
}

// Push schema to a tenant database using Prisma
export async function initTenantSchema(dbName: string): Promise<boolean> {
  try {
    const url = buildTenantDbUrl(dbName)
    const { execSync } = await import("child_process")

    // Run prisma db push with the tenant database URL
    execSync(`npx prisma db push --accept-data-loss --skip-generate`, {
      env: { ...process.env, DATABASE_URL: url },
      stdio: "pipe",
    })

    return true
  } catch (err) {
    console.error("Failed to initialize tenant schema:", err)
    return false
  }
}

// Disconnect all tenant clients (for graceful shutdown)
export async function disconnectAllTenants() {
  for (const [id, client] of tenantClients) {
    await client.$disconnect()
    tenantClients.delete(id)
  }
}
