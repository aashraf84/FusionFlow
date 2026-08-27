import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getTenantDb, createTenantDatabase, initTenantSchema, buildTenantDbUrl } from "@/lib/db-manager"
import { SEED_BRANCHES, SEED_PRODUCTS } from "@/lib/data"
import { PrismaClient } from "@prisma/client"

// POST /api/seed — Multi-tenant initialization
// 1. Creates default tenant in master DB (if not exists)
// 2. Creates tenant database on Neon (if not exists)
// 3. Seeds tenant DB with branches, products, inventory, riders, employees, customers, users, orders
// 4. Creates TenantUsers in master DB for auth
export async function POST() {
  const DEFAULT_TENANT_DB = "tenant_fusionflow_default"
  const DEFAULT_TENANT_NAME = "FusionFlow Restaurant Group"

  // ── Step 1: Create or find default tenant in master DB ──
  let tenant = await db.tenant.findFirst({
    where: { dbName: DEFAULT_TENANT_DB },
  })

  if (!tenant) {
    tenant = await db.tenant.create({
      data: {
        name: DEFAULT_TENANT_NAME,
        dbName: DEFAULT_TENANT_DB,
        brand: "FusionFlow Restaurant",
        plan: "enterprise",
        status: "active",
        contactName: "Daniyal Khan",
        contactEmail: "owner@fusionflow.dev",
        contactPhone: "+923001111111",
        city: "Lahore",
      },
    })
  }

  // ── Step 2: Create tenant database on Neon (if not exists) ──
  await createTenantDatabase(DEFAULT_TENANT_DB)

  // ── Step 3: Initialize schema in tenant DB ──
  await initTenantSchema(DEFAULT_TENANT_DB)

  // ── Step 4: Connect to tenant DB and seed restaurant data ──
  const tenantDbUrl = buildTenantDbUrl(DEFAULT_TENANT_DB)
  const tdb = new PrismaClient({
    datasources: { db: { url: tenantDbUrl } },
    log: ["error"],
  })

  // Wipe tenant DB (order matters for FK)
  await tdb.orderItem.deleteMany()
  await tdb.order.deleteMany()
  await tdb.inventoryItem.deleteMany()
  await tdb.rider.deleteMany()
  await tdb.employee.deleteMany()
  await tdb.customer.deleteMany()
  await tdb.user.deleteMany()
  await tdb.product.deleteMany()
  await tdb.branch.deleteMany()

  // ── Branches ──
  await tdb.branch.createMany({
    data: SEED_BRANCHES.map((b) => ({
      id: b.id, name: b.name, brand: b.brand, type: b.type, city: b.city,
      manager: b.manager ?? null, status: b.status, isOpen: b.isOpen,
      royaltyPct: b.royaltyPct ?? 6, franchisee: b.franchisee ?? null,
    })),
  })

  // ── Products (catalog + custom pizza placeholder) ──
  await tdb.product.createMany({
    data: [
      {
        id: "P-CUSTOM", name: "Custom Built Pizza", category: "pizza", price: 990, cost: 320,
        description: "Customer-built pizza via Pizza Builder", available: true,
        calories: 1000, prepTime: 14, station: "pizza", popular: false,
      },
      ...SEED_PRODUCTS.map((p) => ({
        id: p.id, name: p.name, category: p.category, price: p.price, cost: p.cost,
        description: p.description ?? null, available: p.available,
        calories: p.calories ?? null, prepTime: p.prepTime, station: p.station,
        popular: p.popular ?? false,
      })),
    ],
  })

  // ── Inventory per branch ──
  const inv = [
    { name: "Pizza Dough Flour", category: "raw", unit: "kg", qty: 120, min: 40, cost: 95 },
    { name: "Mozzarella Cheese", category: "raw", unit: "kg", qty: 28, min: 25, cost: 1450 },
    { name: "Chicken Breast", category: "raw", unit: "kg", qty: 65, min: 30, cost: 720 },
    { name: "Beef Mince", category: "raw", unit: "kg", qty: 22, min: 20, cost: 880 },
    { name: "Tomato Sauce", category: "semi_finished", unit: "L", qty: 40, min: 15, cost: 320 },
    { name: "Fresh Vegetables", category: "raw", unit: "kg", qty: 35, min: 15, cost: 180 },
    { name: "Cooking Oil", category: "raw", unit: "L", qty: 50, min: 20, cost: 540 },
    { name: "Cola Syrup", category: "raw", unit: "L", qty: 18, min: 10, cost: 410 },
    { name: "Pizza Box Large", category: "packaging", unit: "pcs", qty: 480, min: 200, cost: 35 },
    { name: "Burger Box", category: "packaging", unit: "pcs", qty: 950, min: 300, cost: 12 },
    { name: "Dough Balls (Prepped)", category: "semi_finished", unit: "pcs", qty: 60, min: 30, cost: 40 },
    { name: "Marinated Chicken", category: "semi_finished", unit: "kg", qty: 14, min: 12, cost: 760 },
  ]
  const invRows: any[] = []
  SEED_BRANCHES.forEach((b) => {
    inv.forEach((item, idx) => {
      const drift = 0.7 + Math.random() * 0.6
      invRows.push({
        id: `INV-${b.id}-${String(idx).padStart(2, "0")}`,
        branchId: b.id, name: item.name, category: item.category, unit: item.unit,
        quantity: Math.round(item.qty * drift * 10) / 10, minStock: item.min, cost: item.cost,
        batchNo: `B${Math.floor(1000 + Math.random() * 9000)}`,
        expiry: new Date(Date.now() + (5 + Math.floor(Math.random() * 20)) * 86400000),
      })
    })
  })
  await tdb.inventoryItem.createMany({ data: invRows })

  // ── Riders ──
  const riderNames = ["Usman Ali", "Kamran Shah", "Rizwan Ahmed", "Tariq Mehmood", "Imran Sheikh", "Naveed Iqbal", "Asif Raza", "Bilal Hussain"]
  const riderRows: any[] = []
  SEED_BRANCHES.forEach((b, bi) => {
    for (let i = 0; i < 4; i++) {
      const idx = bi * 4 + i
      riderRows.push({
        id: `R-${b.id}-${i + 1}`, name: riderNames[idx % riderNames.length],
        phone: `+92300${1000000 + idx * 137}`, vehicle: i % 4 === 0 ? "bicycle" : "motorbike",
        status: i === 0 ? "on_delivery" : "available",
        rating: Math.round((4.2 + Math.random() * 0.8) * 10) / 10,
        totalDeliveries: 120 + Math.floor(Math.random() * 800),
        earnings: Math.round(18000 + Math.random() * 42000), branchId: b.id,
      })
    }
  })
  await tdb.rider.createMany({ data: riderRows })

  // ── Employees ──
  const roles = [
    { role: "manager", salary: 180000 }, { role: "supervisor", salary: 95000 },
    { role: "cashier", salary: 55000 }, { role: "chef", salary: 78000 },
    { role: "chef", salary: 72000 }, { role: "cleaner", salary: 38000 },
  ]
  const empNames = ["Ahsan", "Sara", "Bilal", "Hina", "Faisal", "Nida", "Owais", "Mahnoor", "Rashid", "Kiran", "Tariq", "Sana"]
  const empRows: any[] = []
  SEED_BRANCHES.forEach((b, bi) => {
    roles.forEach((r, i) => {
      empRows.push({
        id: `E-${b.id}-${i + 1}`,
        name: empNames[(bi * 6 + i) % empNames.length] + " " + (["Khan", "Malik", "Raza", "Tariq", "Ahmed", "Yusuf"][i % 6]),
        role: r.role, branchId: b.id, salary: r.salary, status: "active",
        attendance: i === 5 ? "late" : "present",
        shift: i < 3 ? "morning" : i < 5 ? "evening" : "night",
      })
    })
  })
  await tdb.employee.createMany({ data: empRows })

  // ── Customers ──
  const customers = [
    { id: "C-001", name: "Hamza Sheikh", phone: "+923331234567", email: "hamza@mail.com", tier: "Platinum", points: 4250, spent: 184500, count: 47, bd: "12-Mar" },
    { id: "C-002", name: "Ayesha Khan", phone: "+923331111222", email: "ayesha@mail.com", tier: "Gold", points: 2100, spent: 96800, count: 28, bd: "02-Jul" },
    { id: "C-003", name: "Bilal Ahmed", phone: "+923009988776", tier: "Silver", points: 820, spent: 41200, count: 14, bd: "21-Nov" },
    { id: "C-004", name: "Mariam Iqbal", phone: "+923215554433", email: "mariam@mail.com", tier: "Gold", points: 1850, spent: 88400, count: 24, bd: "30-Jan" },
    { id: "C-005", name: "Usman Tariq", phone: "+923457776655", tier: "Bronze", points: 240, spent: 11800, count: 6, bd: "18-Sep" },
    { id: "C-006", name: "Fatima Noor", phone: "+923111223344", email: "fatima@mail.com", tier: "Platinum", points: 5100, spent: 221000, count: 58, bd: "02-Feb" },
  ]
  await tdb.customer.createMany({
    data: customers.map((c) => ({
      id: c.id, name: c.name, phone: c.phone, email: c.email ?? null,
      loyaltyPoints: c.points, tier: c.tier, totalSpent: c.spent, ordersCount: c.count,
      birthday: c.bd, lastOrderAt: new Date(Date.now() - Math.floor(Math.random() * 12) * 86400000),
    })),
  })

  // ── Users in tenant DB (for User Management module) ──
  const demoUsers = [
    { id: "U-OWNER", name: "Daniyal Khan", email: "demo.owner@fusionflow.dev", role: "owner", color: "var(--chart-5)", phone: "+923001111111" },
    { id: "U-ADMIN", name: "Ahsan Khan", email: "demo.admin@fusionflow.dev", role: "admin", color: "var(--chart-1)", phone: "+923002222222" },
    { id: "U-MGR", name: "Sara Malik", email: "demo.manager@fusionflow.dev", role: "manager", color: "var(--chart-3)", phone: "+923003333333" },
    { id: "U-CASH", name: "Bilal Raza", email: "demo.cashier@fusionflow.dev", role: "cashier", color: "var(--chart-2)", phone: "+923004444444" },
    { id: "U-CHEF", name: "Imran Sheikh", email: "demo.chef@fusionflow.dev", role: "chef", color: "var(--chart-4)", phone: "+923005555555" },
    { id: "U-RIDER", name: "Usman Ali", email: "demo.rider@fusionflow.dev", role: "rider", color: "var(--chart-3)", phone: "+923006666666" },
    { id: "U-VIEW", name: "Nida Yusuf", email: "demo.viewer@fusionflow.dev", role: "viewer", color: "var(--muted-foreground)", phone: "+923007777777" },
  ]
  await tdb.user.createMany({
    data: demoUsers.map((u) => ({
      id: u.id, name: u.name, email: u.email, password: "fusionflow123", role: u.role,
      branchId: ["U-MGR", "U-CASH", "U-CHEF", "U-RIDER"].includes(u.id) ? "BR-GUL" : null,
      active: true, avatarColor: u.color, phone: u.phone,
    })),
  })

  // ── Step 5: Create TenantUsers in master DB for auth ──
  // Wipe existing tenant users for this tenant
  await db.tenantUser.deleteMany({ where: { tenantId: tenant.id } })

  for (const u of demoUsers) {
    await db.tenantUser.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        password: "fusionflow123",
        name: u.name,
        role: u.role,
        tenantId: tenant.id,
        active: true,
        avatarColor: u.color,
        phone: u.phone,
      },
      update: {
        password: "fusionflow123",
        name: u.name,
        role: u.role,
        tenantId: tenant.id,
        active: true,
        avatarColor: u.color,
        phone: u.phone,
      },
    })
  }

  // ── Sample orders ──
  let orderNo = 1001
  const orderTypes = ["dine_in", "takeaway", "delivery", "drive_thru"] as const
  const payMethods = ["cash", "card", "wallet"] as const
  const activeStatuses = ["pending", "preparing", "preparing", "ready", "dispatched"]
  const orderRows: any[] = []
  const orderItemRows: any[] = []
  const now = Date.now()

  for (const b of SEED_BRANCHES) {
    if (!b.isOpen) continue
    // Active orders
    const activeCount = 3 + Math.floor(Math.random() * 4)
    for (let i = 0; i < activeCount; i++) {
      const product = SEED_PRODUCTS[Math.floor(Math.random() * 12)]
      const qty = 1 + Math.floor(Math.random() * 3)
      const sub = product.price * qty
      const tax = Math.round(sub * 0.13)
      const status = activeStatuses[Math.floor(Math.random() * activeStatuses.length)]
      const oid = `O-${b.id}-${orderNo}`
      orderRows.push({
        id: oid, number: orderNo, branchId: b.id,
        type: orderTypes[Math.floor(Math.random() * 4)], status, station: product.station,
        table: "T-" + (1 + Math.floor(Math.random() * 12)),
        customerName: customers[Math.floor(Math.random() * customers.length)].name,
        subtotal: sub, tax, total: sub + tax,
        paymentStatus: Math.random() > 0.4 ? "paid" : "unpaid",
        paymentMethod: payMethods[Math.floor(Math.random() * 3)],
        createdAt: new Date(now - Math.floor(Math.random() * 40) * 60000),
      })
      orderItemRows.push({
        id: `OI-${oid}-1`, orderId: oid, productId: product.id,
        name: product.name, quantity: qty, price: product.price,
      })
      orderNo++
    }
    // Delivered history
    const histCount = 28 + Math.floor(Math.random() * 20)
    for (let i = 0; i < histCount; i++) {
      const product = SEED_PRODUCTS[Math.floor(Math.random() * SEED_PRODUCTS.length)]
      const qty = 1 + Math.floor(Math.random() * 3)
      const sub = product.price * qty
      const tax = Math.round(sub * 0.13)
      const created = new Date(now - Math.floor(Math.random() * 24 * 3600000))
      const oid = `O-${b.id}-${orderNo}`
      orderRows.push({
        id: oid, number: orderNo, branchId: b.id,
        type: orderTypes[Math.floor(Math.random() * 4)], status: "delivered",
        station: product.station,
        customerName: customers[Math.floor(Math.random() * customers.length)].name,
        subtotal: sub, tax, total: sub + tax, paymentStatus: "paid",
        paymentMethod: payMethods[Math.floor(Math.random() * 3)], createdAt: created,
      })
      orderItemRows.push({
        id: `OI-${oid}-1`, orderId: oid, productId: product.id,
        name: product.name, quantity: qty, price: product.price,
      })
      orderNo++
    }
  }
  await tdb.order.createMany({ data: orderRows })
  await tdb.orderItem.createMany({ data: orderItemRows })

  // Disconnect tenant client
  await tdb.$disconnect()

  return NextResponse.json({
    ok: true,
    tenant: tenant.name,
    tenantId: tenant.id,
    tenantDb: DEFAULT_TENANT_DB,
    branches: SEED_BRANCHES.length,
    products: SEED_PRODUCTS.length + 1,
    users: demoUsers.length,
    orders: orderRows.length,
    message: "Multi-tenant database seeded successfully",
  })
}

export async function GET() {
  const tenantCount = await db.tenant.count()
  const userCount = await db.tenantUser.count()
  return NextResponse.json({
    tenants: tenantCount,
    tenantUsers: userCount,
    multiTenant: true,
    database: "neon-postgresql",
  })
}
