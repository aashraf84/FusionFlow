"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useFetch } from "@/hooks/use-fetch"
import { useAppStore } from "@/lib/store"
import { formatPKR } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Cog, FlaskConical, Wheat, Drumstick, Salad, CakeSlice, Droplet, TrendingDown, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { toast } from "sonner"

interface DData {
  inventory: any[]
}

interface Batch {
  id: string
  item: string
  icon: typeof Wheat
  qty: string
  batch: string
  status: "planned" | "in_progress" | "ready"
  yield: number
  cost: number
  expiry: string
  progress: number
}

const BATCHES: Batch[] = [
  { id: "B1", item: "Pizza Dough Balls", icon: Wheat, qty: "120 pcs", batch: "DOU-2401", status: "in_progress", yield: 96, cost: 4800, expiry: "48h", progress: 65 },
  { id: "B2", item: "Tomato Sauce Batch", icon: FlaskConical, qty: "40 L", batch: "SAU-2401", status: "ready", yield: 100, cost: 12800, expiry: "5 days", progress: 100 },
  { id: "B3", item: "Marinated Chicken", icon: Drumstick, qty: "25 kg", batch: "CHK-2401", status: "in_progress", yield: 92, cost: 19000, expiry: "24h", progress: 40 },
  { id: "B4", item: "Fresh Vegetable Prep", icon: Salad, qty: "30 kg", batch: "VEG-2401", status: "planned", yield: 88, cost: 5400, expiry: "12h", progress: 0 },
  { id: "B5", item: "Cheese Portioning", icon: FlaskConical, qty: "18 kg", batch: "CHZ-2401", status: "ready", yield: 98, cost: 26100, expiry: "7 days", progress: 100 },
  { id: "B6", item: "Dessert Bases", icon: CakeSlice, qty: "60 pcs", batch: "DST-2401", status: "planned", yield: 95, cost: 4200, expiry: "3 days", progress: 0 },
]

const STATUS_META = {
  planned: { label: "Planned", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  in_progress: { label: "In Progress", cls: "bg-chart-4/15 text-chart-4", dot: "bg-chart-4" },
  ready: { label: "Ready", cls: "bg-chart-3/15 text-chart-3", dot: "bg-chart-3" },
}

export function Production() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data, loading } = useFetch<DData>(`/api/dashboard${branchParam}`, {})

  const waste = 3.8
  const totalCost = BATCHES.reduce((s, b) => s + b.cost, 0)
  const ready = BATCHES.filter((b) => b.status === "ready").length
  const inProg = BATCHES.filter((b) => b.status === "in_progress").length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={Cog} label="Active Batches" value={BATCHES.length} sub={`${inProg} in progress`} color="var(--chart-4)" />
        <Tile icon={CheckCircle2} label="Ready Today" value={ready} sub="batches completed" color="var(--chart-3)" />
        <Tile icon={Droplet} label="Production Cost" value={formatPKR(totalCost)} sub="today's batches" color="var(--chart-1)" />
        <Tile icon={TrendingDown} label="Waste Rate" value={`${waste}%`} sub="target < 5%" color="var(--chart-2)" />
      </div>

      {/* Production batches */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Daily Production Plan</h3>
            <p className="text-[11px] text-muted-foreground">Batch tracking · yield · expiry · cost</p>
          </div>
          <Button size="sm" onClick={() => toast.info("New production batch")}>
            <Cog className="h-3.5 w-3.5 mr-1" /> New Batch
          </Button>
        </div>
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {BATCHES.map((b) => {
            const Icon = b.icon
            const m = STATUS_META[b.status]
            return (
              <div key={b.id} className={cn(
                "rounded-xl border-2 p-3 transition-all hover:shadow-md",
                b.status === "in_progress" ? "border-chart-4/50 bg-chart-4/5" : b.status === "ready" ? "border-chart-3/50 bg-chart-3/5" : "border-border"
              )}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="grid place-items-center h-9 w-9 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight">{b.item}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{b.batch}</div>
                    </div>
                  </div>
                  <Badge className={cn("text-[9px]", m.cls)}><span className={cn("h-1.5 w-1.5 rounded-full mr-0.5", m.dot)} />{m.label}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-2 text-center">
                  <div className="rounded bg-muted/40 py-1.5">
                    <div className="text-[9px] text-muted-foreground uppercase">Qty</div>
                    <div className="text-[11px] font-bold">{b.qty}</div>
                  </div>
                  <div className="rounded bg-muted/40 py-1.5">
                    <div className="text-[9px] text-muted-foreground uppercase">Yield</div>
                    <div className="text-[11px] font-bold text-chart-3">{b.yield}%</div>
                  </div>
                  <div className="rounded bg-muted/40 py-1.5">
                    <div className="text-[9px] text-muted-foreground uppercase">Expiry</div>
                    <div className="text-[11px] font-bold">{b.expiry}</div>
                  </div>
                </div>
                {b.status === "in_progress" && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />Progress</span>
                      <span className="font-bold">{b.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-chart-4 transition-all" style={{ width: `${b.progress}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-[11px] text-muted-foreground">Cost: <span className="font-bold text-foreground">{formatPKR(b.cost)}</span></span>
                  {b.status === "planned" && (
                    <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => toast.success(`Started batch ${b.batch}`)}>
                      Start
                    </Button>
                  )}
                  {b.status === "in_progress" && (
                    <Button size="sm" className="h-7 text-[10px]" onClick={() => toast.success(`Batch ${b.batch} marked ready`)}>
                      Mark Ready
                    </Button>
                  )}
                  {b.status === "ready" && (
                    <Badge variant="outline" className="text-[9px] text-chart-3"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Stored</Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Raw material consumption + waste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-bold text-sm">Raw Material Consumption (Today)</h3>
            <p className="text-[11px] text-muted-foreground">Auto-deducted from inventory on sale</p>
          </div>
          <div className="p-3">
            {loading && <Skeleton className="h-40 rounded-lg" />}
            {!loading && data && (
              <div className="space-y-2">
                {data.inventory.slice(0, 8).map((i) => {
                  const consumed = Math.round(i.minStock * 1.4)
                  const ratio = Math.min(100, Math.round((consumed / (i.quantity + consumed)) * 100))
                  return (
                    <div key={i.id} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-32 truncate">{i.name}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary/70" style={{ width: `${ratio}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-16 text-right">{consumed}{i.unit} / {Math.round(i.quantity + consumed)}{i.unit}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-chart-4" />
            <h3 className="font-bold text-sm">Waste Analysis</h3>
          </div>
          <div className="p-4 space-y-2">
            {[
              { item: "Dough scraps", pct: 1.2, amt: "1.4 kg" },
              { item: "Vegetable trimmings", pct: 0.8, amt: "2.1 kg" },
              { item: "Over-cooked pizza", pct: 0.6, amt: "3 pcs" },
              { item: "Expired sauce", pct: 1.2, amt: "1.8 L" },
            ].map((w) => (
              <div key={w.item} className="flex items-center justify-between text-xs">
                <span className="flex-1 truncate">{w.item}</span>
                <span className="text-muted-foreground mr-2">{w.amt}</span>
                <Badge variant="outline" className="text-[9px]">{w.pct}%</Badge>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t flex items-center justify-between">
              <span className="text-xs font-bold">Total waste today</span>
              <span className="text-sm font-extrabold text-chart-4">{formatPKR(4200)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, color }: { icon: typeof Cog; label: string; value: string | number; sub: string; color: string }) {
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
