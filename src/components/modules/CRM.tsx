"use client"

import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { formatPKR } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Search, Phone, Mail, MapPin, Cake, Star, Award, Gift, TrendingUp, Users } from "lucide-react"

const TIER_STYLE: Record<string, string> = {
  Platinum: "bg-gradient-to-r from-slate-300 to-slate-500 text-slate-900",
  Gold: "bg-gradient-to-r from-amber-300 to-yellow-500 text-amber-950",
  Silver: "bg-gradient-to-r from-zinc-200 to-zinc-400 text-zinc-900",
  Bronze: "bg-gradient-to-r from-orange-300 to-amber-600 text-orange-950",
}

export function CRM() {
  const { data } = useFetch<{ customers: any[] }>("/api/customers", {})
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string | null>(null)

  const customers = data?.customers ?? []
  const filtered = customers.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
  const current = customers.find((c) => c.id === selected) ?? filtered[0]

  // Aggregate
  const totalLoyalty = customers.reduce((s, c) => s + c.loyaltyPoints, 0)
  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0)
  const platinum = customers.filter((c) => c.tier === "Platinum").length

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={Users} label="Total Customers" value={customers.length} color="var(--chart-1)" />
        <Tile icon={Star} label="Loyalty Points" value={totalLoyalty.toLocaleString()} color="var(--chart-2)" />
        <Tile icon={TrendingUp} label="Lifetime Value" value={formatPKR(totalSpent)} color="var(--chart-3)" />
        <Tile icon={Award} label="Platinum Members" value={platinum} color="var(--chart-5)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Customer list */}
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <h3 className="font-bold text-sm">Customer Directory</h3>
            <div className="relative ml-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="h-8 w-48 pl-8 text-xs" />
            </div>
          </div>
          <div className="max-h-[560px] overflow-y-auto pf-scroll divide-y">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  current?.id === c.id ? "bg-primary/5" : "hover:bg-muted/40"
                )}
              >
                <div className="grid place-items-center h-9 w-9 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                  {c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{c.phone}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold">{formatPKR(c.totalSpent)}</div>
                  <div className="text-[10px] text-muted-foreground">{c.ordersCount} orders</div>
                </div>
                <Badge className={cn("text-[9px] shrink-0", TIER_STYLE[c.tier])}>{c.tier}</Badge>
              </button>
            ))}
          </div>
        </Card>

        {/* Customer detail */}
        {current && (
          <Card className="overflow-hidden">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-chart-2/10">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-14 w-14 rounded-full bg-primary text-primary-foreground font-bold">
                  {current.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-base truncate">{current.name}</div>
                  <Badge className={cn("text-[10px] mt-0.5", TIER_STYLE[current.tier])}>{current.tier} Member</Badge>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Info icon={Phone} label="Phone" value={current.phone} />
                <Info icon={Mail} label="Email" value={current.email ?? "—"} />
                <Info icon={MapPin} label="Address" value={current.address ?? "—"} />
                <Info icon={Cake} label="Birthday" value={current.birthday ?? "—"} />
              </div>

              <div className="rounded-xl bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold"><Gift className="h-3.5 w-3.5 text-chart-2" /> Loyalty Points</div>
                  <span className="text-lg font-extrabold text-chart-2">{current.loyaltyPoints.toLocaleString()}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-chart-2" style={{ width: `${Math.min(100, (current.loyaltyPoints / 6000) * 100)}%` }} />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{6000 - current.loyaltyPoints > 0 ? `${6000 - current.loyaltyPoints} pts to next reward` : "Reward unlocked!"}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Spent</div>
                  <div className="text-lg font-extrabold">{formatPKR(current.totalSpent)}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Orders</div>
                  <div className="text-lg font-extrabold">{current.ordersCount}</div>
                </div>
              </div>

              <div className="rounded-xl border p-3">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">Marketing Preferences</div>
                <div className="flex flex-wrap gap-1.5">
                  {["SMS", "Email", "WhatsApp", "Push"].map((ch) => (
                    <Badge key={ch} variant="secondary" className="text-[10px]">{ch}</Badge>
                  ))}
                </div>
              </div>

              {current.lastOrderAt && (
                <div className="text-[11px] text-muted-foreground">
                  Last order: {Math.floor((Date.now() - new Date(current.lastOrderAt).getTime()) / 86400000)} days ago
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function Tile({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color: string }) {
  return (
    <Card>
      <div className="p-4 flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase">{label}</div>
          <div className="text-xl font-extrabold">{value}</div>
        </div>
      </div>
    </Card>
  )
}

function Info({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</div>
        <div className="text-xs font-medium truncate">{value}</div>
      </div>
    </div>
  )
}
