"use client"

import { useState } from "react"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatPKR } from "@/lib/data"
import {
  ShoppingBag, Smartphone, QrCode, Monitor, Bike, Store, Star, Clock, MapPin,
  Plus, Minus, Heart, ShoppingCart, Search, Wifi, Battery, Signal, Zap, TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

interface MenuData {
  products: any[]
  categories: string[]
}

const CHANNELS = [
  { id: "web", label: "Website", icon: Monitor, orders: 184, revenue: 284000, color: "var(--chart-1)" },
  { id: "app", label: "Mobile App", icon: Smartphone, orders: 412, revenue: 612000, color: "var(--chart-3)" },
  { id: "qr", label: "QR Ordering", icon: QrCode, orders: 96, revenue: 138000, color: "var(--chart-2)" },
  { id: "kiosk", label: "Self Kiosk", icon: ShoppingBag, orders: 58, revenue: 84000, color: "var(--chart-4)" },
]

export function OnlineOrdering() {
  const { data } = useFetch<MenuData>("/api/menu", {})
  const [cart, setCart] = useState<Record<string, number>>({})
  const [search, setSearch] = useState("")
  const [activeCat, setActiveCat] = useState("pizza")

  const products = (data?.products ?? []).filter((p) => {
    if (search) return p.name.toLowerCase().includes(search.toLowerCase())
    return p.category === activeCat
  })
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const p = data?.products.find((x) => x.id === id)
    return p ? { ...p, qty } : null
  }).filter(Boolean) as (any & { qty: number })[]
  const cartTotal = cartItems.reduce((s, p) => s + p.price * p.qty, 0)

  const totalOrders = CHANNELS.reduce((s, c) => s + c.orders, 0)
  const totalRevenue = CHANNELS.reduce((s, c) => s + c.revenue, 0)

  return (
    <div className="space-y-4">
      {/* Channel stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CHANNELS.map((ch) => {
          const Icon = ch.icon
          return (
            <Card key={ch.id}>
              <div className="p-4 flex items-center gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: `color-mix(in oklch, ${ch.color} 15%, transparent)`, color: ch.color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-muted-foreground font-semibold uppercase">{ch.label}</div>
                  <div className="text-xl font-extrabold">{ch.orders}</div>
                  <div className="text-[10px] text-muted-foreground">{formatPKR(ch.revenue)}</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Phone mockup with storefront */}
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Customer Storefront Preview</h3>
              <p className="text-[11px] text-muted-foreground">Live mobile ordering experience</p>
            </div>
            <Badge className="bg-chart-3"><span className="relative flex h-2 w-2 mr-1"><span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" /><span className="relative inline-flex rounded-full h-2 w-2 bg-white" /></span>LIVE</Badge>
          </div>
          <div className="p-4 flex justify-center bg-muted/20">
            {/* Phone frame */}
            <div className="w-full max-w-[360px] rounded-[2rem] border-[6px] border-zinc-900 bg-background overflow-hidden shadow-xl">
              {/* Status bar */}
              <div className="bg-zinc-900 text-white px-4 py-1 flex items-center justify-between text-[9px]">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <Signal className="h-2.5 w-2.5" /><Wifi className="h-2.5 w-2.5" /><Battery className="h-2.5 w-2.5" />
                </div>
              </div>
              {/* App header */}
              <div className="bg-primary text-primary-foreground px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-sm">NY212 Pizza</div>
                    <div className="text-[10px] opacity-80 flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> Deliver to · Gulberg III</div>
                  </div>
                  <div className="grid place-items-center h-8 w-8 rounded-full bg-primary-foreground/20">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                </div>
              </div>
              {/* Search */}
              <div className="p-3 bg-muted/30">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu…" className="h-8 pl-8 text-xs bg-background rounded-full" />
                </div>
              </div>
              {/* Category pills */}
              <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto pf-scroll">
                {(data?.categories ?? ["pizza", "burger", "chicken", "sides", "drinks", "desserts", "combos"]).map((c) => (
                  <button
                    key={c}
                    onClick={() => { setActiveCat(c); setSearch("") }}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all capitalize",
                      activeCat === c && !search ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {/* Products */}
              <div className="px-3 pb-3 space-y-2 max-h-[320px] overflow-y-auto pf-scroll">
                {products.slice(0, 6).map((p) => {
                  const inCart = cart[p.id] ?? 0
                  return (
                    <div key={p.id} className="rounded-xl border p-2.5 flex items-center gap-2.5">
                      <div className="grid place-items-center h-12 w-12 rounded-lg bg-primary/10 text-primary shrink-0 text-xl">
                        {p.category === "pizza" ? "🍕" : p.category === "burger" ? "🍔" : p.category === "chicken" ? "🍗" : p.category === "drinks" ? "🥤" : p.category === "desserts" ? "🍰" : p.category === "combos" ? "🎁" : "🍟"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-[11px] leading-tight truncate">{p.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2 w-2" />{p.prepTime}m</span>
                          {p.popular && <span className="text-[8px] font-bold text-chart-2">★ Popular</span>}
                        </div>
                        <div className="text-xs font-extrabold text-primary mt-0.5">{formatPKR(p.price)}</div>
                      </div>
                      {inCart === 0 ? (
                        <button
                          onClick={() => setCart((c) => ({ ...c, [p.id]: 1 }))}
                          className="grid place-items-center h-8 w-8 rounded-full bg-primary text-primary-foreground shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setCart((c) => ({ ...c, [p.id]: Math.max(0, inCart - 1) }))} className="grid place-items-center h-7 w-7 rounded-full bg-muted">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{inCart}</span>
                          <button onClick={() => setCart((c) => ({ ...c, [p.id]: inCart + 1 }))} className="grid place-items-center h-7 w-7 rounded-full bg-primary text-primary-foreground">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {/* Cart bar */}
              {cartItems.length > 0 && (
                <div className="bg-primary text-primary-foreground px-3 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid place-items-center h-7 w-7 rounded-full bg-primary-foreground/20 text-[10px] font-bold">{cartItems.reduce((s, p) => s + p.qty, 0)}</div>
                    <span className="text-xs font-semibold">View Cart</span>
                  </div>
                  <span className="text-sm font-extrabold">{formatPKR(cartTotal)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Side: QR + live online orders */}
        <div className="space-y-4">
          {/* QR code */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm">QR Ordering</h3>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="relative p-3 bg-white rounded-xl border-2">
                {/* Stylized QR */}
                <div className="grid grid-cols-8 gap-0.5 w-32 h-32">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={cn("rounded-sm", (i * 7 + (i % 3)) % 2 === 0 ? "bg-zinc-900" : "bg-transparent")} />
                  ))}
                </div>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid place-items-center h-8 w-8 rounded-md bg-primary text-primary-foreground">
                    <span className="text-[8px] font-bold">🍕</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="font-bold text-sm">Table T-5</div>
                <div className="text-[11px] text-muted-foreground">Scan to order · No app needed</div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[10px]">
                <Badge variant="outline" className="text-[9px]"><Zap className="h-2.5 w-2.5 mr-0.5 text-chart-3" />96 orders today</Badge>
                <Badge variant="outline" className="text-[9px]"><Star className="h-2.5 w-2.5 mr-0.5 text-chart-2" />4.8 rating</Badge>
              </div>
            </div>
          </Card>

          {/* Live online orders */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-sm">Live Online Orders</h3>
              <Badge className="bg-chart-3 text-[10px]"><span className="relative flex h-1.5 w-1.5 mr-1"><span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" /></span>Streaming</Badge>
            </div>
            <div className="max-h-[280px] overflow-y-auto pf-scroll divide-y">
              {[
                { id: "ON-4821", channel: "app", customer: "Hamza S.", items: 2, total: 1490, status: "preparing" },
                { id: "ON-4822", channel: "web", customer: "Ayesha K.", items: 4, total: 2990, status: "dispatched" },
                { id: "ON-4823", channel: "qr", customer: "Table T-8", items: 3, total: 1840, status: "ready" },
                { id: "ON-4824", channel: "app", customer: "Bilal A.", items: 1, total: 690, status: "pending" },
                { id: "ON-4825", channel: "kiosk", customer: "Walk-in #12", items: 2, total: 1180, status: "preparing" },
              ].map((o) => {
                const Ch = CHANNELS.find((c) => c.id === o.channel)!
                const ChIcon = Ch.icon
                return (
                  <div key={o.id} className="flex items-center gap-2 px-3 py-2">
                    <div className="grid place-items-center h-7 w-7 rounded-lg shrink-0" style={{ background: `color-mix(in oklch, ${Ch.color} 15%, transparent)`, color: Ch.color }}>
                      <ChIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{o.id} · {o.customer}</div>
                      <div className="text-[10px] text-muted-foreground">{o.items} items · {formatPKR(o.total)}</div>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[9px] capitalize",
                      o.status === "preparing" && "text-chart-4",
                      o.status === "ready" && "text-chart-3",
                      o.status === "dispatched" && "text-chart-2",
                    )}>{o.status}</Badge>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-4 bg-gradient-to-br from-chart-3/10 to-chart-2/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-chart-3" />
              <div className="font-bold text-sm">Online Channel Summary</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-background/60 p-2">
                <div className="text-xl font-extrabold">{totalOrders}</div>
                <div className="text-[9px] text-muted-foreground uppercase font-semibold">Total Orders</div>
              </div>
              <div className="rounded-lg bg-background/60 p-2">
                <div className="text-xl font-extrabold">{formatPKR(totalRevenue)}</div>
                <div className="text-[9px] text-muted-foreground uppercase font-semibold">Revenue</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
