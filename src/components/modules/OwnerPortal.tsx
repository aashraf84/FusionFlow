"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPKR } from "@/lib/data"
import {
  Crown, Building2, Users, CreditCard, Key, Server, ShieldCheck, Activity,
  Plus, MoreVertical, CheckCircle2, AlertTriangle, Clock, Cpu, HardDrive, Database, Globe,
} from "lucide-react"
import { toast } from "sonner"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface Tenant {
  id: string
  name: string
  brand: string
  plan: "Starter" | "Growth" | "Enterprise"
  status: "trial" | "active" | "suspended" | "expired"
  branches: number
  devices: number
  deviceLimit: number
  mrr: number
  trialEnds?: string
  licenseKey: string
  region: string
  since: string
}

const TENANTS: Tenant[] = [
  { id: "T-001", name: "NY212 Pizza", brand: "NY212 Pizza", plan: "Enterprise", status: "active", branches: 6, devices: 24, deviceLimit: 40, mrr: 185000, licenseKey: "PF-ENT-7H3K-9X2A", region: "Pakistan", since: "Jan 2024" },
  { id: "T-002", name: "Cheezious Group", brand: "Cheezious", plan: "Enterprise", status: "active", branches: 4, devices: 16, deviceLimit: 30, mrr: 145000, licenseKey: "PF-ENT-2B8F-4M1Z", region: "Pakistan", since: "Mar 2024" },
  { id: "T-003", name: "Clucky's Chicken", brand: "Clucky's", plan: "Growth", status: "active", branches: 3, devices: 9, deviceLimit: 15, mrr: 65000, licenseKey: "PF-GRW-5D9K-1P7T", region: "Pakistan", since: "Jun 2024" },
  { id: "T-004", name: "Pizza Bella", brand: "Pizza Bella", plan: "Growth", status: "trial", branches: 1, devices: 2, deviceLimit: 5, mrr: 0, trialEnds: "4 days", licenseKey: "PF-TRI-8N2X-6Q4V", region: "UAE", since: "2 weeks ago" },
  { id: "T-005", name: "Burger House", brand: "Burger House", plan: "Starter", status: "active", branches: 1, devices: 3, deviceLimit: 5, mrr: 18000, licenseKey: "PF-STR-1A5Z-9E3K", region: "Pakistan", since: "Aug 2024" },
  { id: "T-006", name: "Café Aroma", brand: "Aroma", plan: "Starter", status: "suspended", branches: 1, devices: 0, deviceLimit: 3, mrr: 0, licenseKey: "PF-STR-7C2B-4M9F", region: "Pakistan", since: "May 2024" },
  { id: "T-007", name: "Royal Fried Chicken", brand: "RFC", plan: "Growth", status: "active", branches: 5, devices: 18, deviceLimit: 15, mrr: 72000, licenseKey: "PF-GRW-3D8K-2N6T", region: "Saudi Arabia", since: "Feb 2024" },
  { id: "T-008", name: "Dough & Co", brand: "Dough & Co", plan: "Starter", status: "expired", branches: 0, devices: 0, deviceLimit: 3, mrr: 0, licenseKey: "PF-STR-9F4A-1Q7Z", region: "Pakistan", since: "Dec 2023" },
]

const STATUS_META = {
  active: { label: "Active", cls: "bg-chart-3/15 text-chart-3", dot: "bg-chart-3" },
  trial: { label: "Trial", cls: "bg-chart-2/15 text-chart-2", dot: "bg-chart-2" },
  suspended: { label: "Suspended", cls: "bg-chart-4/15 text-chart-4", dot: "bg-chart-4" },
  expired: { label: "Expired", cls: "bg-destructive/15 text-destructive", dot: "bg-destructive" },
}

const PLAN_META = {
  Starter: "var(--chart-4)",
  Growth: "var(--chart-2)",
  Enterprise: "var(--chart-5)",
}

const MRR_TREND = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({
  month: m,
  mrr: 320000 + i * 48000 + Math.random() * 30000,
}))

