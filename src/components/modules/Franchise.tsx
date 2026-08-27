"use client"

import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPKR } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Store, Crown, TrendingUp, MapPin, Award, Star, ShieldCheck, Network, Building2 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"

interface FData {
  branchStats: any[]
}

const TYPE_ICON: Record<string, string> = {
  restaurant: "🏪", cloud_kitchen: "☁️", food_court: "🍜", drive_thru: "🚗", food_truck: "🚚",
}

export function Franchise() {
  const { data, loading } = useFetch<FData>("/api/dashboard", { intervalMs: 30000 })

  if (loading && !data) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
  }

  if (!data || !data.branchStats) {
    return <div className="grid place-items-center min-h-[40vh] text-sm text-muted-foreground">Unable to load franchise data</div>
  }

  const branches = data.branchStats || []
  const totalSales = branches.reduce((s, b) => s + b.sales, 0)
  const totalOrders = branches.reduce((s, b) => s + b.orders, 0)
  const openCount = branches.filter((b) => b.isOpen).length
  const brands = Array.from(new Set(branches.map((b) => b.brand)))

  const ranked = [...branches].sort((a, b) => b.sales - a.sales)
  const chartData = ranked.map((b) => ({ name: b.name.split(" ").slice(0, 2).join(" "), sales: b.sales, orders: b.orders }))

  return (
    <div className="space-y-4">
      {/* Network stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <NetTile icon={Network} label="Total Branches" value={branches.length} sub={`${openCount} open now`} color="var(--chart-1)" />
        <NetTile icon={Building2} label="Brands" value={brands.length} sub={brands.join(" · ")} color="var(--chart-2)" />
        <NetTile icon={TrendingUp} label="Network Sales" value={formatPKR(totalSales)} sub="last 24h" color="var(--chart-3)" />
        <NetTile icon={Crown} label="Top Franchisee" value={ranked[0]?.name.split(" ")[0] ?? "—"} sub={formatPKR(ranked[0]?.sales ?? 0)} color="var(--chart-5)" />
      </div>

      {/* Branch comparison chart */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Branch Sales Comparison</h3>
            <p className="text-[11px] text-muted-foreground">Revenue ranking across franchise network</p>
          </div>
          <Badge variant="secondary" className="text-[10px]">24h</Badge>
        </div>
        <div className="h-[300px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v >= 1000 ? (v / 1000).toFixed(0) + "k" : String(v)} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]} barSize={36}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "var(--chart-3)" : i === chartData.length - 1 ? "var(--chart-4)" : "var(--chart-1)"} fillOpacity={1 - i * 0.1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Branch cards grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-bold text-sm">Franchise Network</h3>
          <Badge variant="secondary" className="text-[10px]">{branches.length} outlets</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ranked.map((b, i) => (
            <Card key={b.id} className={cn("overflow-hidden hover:shadow-md transition-shadow", !b.isOpen && "opacity-60")}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">{TYPE_ICON[b.type] ?? "🏪"}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate flex items-center gap-1">
                        {b.name}
                        {i === 0 && <Crown className="h-3.5 w-3.5 text-chart-2 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{b.brand}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] capitalize shrink-0">{b.type.replace("_", " ")}</Badge>
                </div>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.city}</span>
                  <span className="flex items-center gap-1"><Store className="h-3 w-3" />{b.franchisee ?? "Corporate"}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <Metric label="Sales" value={formatPKR(b.sales)} />
                  <Metric label="Orders" value={b.orders} />
                  <Metric label="AOV" value={formatPKR(b.avg)} />
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", b.isOpen ? "bg-chart-3" : "bg-muted-foreground/40")} />
                    <span className="text-[10px] font-medium capitalize">{b.status}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-chart-3" />
                    Royalty {b.royaltyPct}%
                  </div>
                </div>
              </div>
              {i < 3 && (
                <div className={cn("px-4 py-1.5 text-[10px] font-bold flex items-center gap-1",
                  i === 0 ? "bg-chart-2/15 text-chart-2" : i === 1 ? "bg-muted-foreground/15 text-muted-foreground" : "bg-chart-4/15 text-chart-4"
                )}>
                  <Award className="h-3 w-3" /> Rank #{i + 1} · Top Performer
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Compliance summary */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30">
          <h3 className="font-bold text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-chart-3" /> Brand Compliance & Royalties</h3>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Compliance label="Menu Sync" value="98%" good />
          <Compliance label="Pricing Compliance" value="94%" good />
          <Compliance label="Royalty Collected" value={formatPKR(branches.reduce((s, b) => s + b.sales * b.royaltyPct / 100, 0))} good />
          <Compliance label="Audits Pending" value="2" warn />
        </div>
      </Card>
    </div>
  )
}

function NetTile({ icon: Icon, label, value, sub, color }: { icon: typeof Store; label: string; value: string | number; sub: string; color: string }) {
  return (
    <Card>
      <div className="p-4 flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase">{label}</div>
          <div className="text-lg font-extrabold truncate">{value}</div>
          <div className="text-[10px] text-muted-foreground truncate">{sub}</div>
        </div>
      </div>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2">
      <div className="text-[9px] text-muted-foreground uppercase font-semibold">{label}</div>
      <div className="text-xs font-bold truncate">{value}</div>
    </div>
  )
}

function Compliance({ label, value, good, warn }: { label: string; value: string | number; good?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</div>
      <div className="text-lg font-extrabold">{value}</div>
      <div className={cn("text-[10px] font-semibold", good ? "text-chart-3" : warn ? "text-chart-4" : "text-muted-foreground")}>
        {good ? "✓ Healthy" : warn ? "⚠ Action needed" : "—"}
      </div>
    </div>
  )
}
