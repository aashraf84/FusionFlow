"use client"

import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPKR } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Wallet, TrendingUp, TrendingDown, Banknote, CreditCard, Receipt, ArrowDownLeft, ArrowUpRight, PiggyBank, Landmark, FileText } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"

interface FData {
  kpis: { todaysSales: number; foodCost: number; grossProfit: number; todaysOrders: number }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function Finance() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data, loading } = useFetch<FData>(`/api/dashboard${branchParam}`, {})

  if (loading && !data) {
    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
  }

  const sales = data!.kpis.todaysSales
  const cogs = data!.kpis.foodCost
  const grossProfit = data!.kpis.grossProfit
  const labor = Math.round(sales * 0.24)
  const overhead = Math.round(sales * 0.14)
  const marketing = Math.round(sales * 0.04)
  const netProfit = grossProfit - labor - overhead - marketing
  const margin = sales > 0 ? Math.round((netProfit / sales) * 100) : 0

  // P&L trend (12 months)
  const pnl = MONTHS.map((m, i) => {
    const base = 800000 + i * 60000 + Math.sin(i) * 80000
    return {
      month: m,
      revenue: Math.round(base),
      cogs: Math.round(base * 0.32),
      labor: Math.round(base * 0.24),
      overhead: Math.round(base * 0.14),
      net: Math.round(base * 0.3 - 60000),
    }
  })

  const cashflow = MONTHS.slice(-6).map((m, i) => ({
    month: m,
    inflow: 900000 + i * 70000 + Math.random() * 80000,
    outflow: 700000 + i * 50000 + Math.random() * 60000,
  }))

  const expenses = [
    { name: "Food Cost", value: cogs, color: "var(--chart-1)" },
    { name: "Labor", value: labor, color: "var(--chart-4)" },
    { name: "Overhead", value: overhead, color: "var(--chart-2)" },
    { name: "Marketing", value: marketing, color: "var(--chart-3)" },
  ]

  const transactions = [
    { id: "TX-9201", type: "in", desc: "POS Cash Sales", amount: sales * 0.4, method: "Cash", time: "2m ago" },
    { id: "TX-9202", type: "in", desc: "Card Settlement", amount: sales * 0.45, method: "Card", time: "8m ago" },
    { id: "TX-9203", type: "in", desc: "Wallet Transfer", amount: sales * 0.15, method: "Wallet", time: "15m ago" },
    { id: "TX-9204", type: "out", desc: "Inventory Purchase — Cheese", amount: 87000, method: "Bank", time: "1h ago" },
    { id: "TX-9205", type: "out", desc: "Staff Salary — Advance", amount: 45000, method: "Bank", time: "2h ago" },
    { id: "TX-9206", type: "out", desc: "Utility Bill — Electricity", amount: 28000, method: "Bank", time: "3h ago" },
    { id: "TX-9207", type: "in", desc: "Franchise Royalty — DHA", amount: 18400, method: "Bank", time: "5h ago" },
  ]

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={TrendingUp} label="Revenue (24h)" value={formatPKR(sales)} delta="+12.4%" color="var(--chart-3)" up />
        <Kpi icon={PiggyBank} label="Net Profit" value={formatPKR(netProfit)} delta={`${margin}% margin`} color="var(--chart-1)" up />
        <Kpi icon={TrendingDown} label="Total Expenses" value={formatPKR(cogs + labor + overhead + marketing)} delta="+3.1%" color="var(--destructive)" />
        <Kpi icon={Landmark} label="Cash Balance" value={formatPKR(2840000)} delta="+5.2%" color="var(--chart-2)" up />
      </div>

      {/* P&L trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Profit & Loss Trend</h3>
              <p className="text-[11px] text-muted-foreground">Revenue vs Net Profit · 12 months</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">PKR</Badge>
          </div>
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnl}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-3)" strokeWidth={2.5} fill="url(#rev)" />
                <Area type="monotone" dataKey="net" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#net)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense breakdown */}
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-bold text-sm">Expense Breakdown</h3>
            <p className="text-[11px] text-muted-foreground">Today&apos;s cost structure</p>
          </div>
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenses} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={70} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                  {expenses.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* P&L statement + cash flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* P&L Statement */}
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm">Profit & Loss Statement</h3>
          </div>
          <div className="p-4 space-y-1 text-sm">
            <PLRow label="Gross Revenue" value={formatPKR(sales)} />
            <PLRow label="Less: Food Cost (COGS)" value={`(${formatPKR(cogs)})`} neg />
            <div className="border-t my-1.5" />
            <PLRow label="Gross Profit" value={formatPKR(grossProfit)} bold />
            <PLRow label="Less: Labor" value={`(${formatPKR(labor)})`} neg />
            <PLRow label="Less: Overhead" value={`(${formatPKR(overhead)})`} neg />
            <PLRow label="Less: Marketing" value={`(${formatPKR(marketing)})`} neg />
            <div className="border-t-2 my-1.5" />
            <PLRow label="Net Profit" value={formatPKR(netProfit)} bold highlight />
            <div className="flex items-center justify-between pt-2 mt-2 border-t text-xs text-muted-foreground">
              <span>Net Margin</span>
              <span className="font-bold text-chart-3">{margin}%</span>
            </div>
          </div>
        </Card>

        {/* Cash flow */}
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-bold text-sm">Cash Flow — Last 6 Months</h3>
          </div>
          <div className="h-[230px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                <Bar dataKey="inflow" fill="var(--chart-3)" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="outflow" fill="var(--chart-4)" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="px-4 pb-4 flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-chart-3" /> Inflow</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-chart-4" /> Outflow</span>
          </div>
        </Card>
      </div>

      {/* Recent transactions + AR/AP */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="font-bold text-sm">Recent Transactions</h3>
          </div>
          <div className="divide-y max-h-[340px] overflow-y-auto pf-scroll">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30">
                <div className={cn(
                  "grid place-items-center h-9 w-9 rounded-lg shrink-0",
                  t.type === "in" ? "bg-chart-3/15 text-chart-3" : "bg-destructive/10 text-destructive"
                )}>
                  {t.type === "in" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs truncate">{t.desc}</div>
                  <div className="text-[10px] text-muted-foreground">{t.id} · {t.method} · {t.time}</div>
                </div>
                <div className={cn("text-sm font-bold", t.type === "in" ? "text-chart-3" : "text-destructive")}>
                  {t.type === "in" ? "+" : "−"}{formatPKR(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-chart-4" />
              <h3 className="font-bold text-sm">Accounts Receivable</h3>
            </div>
            <div className="p-4 space-y-2">
              {[
                { name: "Corporate Catering — TechCorp", amount: 184000, due: "3 days" },
                { name: "Foodpanda Settlement", amount: 92000, due: "5 days" },
                { name: "Franchise — DHA Phase 6", amount: 67500, due: "7 days" },
              ].map((ar) => (
                <div key={ar.name} className="flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-medium truncate">{ar.name}</div>
                    <div className="text-[10px] text-muted-foreground">Due in {ar.due}</div>
                  </div>
                  <span className="font-bold">{formatPKR(ar.amount)}</span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t flex items-center justify-between">
                <span className="text-xs font-bold">Total AR</span>
                <span className="text-sm font-extrabold text-chart-4">{formatPKR(343500)}</span>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-destructive" />
              <h3 className="font-bold text-sm">Accounts Payable</h3>
            </div>
            <div className="p-4 space-y-2">
              {[
                { name: "Cheese Supplier — Nestlé", amount: 245000, due: "2 days" },
                { name: "Flour Mill — Dawn", amount: 86000, due: "4 days" },
                { name: "Electricity — LESCO", amount: 28000, due: "Overdue" },
              ].map((ap) => (
                <div key={ap.name} className="flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-medium truncate">{ap.name}</div>
                    <div className="text-[10px] text-muted-foreground">{ap.due}</div>
                  </div>
                  <span className="font-bold">{formatPKR(ap.amount)}</span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t flex items-center justify-between">
                <span className="text-xs font-bold">Total AP</span>
                <span className="text-sm font-extrabold text-destructive">{formatPKR(359000)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, label, value, delta, color, up }: { icon: typeof TrendingUp; label: string; value: string; delta: string; color: string; up?: boolean }) {
  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="grid place-items-center h-9 w-9 rounded-lg" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
          <Badge variant="secondary" className={cn("text-[10px]", up ? "text-chart-3" : "text-destructive")}>
            <TrendingUp className={cn("h-2.5 w-2.5 mr-0.5", !up && "rotate-180")} />{delta}
          </Badge>
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground font-semibold uppercase">{label}</div>
        <div className="text-xl font-extrabold">{value}</div>
      </div>
    </Card>
  )
}

function PLRow({ label, value, bold, neg, highlight }: { label: string; value: string; bold?: boolean; neg?: boolean; highlight?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between py-1",
      bold && "font-bold",
      highlight && "text-chart-3 text-base"
    )}>
      <span className={cn("text-muted-foreground", bold && "text-foreground")}>{label}</span>
      <span className={cn(neg && "text-destructive")}>{value}</span>
    </div>
  )
}
