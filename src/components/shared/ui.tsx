"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  accent = "primary",
  loading,
}: {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  trend?: { value: string; up: boolean }
  accent?: "primary" | "chart-2" | "chart-3" | "chart-4" | "chart-5"
  loading?: boolean
}) {
  const accentMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    "chart-2": "bg-chart-2/15 text-chart-2",
    "chart-3": "bg-chart-3/15 text-chart-3",
    "chart-4": "bg-chart-4/15 text-chart-4",
    "chart-5": "bg-chart-5/15 text-chart-5",
  }
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight truncate">{value}</div>
            {sub && <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</div>}
          </div>
          <div className={cn("grid place-items-center h-10 w-10 rounded-xl shrink-0", accentMap[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px]">
            <span className={cn("inline-flex items-center gap-0.5 font-bold", trend.up ? "text-chart-3" : "text-destructive")}>
              {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}
            </span>
            <span className="text-muted-foreground">vs yesterday</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-2 px-4 lg:px-5 py-3 border-b bg-muted/30">
        <div className="min-w-0">
          <h3 className="font-bold text-sm">{title}</h3>
          {description && <p className="text-[11px] text-muted-foreground truncate">{description}</p>}
        </div>
        {action}
      </div>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}

export function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-muted-foreground",
    preparing: "bg-chart-4",
    ready: "bg-chart-3",
    dispatched: "bg-chart-2",
    delivered: "bg-chart-3/60",
    cancelled: "bg-destructive",
  }
  return <span className={cn("inline-block h-2 w-2 rounded-full", map[status] ?? "bg-muted-foreground")} />
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
    preparing: { label: "Preparing", cls: "bg-chart-4/15 text-chart-4" },
    ready: { label: "Ready", cls: "bg-chart-3/15 text-chart-3" },
    dispatched: { label: "Dispatched", cls: "bg-chart-2/15 text-chart-2" },
    delivered: { label: "Delivered", cls: "bg-chart-3/10 text-chart-3" },
    cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive" },
  }
  const s = map[status] ?? map.pending
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", s.cls)}><StatusDot status={status} />{s.label}</span>
}
