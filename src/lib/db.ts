import { PrismaClient } from "@prisma/client"

// ── Master DB client (for Tenant + TenantUser + SerialKey queries) ──
// Singleton pattern: reuse the same PrismaClient across hot reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
