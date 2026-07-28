"use client"

import { useCallback, useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatPKR } from "@/lib/data"
import {
  Car, Clock, Mic, CreditCard, Package, ArrowRight, CheckCircle2, AlertTriangle,
  Zap, Plus, X, ShoppingCart,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"

interface DtOrder {
  id: string
  number: number
  status: string
  station: string
  table: string | null
  customerName: string | null
  items: { id: string; name: string; quantity: number; price: number }[]
  total: number
  subtotal: number
  tax: number
  paymentMethod: string | null
  paymentStatus: string
  createdAt: string
  branch: { name: string }
}

interface MenuData {
  products: { id: string; name: string; price: number; category: string; station: string; available: boolean }[]
}

// Drive-thru stage mapping based on order status
// pending → Order stage, preparing → Payment stage, ready → Pickup stage, dispatched/delivered → Complete
const STAGE_MAP: Record<string, string> = {
  pending: "order",
  preparing: "pay",
  ready: "pickup",
  dispatched: "done",
  delivered: "done",
  cancelled: "done",
}

const STAGES = [
  { id: "order", label: "Order", icon: Mic, color: "var(--chart-2)" },
  { id: "pay", label: "Payment", icon: CreditCard, color: "var(--chart-4)" },
  { id: "pickup", label: "Pickup", icon: Package, color: "var(--chart-3)" },
  { id: "done", label: "Complete", icon: CheckCircle2, color: "var(--chart-1)" },
] as const

const NEXT_STATUS: Record<string, string> = {
  pending: "preparing",
  preparing: "ready",
  ready: "dispatched",
  dispatched: "delivered",
}

export function DriveThru() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchId = activeBranchId === "__ALL__" ? "" : activeBranchId
  const ordersParam = branchId ? `?branchId=${branchId}&active=true` : `?active=true`
  const { data: ordersData, loading, refresh } = useFetch<{ orders: DtOrder[] }>(`/api/orders${ordersParam}`, { intervalMs: 10000 })
  const { data: menuData } = useFetch<MenuData>("/api/menu", {})

  const [now, setNow] = useState(Date.now())
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Filter only drive-thru orders
  const allOrders = ordersData?.orders ?? []
  const dtOrders = allOrders.filter(o => o.type === "drive_thru" || (o as any).table?.startsWith?.("DT-"))

  // Group by stage
  const carsByStage = (stageId: string) => dtOrders.filter(o => STAGE_MAP[o.status] === stageId)

  const advance = async (order: DtOrder) => {
    const nextStatus = NEXT_STATUS[order.status]
    if (!nextStatus) return
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          paymentStatus: nextStatus === "preparing" ? "paid" : order.paymentStatus,
        }),
      })
      toast.success(`Order #${order.number} → ${nextStatus}`, {
        description: `Vehicle advanced to ${STAGES.find(s => s.id === STAGE_MAP[nextStatus])?.label} stage`,
      })
      refresh()
    } catch {
      toast.error("Failed to advance order")
    }
  }

  const stats = {
    inQueue: dtOrders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length,
    avgTime: dtOrders.length > 0
      ? Math.round(dtOrders.reduce((s, o) => s + (now - new Date(o.createdAt).getTime()) / 1000 / 60, 0) / dtOrders.length)
      : 0,
    served: dtOrders.filter(o => o.status === "delivered").length,
    revenue: dtOrders.filter(o => o.status === "delivered" || o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0),
  }
  const sla = 240 // 4 min target

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={Car} label="In Queue" value={stats.inQueue} sub="vehicles" color="var(--chart-2)" />
        <Tile icon={Clock} label="Avg Time" value={`${stats.avgTime}m`} sub="per vehicle" color="var(--chart-4)" />
        <Tile icon={CheckCircle2} label="Served Today" value={stats.served} sub="completed" color="var(--chart-3)" />
        <Tile icon={Zap} label="Revenue" value={formatPKR(stats.revenue)} sub="drive-thru" color="var(--chart-1)" />
      </div>

      {/* Lane visualization */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Drive-Thru Lane</h3>
            <p className="text-[11px] text-muted-foreground">SLA target: 4 minutes per vehicle · synced with order system</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setVoiceOpen(true)}>
              <Mic className="h-4 w-4 mr-1.5" /> Voice Order
            </Button>
            <Button size="sm" onClick={() => setNewOrderOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> New Vehicle
            </Button>
          </div>
        </div>

        {loading && !ordersData ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4">
            {STAGES.map((stage) => {
              const stageOrders = carsByStage(stage.id)
              const Icon = stage.icon
              return (
                <div key={stage.id} className="rounded-xl border-2 overflow-hidden" style={{ borderColor: `color-mix(in oklch, ${stage.color} 35%, transparent)` }}>
                  <div className="px-3 py-2 border-b flex items-center gap-2" style={{ background: `color-mix(in oklch, ${stage.color} 10%, transparent)` }}>
                    <Icon className="h-4 w-4" style={{ color: stage.color }} />
                    <span className="font-bold text-xs">{stage.label}</span>
                    <Badge variant="secondary" className="ml-auto text-[9px]">{stageOrders.length}</Badge>
                  </div>
                  <div className="p-2 space-y-2 min-h-[160px] max-h-[400px] overflow-y-auto pf-scroll">
                    <AnimatePresence>
                      {stageOrders.map((o) => {
                        const elapsed = Math.floor((now - new Date(o.createdAt).getTime()) / 1000)
                        const mins = Math.floor(elapsed / 60)
                        const secs = elapsed % 60
                        const overdue = elapsed > sla && o.status !== "delivered" && o.status !== "dispatched"
                        return (
                          <motion.div
                            key={o.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={cn(
                              "rounded-lg border-2 p-2.5 bg-card",
                              overdue ? "border-destructive" : "border-border"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs">#{o.number}</span>
                              {o.customerName && <span className="text-[9px] text-muted-foreground truncate max-w-[60px]">{o.customerName}</span>}
                            </div>
                            <div className="flex items-center justify-between mt-1.5 text-[10px]">
                              <span className="text-muted-foreground">{o.items.length} items</span>
                              <span className="font-bold text-primary">{formatPKR(o.total)}</span>
                            </div>
                            {/* Items list */}
                            <div className="mt-1.5 space-y-0.5">
                              {o.items.slice(0, 3).map((item, i) => (
                                <div key={i} className="text-[9px] text-muted-foreground truncate">
                                  {item.quantity}× {item.name}
                                </div>
                              ))}
                              {o.items.length > 3 && <div className="text-[9px] text-muted-foreground">+{o.items.length - 3} more</div>}
                            </div>
                            <div className={cn(
                              "flex items-center justify-between mt-1.5 text-[10px] font-mono font-bold",
                              overdue ? "text-destructive" : "text-muted-foreground"
                            )}>
                              <span className="flex items-center gap-0.5">
                                {overdue ? <AlertTriangle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                              </span>
                              {stage.id !== "done" && (
                                <button
                                  onClick={() => advance(o)}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary text-primary-foreground hover:opacity-80"
                                >
                                  <ArrowRight className="h-2.5 w-2.5" /> {NEXT_STATUS[o.status] ? "Advance" : "Done"}
                                </button>
                              )}
                            </div>
                            {/* Payment status */}
                            {stage.id !== "done" && (
                              <div className="mt-1 flex items-center gap-1">
                                <Badge variant="outline" className={cn(
                                  "text-[8px]",
                                  o.paymentStatus === "paid" ? "text-chart-3 border-chart-3/30" : "text-chart-4 border-chart-4/30"
                                )}>
                                  {o.paymentStatus === "paid" ? "✓ Paid" : "Unpaid"}
                                </Badge>
                                {o.paymentMethod && (
                                  <Badge variant="outline" className="text-[8px] capitalize">{o.paymentMethod}</Badge>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                    {stageOrders.length === 0 && (
                      <div className="text-center text-[10px] text-muted-foreground py-8">Empty</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Performance + voice assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-bold text-sm">Hourly Throughput</h3>
            <p className="text-[11px] text-muted-foreground">Vehicles served per hour today</p>
          </div>
          <div className="p-4 grid grid-cols-12 gap-1.5 items-end h-[140px]">
            {Array.from({ length: 12 }).map((_, i) => {
              const h = 30 + Math.floor(Math.sin(i * 0.7) * 25 + Math.random() * 30)
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors" style={{ height: `${h}%` }} />
                  <span className="text-[8px] text-muted-foreground">{11 + i}h</span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-gradient-to-r from-chart-3/15 to-transparent">
            <h3 className="font-bold text-sm flex items-center gap-1.5"><Mic className="h-4 w-4 text-chart-3" /> Voice Assistant</h3>
            <p className="text-[11px] text-muted-foreground">AI drive-thru ordering</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="rounded-lg bg-muted/40 p-3 text-xs">
              <div className="text-[10px] text-muted-foreground font-semibold mb-1">Customer said:</div>
              <div className="italic">&ldquo;I&apos;ll take two large pepperoni pizzas and a cola&rdquo;</div>
            </div>
            <div className="rounded-lg bg-chart-3/10 p-3 text-xs">
              <div className="text-[10px] text-chart-3 font-semibold mb-1">AI recognized:</div>
              <div>2× Pepperoni Supreme (Large) · 1× Cola 500ml</div>
              <div className="text-[10px] mt-1 font-bold text-primary">Total: {formatPKR(2730)}</div>
            </div>
            <Button size="sm" className="w-full" onClick={() => setVoiceOpen(true)}>
              <Mic className="h-3.5 w-3.5 mr-1.5" /> Confirm Voice Order
            </Button>
            <div className="text-[10px] text-center text-muted-foreground">
              <Badge variant="outline" className="text-[9px]">94% accuracy</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* New vehicle order dialog */}
      <NewDriveThruOrder
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        products={menuData?.products ?? []}
        branchId={branchId || "BR-GUL"}
        onCreated={refresh}
      />

      {/* Voice order dialog */}
      <VoiceOrderDialog
        open={voiceOpen}
        onOpenChange={setVoiceOpen}
        branchId={branchId || "BR-GUL"}
        onCreated={refresh}
      />
    </div>
  )
}

// ── New Drive-Thru Order Dialog ──
function NewDriveThruOrder({
  open, onOpenChange, products, branchId, onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  products: { id: string; name: string; price: number; category: string; station: string; available: boolean }[]
  branchId: string
  onCreated: () => void
}) {
  const [plate, setPlate] = useState("")
  const [cart, setCart] = useState<Record<string, number>>({})
  const [payMethod, setPayMethod] = useState("card")
  const [placing, setPlacing] = useState(false)

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id === id)
    return p ? { ...p, qty } : null
  }).filter(Boolean) as ({ id: string; name: string; price: number; qty: number }[])

  const subtotal = cartItems.reduce((s, p) => s + p.price * p.qty, 0)
  const tax = Math.round(subtotal * 0.13)
  const total = subtotal + tax

  const submit = async () => {
    if (!cartItems.length) { toast.error("Add at least one item"); return }
    setPlacing(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          type: "drive_thru",
          table: `DT-${plate || "GUEST"}`,
          customerName: plate ? `Vehicle ${plate}` : "Drive-Thru",
          items: cartItems.map(p => ({ productId: p.id, name: p.name, price: p.price, quantity: p.qty })),
          paymentMethod: payMethod,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      toast.success(`Drive-thru order #${json.order.number} created`, {
        description: `${cartItems.length} items · ${formatPKR(total)} · vehicle ${plate || "guest"}`,
      })
      setCart({})
      setPlate("")
      onOpenChange(false)
      onCreated()
    } catch (e) {
      toast.error("Failed to create order", { description: e instanceof Error ? e.message : "" })
    } finally {
      setPlacing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto pf-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm"><Car className="h-4 w-4 text-primary" /> New Drive-Thru Order</DialogTitle>
          <DialogDescription>Create a real order for the vehicle at the window</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block">Vehicle Plate (optional)</label>
            <Input value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} placeholder="LEB-2024" className="h-9 uppercase font-mono" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Quick Add Items</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto pf-scroll">
              {products.filter(p => p.available).slice(0, 12).map(p => {
                const inCart = cart[p.id] ?? 0
                return (
                  <button
                    key={p.id}
                    onClick={() => setCart(c => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }))}
                    className="text-left rounded-lg border p-2 hover:border-primary/40 transition-colors"
                  >
                    <div className="text-[11px] font-semibold leading-tight truncate">{p.name}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] font-bold text-primary">{formatPKR(p.price)}</span>
                      {inCart > 0 && <Badge variant="default" className="text-[8px] h-4 px-1">{inCart}</Badge>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          {/* Cart summary */}
          {cartItems.length > 0 && (
            <div className="rounded-lg border p-2 space-y-1">
              {cartItems.map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <span className="flex-1 truncate">{p.qty}× {p.name}</span>
                  <span className="font-semibold">{formatPKR(p.price * p.qty)}</span>
                  <button onClick={() => setCart(c => { const n = { ...c }; delete n[p.id]; return n })} className="ml-2 text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="border-t pt-1 flex items-center justify-between text-xs font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPKR(total)}</span>
              </div>
            </div>
          )}
          {/* Payment */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Payment Method</label>
            <div className="grid grid-cols-3 gap-1.5">
              {["card", "cash", "wallet"].map(m => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className={cn(
                    "py-2 rounded-lg border-2 text-xs font-semibold capitalize transition-all",
                    payMethod === m ? "border-primary bg-primary/5" : "border-border"
                  )}
                >{m}</button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={placing || !cartItems.length}>
            {placing ? "Creating…" : <>Create Order · {formatPKR(total)}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Voice Order Dialog ──
function VoiceOrderDialog({
  open, onOpenChange, branchId, onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  branchId: string
  onCreated: () => void
}) {
  const [placing, setPlacing] = useState(false)
  // Simulated voice order: 2× Pepperoni Supreme, 1× Cola
  const voiceItems = [
    { productId: "P-PEP", name: "Pepperoni Supreme", price: 1290, quantity: 2 },
    { productId: "D-COL", name: "Cola 500ml", price: 150, quantity: 1 },
  ]
  const subtotal = voiceItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax = Math.round(subtotal * 0.13)
  const total = subtotal + tax

  const submit = async () => {
    setPlacing(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          type: "drive_thru",
          table: "DT-VOICE",
          customerName: "Voice Order",
          items: voiceItems,
          paymentMethod: "card",
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed")
      toast.success(`Voice order #${json.order.number} sent to kitchen`, {
        description: `${formatPKR(total)} · 3 items`,
      })
      onOpenChange(false)
      onCreated()
    } catch (e) {
      toast.error("Failed to create voice order", { description: e instanceof Error ? e.message : "" })
    } finally {
      setPlacing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm"><Mic className="h-4 w-4 text-chart-3" /> AI Voice Order</DialogTitle>
          <DialogDescription>Review and confirm the voice-recognized order</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg bg-muted/40 p-3 text-xs">
            <div className="text-[10px] text-muted-foreground font-semibold mb-1">Customer said:</div>
            <div className="italic">&ldquo;I&apos;ll take two large pepperoni pizzas and a cola&rdquo;</div>
          </div>
          <div className="rounded-lg border p-3 space-y-1.5">
            <div className="text-[10px] font-bold uppercase text-muted-foreground">Recognized Items</div>
            {voiceItems.map((i, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span>{i.quantity}× {i.name}</span>
                <span className="font-semibold">{formatPKR(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-1.5 flex items-center justify-between text-sm font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPKR(total)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={placing} className="gap-1.5">
            <Mic className="h-3.5 w-3.5" /> {placing ? "Sending…" : "Confirm & Send to Kitchen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Tile({ icon: Icon, label, value, sub, color }: { icon: typeof Car; label: string; value: string | number; sub: string; color: string }) {
  return (
    <Card>
      <div className="p-4 flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase">{label}</div>
          <div className="text-xl font-extrabold">{value}</div>
          <div className="text-[10px] text-muted-foreground">{sub}</div>
        </div>
      </div>
    </Card>
  )
}
