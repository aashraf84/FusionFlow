"use client"

import { useEffect, useMemo, useState } from "react"
import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPKR } from "@/lib/data"
import { Users, Clock, Plus, Merge, Split, Calendar, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

type TState = "available" | "occupied" | "reserved" | "cleaning"
interface TableT {
  id: string
  seats: number
  state: TState
  guests?: number
  sinceMins?: number
  server?: string
  orderTotal?: number
  orderNumber?: number
  orderId?: string
  orderStatus?: string
  reservationName?: string
  reservationTime?: string
}

// Static table layout (physical tables in the restaurant)
const TABLE_LAYOUT: { id: string; seats: number }[] = [
  { id: "T-1", seats: 2 },
  { id: "T-2", seats: 2 },
  { id: "T-3", seats: 4 },
  { id: "T-4", seats: 4 },
  { id: "T-5", seats: 6 },
  { id: "T-6", seats: 2 },
  { id: "T-7", seats: 4 },
  { id: "T-8", seats: 8 },
  { id: "T-9", seats: 2 },
  { id: "T-10", seats: 4 },
  { id: "T-11", seats: 4 },
  { id: "T-12", seats: 6 },
]

// Reservations (would be from a reservations API in production)
const RESERVATIONS: Record<string, { name: string; time: string }> = {
  "T-4": { name: "Hamza Sheikh", time: "20:30" },
  "T-10": { name: "Ayesha Khan", time: "21:00" },
}

const WAITING = [
  { name: "Usman Family", size: 5, quoted: 18 },
  { name: "Rizwan +2", size: 3, quoted: 12 },
  { name: "Maria", size: 2, quoted: 6 },
]

const STATE_META: Record<TState, { label: string; bg: string; border: string; text: string; dot: string }> = {
  available: { label: "Available", bg: "bg-chart-3/10", border: "border-chart-3/40", text: "text-chart-3", dot: "bg-chart-3" },
  occupied: { label: "Occupied", bg: "bg-primary/10", border: "border-primary/40", text: "text-primary", dot: "bg-primary" },
  reserved: { label: "Reserved", bg: "bg-chart-2/15", border: "border-chart-2/50", text: "text-chart-2", dot: "bg-chart-2" },
  cleaning: { label: "Cleaning", bg: "bg-muted", border: "border-border", text: "text-muted-foreground", dot: "bg-muted-foreground" },
}

interface OrderData {
  orders: {
    id: string
    number: number
    type: string
    status: string
    table: string | null
    customerName: string | null
    total: number
    items: { id: string; name: string; quantity: number }[]
    createdAt: string
  }[]
}

const SERVERS = ["Sara", "Bilal", "Owais", "Kiran"]

export function Tables() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data, loading, refresh } = useFetch<OrderData>(`/api/orders${branchParam}&active=true`, { intervalMs: 15000 })

  // Build table states from real dine-in orders
  const tables: TableT[] = useMemo(() => {
    const now = Date.now()
    const dineInOrders = (data?.orders ?? []).filter(o => o.type === "dine_in" && o.table)

    // Create a map of table → order
    const tableOrders: Record<string, typeof dineInOrders[0]> = {}
    dineInOrders.forEach(o => {
      if (o.table && !tableOrders[o.table]) tableOrders[o.table] = o
    })

    return TABLE_LAYOUT.map((t, i) => {
      const order = tableOrders[t.id]
      const reservation = RESERVATIONS[t.id]
      if (order) {
        const sinceMins = Math.floor((now - new Date(order.createdAt).getTime()) / 60000)
        return {
          id: t.id,
          seats: t.seats,
          state: "occupied" as TState,
          guests: Math.min(t.seats, 1 + (order.items.reduce((s, it) => s + it.quantity, 0))),
          sinceMins,
          server: SERVERS[i % SERVERS.length],
          orderTotal: order.total,
          orderNumber: order.number,
          orderId: order.id,
          orderStatus: order.status,
        }
      }
      if (reservation) {
        return {
          id: t.id,
          seats: t.seats,
          state: "reserved" as TState,
          reservationName: reservation.name,
          reservationTime: reservation.time,
        }
      }
      return { id: t.id, seats: t.seats, state: "available" as TState }
    })
  }, [data, loading])

  const [selected, setSelected] = useState<string | null>(null)
  const [cleaningTables, setCleaningTables] = useState<Set<string>>(new Set())

  // Auto-clear cleaning after 30 seconds (simulated)
  useEffect(() => {
    if (cleaningTables.size === 0) return
    const t = setTimeout(() => setCleaningTables(new Set()), 30000)
    return () => clearTimeout(t)
  }, [cleaningTables])

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.state === "available").length,
    occupied: tables.filter(t => t.state === "occupied").length,
    reserved: tables.filter(t => t.state === "reserved").length,
    guests: tables.reduce((s, t) => s + (t.guests ?? 0), 0),
  }
  const occupancyPct = Math.round((stats.occupied / stats.total) * 100)

  const freeTable = (tableId: string) => {
    setCleaningTables(prev => new Set(prev).add(tableId))
    toast.success(`${tableId} marked for cleaning`, { description: "Table will be available shortly" })
  }

  const seatCustomer = (tableId: string) => {
    toast.success(`Customer seated at ${tableId}`, { description: "Use POS to take their order" })
  }

  const sel = tables.find(t => t.id === selected)

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MiniStat label="Total Tables" value={stats.total} icon={Users} color="var(--chart-1)" />
        <MiniStat label="Available" value={stats.available} icon={CheckCircle2} color="var(--chart-3)" />
        <MiniStat label="Occupied" value={stats.occupied} icon={Users} color="var(--primary)" />
        <MiniStat label="Reserved" value={stats.reserved} icon={Calendar} color="var(--chart-2)" />
        <MiniStat label="Guests Seated" value={stats.guests} icon={Users} color="var(--chart-5)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Floor plan */}
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Floor Plan — Main Hall</h3>
              <p className="text-[11px] text-muted-foreground">{loading ? "Syncing…" : "Live · synced with POS orders"}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Occupancy</div>
                <div className="text-lg font-extrabold">{occupancyPct}%</div>
              </div>
              <div className="h-12 w-12 rounded-full grid place-items-center relative" style={{ background: `conic-gradient(var(--primary) ${occupancyPct * 3.6}deg, var(--muted) 0deg)` }}>
                <div className="absolute inset-1.5 rounded-full bg-background grid place-items-center">
                  <span className="text-[10px] font-bold">{stats.occupied}/{stats.total}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 pf-map min-h-[420px] relative">
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground bg-background/80 px-2 py-0.5 rounded">⬆ ENTRANCE</div>
            <div className="absolute top-3 right-3 text-[10px] font-bold text-muted-foreground bg-background/80 px-2 py-0.5 rounded">🍽 KITCHEN</div>
            <div className="grid grid-cols-4 gap-3">
              {tables.map((t) => {
                const m = STATE_META[t.state]
                const isCleaning = cleaningTables.has(t.id)
                const displayState = isCleaning ? "cleaning" : t.state
                const dm = STATE_META[displayState]
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t.id)}
                    className={cn(
                      "relative rounded-xl border-2 p-3 transition-all hover:scale-[1.03] hover:shadow-md text-left",
                      dm.bg, dm.border, selected === t.id && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">{t.id}</span>
                      <span className={cn("h-2 w-2 rounded-full", dm.dot)} />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <Users className="h-2.5 w-2.5" /> {t.seats} seats
                    </div>
                    {t.state === "occupied" && !isCleaning && (
                      <div className="mt-2 space-y-0.5">
                        <div className="text-[10px] font-bold">{t.guests} guests</div>
                        <div className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Clock className="h-2 w-2" />{t.sinceMins}m · {t.server}</div>
                        <div className="text-[10px] font-bold text-primary">{formatPKR(t.orderTotal ?? 0)}</div>
                        <div className="text-[9px] text-muted-foreground">#{t.orderNumber} · {t.orderStatus}</div>
                      </div>
                    )}
                    {t.state === "reserved" && !isCleaning && (
                      <div className="mt-2 space-y-0.5">
                        <div className="text-[10px] font-bold truncate">{t.reservationName}</div>
                        <div className="text-[9px] text-muted-foreground">{t.reservationTime}</div>
                      </div>
                    )}
                    {isCleaning && (
                      <div className="mt-2 text-[10px] text-muted-foreground font-medium">🧹 Cleaning…</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          {sel ? (
            <Card className="overflow-hidden">
              <div className={cn("px-4 py-3 border-b", STATE_META[sel.state].bg)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-base">{sel.id}</div>
                    <div className="text-[11px] text-muted-foreground">{sel.seats} seats · {STATE_META[sel.state].label}</div>
                  </div>
                  <Badge className={STATE_META[sel.state].text + " bg-transparent border-0"}>{STATE_META[sel.state].label}</Badge>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {sel.state === "occupied" && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Info label="Guests" value={`${sel.guests}`} />
                    <Info label="Duration" value={`${sel.sinceMins}m`} />
                    <Info label="Server" value={sel.server ?? "—"} />
                    <Info label="Order #" value={`#${sel.orderNumber}`} />
                    <Info label="Status" value={sel.orderStatus ?? "—"} />
                    <Info label="Bill" value={sel.orderTotal ? formatPKR(sel.orderTotal) : "—"} />
                  </div>
                )}
                {sel.state === "reserved" && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Info label="Guest" value={sel.reservationName ?? "—"} />
                    <Info label="Time" value={sel.reservationTime ?? "—"} />
                  </div>
                )}
                {sel.state === "available" && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    Table available for seating
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.info(`Merge ${sel.id} with adjacent`)}>
                    <Merge className="h-3.5 w-3.5 mr-1" /> Merge
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info(`Split ${sel.id}`)}>
                    <Split className="h-3.5 w-3.5 mr-1" /> Split
                  </Button>
                  {sel.state === "occupied" && (
                    <Button size="sm" variant="outline" onClick={() => freeTable(sel.id)}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Free Table
                    </Button>
                  )}
                  {sel.state === "available" && (
                    <Button size="sm" onClick={() => seatCustomer(sel.id)}>
                      Seat Customer
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => { refresh(); toast.success("Tables refreshed") }}>
                    Refresh
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Select a table to view details
            </Card>
          )}

          {/* Waiting queue */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-1.5"><Clock className="h-4 w-4 text-chart-4" /> Waiting Queue</h3>
              <Badge variant="secondary" className="text-[10px]">{WAITING.length} waiting</Badge>
            </div>
            <div className="p-2 space-y-1.5">
              {WAITING.map((w) => (
                <div key={w.name} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/40">
                  <div className="grid place-items-center h-8 w-8 rounded-lg bg-chart-4/15 text-chart-4 text-xs font-bold shrink-0">{w.size}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-xs truncate">{w.name}</div>
                    <div className="text-[10px] text-muted-foreground">Quoted {w.quoted}m wait</div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={() => toast.success(`${w.name} seated`)}>
                    Seat
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="ghost" className="w-full text-xs h-8" onClick={() => toast.info("Add to waitlist")}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add to Waitlist
              </Button>
            </div>
          </Card>

          {/* Legend */}
          <Card className="p-3">
            <div className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Legend</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATE_META).map(([k, m]) => (
                <div key={k} className="flex items-center gap-2 text-[11px]">
                  <span className={cn("h-2.5 w-2.5 rounded-full", m.dot)} />
                  <span className="capitalize">{m.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof Users; color: string }) {
  return (
    <Card>
      <div className="p-3 flex items-center gap-2.5">
        <div className="grid place-items-center h-9 w-9 rounded-lg shrink-0" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] text-muted-foreground font-semibold uppercase">{label}</div>
          <div className="text-lg font-extrabold leading-none">{value}</div>
        </div>
      </div>
    </Card>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-2 py-1.5">
      <div className="text-[9px] text-muted-foreground uppercase font-semibold">{label}</div>
      <div className="text-xs font-bold truncate capitalize">{value}</div>
    </div>
  )
}
