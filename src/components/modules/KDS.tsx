"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatPKR, STATIONS } from "@/lib/data"
import { cn } from "@/lib/utils"
import { ChefHat, Clock, CheckCircle2, ArrowRight, AlertTriangle, Flame } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface KdsOrder {
  id: string
  number: number
  type: string
  status: string
  station: string
  table: string | null
  customerName: string | null
  items: { id: string; name: string; quantity: number; customizations?: string | null }[]
  total: number
  createdAt: string
  branch: { name: string }
}

const STATUS_FLOW: Record<string, { next: string; label: string; cls: string }> = {
  pending: { next: "preparing", label: "Start", cls: "bg-muted-foreground/15 text-muted-foreground" },
  preparing: { next: "ready", label: "Mark Ready", cls: "bg-chart-4/20 text-chart-4" },
  ready: { next: "dispatched", label: "Dispatch", cls: "bg-chart-3/20 text-chart-3" },
  dispatched: { next: "delivered", label: "Complete", cls: "bg-chart-2/20 text-chart-2" },
}

export function KDS() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const kdsStation = useAppStore((s) => s.kdsStation)
  const setKdsStation = useAppStore((s) => s.setKdsStation)
  const branchParam = activeBranchId === "__ALL__" ? "" : `&branchId=${activeBranchId}`
  const { data, loading, refresh } = useFetch<{ orders: KdsOrder[] }>(
    `/api/orders?active=true${branchParam}`,
    { intervalMs: 8000 }
  )

  const orders = data?.orders ?? []
  const filtered = kdsStation === "all" ? orders : orders.filter((o) => o.station === kdsStation)

  // group by station
  const byStation = STATIONS.map((st) => ({
    ...st,
    orders: orders.filter((o) => o.station === st.id),
  }))

  const advance = async (order: KdsOrder) => {
    const flow = STATUS_FLOW[order.status]
    if (!flow) return
    // optimistic: refresh handled by polling
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: flow.next }),
      })
      toast.success(`Order #${order.number} → ${flow.next}`, { description: flow.label })
      refresh()
    } catch {
      toast.error("Failed to update order")
    }
  }

  return (
    <div className="space-y-4">
      {/* Station tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={kdsStation === "all" ? "default" : "outline"}
          size="sm"
          className="h-9"
          onClick={() => setKdsStation("all")}
        >
          <ChefHat className="h-4 w-4 mr-1.5" /> All Stations
          <Badge variant="secondary" className="ml-2 text-[10px] bg-background/20">{orders.length}</Badge>
        </Button>
        {STATIONS.map((st) => {
          const count = orders.filter((o) => o.station === st.id).length
          return (
            <Button
              key={st.id}
              variant={kdsStation === st.id ? "default" : "outline"}
              size="sm"
              className="h-9"
              onClick={() => setKdsStation(st.id)}
            >
              <span className="h-2 w-2 rounded-full mr-1.5" style={{ background: st.color }} />
              {st.label}
              {count > 0 && <Badge variant="secondary" className="ml-2 text-[10px] bg-background/20">{count}</Badge>}
            </Button>
          )
        })}
      </div>

      {/* KDS columns */}
      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-64 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      ) : kdsStation === "all" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {byStation.map((st) => (
            <StationColumn key={st.id} stationId={st.id} label={st.label} color={st.color} orders={st.orders} onAdvance={advance} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <AnimatePresence>
            {filtered.map((o) => <OrderTicket key={o.id} order={o} onAdvance={advance} />)}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-chart-3" />
              No active orders at this station.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StationColumn({ stationId, label, color, orders, onAdvance }: { stationId: string; label: string; color: string; orders: KdsOrder[]; onAdvance: (o: KdsOrder) => void }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden flex flex-col max-h-[calc(100vh-15rem)]">
      <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ background: `color-mix(in oklch, ${color} 12%, transparent)` }}>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          <span className="font-bold text-sm">{label}</span>
        </div>
        <Badge variant="secondary" className="text-[10px]">{orders.length}</Badge>
      </div>
      <div className="flex-1 overflow-y-auto pf-scroll p-2 space-y-2">
        {orders.length === 0 && <div className="text-center text-xs text-muted-foreground py-8">Idle</div>}
        <AnimatePresence>
          {orders.map((o) => <OrderTicket key={o.id} order={o} onAdvance={onAdvance} compact />)}
        </AnimatePresence>
      </div>
    </div>
  )
}

function OrderTicket({ order, onAdvance, compact }: { order: KdsOrder; onAdvance: (o: KdsOrder) => void; compact?: boolean }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000))
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [order.createdAt])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const flow = STATUS_FLOW[order.status]
  const overdue = elapsed > 600 && order.status !== "ready" && order.status !== "dispatched" // 10 min
  const warning = elapsed > 360 && !overdue

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "rounded-lg border-2 bg-card overflow-hidden",
        overdue ? "border-destructive" : warning ? "border-chart-4" : "border-border"
      )}
    >
      <div className={cn(
        "flex items-center justify-between px-3 py-2",
        overdue ? "bg-destructive/10" : warning ? "bg-chart-4/10" : "bg-muted/40"
      )}>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm">#{order.number}</span>
          <Badge variant="outline" className="text-[9px] capitalize">{order.type.replace("_", "-")}</Badge>
          {order.table && <Badge variant="outline" className="text-[9px]">{order.table}</Badge>}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-mono font-bold",
          overdue ? "text-destructive" : warning ? "text-chart-4" : "text-muted-foreground"
        )}>
          {overdue ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {order.items.map((it) => (
          <div key={it.id} className="flex items-start gap-2 text-sm">
            <span className="grid place-items-center h-5 min-w-5 px-1 rounded bg-primary/10 text-primary text-[10px] font-bold shrink-0">{it.quantity}×</span>
            <div className="min-w-0">
              <div className="font-medium leading-tight">{it.name}</div>
              {it.customizations && <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{it.customizations}</div>}
            </div>
          </div>
        ))}
        {!compact && order.customerName && (
          <div className="text-[10px] text-muted-foreground pt-1 border-t">{order.customerName} · {formatPKR(order.total)}</div>
        )}
      </div>
      {flow && (
        <button
          onClick={() => onAdvance(order)}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition-colors",
            flow.cls, "hover:opacity-80"
          )}
        >
          {order.status === "preparing" ? <Flame className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
          {flow.label}
        </button>
      )}
    </motion.div>
  )
}
