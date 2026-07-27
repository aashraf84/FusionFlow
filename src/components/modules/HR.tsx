"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPKR } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Users, UserCheck, UserX, Clock, Wallet, TrendingUp, Search, Plus, Phone, Calendar, Award } from "lucide-react"
import { toast } from "sonner"

interface HRData {
  employees: any[]
}

const ROLE_STYLE: Record<string, string> = {
  manager: "bg-primary/15 text-primary",
  supervisor: "bg-chart-3/15 text-chart-3",
  cashier: "bg-chart-2/15 text-chart-2",
  chef: "bg-chart-4/15 text-chart-4",
  cleaner: "bg-muted text-muted-foreground",
}

const ATT_STYLE: Record<string, string> = {
  present: "bg-chart-3/15 text-chart-3",
  late: "bg-chart-4/15 text-chart-4",
  absent: "bg-destructive/15 text-destructive",
  leave: "bg-muted text-muted-foreground",
}

export function HR() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data, loading } = useFetch<HRData>(`/api/dashboard${branchParam}`, {})
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")

  const employees = (data?.employees ?? []).filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    if (role !== "all" && e.role !== role) return false
    return true
  })

  if (loading && !data) {
    return <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
  }

  const all = data?.employees ?? []
  const present = all.filter((e) => e.attendance === "present").length
  const late = all.filter((e) => e.attendance === "late").length
  const absent = all.filter((e) => e.attendance === "absent").length
  const payroll = all.reduce((s, e) => s + e.salary, 0)

  const roles = Array.from(new Set(all.map((e) => e.role)))

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile icon={Users} label="Total Staff" value={all.length} sub={`${all.filter(e => e.status === "active").length} active`} color="var(--chart-1)" />
        <Tile icon={UserCheck} label="Present" value={present} sub={`${late} late today`} color="var(--chart-3)" />
        <Tile icon={UserX} label="Absent" value={absent} sub="today" color="var(--destructive)" />
        <Tile icon={Wallet} label="Monthly Payroll" value={formatPKR(payroll)} sub={`${all.length} employees`} color="var(--chart-2)" />
      </div>

      {/* Attendance + shifts overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-bold text-sm">Today&apos;s Attendance</h3>
          </div>
          <div className="p-4 grid grid-cols-3 gap-2 text-center">
            <AttStat label="Present" value={present} color="var(--chart-3)" />
            <AttStat label="Late" value={late} color="var(--chart-4)" />
            <AttStat label="Absent" value={absent} color="var(--destructive)" />
          </div>
          <div className="px-4 pb-4">
            <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-2">Attendance Rate</div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-chart-3" style={{ width: `${Math.round((present / Math.max(all.length, 1)) * 100)}%` }} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">{Math.round((present / Math.max(all.length, 1)) * 100)}% present today</div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-bold text-sm">Shift Coverage</h3>
          </div>
          <div className="p-4 space-y-3">
            {[
              { shift: "Morning", time: "06:00 - 14:00", count: all.filter(e => e.shift === "morning").length, color: "var(--chart-2)" },
              { shift: "Evening", time: "14:00 - 22:00", count: all.filter(e => e.shift === "evening").length, color: "var(--chart-4)" },
              { shift: "Night", time: "22:00 - 06:00", count: all.filter(e => e.shift === "night").length, color: "var(--chart-5)" },
            ].map((s) => (
              <div key={s.shift} className="flex items-center gap-3">
                <div className="grid place-items-center h-9 w-9 rounded-lg shrink-0" style={{ background: `color-mix(in oklch, ${s.color} 15%, transparent)`, color: s.color }}>
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">{s.shift} Shift</div>
                  <div className="text-[10px] text-muted-foreground">{s.time}</div>
                </div>
                <Badge variant="secondary" className="text-[10px]">{s.count} staff</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-bold text-sm flex items-center gap-1.5"><Award className="h-4 w-4 text-chart-2" /> Top Performers</h3>
          </div>
          <div className="p-2 space-y-1">
            {all.slice(0, 4).map((e, i) => (
              <div key={e.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40">
                <span className="grid place-items-center h-6 w-6 rounded-full bg-chart-2/15 text-chart-2 text-[10px] font-bold">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate">{e.name}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{e.role}</div>
                </div>
                <Badge variant="outline" className="text-[9px]">★ {(4.5 + Math.random() * 0.5).toFixed(1)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Employees table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-2">
          <h3 className="font-bold text-sm">Employee Directory</h3>
          <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="h-8 w-40 pl-8 text-xs" />
            </div>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
              <option value="all">All roles</option>
              {roles.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
            </select>
            <Button size="sm" className="h-8" onClick={() => toast.info("Add employee form")}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Employee</th>
                <th className="text-left px-4 py-2 font-semibold">Role</th>
                <th className="text-left px-4 py-2 font-semibold hidden sm:table-cell">Shift</th>
                <th className="text-left px-4 py-2 font-semibold">Attendance</th>
                <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Phone</th>
                <th className="text-right px-4 py-2 font-semibold">Salary</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="grid place-items-center h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {e.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{e.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{e.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge className={cn("text-[9px] capitalize", ROLE_STYLE[e.role] ?? "bg-muted")}>{e.role}</Badge>
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <span className="text-xs capitalize flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />{e.shift}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge className={cn("text-[9px] capitalize", ATT_STYLE[e.attendance] ?? "bg-muted")}>{e.attendance}</Badge>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">{e.phone ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-bold">{formatPKR(e.salary)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info(`Calling ${e.name}`)}>
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payroll summary */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-chart-3" />
          <h3 className="font-bold text-sm">Payroll Summary — This Month</h3>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PayItem label="Base Salaries" value={formatPKR(payroll)} />
          <PayItem label="Overtime" value={formatPKR(Math.round(payroll * 0.08))} />
          <PayItem label="Commissions" value={formatPKR(Math.round(payroll * 0.05))} />
          <PayItem label="Total Cost" value={formatPKR(Math.round(payroll * 1.13))} highlight />
        </div>
      </Card>
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, color }: { icon: typeof Users; label: string; value: string | number; sub: string; color: string }) {
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

function AttStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg p-2" style={{ background: `color-mix(in oklch, ${color} 12%, transparent)` }}>
      <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</div>
    </div>
  )
}

function PayItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-3", highlight && "bg-primary/5 border-primary/30")}>
      <div className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</div>
      <div className={cn("text-base font-extrabold", highlight && "text-primary")}>{value}</div>
    </div>
  )
}
