import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SEED_BRANCHES, SEED_PRODUCTS } from "@/lib/data"

// POST /api/seed — populate branches, products, inventory, riders, employees, customers, sample orders
export async function POST() {
  // Wipe (order matters for FK)
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.inventoryItem.deleteMany()
  await db.rider.deleteMany()
  await db.employee.deleteMany()
  await db.customer.deleteMany()
  await db.product.deleteMany()
  await db.branch.deleteMany()

  // Branches
  for (const b of SEED_BRANCHES) {
    await db.branch.create({
      data: {
        id: b.id,
        name: b.name,
        brand: b.brand,
        type: b.type,
        city: b.city,
        manager: b.manager ?? null,
        status: b.status,
        isOpen: b.isOpen,
        royaltyPct: b.royaltyPct ?? 6,
        franchisee: b.franchisee ?? null,
      },
    })
  }

  // Products
  for (const p of SEED_PRODUCTS) {
    await db.product.create({
      data: {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        cost: p.cost,
        description: p.description ?? null,
        available: p.available,
        calories: p.calories ?? null,
        prepTime: p.prepTime,
        station: p.station,
        popular: p.popular ?? false,
      },
    })
  }

  // Inventory per branch
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
  for (const b of SEED_BRANCHES) {
    for (let idx = 0; idx < inv.length; idx++) {
      const item = inv[idx]
      const drift = 0.7 + Math.random() * 0.6
      await db.inventoryItem.create({
        data: {
          id: `INV-${b.id}-${String(idx).padStart(2, "0")}`,
          branchId: b.id,
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: Math.round(item.qty * drift * 10) / 10,
          minStock: item.min,
          cost: item.cost,
          batchNo: `B${Math.floor(1000 + Math.random() * 9000)}`,
          expiry: new Date(Date.now() + (5 + Math.floor(Math.random() * 20)) * 86400000),
        },
      })
    }
  }

  // Riders
  const riderNames = ["Usman Ali", "Kamran Shah", "Rizwan Ahmed", "Tariq Mehmood", "Imran Sheikh", "Naveed Iqbal", "Asif Raza", "Bilal Hussain"]
  for (const b of SEED_BRANCHES) {
    for (let i = 0; i < 4; i++) {
      const idx = SEED_BRANCHES.indexOf(b) * 4 + i
      await db.rider.create({
        data: {
          id: `R-${b.id}-${i + 1}`,
          name: riderNames[idx % riderNames.length],
          phone: `+92300${1000000 + idx * 137}`,
          vehicle: i % 4 === 0 ? "bicycle" : "motorbike",
          status: i === 0 ? "on_delivery" : "available",
          rating: Math.round((4.2 + Math.random() * 0.8) * 10) / 10,
          totalDeliveries: 120 + Math.floor(Math.random() * 800),
          earnings: Math.round(18000 + Math.random() * 42000),
          branchId: b.id,
        },
      })
    }
  }

  // Employees
  const roles = [
    { role: "manager", salary: 180000 },
    { role: "supervisor", salary: 95000 },
    { role: "cashier", salary: 55000 },
    { role: "chef", salary: 78000 },
    { role: "chef", salary: 72000 },
    { role: "cleaner", salary: 38000 },
  ]
  const empNames = ["Ahsan", "Sara", "Bilal", "Hina", "Faisal", "Nida", "Owais", "Mahnoor", "Rashid", "Kiran", "Tariq", "Sana"]
  for (const b of SEED_BRANCHES) {
    for (let i = 0; i < roles.length; i++) {
      await db.employee.create({
        data: {
          id: `E-${b.id}-${i + 1}`,
          name: empNames[(SEED_BRANCHES.indexOf(b) * 6 + i) % empNames.length] + " " + (["Khan", "Malik", "Raza", "Tariq", "Ahmed", "Yusuf"][i % 6]),
          role: roles[i].role,
          branchId: b.id,
          salary: roles[i].salary,
          status: "active",
          attendance: i === 5 ? "late" : "present",
          shift: i < 3 ? "morning" : i < 5 ? "evening" : "night",
        },
      })
    }
  }

  // Customers
  const customers = [
    { id: "C-001", name: "Hamza Sheikh", phone: "+923331234567", email: "hamza@mail.com", tier: "Platinum", points: 4250, spent: 184500, count: 47, bd: "12-Mar" },
    { id: "C-002", name: "Ayesha Khan", phone: "+923331111222", email: "ayesha@mail.com", tier: "Gold", points: 2100, spent: 96800, count: 28, bd: "02-Jul" },
    { id: "C-003", name: "Bilal Ahmed", phone: "+923009988776", tier: "Silver", points: 820, spent: 41200, count: 14, bd: "21-Nov" },
    { id: "C-004", name: "Mariam Iqbal", phone: "+923215554433", email: "mariam@mail.com", tier: "Gold", points: 1850, spent: 88400, count: 24, bd: "30-Jan" },
    { id: "C-005", name: "Usman Tariq", phone: "+923457776655", tier: "Bronze", points: 240, spent: 11800, count: 6, bd: "18-Sep" },
    { id: "C-006", name: "Fatima Noor", phone: "+923111223344", email: "fatima@mail.com", tier: "Platinum", points: 5100, spent: 221000, count: 58, bd: "02-Feb" },
  ]
  for (const c of customers) {
    await db.customer.create({
      data: {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email ?? null,
        loyaltyPoints: c.points,
        tier: c.tier,
        totalSpent: c.spent,
        ordersCount: c.count,
        birthday: c.bd,
        lastOrderAt: new Date(Date.now() - Math.floor(Math.random() * 12) * 86400000),
      },
    })
  }

  // Sample orders: active ones + last 24h history
  let orderNo = 1001
  const activeStatuses = ["pending", "preparing", "preparing", "ready", "dispatched"]
  const orderTypes = ["dine_in", "takeaway", "delivery", "drive_thru"] as const
  const payMethods = ["cash", "card", "wallet"] as const
  for (const b of SEED_BRANCHES) {
    if (!b.isOpen) continue
    const activeCount = 3 + Math.floor(Math.random() * 4)
    for (let i = 0; i < activeCount; i++) {
      const product = SEED_PRODUCTS[Math.floor(Math.random() * 12)]
      const qty = 1 + Math.floor(Math.random() * 3)
      const sub = product.price * qty
      const tax = Math.round(sub * 0.13)
      const status = activeStatuses[Math.floor(Math.random() * activeStatuses.length)]
      const order = await db.order.create({
        data: {
          id: `O-${b.id}-${orderNo}`,
          number: orderNo,
          branchId: b.id,
          type: orderTypes[Math.floor(Math.random() * 4)],
          status,
          station: product.station,
          table: "T-" + (1 + Math.floor(Math.random() * 12)),
          customerName: customers[Math.floor(Math.random() * customers.length)].name,
          subtotal: sub,
          tax,
          total: sub + tax,
          paymentStatus: Math.random() > 0.4 ? "paid" : "unpaid",
          paymentMethod: payMethods[Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 40) * 60000),
        },
      })
      await db.orderItem.create({
        data: {
          id: `OI-${order.id}-1`,
          orderId: order.id,
          productId: product.id,
          name: product.name,
          quantity: qty,
          price: product.price,
        },
      })
      orderNo++
    }
    const histCount = 28 + Math.floor(Math.random() * 20)
    for (let i = 0; i < histCount; i++) {
      const product = SEED_PRODUCTS[Math.floor(Math.random() * SEED_PRODUCTS.length)]
      const qty = 1 + Math.floor(Math.random() * 3)
      const sub = product.price * qty
      const tax = Math.round(sub * 0.13)
      const created = new Date(Date.now() - Math.floor(Math.random() * 24 * 3600000))
      const order = await db.order.create({
        data: {
          id: `O-${b.id}-${orderNo}`,
          number: orderNo,
          branchId: b.id,
          type: orderTypes[Math.floor(Math.random() * 4)],
          status: "delivered",
          station: product.station,
          customerName: customers[Math.floor(Math.random() * customers.length)].name,
          subtotal: sub,
          tax,
          total: sub + tax,
          paymentStatus: "paid",
          paymentMethod: payMethods[Math.floor(Math.random() * 3)],
          createdAt: created,
        },
      })
      await db.orderItem.create({
        data: {
          id: `OI-${order.id}-1`,
          orderId: order.id,
          productId: product.id,
          name: product.name,
          quantity: qty,
          price: product.price,
        },
      })
      orderNo++
    }
  }

  return NextResponse.json({
    ok: true,
    branches: SEED_BRANCHES.length,
    products: SEED_PRODUCTS.length,
    message: "Database seeded successfully",
  })
}

export async function GET() {
  const counts = {
    branches: await db.branch.count(),
    products: await db.product.count(),
    orders: await db.order.count(),
    customers: await db.customer.count(),
    riders: await db.rider.count(),
    inventory: await db.inventoryItem.count(),
    employees: await db.employee.count(),
  }
  return NextResponse.json(counts)
}
