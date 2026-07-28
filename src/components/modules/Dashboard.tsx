"use client"

import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { KpiCard, SectionCard, StatusBadge } from "@/components/shared/ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, ArrowRight } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatPKR } from "@/lib/data"
import { motion } from "framer-motion"

interface DashboardData {
  kpis: {
    todaysSales: number
    todaysOrders: number
    avgOrder: number
    foodCost: number
    grossProfit: number
    activeOrders: number
    totalCustomers: number
    presentStaff: number
    occupancyPct: number
    lowStockCount: number
  }
  hourly: { hour: string; sales: number; orders: number }[]
  activeOrders: any[]
  stationLoad: Record<string, number>
  topProducts: { name: string; qty: number; revenue: number }[]
  orderTypes: { name: string; value: number }[]
  branchStats: any[]
  lowStock: any[]
  expiringSoon: any[]
  customers: any[]
}

const STATION_LABELS: Record<string, string> = {
  pizza: "Pizza",
  burger: "Burger",
  fry: "Fry",
  grill: "Grill",
  drinks: "Drinks",
  dessert: "Dessert",
}
const STATION_COLORS: Record<string, string> = {
  pizza: "var(--chart-1)",
  burger: "var(--chart-4)",
  fry: "var(--chart-2)",
  grill: "var(--chart-3)",
  drinks: "var(--chart-3)",
  dessert: "var(--chart-5)",
}

