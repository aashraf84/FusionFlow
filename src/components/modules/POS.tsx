"use client"

import { useMemo, useState } from "react"
import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { formatPKR, STATIONS } from "@/lib/data"
import {
  Pizza,
  Soup,
  Drumstick,
  Sandwich,
  GlassWater,
  CakeSlice,
  Package,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Wallet,
  Banknote,
  ScanLine,
  ClipboardList,
  Users,
  Bike,
  Car,
  Store,
  X,
  CheckCircle2,
  Receipt,
  Printer,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"

interface MenuProduct {
  id: string
  name: string
  category: string
  price: number
  cost: number
  description?: string
  calories?: number
  prepTime: number
  station: string
  popular?: boolean
  available: boolean
}

const CATEGORY_ICONS: Record<string, typeof Pizza> = {
  pizza: Pizza,
  burger: Sandwich,
  chicken: Drumstick,
  sides: Soup,
  drinks: GlassWater,
  desserts: CakeSlice,
  combos: Package,
}

const ORDER_TYPES = [
  { id: "dine_in", label: "Dine-In", icon: Store },
  { id: "takeaway", label: "Takeaway", icon: Package },
  { id: "delivery", label: "Delivery", icon: Bike },
  { id: "drive_thru", label: "Drive-Thru", icon: Car },
] as const

export function POS() {
  const { data: menuData, loading } = useFetch<{ products: MenuProduct[]; categories: string[] }>("/api/menu", {})
  const products = menuData?.products ?? []
  const categories = menuData?.categories ?? []

  const [activeCat, setActiveCat] = useState<string>("")
  const [search, setSearch] = useState("")
  const cart = useAppStore((s) => s.cart)
  const addToCart = useAppStore((s) => s.addToCart)
  const updateCartQty = useAppStore((s) => s.updateCartQty)
  const removeFromCart = useAppStore((s) => s.removeFromCart)
  const clearCart = useAppStore((s) => s.clearCart)
  const orderType = useAppStore((s) => s.orderType)
  const setOrderType = useAppStore((s) => s.setOrderType)
  const tableNo = useAppStore((s) => s.tableNo)
  const setTableNo = useAppStore((s) => s.setTableNo)
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  const [payOpen, setPayOpen] = useState(false)
  const [payMethod, setPayMethod] = useState<string>("cash")
  const [placing, setPlacing] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null)

  const effectiveCat = activeCat || categories[0] || "pizza"

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!p.available) return false
      if (search) return p.name.toLowerCase().includes(search.toLowerCase())
      return p.category === effectiveCat
    })
  }, [products, effectiveCat, search])

  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0)
  const tax = Math.round(subtotal * 0.13)
  const total = subtotal + tax

  const placeOrder = async () => {
    if (!cart.length) return
    const branchId = activeBranchId === "__ALL__" ? "BR-GUL" : activeBranchId
    setPlacing(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          type: orderType,
          table: orderType === "dine_in" ? tableNo : undefined,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          items: cart.map((l) => ({
            productId: l.productId,
            name: l.name,
            price: l.price,
            quantity: l.quantity,
            customizations: l.customizations,
          })),
          paymentMethod: payMethod,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      toast.success(`Order #${json.order.number} placed!`, {
        description: `${cart.length} items · ${formatPKR(total)} · sent to kitchen`,
        action: { label: "Print Invoice", onClick: () => setInvoiceOrder({ ...json.order, items: cart, branchName: "Gulberg III Flagship" }) },
      })
      setInvoiceOrder({ ...json.order, items: cart.map(l => ({ name: l.name, quantity: l.quantity, price: l.price, customizations: l.customizations })), branchName: "Gulberg III Flagship" })
      clearCart()
      setPayOpen(false)
      setCustomerName("")
      setCustomerPhone("")
    } catch (e) {
      toast.error("Could not place order", { description: e instanceof Error ? e.message : "" })
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 h-[calc(100vh-9rem)]">
      {/* LEFT — menu */}
      <div className="flex flex-col min-h-0 rounded-xl border bg-card overflow-hidden">
        {/* Order type + search */}
        <div className="border-b p-3 space-y-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {ORDER_TYPES.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setOrderType(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all pf-tile",
                    orderType === t.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              )
            })}
            {orderType === "dine_in" && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <Input value={tableNo} onChange={(e) => setTableNo(e.target.value)} className="h-9 w-20 text-xs font-semibold" placeholder="T-5" />
              </div>
            )}
            <Button variant="outline" size="sm" className="h-9 ml-auto sm:ml-0" onClick={() => toast.info("Barcode scanner ready")}>
              <ScanLine className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="h-10 pl-9" />
            <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pf-scroll pb-1">
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c] ?? Package
              return (
                <button
                  key={c}
                  onClick={() => { setActiveCat(c); setSearch("") }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                    effectiveCat === c && !search ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> <span className="capitalize">{c}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Product grid */}
        <ScrollArea className="flex-1">
          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-muted/40 animate-pulse" />
            ))}
            <AnimatePresence>
              {filtered.map((p) => {
                const Icon = CATEGORY_ICONS[p.category] ?? Package
                return (
                  <motion.button
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => addToCart({ productId: p.id, name: p.name, price: p.price, quantity: 1, station: p.station })}
                    className="pf-tile group relative text-left rounded-xl border bg-card overflow-hidden hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-chart-2/10 grid place-items-center relative">
                      <Icon className="h-9 w-9 text-primary/70 group-hover:scale-110 transition-transform" />
                      {p.popular && (
                        <Badge className="absolute top-1.5 left-1.5 h-5 text-[9px] bg-chart-2 text-black">POPULAR</Badge>
                      )}
                      <div className="absolute top-1.5 right-1.5 grid place-items-center h-7 w-7 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="p-2.5">
                      <div className="font-semibold text-[13px] leading-tight line-clamp-2 min-h-[34px]">{p.name}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="font-extrabold text-primary text-sm">{formatPKR(p.price)}</span>
                        <span className="text-[10px] text-muted-foreground">{p.prepTime}m</span>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* RIGHT — cart */}
      <div className="flex flex-col min-h-0 rounded-xl border bg-card overflow-hidden">
        <div className="border-b p-3 flex items-center justify-between shrink-0">
          <div>
            <div className="font-bold text-sm">Current Order</div>
            <div className="text-[11px] text-muted-foreground capitalize">{orderType.replace("_", "-")}{orderType === "dine_in" ? ` · ${tableNo}` : ""}</div>
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive" onClick={clearCart}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1.5">
            {cart.length === 0 && (
              <div className="h-full grid place-items-center py-16 text-center">
                <div>
                  <ClipboardList className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                  <div className="text-sm font-medium text-muted-foreground">Cart is empty</div>
                  <div className="text-[11px] text-muted-foreground/70">Tap products to add</div>
                </div>
              </div>
            )}
            <AnimatePresence>
              {cart.map((l, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="rounded-lg border p-2.5"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm leading-tight">{l.name}</div>
                      {l.customizations && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{l.customizations}</div>
                      )}
                      <div className="text-xs font-bold text-primary mt-1">{formatPKR(l.price)}</div>
                    </div>
                    <button onClick={() => removeFromCart(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateCartQty(i, l.quantity - 1)} className="grid place-items-center h-7 w-7 rounded-md bg-muted hover:bg-muted/70">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{l.quantity}</span>
                      <button onClick={() => updateCartQty(i, l.quantity + 1)} className="grid place-items-center h-7 w-7 rounded-md bg-muted hover:bg-muted/70">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-bold text-sm">{formatPKR(l.price * l.quantity)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Totals + checkout */}
        <div className="border-t p-3 space-y-2 shrink-0 bg-muted/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatPKR(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tax (13% GST)</span>
            <span className="font-semibold">{formatPKR(tax)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t">
            <span className="font-bold">Total</span>
            <span className="font-extrabold text-lg text-primary">{formatPKR(total)}</span>
          </div>
          <Button className="w-full h-11 font-bold" disabled={!cart.length || placing} onClick={() => setPayOpen(true)}>
            <CreditCard className="h-4 w-4 mr-2" /> Charge {formatPKR(total)}
          </Button>
          <Button variant="outline" className="w-full h-9 text-xs" onClick={() => setActiveModule("pizza-builder")}>
            <Pizza className="h-3.5 w-3.5 mr-1.5" /> Build a Custom Pizza
          </Button>
        </div>
      </div>

      {/* Payment dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Take Payment</DialogTitle>
            <DialogDescription className="sr-only">Process payment for the current order and send it to the kitchen.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-4 text-center">
              <div className="text-[11px] text-muted-foreground uppercase font-semibold">Amount Due</div>
              <div className="text-3xl font-extrabold text-primary mt-1">{formatPKR(total)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{cart.length} items · {orderType.replace("_", "-")}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "cash", label: "Cash", icon: Banknote },
                { id: "card", label: "Card", icon: CreditCard },
                { id: "wallet", label: "Wallet", icon: Wallet },
                { id: "mixed", label: "Mixed", icon: Users },
              ].map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    onClick={() => setPayMethod(m.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all",
                      payMethod === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-semibold">{m.label}</span>
                  </button>
                )
              })}
            </div>
            {(orderType === "delivery" || orderType === "takeaway") && (
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-9" />
                <Input placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="h-9" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button onClick={placeOrder} disabled={placing} className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> {placing ? "Placing…" : "Confirm & Send to Kitchen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice print dialog */}
      <Dialog open={!!invoiceOrder} onOpenChange={(o) => !o && setInvoiceOrder(null)}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto pf-scroll">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Invoice #{invoiceOrder?.number}</DialogTitle>
            <DialogDescription>Order placed successfully. Print or save this invoice.</DialogDescription>
          </DialogHeader>
          {invoiceOrder && <PosInvoice order={invoiceOrder} />}
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setInvoiceOrder(null)}>Close</Button>
            <Button onClick={() => { window.print(); toast.success("Invoice sent to printer") }}>
              <Printer className="h-4 w-4 mr-1.5" /> Print Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── POS Invoice component (professional A4 receipt layout) ──
function PosInvoice({ order }: { order: any }) {
  const dateStr = new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })
  const timeStr = new Date(order.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="bg-white text-black rounded-lg border-2 border-gray-200 p-6 print:border-0 print:p-0">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-12 w-12 rounded-xl text-white font-extrabold text-lg" style={{ background: "linear-gradient(135deg, oklch(0.62 0.2 28), oklch(0.66 0.15 145))" }}>FF</div>
          <div>
            <div className="text-xl font-extrabold">FusionFlow Restaurant</div>
            <div className="text-[11px] text-gray-500">{order.branchName ?? "Gulberg III Flagship"}, Lahore</div>
            <div className="text-[10px] text-gray-500">NTN: 1234567-8 · STRN: 3217654-0987654-1</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-extrabold">TAX INVOICE</div>
          <div className="text-[11px] text-gray-500">Original for Recipient</div>
        </div>
      </div>

      {/* Invoice meta */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div>
          <div className="text-[9px] uppercase font-bold text-gray-400">Invoice #</div>
          <div className="font-bold">INV-{order.number}</div>
          <div className="text-[9px] uppercase font-bold text-gray-400 mt-1.5">Date / Time</div>
          <div className="font-semibold">{dateStr} · {timeStr}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase font-bold text-gray-400">Bill To</div>
          <div className="font-bold">{order.customerName || "Walk-in Customer"}</div>
          {order.customerPhone && <div className="text-gray-600">{order.customerPhone}</div>}
          <div className="text-[9px] uppercase font-bold text-gray-400 mt-1.5">Order Type</div>
          <div className="font-semibold capitalize">{order.type.replace("_", " ")}{order.table ? ` · ${order.table}` : ""}</div>
        </div>
      </div>

      {/* Items table */}
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-2 border-black bg-gray-100">
            <th className="text-center py-1.5 px-1 font-bold w-8">#</th>
            <th className="text-left py-1.5 px-2 font-bold">Item</th>
            <th className="text-center py-1.5 px-1 font-bold w-12">Qty</th>
            <th className="text-right py-1.5 px-2 font-bold w-20">Rate</th>
            <th className="text-right py-1.5 px-2 font-bold w-24">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item: any, i: number) => (
            <tr key={i} className="border-b border-gray-300">
              <td className="py-1.5 px-1 text-center text-gray-500">{i + 1}</td>
              <td className="py-1.5 px-2">
                <div className="font-semibold">{item.name}</div>
                {item.customizations && <div className="text-[10px] text-gray-500">{item.customizations}</div>}
              </td>
              <td className="py-1.5 px-1 text-center font-semibold">{item.quantity}</td>
              <td className="py-1.5 px-2 text-right">{formatPKR(item.price)}</td>
              <td className="py-1.5 px-2 text-right font-semibold">{formatPKR(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mt-3">
        <div className="w-56 text-xs space-y-0.5">
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">{formatPKR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-600">GST (13%)</span>
            <span className="font-semibold">{formatPKR(order.tax)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-600">Discount</span>
              <span className="font-semibold text-red-600">-{formatPKR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t-2 border-black text-base font-extrabold">
            <span>TOTAL</span>
            <span>{formatPKR(order.total)}</span>
          </div>
          <div className="text-[10px] text-gray-500 pt-1">
            Payment: <span className="capitalize font-semibold">{order.paymentMethod ?? "Cash"}</span> · Status: <span className="font-semibold capitalize">{order.paymentStatus}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3 border-t-2 border-gray-200 text-center text-[10px] text-gray-500">
        <div className="font-bold text-gray-700">Thank you for dining with FusionFlow!</div>
        <div>Computer-generated invoice — no signature required.</div>
        <div>For queries: info@fusionflow.dev · +92 300 0000000</div>
      </div>
    </div>
  )
}
