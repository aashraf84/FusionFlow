"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Sparkles, Brain, TrendingUp, TrendingDown, Flame, Users, Percent,
  Megaphone, AlertTriangle, Clock, RefreshCw, Zap, Target, Activity,
} from "lucide-react"

interface Insight {
  executiveSummary: string
  bestSellers: { item: string; reason: string; trend: "up" | "stable" | "down" }[]
  slowMovers: { item: string; action: string }[]
  demandForecast: { item: string; expectedDemand: string; prepAdvice: string }[]
  staffing: { peakWindow: string; recommendation: string }[]
  wasteRisk: { item: string; risk: "low" | "medium" | "high"; advice: string }[]
  churnRisk: { customer: string; winback: string }[]
  dynamicPricing: { item: string; suggestion: string; expectedImpact: string }[]
  marketing: { campaign: string; channel: string; segment: string; expectedROI: string }[]
  confidenceScore: number
}

const RISK_STYLE: Record<string, string> = {
  low: "bg-chart-3/15 text-chart-3",
  medium: "bg-chart-4/15 text-chart-4",
  high: "bg-destructive/15 text-destructive",
}

export function AIInsights() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data, loading, error, refresh } = useFetch<{ ok: boolean; insights: Insight; context?: any }>(
    `/api/insights${branchParam}`,
    {}
  )
  const [regenerating, setRegenerating] = useState(false)

  const regenerate = async () => {
    setRegenerating(true)
    try {
      const res = await fetch(`/api/insights${branchParam}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Failed")
      refresh()
      toast.success("AI insights regenerated", { description: "Fresh predictions generated" })
    } catch (e) {
      toast.error("Regeneration failed", { description: e instanceof Error ? e.message : "" })
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10 p-6 flex items-center gap-4">
          <div className="grid place-items-center h-12 w-12 rounded-xl bg-primary text-primary-foreground animate-pulse">
            <Brain className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-3 w-72" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error || !data?.insights) {
    return (
      <div className="rounded-xl border-2 border-dashed p-12 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-chart-4" />
        <h3 className="font-bold mb-1">AI engine unavailable</h3>
        <p className="text-sm text-muted-foreground mb-4">{error ?? "Could not generate insights."}</p>
        <Button onClick={regenerate} disabled={regenerating}>
          <RefreshCw className={cn("h-4 w-4 mr-1.5", regenerating && "animate-spin")} /> Retry
        </Button>
      </div>
    )
  }

  const ins = data.insights

  return (
    <div className="space-y-4">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10 p-5">
        <div className="flex items-start gap-4">
          <div className="grid place-items-center h-12 w-12 rounded-xl bg-primary text-primary-foreground shadow-lg shrink-0">
            <Brain className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-lg">FusionFlow AI · Predictive Intelligence</h2>
              <Badge className="bg-primary"><Sparkles className="h-3 w-3 mr-1" />Live</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{ins.executiveSummary}</p>
            <div className="flex items-center gap-3 mt-2 text-[11px]">
              <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-chart-2" />Confidence <strong className="text-foreground">{ins.confidenceScore}%</strong></span>
              <span className="flex items-center gap-1"><Activity className="h-3 w-3 text-chart-3" />Model: FusionFlow-GPT</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={regenerate} disabled={regenerating} className="shrink-0">
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", regenerating && "animate-spin")} /> Regenerate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Best sellers */}
        <InsightCard icon={TrendingUp} title="Best Sellers Forecast" color="var(--chart-3)" count={ins.bestSellers.length}>
          {ins.bestSellers.map((b, i) => (
            <Row key={i} title={b.item} sub={b.reason}>
              <Badge variant="outline" className={cn("text-[9px]", b.trend === "up" ? "text-chart-3" : b.trend === "down" ? "text-destructive" : "text-muted-foreground")}>
                {b.trend === "up" ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : b.trend === "down" ? <TrendingDown className="h-2.5 w-2.5 mr-0.5" /> : <Activity className="h-2.5 w-2.5 mr-0.5" />}
                {b.trend}
              </Badge>
            </Row>
          ))}
        </InsightCard>

        {/* Slow movers */}
        <InsightCard icon={TrendingDown} title="Slow Movers & Actions" color="var(--chart-4)" count={ins.slowMovers.length}>
          {ins.slowMovers.map((s, i) => (
            <Row key={i} title={s.item} sub={s.action} />
          ))}
        </InsightCard>

        {/* Demand forecast */}
        <InsightCard icon={Flame} title="Demand Forecast & Prep" color="var(--chart-1)" count={ins.demandForecast.length}>
          {ins.demandForecast.map((d, i) => (
            <Row key={i} title={d.item} sub={`${d.expectedDemand} · ${d.prepAdvice}`} />
          ))}
        </InsightCard>

        {/* Staffing */}
        <InsightCard icon={Clock} title="Staffing Optimization" color="var(--chart-2)" count={ins.staffing.length}>
          {ins.staffing.map((s, i) => (
            <Row key={i} title={s.peakWindow} sub={s.recommendation} />
          ))}
        </InsightCard>

        {/* Waste risk */}
        <InsightCard icon={AlertTriangle} title="Waste Risk Analysis" color="var(--destructive)" count={ins.wasteRisk.length}>
          {ins.wasteRisk.map((w, i) => (
            <Row key={i} title={w.item} sub={w.advice}>
              <Badge variant="outline" className={cn("text-[9px] capitalize", RISK_STYLE[w.risk])}>{w.risk}</Badge>
            </Row>
          ))}
        </InsightCard>

        {/* Churn risk */}
        <InsightCard icon={Users} title="Customer Churn Risk" color="var(--chart-5)" count={ins.churnRisk.length}>
          {ins.churnRisk.map((c, i) => (
            <Row key={i} title={c.customer} sub={c.winback} />
          ))}
        </InsightCard>

        {/* Dynamic pricing */}
        <InsightCard icon={Percent} title="Dynamic Pricing Engine" color="var(--chart-4)" count={ins.dynamicPricing.length}>
          {ins.dynamicPricing.map((p, i) => (
            <Row key={i} title={p.item} sub={`${p.suggestion} · ${p.expectedImpact}`} />
          ))}
        </InsightCard>

        {/* Marketing */}
        <InsightCard icon={Megaphone} title="Marketing Recommendations" color="var(--chart-3)" count={ins.marketing.length}>
          {ins.marketing.map((m, i) => (
            <Row key={i} title={m.campaign} sub={`${m.channel} · ${m.segment} · ROI ${m.expectedROI}`}>
              <Badge variant="outline" className="text-[9px] bg-chart-3/10 text-chart-3">{m.channel}</Badge>
            </Row>
          ))}
        </InsightCard>
      </div>

      {/* Future roadmap teaser */}
      <Card className="overflow-hidden border-dashed">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm">AI Roadmap · Coming Soon</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              "Voice Ordering",
              "Drive-Thru Voice Assistant",
              "CV Kitchen Quality Control",
              "Autonomous Inventory",
              "Dynamic Menu Boards",
              "Demand Forecasting v2",
              "Computer Vision Waste Tracking",
              "AI Recipe Generator",
            ].map((f) => (
              <div key={f} className="rounded-lg border border-dashed bg-muted/20 px-3 py-2 text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function InsightCard({ icon: Icon, title, color, count, children }: { icon: typeof TrendingUp; title: string; color: string; count: number; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
        <div className="grid place-items-center h-8 w-8 rounded-lg shrink-0" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-sm flex-1">{title}</h3>
        <Badge variant="secondary" className="text-[9px]">{count}</Badge>
      </div>
      <div className="p-2 divide-y">
        {children}
      </div>
    </Card>
  )
}

function Row({ title, sub, children }: { title: string; sub: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 px-2 py-2">
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-xs leading-tight">{title}</div>
        <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{sub}</div>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}
