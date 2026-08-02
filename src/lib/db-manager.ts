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
  if (tenantClients.has(tenantId)) {
    return tenantClients.get(tenantId)!
  }

  // Look up tenant info from master DB
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
  })

  if (!tenant) {
    throw new Error(`Tenant not found: ${tenantId}`)
  }

  if (tenant.status !== "active") {
    throw new Error(`Tenant suspended or inactive: ${tenant.name}`)
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

// Get tenant DB from request (reads x-tenant-id header)
export async function getTenantDbFromRequest(req: Request): Promise<PrismaClient> {
  const tenantId = req.headers.get("x-tenant-id")

  if (!tenantId) {
    throw new Error("Missing x-tenant-id header")
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
