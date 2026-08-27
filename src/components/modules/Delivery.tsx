"use client"

import { tenantFetch } from "@/lib/tenant-fetch"

import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { formatPKR } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Bike, MapPin, Star, Phone, Navigation, Package, Clock, CheckCircle2, Truck, User } from "lucide-react"
import { motion } from "framer-motion"

interface DeliveryData {
  riders: any[]
  activeOrders: any[]
}

const RIDER_POS = [
  { x: 22, y: 30 }, { x: 68, y: 22 }, { x: 45, y: 55 },
  { x: 80, y: 60 }, { x: 30, y: 75 }, { x: 60, y: 80 },
  { x: 15, y: 50 }, { x: 88, y: 40 },
]

export function Delivery() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data, loading, refresh } = useFetch<DeliveryData>(`/api/dashboard${branchParam}`, { intervalMs: 12000 })

  if (loading && !data) {
    return <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}</div>
  }

  if (!data || !data.activeOrders) {
    return <div className="grid place-items-center min-h-[40vh] text-sm text-muted-foreground">Unable to load delivery data</div>
  }

  const d = data
  const activeDeliveries = (d.activeOrders || []).filter((o: any) => o.type === "delivery" && (o.status === "dispatched" || o.status === "ready"))
  const availableRiders = d.riders.filter((r: any) => r.status === "available")
  const onDelivery = d.riders.filter((r: any) => r.status === "on_delivery")
  const offline = d.riders.filter((r: any) => r.status === "offline")

  const assignRider = async (orderId: string, rider: any) => {
    try {
      await tenantFetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dispatched", riderId: rider.id }),
      })
      toast.success(`${rider.name} assigned`, { description: `Order dispatched · OTP 4821` })
      refresh()
    } catch {
      toast.error("Assignment failed")
    }
  }

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Active Deliveries" value={activeDeliveries.length} icon={Truck} color="var(--chart-2)" />
        <StatTile label="Available Riders" value={availableRiders.length} icon={Bike} color="var(--chart-3)" />
        <StatTile label="On Delivery" value={onDelivery.length} icon={Navigation} color="var(--chart-4)" />
        <StatTile label="Avg Rating" value={(d.riders.reduce((s: number, r: any) => s + r.rating, 0) / Math.max(d.riders.length, 1)).toFixed(1)} icon={Star} color="var(--chart-1)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Map */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div>
              <h3 className="font-bold text-sm">Live Rider Map</h3>
              <p className="text-[11px] text-muted-foreground">GPS tracking · route optimization</p>
            </div>
            <Badge className="bg-chart-3"><span className="relative flex h-2 w-2 mr-1"><span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" /><span className="relative inline-flex rounded-full h-2 w-2 bg-white" /></span>LIVE</Badge>
          </div>
          <div className="pf-map relative h-[420px]">
            {/* Restaurant HQ marker */}
            <div className="absolute" style={{ left: "48%", top: "46%" }}>
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div className="grid place-items-center h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg border-2 border-background">
                  <Package className="h-5 w-5" />
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold bg-background px-2 py-0.5 rounded shadow">
                  HQ · {activeBranchId === "__ALL__" ? "All" : "Branch"}
                </div>
                <span className="absolute inset-0 rounded-full pf-live-dot" />
              </div>
            </div>
            {/* Riders */}
            {d.riders.slice(0, 8).map((r: any, i: number) => {
              const pos = RIDER_POS[i % RIDER_POS.length]
              const onDel = r.status === "on_delivery"
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="absolute group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className={cn(
                    "relative -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110",
                  )}>
                    <div className={cn(
                      "grid place-items-center h-8 w-8 rounded-full shadow-md border-2 border-background",
                      onDel ? "bg-chart-2 text-black" : r.status === "available" ? "bg-chart-3 text-black" : "bg-muted-foreground text-white"
                    )}>
                      <Bike className="h-4 w-4" />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-background border rounded-md px-2 py-1 text-[10px] font-medium shadow-lg z-10">
                      {r.name} · ⭐{r.rating}
                    </div>
                  </div>
                </motion.div>
              )
            })}
            {/* Route lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.4 }}>
              {onDelivery.map((_: any, i: number) => {
                const pos = RIDER_POS[i % RIDER_POS.length]
                return (
                  <line key={i} x1="48%" y1="46%" x2={`${pos.x}%`} y2={`${pos.y}%`} stroke="var(--chart-2)" strokeWidth="1.5" strokeDasharray="4 4" />
                )
              })}
            </svg>
          </div>
        </Card>

        {/* Active deliveries queue */}
        <Card className="overflow-hidden flex flex-col max-h-[480px]">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-bold text-sm">Delivery Queue</h3>
            <p className="text-[11px] text-muted-foreground">Assign nearest rider</p>
          </div>
          <div className="flex-1 overflow-y-auto pf-scroll divide-y">
            {activeDeliveries.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No deliveries waiting
              </div>
            )}
            {activeDeliveries.map((o: any) => (
              <div key={o.id} className="p-3 hover:bg-muted/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm">#{o.number}</span>
                  <Badge variant={o.status === "dispatched" ? "default" : "secondary"} className="text-[9px] capitalize">{o.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2 truncate">
                  {o.customerName} · {o.items[0]?.name ?? "Order"}
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-[11px] truncate">{o.customerAddress || `${o.branch?.name}, ${o.branch?.city}`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">{formatPKR(o.total)}</span>
                  <SelectRider riders={availableRiders} onAssign={(r) => assignRider(o.id, r)} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Riders table */}
      <Card>
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-bold text-sm">Rider Fleet</h3>
          <div className="flex items-center gap-2 text-[11px]">
            <Badge variant="secondary" className="bg-chart-3/15 text-chart-3">{availableRiders.length} available</Badge>
            <Badge variant="secondary" className="bg-chart-2/15 text-chart-2">{onDelivery.length} on delivery</Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Rider</th>
                <th className="text-left px-4 py-2 font-semibold hidden sm:table-cell">Branch</th>
                <th className="text-left px-4 py-2 font-semibold">Status</th>
                <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Vehicle</th>
                <th className="text-right px-4 py-2 font-semibold hidden md:table-cell">Deliveries</th>
                <th className="text-right px-4 py-2 font-semibold">Rating</th>
                <th className="text-right px-4 py-2 font-semibold hidden lg:table-cell">Earnings</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {d.riders.map((r: any) => (
                <tr key={r.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="grid place-items-center h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {r.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{r.name}</div>
                        <div className="text-[10px] text-muted-foreground">{r.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell text-xs">{r.branch?.name}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className={cn(
                      "text-[9px] capitalize",
                      r.status === "available" && "bg-chart-3/15 text-chart-3",
                      r.status === "on_delivery" && "bg-chart-2/15 text-chart-2",
                      r.status === "offline" && "bg-muted text-muted-foreground",
                    )}>{r.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-xs capitalize">{r.vehicle}</td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-right text-xs font-semibold">{r.totalDeliveries}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold">
                      <Star className="h-3 w-3 fill-chart-2 text-chart-2" />{r.rating}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-right text-xs font-bold">{formatPKR(r.earnings)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info(`Calling ${r.name}…`)}>
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function SelectRider({ riders, onAssign }: { riders: any[]; onAssign: (r: any) => void }) {
  return (
    <select
      defaultValue=""
      onChange={(e) => {
        const r = riders.find((x) => x.id === e.target.value)
        if (r) onAssign(r)
        e.target.value = ""
      }}
      className="text-[10px] rounded-md border bg-background px-2 py-1 font-medium ml-auto"
    >
      <option value="" disabled>+ Assign rider</option>
      {riders.map((r) => (
        <option key={r.id} value={r.id}>{r.name} · ⭐{r.rating}</option>
      ))}
    </select>
  )
}

function StatTile({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof Bike; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase">{label}</div>
          <div className="text-xl font-extrabold">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}
