"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPKR } from "@/lib/data"
import { Car, Clock, Mic, CreditCard, Package, ArrowRight, CheckCircle2, AlertTriangle, Zap } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface DtCar {
  id: string
  plate: string
  stage: "order" | "pay" | "pickup" | "done"
  enteredAt: number
  items: number
  total: number
  voice?: boolean
}

const STAGES = [
  { id: "order", label: "Order", icon: Mic, color: "var(--chart-2)" },
  { id: "pay", label: "Payment", icon: CreditCard, color: "var(--chart-4)" },
  { id: "pickup", label: "Pickup", icon: Package, color: "var(--chart-3)" },
  { id: "done", label: "Complete", icon: CheckCircle2, color: "var(--chart-1)" },
] as const

const NAMES = ["LEB-2024", "RWP-7781", "KHI-3392", "LHR-5521", "ISB-9008", "MUL-1120"]

export function DriveThru() {
  const [cars, setCars] = useState<DtCar[]>([
    { id: "DT-1", plate: "LEB-2024", stage: "order", enteredAt: Date.now() - 90, items: 3, total: 1490, voice: true },
    { id: "DT-2", plate: "RWP-7781", stage: "pay", enteredAt: Date.now() - 180, items: 1, total: 690 },
    { id: "DT-3", plate: "KHI-3392", stage: "pickup", enteredAt: Date.now() - 320, items: 5, total: 2990 },
    { id: "DT-4", plate: "LHR-5521", stage: "order", enteredAt: Date.now() - 40, items: 2, total: 1180 },
  ])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const advance = (id: string) => {
    setCars((cs) =>
      cs.map((c) => {
        if (c.id !== id) return c
        const idx = STAGES.findIndex((s) => s.id === c.stage)
        if (idx >= STAGES.length - 1) return c
        return { ...c, stage: STAGES[idx + 1].id }
      })
    )
    const c = cars.find((x) => x.id === id)
    if (c) toast.success(`${c.plate} → next stage`)
  }

  const addCar = () => {
    const plate = NAMES[Math.floor(Math.random() * NAMES.length)] + Math.floor(Math.random() * 90 + 10)
    setCars((cs) => [...cs, { id: `DT-${cs.length + 5}`, plate, stage: "order", enteredAt: Date.now(), items: 1 + Math.floor(Math.random() * 4), total: 490 + Math.floor(Math.random() * 2500) }])
    toast.success(`New vehicle entered: ${plate}`)
  }

  const stats = {
    inQueue: cars.filter((c) => c.stage !== "done").length,
    avgTime: Math.round(cars.reduce((s, c) => s + (now - c.enteredAt) / 1000 / 60, 0) / Math.max(cars.length, 1)),
    served: 184, // today cumulative
    revenue: cars.reduce((s, c) => s + c.total, 0),
  }
  const sla = 240 // 4 min target

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={Car} label="In Queue" value={stats.inQueue} sub="vehicles" color="var(--chart-2)" />
        <Tile icon={Clock} label="Avg Time" value={`${stats.avgTime}m`} sub="per vehicle" color="var(--chart-4)" />
        <Tile icon={CheckCircle2} label="Served Today" value={stats.served} sub="vehicles" color="var(--chart-3)" />
        <Tile icon={Zap} label="Queue Revenue" value={formatPKR(stats.revenue)} sub="current" color="var(--chart-1)" />
      </div>

      {/* Lane visualization */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">Drive-Thru Lane</h3>
            <p className="text-[11px] text-muted-foreground">SLA target: 4 minutes per vehicle</p>
          </div>
          <Button size="sm" onClick={addCar}>
            <Car className="h-4 w-4 mr-1.5" /> New Vehicle
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4">
          {STAGES.map((stage) => {
            const stageCars = cars.filter((c) => c.stage === stage.id)
            const Icon = stage.icon
            return (
              <div key={stage.id} className="rounded-xl border-2 overflow-hidden" style={{ borderColor: `color-mix(in oklch, ${stage.color} 35%, transparent)` }}>
                <div className="px-3 py-2 border-b flex items-center gap-2" style={{ background: `color-mix(in oklch, ${stage.color} 10%, transparent)` }}>
                  <Icon className="h-4 w-4" style={{ color: stage.color }} />
                  <span className="font-bold text-xs">{stage.label}</span>
                  <Badge variant="secondary" className="ml-auto text-[9px]">{stageCars.length}</Badge>
                </div>
                <div className="p-2 space-y-2 min-h-[160px]">
                  <AnimatePresence>
                    {stageCars.map((c) => {
                      const elapsed = Math.floor((now - c.enteredAt) / 1000)
                      const mins = Math.floor(elapsed / 60)
                      const secs = elapsed % 60
                      const overdue = elapsed > sla && c.stage !== "done"
                      return (
                        <motion.div
                          key={c.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={cn(
                            "rounded-lg border-2 p-2.5 bg-card",
                            overdue ? "border-destructive" : "border-border"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{c.plate}</span>
                            {c.voice && <Badge className="text-[8px] bg-chart-3/15 text-chart-3"><Mic className="h-2 w-2 mr-0.5" />Voice</Badge>}
                          </div>
                          <div className="flex items-center justify-between mt-1.5 text-[10px]">
                            <span className="text-muted-foreground">{c.items} items</span>
                            <span className="font-bold text-primary">{formatPKR(c.total)}</span>
                          </div>
                          <div className={cn(
                            "flex items-center justify-between mt-1.5 text-[10px] font-mono font-bold",
                            overdue ? "text-destructive" : "text-muted-foreground"
                          )}>
                            <span className="flex items-center gap-0.5">
                              {overdue ? <AlertTriangle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                            </span>
                            {stage.id !== "done" && (
                              <button
                                onClick={() => advance(c.id)}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary text-primary-foreground hover:opacity-80"
                              >
                                <ArrowRight className="h-2.5 w-2.5" /> Advance
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  {stageCars.length === 0 && (
                    <div className="text-center text-[10px] text-muted-foreground py-8">Empty</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Performance + voice assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-bold text-sm">Hourly Throughput</h3>
            <p className="text-[11px] text-muted-foreground">Vehicles served per hour</p>
          </div>
          <div className="p-4 grid grid-cols-12 gap-1.5 items-end h-[140px]">
            {Array.from({ length: 12 }).map((_, i) => {
              const h = 30 + Math.floor(Math.sin(i * 0.7) * 25 + Math.random() * 30)
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors" style={{ height: `${h}%` }} />
                  <span className="text-[8px] text-muted-foreground">{11 + i}h</span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-gradient-to-r from-chart-3/15 to-transparent">
            <h3 className="font-bold text-sm flex items-center gap-1.5"><Mic className="h-4 w-4 text-chart-3" /> Voice Assistant</h3>
            <p className="text-[11px] text-muted-foreground">AI drive-thru ordering</p>
          </div>
          <div className="p-4 space-y-3">
            <div className="rounded-lg bg-muted/40 p-3 text-xs">
              <div className="text-[10px] text-muted-foreground font-semibold mb-1">Customer said:</div>
              <div className="italic">&ldquo;I&apos;ll take two large pepperoni pizzas and a cola&rdquo;</div>
            </div>
            <div className="rounded-lg bg-chart-3/10 p-3 text-xs">
              <div className="text-[10px] text-chart-3 font-semibold mb-1">AI recognized:</div>
              <div>2× Pepperoni Supreme (Large) · 1× Cola 500ml</div>
              <div className="text-[10px] mt-1 font-bold text-primary">Total: {formatPKR(2730)}</div>
            </div>
            <Button size="sm" className="w-full" onClick={() => toast.success("Voice order confirmed & sent to KDS")}>
              <Mic className="h-3.5 w-3.5 mr-1.5" /> Confirm Voice Order
            </Button>
            <div className="text-[10px] text-center text-muted-foreground">
              <Badge variant="outline" className="text-[9px]">94% accuracy</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, color }: { icon: typeof Car; label: string; value: string | number; sub: string; color: string }) {
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