export function OwnerPortal() {
  const [filter, setFilter] = useState<"all" | "active" | "trial" | "suspended" | "expired">("all")

  const totalMRR = TENANTS.filter((t) => t.status === "active").reduce((s, t) => s + t.mrr, 0)
  const activeTenants = TENANTS.filter((t) => t.status === "active").length
  const trialTenants = TENANTS.filter((t) => t.status === "trial").length
  const totalDevices = TENANTS.reduce((s, t) => s + t.devices, 0)
  const arr = totalMRR * 12

  const filtered = filter === "all" ? TENANTS : TENANTS.filter((t) => t.status === filter)

  return (
    <div className="space-y-4">
      {/* Owner banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-chart-5/15 via-primary/10 to-chart-2/10 p-5">
        <div className="flex items-start gap-4">
          <div className="grid place-items-center h-12 w-12 rounded-xl bg-chart-5 text-white shadow-lg shrink-0">
            <Crown className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-lg">PizzaFlow Owner Portal</h2>
              <Badge className="bg-chart-5 text-white">ApexFlow Suite</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Manage PizzaFlow ERP tenants, subscriptions, licenses, devices, billing & SaaS health.</p>
          </div>
          <Button onClick={() => toast.info("Provision new tenant")}>
            <Plus className="h-4 w-4 mr-1.5" /> New Tenant
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={Building2} label="Active Tenants" value={activeTenants} sub={`${trialTenants} on trial`} color="var(--chart-1)" />
        <Tile icon={CreditCard} label="Monthly Recurring" value={formatPKR(totalMRR)} sub="MRR" color="var(--chart-3)" />
        <Tile icon={Activity} label="Annual Run Rate" value={formatPKR(arr)} sub="ARR" color="var(--chart-2)" />
        <Tile icon={Cpu} label="Active Devices" value={totalDevices} sub="across all tenants" color="var(--chart-4)" />
      </div>

      {/* MRR trend + SaaS health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">MRR Growth</h3>
              <p className="text-[11px] text-muted-foreground">Monthly recurring revenue trend</p>
            </div>
            <Badge variant="secondary" className="text-[10px] text-chart-3">+15.2% MoM</Badge>
          </div>
          <div className="h-[200px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MRR_TREND}>
                <defs>
                  <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                <Area type="monotone" dataKey="mrr" stroke="var(--chart-3)" strokeWidth={2.5} fill="url(#mrrFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <Server className="h-4 w-4 text-chart-3" />
            <h3 className="font-bold text-sm">SaaS Health</h3>
          </div>
          <div className="p-4 space-y-3">
            <HealthRow icon={Server} label="API Uptime" value="99.98%" color="var(--chart-3)" good />
            <HealthRow icon={Database} label="DB Response" value="42ms" color="var(--chart-3)" good />
            <HealthRow icon={HardDrive} label="Storage Used" value="68%" color="var(--chart-2)" />
            <HealthRow icon={Globe} label="Avg Latency" value="120ms" color="var(--chart-3)" good />
            <HealthRow icon={ShieldCheck} label="Backup Status" value="Healthy" color="var(--chart-3)" good />
            <div className="pt-2 mt-2 border-t flex items-center gap-2 text-xs">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-chart-3 opacity-75 animate-ping" /><span className="relative inline-flex rounded-full h-2 w-2 bg-chart-3" /></span>
              <span className="font-semibold text-chart-3">All systems operational</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tenants table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-2">
          <h3 className="font-bold text-sm">Tenant Management</h3>
          <div className="sm:ml-auto flex items-center gap-1 flex-wrap">
            {(["all", "active", "trial", "suspended", "expired"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-semibold capitalize transition-colors",
                  filter === f ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Tenant</th>
                <th className="text-left px-4 py-2 font-semibold hidden sm:table-cell">Plan</th>
                <th className="text-left px-4 py-2 font-semibold">Status</th>
                <th className="text-right px-4 py-2 font-semibold hidden md:table-cell">Branches</th>
                <th className="text-right px-4 py-2 font-semibold">Devices</th>
                <th className="text-right px-4 py-2 font-semibold hidden lg:table-cell">MRR</th>
                <th className="text-left px-4 py-2 font-semibold hidden xl:table-cell">License Key</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((t) => {
                const m = STATUS_META[t.status]
                const deviceOver = t.devices > t.deviceLimit
                return (
                  <tr key={t.id} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                          {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs truncate">{t.name}</div>
                          <div className="text-[10px] text-muted-foreground">{t.id} · {t.region} · since {t.since}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      <Badge variant="outline" className="text-[9px]" style={{ color: PLAN_META[t.plan], borderColor: `color-mix(in oklch, ${PLAN_META[t.plan]} 35%, transparent)` }}>{t.plan}</Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge className={cn("text-[9px]", m.cls)}><span className={cn("h-1.5 w-1.5 rounded-full mr-0.5", m.dot)} />{m.label}</Badge>
                      {t.trialEnds && <div className="text-[9px] text-muted-foreground mt-0.5">{t.trialEnds} left</div>}
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-right text-xs font-semibold">{t.branches}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={cn("text-xs font-bold", deviceOver && "text-destructive")}>{t.devices}/{t.deviceLimit}</span>
                      {deviceOver && <AlertTriangle className="inline h-3 w-3 text-destructive ml-1" />}
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell text-right text-xs font-bold">{t.mrr > 0 ? formatPKR(t.mrr) : "—"}</td>
                    <td className="px-4 py-2.5 hidden xl:table-cell">
                      <code className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">{t.licenseKey}</code>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info(`Manage ${t.name}`)}>
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* License + module control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <Key className="h-4 w-4 text-chart-5" />
            <h3 className="font-bold text-sm">License & Serial Key Generation</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="rounded-lg bg-muted/40 p-3 font-mono text-center">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Latest Generated Key</div>
              <div className="text-lg font-extrabold tracking-wider text-primary">PF-ENT-7H3K-9X2A-2024</div>
              <div className="text-[10px] text-muted-foreground mt-1">Enterprise · 40 devices · 12 months · Pakistan</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success("License key generated")}>
                <Key className="h-3.5 w-3.5 mr-1" /> Generate Key
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Revoke license")}>
                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Revoke
              </Button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-chart-3" />
            <h3 className="font-bold text-sm">Module & Feature Control</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            {[
              { name: "POS", on: true },
              { name: "KDS", on: true },
              { name: "Delivery", on: true },
              { name: "Inventory", on: true },
              { name: "CRM", on: true },
              { name: "Franchise", on: true },
              { name: "AI Insights", on: true },
              { name: "Finance", on: false },
              { name: "HR Module", on: false },
              { name: "Online Ordering", on: true },
              { name: "White-Label", on: false },
              { name: "Voice Ordering", on: false },
            ].map((mod) => (
              <div key={mod.name} className="flex items-center justify-between rounded-lg border px-2.5 py-2">
                <span className="text-xs font-medium">{mod.name}</span>
                <button
                  onClick={() => toast.success(`${mod.name} ${mod.on ? "disabled" : "enabled"}`)}
                  className={cn("relative h-5 w-9 rounded-full transition-colors", mod.on ? "bg-chart-3" : "bg-muted")}
                >
                  <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", mod.on ? "translate-x-4" : "translate-x-0.5")} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, color }: { icon: typeof Building2; label: string; value: string | number; sub: string; color: string }) {
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

function HealthRow({ icon: Icon, label, value, color, good }: { icon: typeof Server; label: string; value: string; color: string; good?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <div className="grid place-items-center h-7 w-7 rounded-lg shrink-0" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className={cn("font-bold", good && "text-chart-3")}>{value}</span>
      {good && <CheckCircle2 className="h-3 w-3 text-chart-3" />}
    </div>
  )
}
