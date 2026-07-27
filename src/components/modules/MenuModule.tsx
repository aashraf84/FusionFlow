"use client"

import { useState } from "react"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPKR } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Pizza, Sandwich, Drumstick, Soup, GlassWater, CakeSlice, Package, Search, Flame, Clock, TrendingUp, Plus } from "lucide-react"
import { toast } from "sonner"

const CATEGORY_ICONS: Record<string, typeof Pizza> = {
  pizza: Pizza, burger: Sandwich, chicken: Drumstick, sides: Soup, drinks: GlassWater, desserts: CakeSlice, combos: Package,
}

export function MenuModule() {
  const { data } = useFetch<{ products: any[]; categories: string[] }>("/api/menu", {})
  const [activeCat, setActiveCat] = useState("pizza")
  const [search, setSearch] = useState("")

  const products = (data?.products ?? []).filter((p) => {
    if (search) return p.name.toLowerCase().includes(search.toLowerCase())
    return p.category === activeCat
  })

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu…" className="pl-9" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pf-scroll">
          {(data?.categories ?? ["pizza", "burger", "chicken", "sides", "drinks", "desserts", "combos"]).map((c) => {
            const Icon = CATEGORY_ICONS[c] ?? Package
            return (
              <button
                key={c}
                onClick={() => { setActiveCat(c); setSearch("") }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                  activeCat === c && !search ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted"
                )}
              >
                <Icon className="h-3.5 w-3.5" /> <span className="capitalize">{c}</span>
              </button>
            )
          })}
        </div>
        <Button onClick={() => toast.info("New product wizard")}>
          <Plus className="h-4 w-4 mr-1.5" /> New Product
        </Button>
      </div>

      {/* Product cards with recipe costing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {products.map((p) => {
          const Icon = CATEGORY_ICONS[p.category] ?? Package
          const margin = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0
          const foodCostPct = p.price > 0 ? Math.round((p.cost / p.price) * 100) : 0
          return (
            <Card key={p.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-chart-2/10 grid place-items-center relative">
                <Icon className="h-10 w-10 text-primary/70" />
                {p.popular && <Badge className="absolute top-2 left-2 bg-chart-2 text-black text-[9px]">POPULAR</Badge>}
                <Badge variant="outline" className="absolute top-2 right-2 text-[9px] bg-background capitalize">{p.station}</Badge>
              </div>
              <div className="p-3">
                <div className="font-bold text-sm leading-tight line-clamp-1">{p.name}</div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 min-h-[28px]">{p.description}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{p.prepTime}m</span>
                  {p.calories && <span className="flex items-center gap-0.5"><Flame className="h-3 w-3" />{p.calories}cal</span>}
                </div>
                {/* Recipe costing bar */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Food cost {foodCostPct}%</span>
                    <span className="font-bold text-chart-3">Margin {margin}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
                    <div className="bg-destructive/70" style={{ width: `${foodCostPct}%` }} />
                    <div className="bg-chart-3" style={{ width: `${margin}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Sell · Cost</div>
                    <div className="text-xs font-bold">{formatPKR(p.price)} <span className="text-muted-foreground font-normal">/ {formatPKR(p.cost)}</span></div>
                  </div>
                  <Badge variant={margin > 60 ? "default" : margin > 45 ? "secondary" : "outline"} className="text-[9px]">
                    <TrendingUp className="h-2.5 w-2.5 mr-0.5" />{margin > 60 ? "Healthy" : margin > 45 ? "OK" : "Review"}
                  </Badge>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
