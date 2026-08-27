"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPKR } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Boxes, AlertTriangle, Calendar, Package, Search, TrendingDown, Truck, CheckCircle2 } from "lucide-react"
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface InvData {
  inventory: any[]
  lowStock: any[]
  expiringSoon: any[]
}

const CAT_COLORS: Record<string, string> = {
  raw: "var(--chart-1)",
  semi_finished: "var(--chart-4)",
  finished: "var(--chart-3)",
  packaging: "var(--chart-2)",
}

export function Inventory() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data, loading } = useFetch<InvData>(`/api/dashboard${branchParam}`, { intervalMs: 30000 })
  const [cat, setCat] = useState("all")
  const [search, setSearch] = useState("")

  if (loading && !data) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
  }

  if (!data || !data.inventory) {
    return (
      <div className="grid place-items-center min-h-[40vh] text-center">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground">Unable to load inventory data</div>
        </div>
      </div>
    )
  }

  const d = data
  const items = (d.inventory || []).filter((i) => {
    if (cat !== "all" && i.category !== cat) return false
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalValue = d.inventory.reduce((s, i) => s + i.quantity * i.cost, 0)
  const lowCount = d.lowStock.length
  const expCount = d.expiringSoon.length

  // category value breakdown
  const catValues = ["raw", "semi_finished", "finished", "packaging"].map((c) => ({
    name: c.replace("_", " "),
    value: Math.round(d.inventory.filter((i) => i.category === c).reduce((s, i) => s + i.quantity * i.cost, 0)),
  }))

  return (
    <div className="space-y-4">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={Boxes} label="Inventory Value" value={formatPKR(totalValue)} sub={`${d.inventory.length} SKUs`} color="var(--chart-1)" />
        <Tile icon={AlertTriangle} label="Low Stock" value={lowCount} sub="below minimum" color="var(--destructive)" />
        <Tile icon={Calendar} label="Expiring Soon" value={expCount} sub="within 4 days" color="var(--chart-4)" />
        <Tile icon={Truck} label="Auto-Reorder" value={lowCount} sub="POs suggested" color="var(--chart-2)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category value chart */}
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-bold text-sm">Value by Category</h3>
          </div>
          <div className="h-[200px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catValues} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v >= 1000 ? (v / 1000).toFixed(0) + "k" : String(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, textTransform: "capitalize" }} stroke="var(--muted-foreground)" width={80} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                  {catValues.map((c, i) => <Cell key={i} fill={CAT_COLORS[["raw", "semi_finished", "finished", "packaging"][i]]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expiring soon */}
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-chart-4" />
            <h3 className="font-bold text-sm">Expiring Soon (FEFO)</h3>
          </div>
          <div className="max-h-[200px] overflow-y-auto pf-scroll p-2">
            {d.expiringSoon.length === 0 && <div className="p-6 text-center text-xs text-muted-foreground">Nothing expiring soon.</div>}
            {d.expiringSoon.map((i) => {
              const days = Math.ceil((new Date(i.expiry).getTime() - Date.now()) / 86400000)
              return (
                <div key={i.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40">
                  <span className="h-2 w-2 rounded-full bg-chart-4 shrink-0" />
                  <span className="text-sm font-medium flex-1 truncate">{i.name}</span>
                  <span className="text-[10px] text-muted-foreground">{i.batchNo}</span>
                  <Badge variant={days <= 1 ? "destructive" : "secondary"} className="text-[9px]">{days}d</Badge>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Low stock reorder */}
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <h3 className="font-bold text-sm">Reorder Suggestions</h3>
          </div>
          <div className="max-h-[200px] overflow-y-auto pf-scroll p-2">
            {d.lowStock.length === 0 && <div className="p-6 text-center text-xs text-muted-foreground"><CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-chart-3" />All healthy</div>}
            {d.lowStock.slice(0, 10).map((i) => (
              <div key={i.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40">
                <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium flex-1 truncate">{i.name}</span>
                <span className="text-[10px] text-muted-foreground">{i.quantity}{i.unit}/{i.minStock}{i.unit}</span>
                <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]">Reorder</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Full inventory table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-2">
          <h3 className="font-bold text-sm">Stock Items · Batch & Expiry Tracking</h3>
          <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="h-8 w-40 pl-8 text-xs" />
            </div>
            <div className="flex items-center gap-1">
              {["all", "raw", "semi_finished", "finished", "packaging"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-semibold capitalize transition-colors",
                    cat === c ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted"
                  )}
                >
                  {c.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto pf-scroll">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground sticky top-0">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Item</th>
                <th className="text-left px-4 py-2 font-semibold hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Branch</th>
                <th className="text-left px-4 py-2 font-semibold">Quantity</th>
                <th className="text-left px-4 py-2 font-semibold hidden lg:table-cell">Batch</th>
                <th className="text-left px-4 py-2 font-semibold hidden lg:table-cell">Expiry</th>
                <th className="text-right px-4 py-2 font-semibold">Value</th>
                <th className="px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((i) => {
                const ratio = i.minStock > 0 ? i.quantity / i.minStock : 1
                const low = ratio <= 1
                const critical = ratio < 0.6
                const days = i.expiry ? Math.ceil((new Date(i.expiry).getTime() - Date.now()) / 86400000) : null
                return (
                  <tr key={i.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-xs">{i.name}</div>
                      <div className="text-[10px] text-muted-foreground">{i.cost}/unit</div>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium">
                        <span className="h-2 w-2 rounded-full" style={{ background: CAT_COLORS[i.category] }} />
                        <span className="capitalize">{i.category.replace("_", " ")}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">{i.branch?.name}</td>
                    <td className="px-4 py-2.5">
                      <div className="text-xs font-bold">{i.quantity}{i.unit}</div>
                      <div className="h-1 w-16 rounded-full bg-muted mt-1 overflow-hidden">
                        <div className={cn("h-full", critical ? "bg-destructive" : low ? "bg-chart-4" : "bg-chart-3")} style={{ width: `${Math.min(100, ratio * 60)}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell text-xs font-mono">{i.batchNo}</td>
                    <td className="px-4 py-2.5 hidden lg:table-cell text-xs">
                      {days !== null ? (
                        <span className={cn(days <= 3 && "text-destructive font-semibold")}>{days}d</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs font-bold">{formatPKR(i.quantity * i.cost)}</td>
                    <td className="px-4 py-2.5">
                      {critical ? <Badge variant="destructive" className="text-[9px]">Critical</Badge> : low ? <Badge className="text-[9px] bg-chart-4/15 text-chart-4">Low</Badge> : <Badge variant="secondary" className="text-[9px] bg-chart-3/15 text-chart-3">OK</Badge>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, color }: { icon: typeof Boxes; label: string; value: string | number; sub: string; color: string }) {
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