export function Dashboard() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data, loading } = useFetch<DashboardData>(`/api/dashboard${branchParam}`, { intervalMs: 20000 })

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[110px] rounded-xl" />)}
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    )
  }

  const d = data!
  const orderTypeColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

  return (
    <div className="space-y-4">
      {/* KPI Row — show 3 key KPIs on mobile, all 5 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiCard label="Today's Sales" value={formatPKR(d.kpis.todaysSales)} sub={`${d.kpis.todaysOrders} orders`} icon={ArrowRight} accent="primary" trend={{ value: "+12.4%", up: true }} loading={loading} />
        <KpiCard label="Active Orders" value={d.kpis.activeOrders} sub="In kitchen & delivery" icon={ArrowRight} accent="chart-4" loading={loading} />
        <KpiCard label="Gross Profit" value={formatPKR(d.kpis.grossProfit)} sub={`Food cost ${formatPKR(d.kpis.foodCost)}`} icon={ArrowRight} accent="chart-3" trend={{ value: "+8.1%", up: true }} loading={loading} />
        <KpiCard label="Avg Order Value" value={formatPKR(d.kpis.avgOrder)} sub={`${d.kpis.totalCustomers} customers`} icon={ArrowRight} accent="chart-2" trend={{ value: "+3.2%", up: true }} loading={loading} className="hidden md:flex" />
        <KpiCard label="Dine-in Occupancy" value={`${d.kpis.occupancyPct}%`} sub={`${d.kpis.presentStaff} staff on shift`} icon={ArrowRight} accent="chart-5" loading={loading} className="hidden md:flex" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly sales */}
        <SectionCard
          title="Hourly Sales & Order Volume"
          description="Last 24 hours · live"
          className="lg:col-span-2"
          action={<Badge variant="secondary" className="text-[10px]">Rs</Badge>}
        >
          <div className="h-[260px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.hourly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" interval={2} />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v >= 1000 ? (v / 1000).toFixed(0) + "k" : String(v)} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, n: string) => (n === "sales" ? formatPKR(v) : v)}
                />
                <Area type="monotone" dataKey="sales" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#salesFill)" />
                <Area type="monotone" dataKey="orders" stroke="var(--chart-2)" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Order types — hidden on mobile */}
        <SectionCard title="Order Channels" description="Dine-in / takeaway / delivery / drive-thru" className="hidden lg:block">
          <div className="h-[260px] p-4 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={d.orderTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {d.orderTypes.map((_, i) => (
                    <Cell key={i} fill={orderTypeColors[i % orderTypeColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-4 pb-4 grid grid-cols-2 gap-1.5">
            {d.orderTypes.map((t, i) => (
              <div key={t.name} className="flex items-center gap-2 text-[11px]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: orderTypeColors[i % orderTypeColors.length] }} />
                <span className="capitalize flex-1">{t.name.replace("_", "-")}</span>
                <span className="font-bold">{t.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Live orders + kitchen status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Live Orders"
          description="Active across kitchen & delivery"
          className="lg:col-span-2"
          action={<Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setActiveModule("kds")}>Open KDS <ArrowRight className="h-3 w-3 ml-1" /></Button>}
        >
          <div className="max-h-[340px] overflow-y-auto pf-scroll divide-y">
            {d.activeOrders.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No active orders right now.</div>
            )}
            {d.activeOrders.map((o) => {
              const minsAgo = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000)
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40"
                >
                  <div className="grid place-items-center h-9 w-9 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
                    #{o.number}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{o.items[0]?.name ?? "Order"}</span>
                      {o.items.length > 1 && <Badge variant="outline" className="text-[9px]">+{o.items.length - 1}</Badge>}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      <span className="capitalize">{o.type.replace("_", "-")}</span>
                      {o.table ? ` · ${o.table}` : ""} · {o.branch?.name ?? ""}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold">{formatPKR(o.total)}</div>
                    <div className="text-[10px] text-muted-foreground">{minsAgo}m ago</div>
                  </div>
                  <StatusBadge status={o.status} />
                </motion.div>
              )
            })}
          </div>
        </SectionCard>

        {/* Kitchen station load */}
        <SectionCard title="Kitchen Stations" description="Active load by station" action={<Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setActiveModule("kds")}>KDS <ArrowRight className="h-3 w-3 ml-1" /></Button>}>
          <div className="h-[260px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(d.stationLoad).map(([k, v]) => ({ station: STATION_LABELS[k] ?? k, orders: v }))} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                <YAxis type="category" dataKey="station" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={64} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="orders" radius={[0, 6, 6, 0]} barSize={20}>
                  {Object.entries(d.stationLoad).map(([k]) => (
                    <Cell key={k} fill={STATION_COLORS[k] ?? "var(--chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Top products + AI insight strip + alerts — hidden on mobile */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Top Sellers" description="Best selling items today">
          <div className="p-2">
            {d.topProducts.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No sales yet.</div>}
            {d.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/40">
                <span className="grid place-items-center h-7 w-7 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">{i + 1}</span>
                <span className="font-medium text-sm flex-1 truncate">{p.name}</span>
                <span className="text-xs text-muted-foreground">{p.qty} sold</span>
                <span className="text-sm font-bold w-20 text-right">{formatPKR(p.revenue)}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Inventory Alerts" description={`${d.lowStock.length} items below minimum`} action={<Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setActiveModule("inventory")}>Open <ArrowRight className="h-3 w-3 ml-1" /></Button>}>
          <div className="max-h-[260px] overflow-y-auto pf-scroll p-2">
            {d.lowStock.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">All stock levels healthy.</div>}
            {d.lowStock.slice(0, 8).map((i) => {
              const ratio = i.minStock > 0 ? i.quantity / i.minStock : 0
              const critical = ratio < 0.6
              return (
                <div key={i.id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/40">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${critical ? "bg-destructive" : "bg-chart-4"}`} />
                  <span className="text-sm font-medium flex-1 truncate">{i.name}</span>
                  <span className="text-[10px] text-muted-foreground">{i.branch?.name.split(" ")[0]}</span>
                  <Badge variant={critical ? "destructive" : "secondary"} className="text-[10px]">{i.quantity}{i.unit}</Badge>
                </div>
              )
            })}
          </div>
        </SectionCard>

        {/* AI Insight teaser */}
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-chart-2/5 to-chart-3/5 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm">FusionFlow AI</div>
              <div className="text-[11px] text-muted-foreground">Predictive intelligence</div>
            </div>
          </div>
          <ul className="space-y-2 text-[12px] flex-1">
            <li className="flex gap-2"><span className="text-primary">›</span> Pepperoni Supreme projected to sell 40% more during 7–9 PM peak.</li>
            <li className="flex gap-2"><span className="text-primary">›</span> Mozzarella stock at {d.lowStock.find(x => x.name.includes("Cheese"))?.quantity ?? 28}kg — auto-reorder triggered.</li>
            <li className="flex gap-2"><span className="text-primary">›</span> Recommend dynamic pricing: 15% off slow-moving Hawaiian until 5 PM.</li>
          </ul>
          <Button size="sm" className="mt-4 w-full" onClick={() => setActiveModule("ai")}>
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Open AI Insights
          </Button>
        </div>
      </div>
    </div>
  )
}
