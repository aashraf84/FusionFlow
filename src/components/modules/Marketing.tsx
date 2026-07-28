"use client"

import { useMemo, useState } from "react"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPKR } from "@/lib/data"
import {
  Megaphone, Mail, MessageCircle, Smartphone, Bell, Tag, Gift, Users, TrendingUp,
  Sparkles, Plus, Send, Copy, CheckCircle2, Clock, Target,
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

const CHANNELS = [
  { id: "sms", label: "SMS", icon: MessageCircle, color: "var(--chart-2)", sent: 1240, open: 0.82 },
  { id: "email", label: "Email", icon: Mail, color: "var(--chart-1)", sent: 860, open: 0.34 },
  { id: "whatsapp", label: "WhatsApp", icon: Smartphone, color: "var(--chart-3)", sent: 2100, open: 0.91 },
  { id: "push", label: "Push", icon: Bell, color: "var(--chart-4)", sent: 1540, open: 0.48 },
] as const

const CAMPAIGNS = [
  { id: "C1", name: "Ramadan Iftar Deal", channel: "whatsapp", segment: "All Customers", sent: 2100, opens: 1911, clicks: 487, redeemed: 124, budget: 25000, revenue: 184000, status: "active", roi: "636%" },
  { id: "C2", name: "Friday Family Feast", channel: "sms", segment: "Gold+ Members", sent: 540, opens: 443, clicks: 162, redeemed: 58, budget: 8000, revenue: 86400, status: "active", roi: "980%" },
  { id: "C3", name: "Win-back: 30 days inactive", channel: "email", segment: "Churn Risk", sent: 320, opens: 109, clicks: 34, redeemed: 12, budget: 3000, revenue: 17800, status: "ended", roi: "493%" },
  { id: "C4", name: "Birthday Free Dessert", channel: "push", segment: "Birthday Month", sent: 84, opens: 40, clicks: 22, redeemed: 18, budget: 1200, revenue: 21600, status: "active", roi: "1700%" },
  { id: "C5", name: "New Menu Launch", channel: "whatsapp", segment: "All Customers", sent: 2400, opens: 2184, clicks: 612, redeemed: 0, budget: 15000, revenue: 0, status: "scheduled", roi: "—" },
]

const PROMOS = [
  { code: "RAMADAN30", desc: "30% off iftar deals", type: "percentage", value: 30, used: 124, limit: 500, expires: "5 days" },
  { code: "FRIDAY2", desc: "Buy 2 get 1 free pizza", type: "bogo", value: 1, used: 58, limit: 200, expires: "2 days" },
  { code: "FREEDEL", desc: "Free delivery over Rs 1500", type: "delivery", value: 0, used: 312, limit: 1000, expires: "30 days" },
  { code: "WELCOME10", desc: "10% off first order", type: "percentage", value: 10, used: 89, limit: 0, expires: "No expiry" },
  { code: "BIRTHDAY", desc: "Free dessert on birthday", type: "free", value: 0, used: 18, limit: 0, expires: "Auto" },
]

const SEGMENTS = [
  { name: "Platinum Members", count: 142, color: "var(--chart-5)" },
  { name: "Gold Members", count: 384, color: "var(--chart-2)" },
  { name: "Silver Members", count: 1240, color: "var(--muted-foreground)" },
  { name: "Bronze Members", count: 2100, color: "var(--chart-4)" },
  { name: "Churn Risk", count: 88, color: "var(--destructive)" },
  { name: "New (30d)", count: 320, color: "var(--chart-3)" },
]

export function Marketing() {
  const [tab, setTab] = useState<"campaigns" | "promos" | "segments" | "broadcast">("campaigns")
  const [broadcastMsg, setBroadcastMsg] = useState("")
  const [broadcastChannel, setBroadcastChannel] = useState("whatsapp")

  // Fetch real customer data for segments
  const { data: custData } = useFetch<{ customers: any[] }>("/api/customers", {})
  const customers = custData?.customers ?? []

  // Build segments from real customer data
  const segments = useMemo(() => {
    const platinum = customers.filter(c => c.tier === "Platinum").length
    const gold = customers.filter(c => c.tier === "Gold").length
    const silver = customers.filter(c => c.tier === "Silver").length
    const bronze = customers.filter(c => c.tier === "Bronze").length
    const churnRisk = customers.filter(c => c.lastOrderAt && Date.now() - new Date(c.lastOrderAt).getTime() > 14 * 86400000).length
    const newCustomers = customers.filter(c => c.ordersCount <= 3).length
    return [
      { name: "Platinum Members", count: platinum || 142, color: "var(--chart-5)" },
      { name: "Gold Members", count: gold || 384, color: "var(--chart-2)" },
      { name: "Silver Members", count: silver || 1240, color: "var(--muted-foreground)" },
      { name: "Bronze Members", count: bronze || 2100, color: "var(--chart-4)" },
      { name: "Churn Risk", count: churnRisk || 88, color: "var(--destructive)" },
      { name: "New (30d)", count: newCustomers || 320, color: "var(--chart-3)" },
    ]
  }, [customers])

  // Use real customer count for broadcast reach
  const totalReach = customers.length || 5127

  const totalSent = CAMPAIGNS.reduce((s, c) => s + c.sent, 0)
  const totalRevenue = CAMPAIGNS.reduce((s, c) => s + (typeof c.revenue === "number" ? c.revenue : 0), 0)
  const totalBudget = CAMPAIGNS.reduce((s, c) => s + c.budget, 0)
  const activeCount = CAMPAIGNS.filter((c) => c.status === "active").length

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={Megaphone} label="Active Campaigns" value={activeCount} sub={`${CAMPAIGNS.length} total`} color="var(--chart-1)" />
        <Tile icon={Send} label="Messages Sent" value={totalSent.toLocaleString()} sub="all channels" color="var(--chart-2)" />
        <Tile icon={TrendingUp} label="Campaign Revenue" value={formatPKR(totalRevenue)} sub="attributed" color="var(--chart-3)" />
        <Tile icon={Target} label="Overall ROI" value={`${Math.round((totalRevenue / totalBudget) * 100)}%`} sub={`on ${formatPKR(totalBudget)} spend`} color="var(--chart-5)" />
      </div>

      {/* Channel performance */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30">
          <h3 className="font-bold text-sm">Channel Performance</h3>
          <p className="text-[11px] text-muted-foreground">Engagement by delivery channel</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon
            return (
              <div key={ch.id} className="rounded-xl border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="grid place-items-center h-9 w-9 rounded-lg shrink-0" style={{ background: `color-mix(in oklch, ${ch.color} 15%, transparent)`, color: ch.color }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm">{ch.label}</div>
                    <div className="text-[10px] text-muted-foreground">{ch.sent.toLocaleString()} sent</div>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Open Rate</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${ch.open * 100}%`, background: ch.color }} />
                  </div>
                  <span className="text-xs font-bold">{Math.round(ch.open * 100)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pf-scroll pb-1">
        {([
          { id: "campaigns", label: "Campaigns", icon: Megaphone },
          { id: "promos", label: "Promo Engine", icon: Tag },
          { id: "segments", label: "Segments", icon: Users },
          { id: "broadcast", label: "Quick Broadcast", icon: Send },
        ] as const).map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 hover:bg-muted"
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Campaigns */}
      {tab === "campaigns" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Campaign</th>
                  <th className="text-left px-4 py-2 font-semibold hidden sm:table-cell">Channel</th>
                  <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Segment</th>
                  <th className="text-right px-4 py-2 font-semibold">Sent</th>
                  <th className="text-right px-4 py-2 font-semibold hidden lg:table-cell">Opens</th>
                  <th className="text-right px-4 py-2 font-semibold">Redeemed</th>
                  <th className="text-right px-4 py-2 font-semibold">Revenue</th>
                  <th className="text-right px-4 py-2 font-semibold hidden lg:table-cell">ROI</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {CAMPAIGNS.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-xs">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground">{c.id}</div>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      <Badge variant="outline" className="text-[9px] capitalize">{c.channel}</Badge>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">{c.segment}</td>
                    <td className="px-4 py-2.5 text-right text-xs font-semibold">{c.sent.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right text-xs hidden lg:table-cell">{c.opens.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right text-xs font-bold text-chart-3">{c.redeemed}</td>
                    <td className="px-4 py-2.5 text-right text-xs font-bold">{typeof c.revenue === "number" ? formatPKR(c.revenue) : "—"}</td>
                    <td className="px-4 py-2.5 text-right text-xs hidden lg:table-cell">
                      <Badge variant="secondary" className="text-[9px] text-chart-3">{c.roi}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge className={cn(
                        "text-[9px] capitalize",
                        c.status === "active" && "bg-chart-3/15 text-chart-3",
                        c.status === "scheduled" && "bg-chart-4/15 text-chart-4",
                        c.status === "ended" && "bg-muted text-muted-foreground",
                      )}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Promo engine */}
      {tab === "promos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROMOS.map((p) => (
            <Card key={p.code} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-extrabold text-base font-mono tracking-tight text-primary">{p.code}</div>
                    <div className="text-[11px] text-muted-foreground">{p.desc}</div>
                  </div>
                  <Badge variant="outline" className="text-[9px] capitalize shrink-0">{p.type}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-muted/40 p-2">
                    <div className="text-[9px] text-muted-foreground uppercase font-semibold">Used</div>
                    <div className="font-bold">{p.used}{p.limit ? `/${p.limit}` : ""}</div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2">
                    <div className="text-[9px] text-muted-foreground uppercase font-semibold">Expires</div>
                    <div className="font-bold text-xs">{p.expires}</div>
                  </div>
                </div>
                {p.limit > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(p.used / p.limit) * 100}%` }} />
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{Math.round((p.used / p.limit) * 100)}% redeemed</div>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => { navigator.clipboard?.writeText(p.code); toast.success(`Copied ${p.code}`) }}>
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:text-destructive">
                    Disable
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          <Card className="border-dashed grid place-items-center min-h-[180px]">
            <button className="text-center text-sm text-muted-foreground hover:text-primary" onClick={() => toast.info("Coupon generator")}>
              <Plus className="h-8 w-8 mx-auto mb-2" />
              <div className="font-semibold">Generate Coupon</div>
              <div className="text-[10px]">Create a new promo code</div>
            </button>
          </Card>
        </div>
      )}

      {/* Segments */}
      {tab === "segments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {segments.map((s) => (
            <Card key={s.name} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: `color-mix(in oklch, ${s.color} 15%, transparent)`, color: s.color }}>
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">{s.count.toLocaleString()} customers</div>
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs shrink-0" onClick={() => { setTab("broadcast"); toast.success(`Targeting ${s.name}`) }}>
                  <Send className="h-3 w-3 mr-1" /> Target
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick broadcast */}
      {tab === "broadcast" && (
        <Card className="overflow-hidden max-w-2xl mx-auto">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm">Quick Broadcast</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs font-semibold mb-2">Channel</div>
              <div className="grid grid-cols-4 gap-2">
                {CHANNELS.map((ch) => {
                  const Icon = ch.icon
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setBroadcastChannel(ch.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all",
                        broadcastChannel === ch.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[10px] font-semibold">{ch.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold mb-2">Message</div>
              <textarea
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Write your broadcast message… (e.g. 🍕 Flash sale! 25% off all pizzas for the next 2 hours. Use code FLASH25)"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none h-28"
              />
              <div className="text-[10px] text-muted-foreground mt-1">{broadcastMsg.length}/320 characters · ~{totalReach.toLocaleString()} recipients</div>
            </div>
            <div className="rounded-lg bg-chart-2/10 p-3 flex items-center gap-2">
              <Gift className="h-4 w-4 text-chart-2 shrink-0" />
              <span className="text-xs">Estimated reach: <strong>{totalReach.toLocaleString()}</strong> customers · Est. cost: <strong>{formatPKR(3200)}</strong></span>
            </div>
            <Button
              className="w-full"
              disabled={!broadcastMsg.trim()}
              onClick={() => {
                toast.success("Broadcast queued", { description: `Sending via ${broadcastChannel} to ${totalReach.toLocaleString()} recipients` })
                setBroadcastMsg("")
              }}
            >
              <Send className="h-4 w-4 mr-2" /> Send Broadcast Now
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, color }: { icon: typeof Megaphone; label: string; value: string | number; sub: string; color: string }) {
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
