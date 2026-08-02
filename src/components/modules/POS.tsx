"use client"

import { tenantFetch } from "@/lib/tenant-fetch"

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
  MessageCircle,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  const [cartSheetOpen, setCartSheetOpen] = useState(false)

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
      const res = await tenantFetch("/api/orders", {
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
      setInvoiceOrder({ ...json.order, items: cart.map(l => ({ name: l.name, quantity: l.quantity, price: l.price, customizations: l.customizations })), branchName: "Gulberg III Flagship", customerName, customerPhone })
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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3 xl:gap-4 h-[calc(100vh-9rem)] xl:h-[calc(100vh-9rem)]">
      {/* LEFT — menu (full width on mobile) */}
      <div className="flex flex-col min-h-0 rounded-xl border bg-card overflow-hidden">
        {/* Order type + search */}
        <div className="border-b p-2.5 sm:p-3 space-y-2.5 shrink-0">
          {/* Order types — scrollable on mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto pf-scroll pb-0.5">
            {ORDER_TYPES.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setOrderType(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all pf-tile whitespace-nowrap shrink-0",
                    orderType === t.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              )
            })}
            {orderType === "dine_in" && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Input value={tableNo} onChange={(e) => setTableNo(e.target.value)} className="h-9 w-20 text-xs font-semibold" placeholder="T-5" />
              </div>
            )}
          </div>
          <div className="relative">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="h-10 pl-9" />
            <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {/* Category pills — sticky horizontal scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pf-scroll pb-1 -mx-0.5 px-0.5">
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c] ?? Package
              return (
                <button
                  key={c}
                  onClick={() => { setActiveCat(c); setSearch("") }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                    effectiveCat === c && !search ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> <span className="capitalize">{c}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Product grid — 2 cols on mobile, more on larger */}
        <ScrollArea className="flex-1">
          <div className="p-2.5 sm:p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 sm:h-36 rounded-xl bg-muted/40 animate-pulse" />
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
                    className="pf-tile group relative text-left rounded-xl border bg-card overflow-hidden hover:border-primary hover:shadow-md transition-all active:scale-95"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-chart-2/10 grid place-items-center relative">
                      <Icon className="h-8 w-8 sm:h-9 sm:w-9 text-primary/70 group-hover:scale-110 transition-transform" />
                      {p.popular && (
                        <Badge className="absolute top-1.5 left-1.5 h-5 text-[9px] bg-chart-2 text-black">POPULAR</Badge>
                      )}
                      <div className="absolute top-1.5 right-1.5 grid place-items-center h-7 w-7 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="p-2 sm:p-2.5">
                      <div className="font-semibold text-[12px] sm:text-[13px] leading-tight line-clamp-2 min-h-[32px] sm:min-h-[34px]">{p.name}</div>
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

      {/* RIGHT — cart (desktop sidebar, mobile bottom sheet) */}
      {/* Desktop cart panel */}
      <div className="hidden xl:flex flex-col min-h-0 rounded-xl border bg-card overflow-hidden">
        <CartPanel
          cart={cart} orderType={orderType} tableNo={tableNo}
          subtotal={subtotal} tax={tax} total={total}
          onUpdateQty={updateCartQty} onRemove={removeFromCart} onClear={clearCart}
          onCheckout={() => setPayOpen(true)} onBuildPizza={() => setActiveModule("pizza-builder")}
          placing={placing}
        />
      </div>

      {/* Mobile floating cart bar */}
      {cart.length > 0 && (
        <div className="xl:hidden fixed bottom-16 left-3 right-3 z-20">
          <button
            onClick={() => setCartSheetOpen(true)}
            className="w-full flex items-center gap-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 px-4 py-3 active:scale-[0.98] transition-transform"
          >
            <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary-foreground/20 font-bold text-sm shrink-0">
              {cart.reduce((s, l) => s + l.quantity, 0)}
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs font-semibold">View Cart</div>
              <div className="text-[10px] opacity-80">{cart.length} items</div>
            </div>
            <div className="font-extrabold">{formatPKR(total)}</div>
            <CreditCard className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Mobile cart bottom sheet */}
      <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-2 border-b shrink-0">
            <SheetTitle className="flex items-center justify-between text-sm">
              <span>Current Order · {cart.length} items</span>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-[11px] font-semibold text-destructive">Clear All</button>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto pf-scroll">
            <CartPanel
              cart={cart} orderType={orderType} tableNo={tableNo}
              subtotal={subtotal} tax={tax} total={total}
              onUpdateQty={updateCartQty} onRemove={removeFromCart} onClear={clearCart}
              onCheckout={() => { setCartSheetOpen(false); setPayOpen(true) }}
              onBuildPizza={() => { setCartSheetOpen(false); setActiveModule("pizza-builder") }}
              placing={placing}
              noBorder
            />
          </div>
        </SheetContent>
      </Sheet>

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
        <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto pf-scroll p-0">
          <DialogHeader className="px-4 pt-4 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2 text-sm"><Receipt className="h-4 w-4 text-primary" /> Receipt #{invoiceOrder?.number}</DialogTitle>
            <DialogDescription className="text-xs">80mm thermal receipt · ready to print</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pf-scroll">
            {invoiceOrder && <PosInvoice order={invoiceOrder} />}
          </div>
          <DialogFooter className="px-4 py-3 border-t gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setInvoiceOrder(null)} className="h-9">Close</Button>
            <Button
              variant="outline"
              onClick={() => sendWhatsAppReceipt(invoiceOrder)}
              className="h-9 text-chart-3 border-chart-3/30 hover:bg-chart-3/10"
              title="Send receipt to customer via WhatsApp"
            >
              <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp
            </Button>
            <Button onClick={() => printReceipt(invoiceOrder)} className="h-9">
              <Printer className="h-4 w-4 mr-1.5" /> Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Cart panel (shared between desktop sidebar and mobile sheet) ──
function CartPanel({
  cart, orderType, tableNo, subtotal, tax, total,
  onUpdateQty, onRemove, onClear, onCheckout, onBuildPizza, placing, noBorder,
}: {
  cart: any[]
  orderType: string
  tableNo: string
  subtotal: number
  tax: number
  total: number
  onUpdateQty: (i: number, qty: number) => void
  onRemove: (i: number) => void
  onClear: () => void
  onCheckout: () => void
  onBuildPizza: () => void
  placing: boolean
  noBorder?: boolean
}) {
  return (
    <div className={cn("flex flex-col h-full bg-card", !noBorder && "overflow-hidden")}>
      {!noBorder && (
        <div className="border-b p-3 flex items-center justify-between shrink-0">
          <div>
            <div className="font-bold text-sm">Current Order</div>
            <div className="text-[11px] text-muted-foreground capitalize">{orderType.replace("_", "-")}{orderType === "dine_in" ? ` · ${tableNo}` : ""}</div>
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive" onClick={onClear}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          )}
        </div>
      )}
      <div className={cn("flex-1 overflow-y-auto pf-scroll", noBorder && "p-3")}>
        <div className={cn("space-y-1.5", !noBorder && "p-2")}>
          {cart.length === 0 && (
            <div className="grid place-items-center py-16 text-center">
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
                className="rounded-lg border p-2.5 bg-background"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm leading-tight">{l.name}</div>
                    {l.customizations && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{l.customizations}</div>
                    )}
                    <div className="text-xs font-bold text-primary mt-1">{formatPKR(l.price)}</div>
                  </div>
                  <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive shrink-0 p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onUpdateQty(i, l.quantity - 1)} className="grid place-items-center h-8 w-8 rounded-md bg-muted hover:bg-muted/70 active:scale-90 transition-transform">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{l.quantity}</span>
                    <button onClick={() => onUpdateQty(i, l.quantity + 1)} className="grid place-items-center h-8 w-8 rounded-md bg-muted hover:bg-muted/70 active:scale-90 transition-transform">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-sm">{formatPKR(l.price * l.quantity)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

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
        <Button className="w-full h-12 font-bold text-sm" disabled={!cart.length || placing} onClick={onCheckout}>
          <CreditCard className="h-4 w-4 mr-2" /> Charge {formatPKR(total)}
        </Button>
        <Button variant="outline" className="w-full h-9 text-xs" onClick={onBuildPizza}>
          <Pizza className="h-3.5 w-3.5 mr-1.5" /> Build a Custom Pizza
        </Button>
      </div>
    </div>
  )
}

// ── Print receipt in a new window (avoids dialog/portal print issues) ──
// ── Send receipt via WhatsApp to customer ──
function sendWhatsAppReceipt(order: any) {
  const items = order.items ?? []
  const dateStr = new Date(order.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })
  const timeStr = new Date(order.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })

  const itemsText = items.map((item: any) =>
    `• ${item.name} ×${item.quantity} = ${formatPKR(item.price * item.quantity)}`
  ).join("\n")

  const message = `🧾 *FusionFlow Receipt*\n` +
    `Invoice: INV-${order.number}\n` +
    `Date: ${dateStr} ${timeStr}\n` +
    `Type: ${order.type.replace("_", " ").toUpperCase()}\n` +
    (order.table ? `Table: ${order.table}\n` : "") +
    `\n*Items:*\n${itemsText}\n\n` +
    `Subtotal: ${formatPKR(order.subtotal)}\n` +
    `GST (13%): ${formatPKR(order.tax)}\n` +
    (order.discount > 0 ? `Discount: -${formatPKR(order.discount)}\n` : "") +
    `*TOTAL: ${formatPKR(order.total)}*\n\n` +
    `Payment: ${(order.paymentMethod ?? "Cash").toUpperCase()}\n` +
    `Thank you for dining with us! 🍕\n` +
    `www.fusionflow.dev`

  // Clean phone number for WhatsApp (remove + and spaces, ensure country code)
  let phone = order.customerPhone?.replace(/[^\d]/g, "") ?? ""
  if (phone && !phone.startsWith("92")) {
    phone = phone.replace(/^0/, "92")
  }

  if (!phone) {
    toast.error("No customer phone number", { description: "Add a phone number to send WhatsApp receipt" })
    return
  }

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  window.open(url, "_blank")
  toast.success("WhatsApp receipt opened", { description: `Sending to ${order.customerPhone}` })
}

function printReceipt(order: any) {
  const dateStr = new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })
  const timeStr = new Date(order.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
  const items = order.items ?? []

  const itemsHtml = items.map((item: any) => `
    <div class="item">
      <div class="item-name">${item.name}</div>
      ${item.customizations ? `<div class="item-sub">${item.customizations}</div>` : ""}
      <div class="item-row">
        <span class="item-rate">${formatPKR(item.price)} x${item.quantity}</span>
        <span class="item-amt">${formatPKR(item.price * item.quantity)}</span>
      </div>
    </div>
  `).join("")

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Receipt #${order.number}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 80mm; font-family: 'Courier New', 'Liberation Mono', monospace; font-size: 11px; line-height: 1.4; color: #000; background: #fff; padding: 4px; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .xl { font-size: 18px; }
  .lg { font-size: 13px; letter-spacing: 0.1em; }
  .md { font-size: 12px; }
  .sm { font-size: 10px; }
  .xs { font-size: 9px; }
  .xxs { font-size: 8px; }
  .gray { color: #555; }
  .divider { border-top: 1px dashed #000; margin: 4px 0; }
  .row { display: flex; justify-content: space-between; }
  .item { padding: 2px 0; }
  .item-name { font-weight: bold; }
  .item-sub { font-size: 8px; color: #555; }
  .item-row { display: flex; justify-content: space-between; font-size: 9px; }
  .item-amt { font-weight: bold; width: 60px; text-align: right; }
  .total-line { border-top: 1px solid #000; margin-top: 2px; padding-top: 2px; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
  .barcode { display: flex; justify-content: center; gap: 1px; height: 24px; margin-top: 8px; }
  .barcode div { background: #000; height: 100%; }
  .pad { padding: 0 8px; }
  .mt2 { margin-top: 8px; }
</style></head>
<body>
  <div class="center pad">
    <div class="bold xl">FusionFlow</div>
    <div class="bold md">Restaurant & Pizza</div>
    <div class="sm">${order.branchName ?? "Gulberg III Flagship"}</div>
    <div class="sm">Lahore, Pakistan</div>
    <div class="sm">+92 300 0000000</div>
    <div class="xs">NTN: 1234567-8</div>
    <div class="xs">STRN: 3217654-0987654-1</div>
  </div>
  <div class="divider"></div>
  <div class="center bold lg">TAX INVOICE</div>
  <div class="divider"></div>
  <div class="pad sm">
    <div class="row"><span>Invoice #:</span><span class="bold">INV-${order.number}</span></div>
    <div class="row"><span>Date:</span><span class="bold">${dateStr}</span></div>
    <div class="row"><span>Time:</span><span class="bold">${timeStr}</span></div>
    <div class="row"><span>Type:</span><span class="bold">${order.type.replace("_", " ").toUpperCase()}</span></div>
    ${order.table ? `<div class="row"><span>Table:</span><span class="bold">${order.table}</span></div>` : ""}
    <div class="row"><span>Customer:</span><span class="bold">${order.customerName || "Walk-in"}</span></div>
    ${order.customerPhone ? `<div class="row"><span>Phone:</span><span class="bold">${order.customerPhone}</span></div>` : ""}
    <div class="row"><span>Cashier:</span><span class="bold">AK</span></div>
  </div>
  <div class="divider"></div>
  <div class="pad sm bold">
    <div class="row"><span>ITEM</span><span style="width:32px;text-align:center;">QTY</span><span style="width:60px;text-align:right;">AMOUNT</span></div>
  </div>
  <div style="border-top:1px dashed #000;margin:2px 0;"></div>
  <div class="pad sm">${itemsHtml}</div>
  <div class="divider"></div>
  <div class="pad sm">
    <div class="row"><span>Subtotal:</span><span class="bold">${formatPKR(order.subtotal)}</span></div>
    <div class="row"><span>GST (13%):</span><span class="bold">${formatPKR(order.tax)}</span></div>
    ${order.discount > 0 ? `<div class="row"><span>Discount:</span><span class="bold">-${formatPKR(order.discount)}</span></div>` : ""}
  </div>
  <div class="pad total-line">
    <span>TOTAL</span><span>${formatPKR(order.total)}</span>
  </div>
  <div class="divider"></div>
  <div class="pad sm">
    <div class="row"><span>Payment:</span><span class="bold">${(order.paymentMethod ?? "Cash").toUpperCase()}</span></div>
    <div class="row"><span>Status:</span><span class="bold">${(order.paymentStatus ?? "paid").toUpperCase()}</span></div>
    <div class="row"><span>Items:</span><span class="bold">${items.length}</span></div>
  </div>
  <div class="divider"></div>
  <div class="center pad xxs">
    <div class="bold sm">Thank you for dining with us!</div>
    <div class="mt2">Please come again</div>
    <div class="mt2">www.fusionflow.dev</div>
    <div class="mt2">This is a computer-generated receipt.<br>No signature required.</div>
    <div class="barcode">
      ${Array.from({ length: 40 }).map((_, i) => `<div style="width:${(i * 7) % 3 === 0 ? "2px" : "1px"};"></div>`).join("")}
    </div>
    <div class="mt2">*${order.number}*</div>
  </div>
  <script>
    window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
  </script>
</body></html>`

  const printWindow = window.open("", "_blank", "width=400,height=600")
  if (!printWindow) {
    toast.error("Pop-up blocked. Please allow pop-ups to print receipts.")
    return
  }
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  toast.success("Receipt sent to printer")
}

// ── POS Receipt component (80mm thermal printer compatible) ──
function PosInvoice({ order }: { order: any }) {
  const dateStr = new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })
  const timeStr = new Date(order.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
  const itemRows = order.items ?? []

  return (
    <div className="receipt-80mm bg-white text-black mx-auto" style={{ width: "80mm", fontFamily: "'Courier New', 'Liberation Mono', monospace", fontSize: "11px", lineHeight: "1.4" }}>
      {/* ── Store header ── */}
      <div className="text-center px-2 pt-2">
        <div className="text-xl font-extrabold tracking-tight" style={{ fontSize: "18px" }}>FusionFlow</div>
        <div className="font-bold" style={{ fontSize: "12px" }}>Restaurant & Pizza</div>
        <div style={{ fontSize: "10px" }}>{order.branchName ?? "Gulberg III Flagship"}</div>
        <div style={{ fontSize: "10px" }}>Lahore, Pakistan</div>
        <div style={{ fontSize: "10px" }}>+92 300 0000000</div>
        <div style={{ fontSize: "9px" }}>NTN: 1234567-8</div>
        <div style={{ fontSize: "9px" }}>STRN: 3217654-0987654-1</div>
      </div>

      {/* Separator */}
      <ReceiptDivider />

      {/* ── Tax invoice title ── */}
      <div className="text-center font-extrabold" style={{ fontSize: "13px", letterSpacing: "0.1em" }}>TAX INVOICE</div>
      <ReceiptDivider />

      {/* ── Invoice meta ── */}
      <div className="px-2" style={{ fontSize: "10px" }}>
        <ReceiptRow label="Invoice #:" value={`INV-${order.number}`} />
        <ReceiptRow label="Date:" value={dateStr} />
        <ReceiptRow label="Time:" value={timeStr} />
        <ReceiptRow label="Type:" value={order.type.replace("_", " ").toUpperCase()} />
        {order.table && <ReceiptRow label="Table:" value={order.table} />}
        <ReceiptRow label="Customer:" value={order.customerName || "Walk-in"} />
        {order.customerPhone && <ReceiptRow label="Phone:" value={order.customerPhone} />}
        <ReceiptRow label="Cashier:" value="AK" />
      </div>

      <ReceiptDivider />

      {/* ── Items header ── */}
      <div className="px-2 font-bold" style={{ fontSize: "10px" }}>
        <div className="flex justify-between">
          <span className="flex-1">ITEM</span>
          <span className="w-8 text-center">QTY</span>
          <span className="w-16 text-right">AMOUNT</span>
        </div>
      </div>
      <div className="px-2" style={{ borderTop: "1px dashed #000", marginTop: "2px" }} />

      {/* ── Items ── */}
      <div className="px-2" style={{ fontSize: "10px" }}>
        {itemRows.map((item: any, i: number) => (
          <div key={i} className="py-0.5">
            <div className="font-bold">{item.name}</div>
            {item.customizations && (
              <div style={{ fontSize: "8px", color: "#555" }}>{item.customizations}</div>
            )}
            <div className="flex justify-between">
              <span className="flex-1" style={{ fontSize: "9px" }}>
                {formatPKR(item.price)} x{item.quantity}
              </span>
              <span className="w-16 text-right font-bold">{formatPKR(item.price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <ReceiptDivider />

      {/* ── Totals ── */}
      <div className="px-2" style={{ fontSize: "10px" }}>
        <ReceiptRow label="Subtotal:" value={formatPKR(order.subtotal)} />
        <ReceiptRow label="GST (13%):" value={formatPKR(order.tax)} />
        {order.discount > 0 && (
          <ReceiptRow label="Discount:" value={`-${formatPKR(order.discount)}`} />
        )}
      </div>

      <div className="px-2" style={{ borderTop: "1px solid #000", marginTop: "2px", paddingTop: "2px" }}>
        <div className="flex justify-between font-extrabold" style={{ fontSize: "14px" }}>
          <span>TOTAL</span>
          <span>{formatPKR(order.total)}</span>
        </div>
      </div>

      <ReceiptDivider />

      {/* ── Payment ── */}
      <div className="px-2" style={{ fontSize: "10px" }}>
        <ReceiptRow label="Payment:" value={(order.paymentMethod ?? "Cash").toUpperCase()} />
        <ReceiptRow label="Status:" value={(order.paymentStatus ?? "paid").toUpperCase()} />
        <ReceiptRow label="Items:" value={`${itemRows.length}`} />
      </div>

      <ReceiptDivider />

      {/* ── Footer ── */}
      <div className="text-center px-2 pb-2" style={{ fontSize: "9px" }}>
        <div className="font-bold">Thank you for dining with us!</div>
        <div style={{ marginTop: "2px" }}>Please come again</div>
        <div style={{ marginTop: "4px" }}>www.fusionflow.dev</div>
        <div style={{ marginTop: "4px", fontSize: "8px" }}>
          This is a computer-generated receipt.<br />No signature required.
        </div>
        {/* Barcode-like visual */}
        <div className="flex justify-center gap-px mt-2" style={{ height: "24px" }}>
          {Array.from({ length: 40 }).map((_, i) => {
            const barWidth = (i * 7) % 3 === 0 ? "2px" : "1px"
            return <div key={i} style={{ width: barWidth, height: "100%", background: "#000" }} />
          })}
        </div>
        <div style={{ fontSize: "8px", marginTop: "2px" }}>*{order.number}*</div>
      </div>
    </div>
  )
}

function ReceiptDivider() {
  return (
    <div className="my-1 mx-2" style={{ borderTop: "1px dashed #000" }} />
  )
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}
