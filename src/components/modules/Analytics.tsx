"use client"

import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/shared/ui"
import { formatPKR } from "@/lib/data"
import { TrendingUp, DollarSign, ShoppingBag, Users, Flame, Bike, ChefHat, Percent } from "lucide-react"
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"

interface AData {
  hourly: { hour: string; sales: number; orders: number }[]
  topProducts: { name: string; qty: number; revenue: number }[]
  orderTypes: { name: string; value: number }[]
  branchStats: any[]
  kpis: any
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function Analytics() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data, loading, error, refresh } = useFetch<AData>(`/api/dashboard${branchParam}`, {})

  if (loading && !data) {
    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
  }
  if (!data || !data.kpis) {
    return <ErrorState title="Unable to load analytics data" error={error} onRetry={refresh} />
  }
  const d = data

  // synthesize 7-day trend from hourly
  const weekly = DAYS.map((day, i) => ({
    day,
    sales: Math.round(d.kpis.todaysSales * (0.7 + Math.sin(i * 0.9) * 0.25 + i * 0.03)),
    orders: Math.round(d.kpis.todaysOrders * (0.7 + Math.cos(i * 0.7) * 0.2)),
  }))

  // kitchen performance radar
  const kitchenPerf = [
    { metric: "Speed", value: 86 },
    { metric: "Accuracy", value: 94 },
    { metric: "Hygiene", value: 91 },
    { metric: "Waste Ctrl", value: 72 },
    { metric: "Throughput", value: 80 },
    { metric: "Quality", value: 88 },
  ]

  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI icon={DollarSign} label="Revenue (24h)" value={formatPKR(d.kpis.todaysSales)} delta="+12.4%" color="var(--chart-1)" />
        <KPI icon={ShoppingBag} label="Orders (24h)" value={d.kpis.todaysOrders} delta="+8.1%" color="var(--chart-2)" />
        <KPI icon={Users} label="AOV" value={formatPKR(d.kpis.avgOrder)} delta="+3.2%" color="var(--chart-3)" />
        <KPI icon={Percent} label="Food Cost %" value={`${Math.round((d.kpis.foodCost / Math.max(d.kpis.todaysSales, 1)) * 100)}%`} delta="-1.1%" color="var(--chart-4)" down />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly trend */}
        <Card className="overflow-hidden">
          <Header title="Weekly Sales Trend" desc="Last 7 days" />
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="wk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v >= 1000 ? (v / 1000).toFixed(0) + "k" : String(v)} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                <Area type="monotone" dataKey="sales" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#wk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Hourly order volume */}
        <Card className="overflow-hidden">
          <Header title="Hourly Order Volume" desc="Today" />
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" interval={2} />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="orders" stroke="var(--chart-2)" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top products */}
        <Card className="overflow-hidden">
          <Header title="Top Products by Revenue" desc="Best performers" />
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.topProducts} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v >= 1000 ? (v / 1000).toFixed(0) + "k" : String(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" width={90} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={16}>
                  {d.topProducts.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Kitchen performance radar */}
        <Card className="overflow-hidden">
          <Header title="Kitchen Performance Index" desc="Multi-dimensional score" />
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={kitchenPerf}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Radar dataKey="value" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Performance metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <PerfCard icon={Flame} label="Avg Prep Time" value="11.4m" target="<12m" good />
        <PerfCard icon={Bike} label="Delivery Time" value="27m" target="<30m" good />
        <PerfCard icon={ChefHat} label="Waste Rate" value="3.8%" target="<5%" good />
        <PerfCard icon={Users} label="Retention" value="68%" target=">65%" good />
      </div>
    </div>
  )
}

function Header({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="px-4 py-3 border-b bg-muted/30">
      <h3 className="font-bold text-sm">{title}</h3>
      <p className="text-[11px] text-muted-foreground">{desc}</p>
    </div>
  )
}

function KPI({ icon: Icon, label, value, delta, color, down }: { icon: typeof DollarSign; label: string; value: string | number; delta: string; color: string; down?: boolean }) {
  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="grid place-items-center h-9 w-9 rounded-lg" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <Badge variant="secondary" className={cn("text-[10px]", down ? "text-chart-3" : "text-chart-3")}>
            <TrendingUp className={cn("h-2.5 w-2.5 mr-0.5", down && "rotate-180")} />{delta}
          </Badge>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground font-semibold uppercase">{label}</div>
        <div className="text-xl font-extrabold">{value}</div>
      </div>
    </Card>
  )
}

function PerfCard({ icon: Icon, label, value, target, good }: { icon: typeof Flame; label: string; value: string; target: string; good: boolean }) {
  return (
    <Card>
      <div className="p-4 flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-chart-3/15 text-chart-3 shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase">{label}</div>
          <div className="text-lg font-extrabold">{value}</div>
          <div className="text-[10px] text-muted-foreground">Target {target} · {good ? "✓ On track" : "⚠ Review"}</div>
        </div>
      </div>
    </Card>
  )
}

