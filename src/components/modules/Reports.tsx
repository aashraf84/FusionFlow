"use client"

import { useState, useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatPKR } from "@/lib/data"
import { Logo } from "@/components/shared/Logo"
import {
  FileBarChart, FileText, TrendingUp, Wallet, Users, ShoppingCart, Boxes,
  Bike, ChefHat, ShieldCheck, Store, Printer, Download, Search, Calendar,
  FileSpreadsheet, Receipt, Package, Award, Megaphone, Cog,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface DData {
  kpis: any
  hourly: { hour: string; sales: number; orders: number }[]
  activeOrders: any[]
  topProducts: { name: string; qty: number; revenue: number }[]
  orderTypes: { name: string; value: number }[]
  branchStats: any[]
  riders: any[]
  lowStock: any[]
  inventory: any[]
  customers: any[]
  employees: any[]
}

interface ReportDef {
  id: string
  name: string
  description: string
  category: string
  icon: typeof FileText
  color: string
}

const REPORTS: ReportDef[] = [
  // Sales
  { id: "sales-summary", name: "Daily Sales Summary", description: "Hourly sales, order volume & revenue breakdown", category: "Sales", icon: TrendingUp, color: "var(--chart-3)" },
  { id: "sales-by-channel", name: "Sales by Channel", description: "Dine-in, takeaway, delivery & drive-thru performance", category: "Sales", icon: Store, color: "var(--chart-2)" },
  { id: "top-products", name: "Top Selling Products", description: "Best sellers by quantity and revenue", category: "Sales", icon: Package, color: "var(--chart-1)" },
  { id: "invoice", name: "POS Invoice / Receipt", description: "Printable customer invoice for any order", category: "Sales", icon: Receipt, color: "var(--chart-4)" },
  // Kitchen
  { id: "kds-performance", name: "Kitchen Performance Report", description: "Station load, prep times & order throughput", category: "Kitchen", icon: ChefHat, color: "var(--chart-4)" },
  { id: "production-batch", name: "Production Batch Report", description: "Daily batches, yield & waste tracking", category: "Kitchen", icon: Cog, color: "var(--chart-2)" },
  // Delivery
  { id: "delivery-performance", name: "Delivery Performance", description: "Rider efficiency, avg delivery time & ratings", category: "Delivery", icon: Bike, color: "var(--chart-3)" },
  // Inventory
  { id: "inventory-valuation", name: "Inventory Valuation Report", description: "Stock value by category & branch", category: "Inventory", icon: Boxes, color: "var(--chart-1)" },
  { id: "low-stock", name: "Low Stock & Reorder Report", description: "Items below minimum with reorder suggestions", category: "Inventory", icon: ShoppingCart, color: "var(--chart-4)" },
  // Finance
  { id: "pnl", name: "Profit & Loss Statement", description: "Income statement with full breakdown", category: "Finance", icon: Wallet, color: "var(--chart-3)" },
  { id: "balance-sheet", name: "Balance Sheet", description: "Assets, liabilities & equity position", category: "Finance", icon: FileSpreadsheet, color: "var(--chart-1)" },
  { id: "tax-gst", name: "Tax & GST Return", description: "Output/input tax & net payable summary", category: "Finance", icon: Receipt, color: "var(--chart-5)" },
  // HR
  { id: "payroll", name: "Payroll Register", description: "Monthly payroll with per-employee breakdown", category: "HR", icon: Users, color: "var(--chart-2)" },
  { id: "attendance", name: "Attendance Report", description: "Daily attendance & shift compliance", category: "HR", icon: Calendar, color: "var(--chart-4)" },
  // CRM
  { id: "customer-loyalty", name: "Customer & Loyalty Report", description: "Tier distribution, points & lifetime value", category: "CRM", icon: Award, color: "var(--chart-5)" },
  // Marketing
  { id: "marketing-roi", name: "Marketing ROI Report", description: "Campaign performance & return on investment", category: "Marketing", icon: Megaphone, color: "var(--chart-3)" },
  // Franchise
  { id: "franchise-ranking", name: "Franchise Ranking Report", description: "Branch comparison & royalty summary", category: "Franchise", icon: Store, color: "var(--chart-1)" },
  // Compliance
  { id: "compliance-audit", name: "Compliance & Audit Report", description: "Inspection scores & CCP status", category: "Compliance", icon: ShieldCheck, color: "var(--chart-3)" },
]

const CATEGORIES = ["All", "Sales", "Kitchen", "Delivery", "Inventory", "Finance", "HR", "CRM", "Marketing", "Franchise", "Compliance"]

export function Reports() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data } = useFetch<DData>(`/api/dashboard${branchParam}`, {})
  const [category, setCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<ReportDef | null>(null)

  // Periodic date selection
  const today = new Date()
  const [period, setPeriod] = useState<"today" | "yesterday" | "week" | "month" | "quarter" | "year" | "custom">("month")
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(today.getFullYear(), today.getMonth(), 1)
    return d.toISOString().slice(0, 10)
  })
  const [toDate, setToDate] = useState(() => today.toISOString().slice(0, 10))

  const periodLabels: Record<string, string> = {
    today: "Today", yesterday: "Yesterday", week: "This Week", month: "This Month", quarter: "This Quarter", year: "This Year", custom: "Custom Range",
  }

  const applyPeriod = (p: typeof period) => {
    setPeriod(p)
    const now = new Date()
    let from = new Date()
    const to = new Date()
    switch (p) {
      case "today": from = new Date(now); break
      case "yesterday": from = new Date(now); from.setDate(from.getDate() - 1); to.setDate(to.getDate() - 1); break
      case "week": from = new Date(now); from.setDate(from.getDate() - from.getDay()); break
      case "month": from = new Date(now.getFullYear(), now.getMonth(), 1); break
      case "quarter": from = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1); break
      case "year": from = new Date(now.getFullYear(), 0, 1); break
      case "custom": return // keep existing custom dates
    }
    setFromDate(from.toISOString().slice(0, 10))
    setToDate(to.toISOString().slice(0, 10))
  }

  const dateRangeLabel = `${new Date(fromDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })} — ${new Date(toDate).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}`

  const d = data

  const filtered = REPORTS.filter(r => {
    if (category !== "All" && r.category !== category) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const printReport = () => {
    // Open report in new window for clean printing (avoids app shell interference)
    const reportEl = document.querySelector("[style*='210mm']") as HTMLElement
    if (!reportEl) {
      toast.error("Report not found")
      return
    }
    const printWindow = window.open("", "_blank", "width=900,height=1200")
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print.")
      return
    }
    printWindow.document.open()
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${selected?.name ?? "Report"}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #000; background: #fff; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 4px 8px; text-align: left; font-size: 11px; }
  .border-b { border-bottom: 1px solid #ddd; }
  .font-bold { font-weight: bold; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
</style></head><body>${reportEl.innerHTML}</body></html>`)
    printWindow.document.close()
    printWindow.onload = () => { printWindow.print(); setTimeout(() => printWindow.close(), 500) }
    toast.success("Report sent to printer")
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div key="report-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Report toolbar (screen only) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 print:hidden">
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>← Back to Reports</Button>
              {/* Period selector */}
              <div className="flex items-center gap-1 flex-wrap">
                {(Object.keys(periodLabels) as typeof period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => applyPeriod(p)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors",
                      period === p ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted"
                    )}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </div>
              {/* Custom date inputs */}
              {period === "custom" && (
                <div className="flex items-center gap-1.5">
                  <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="h-7 w-36 text-xs" />
                  <span className="text-xs text-muted-foreground">→</span>
                  <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="h-7 w-36 text-xs" />
                </div>
              )}
              <div className="sm:ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.success("Exporting to PDF…")}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Export PDF
                </Button>
                <Button size="sm" onClick={printReport}>
                  <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
                </Button>
              </div>
            </div>

            {/* A4 Report Page */}
            <div className="mx-auto print:m-0" style={{ maxWidth: "210mm" }}>
              <div className="bg-white text-black shadow-lg print:shadow-none print:border-0" style={{ minHeight: "297mm" }}>
                <ReportContent report={selected} data={d} branchId={activeBranchId} dateRangeLabel={dateRangeLabel} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="report-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Header */}
            <Card className="overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10 flex items-center gap-4">
                <div className="grid place-items-center h-12 w-12 rounded-xl bg-primary text-primary-foreground shadow-lg">
                  <FileBarChart className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="font-extrabold text-lg">Reports Center</h2>
                  <p className="text-sm text-muted-foreground">Professional A4 printable reports across all modules — {REPORTS.length} reports available</p>
                </div>
              </div>
            </Card>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports…" className="pl-9 h-10" />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pf-scroll pb-1">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                      category === c ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Report cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {filtered.map(r => {
                const Icon = r.icon
                return (
                  <motion.button
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelected(r)}
                    className="text-left rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/40 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid place-items-center h-11 w-11 rounded-xl shrink-0 transition-transform group-hover:scale-110" style={{ background: `color-mix(in oklch, ${r.color} 15%, transparent)`, color: r.color }}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm leading-tight">{r.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{r.description}</div>
                        <Badge variant="outline" className="text-[9px] mt-1.5">{r.category}</Badge>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print styles for A4 */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  )
}

// ── Report content renderer ──
function ReportContent({ report, data, branchId, dateRangeLabel }: { report: ReportDef; data: DData | null; branchId: string; dateRangeLabel: string }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })
  const branchName = data?.branchStats?.find((b: any) => b.id === branchId)?.name ?? "All Branches"

  return (
    <div className="p-10 print:p-0">
      {/* ── Report Header (A4) ── */}
      <ReportHeader title={report.name} dateStr={dateStr} branchName={branchName} dateRange={dateRangeLabel} />

      {/* ── Report Body ── */}
      <div className="mt-6">
        {report.id === "sales-summary" && <SalesSummaryReport data={data} />}
        {report.id === "sales-by-channel" && <SalesByChannelReport data={data} />}
        {report.id === "top-products" && <TopProductsReport data={data} />}
        {report.id === "invoice" && <InvoiceReport data={data} />}
        {report.id === "kds-performance" && <KdsReport data={data} />}
        {report.id === "production-batch" && <ProductionReport />}
        {report.id === "delivery-performance" && <DeliveryReport data={data} />}
        {report.id === "inventory-valuation" && <InventoryValuationReport data={data} />}
        {report.id === "low-stock" && <LowStockReport data={data} />}
        {report.id === "pnl" && <PnlReport data={data} />}
        {report.id === "balance-sheet" && <BalanceSheetReport />}
        {report.id === "tax-gst" && <TaxReport data={data} />}
        {report.id === "payroll" && <PayrollReport data={data} />}
        {report.id === "attendance" && <AttendanceReport data={data} />}
        {report.id === "customer-loyalty" && <CustomerReport data={data} />}
        {report.id === "marketing-roi" && <MarketingReport />}
        {report.id === "franchise-ranking" && <FranchiseReport data={data} />}
        {report.id === "compliance-audit" && <ComplianceReport />}
      </div>

      {/* ── Report Footer (A4) ── */}
      <ReportFooter />
    </div>
  )
}

function ReportHeader({ title, dateStr, branchName, dateRange }: { title: string; dateStr: string; branchName: string; dateRange: string }) {
  return (
    <div className="border-b-2 border-black pb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Logo size={48} variant="icon" />
          <div>
            <div className="text-2xl font-extrabold tracking-tight">FusionFlow ERP</div>
            <div className="text-xs text-gray-500">Enterprise Restaurant Operating System</div>
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="font-bold text-gray-700">{dateStr}</div>
          <div className="text-gray-500">Generated by FusionFlow ERP</div>
          <div className="text-gray-500">Report ID: RPT-{Date.now().toString(36).toUpperCase().slice(-8)}</div>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Report Title</div>
          <div className="text-xl font-extrabold">{title}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Period</div>
          <div className="text-sm font-bold">{dateRange}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Branch</div>
          <div className="text-sm font-bold">{branchName}</div>
        </div>
      </div>
    </div>
  )
}

function ReportFooter() {
  return (
    <div className="mt-12 pt-4 border-t-2 border-black text-[10px] text-gray-500 flex items-center justify-between">
      <div>
        <div className="font-bold text-gray-700">FusionFlow ERP — Confidential</div>
        <div>This report is generated automatically and is for internal use only.</div>
      </div>
      <div className="text-right">
        <div>Page 1 of 1</div>
        <div>© {new Date().getFullYear()} FusionFlow Systems</div>
      </div>
    </div>
  )
}

// ── Individual report bodies ──

function SalesSummaryReport({ data }: { data: DData | null }) {
  const k = data?.kpis
  const hourly = data?.hourly ?? []
  const totalSales = k?.todaysSales ?? 0
  const totalOrders = k?.todaysOrders ?? 0
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Total Sales", value: formatPKR(totalSales) },
        { label: "Total Orders", value: totalOrders.toString() },
        { label: "Avg Order Value", value: formatPKR(k?.avgOrder ?? 0) },
        { label: "Gross Profit", value: formatPKR(k?.grossProfit ?? 0) },
      ]} />
      <ReportSection title="Hourly Sales Breakdown">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Hour</th>
              <th className="text-right py-2 px-3 font-bold">Orders</th>
              <th className="text-right py-2 px-3 font-bold">Sales (PKR)</th>
              <th className="text-right py-2 px-3 font-bold">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {hourly.map((h, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-1.5 px-3 font-mono">{h.hour}</td>
                <td className="py-1.5 px-3 text-right">{h.orders}</td>
                <td className="py-1.5 px-3 text-right font-semibold">{formatPKR(h.sales)}</td>
                <td className="py-1.5 px-3 text-right text-gray-600">{totalSales > 0 ? Math.round((h.sales / totalSales) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold bg-gray-50">
              <td className="py-2 px-3">TOTAL</td>
              <td className="py-2 px-3 text-right">{hourly.reduce((s, h) => s + h.orders, 0)}</td>
              <td className="py-2 px-3 text-right">{formatPKR(totalSales)}</td>
              <td className="py-2 px-3 text-right">100%</td>
            </tr>
          </tfoot>
        </table>
      </ReportSection>
    </div>
  )
}

function SalesByChannelReport({ data }: { data: DData | null }) {
  const channels = data?.orderTypes ?? []
  const total = channels.reduce((s, c) => s + c.value, 0)
  const channelRev: Record<string, number> = { dine_in: 0, takeaway: 0, delivery: 0, drive_thru: 0 }
  channels.forEach(c => { channelRev[c.name] = Math.round((c.value / Math.max(total, 1)) * (data?.kpis.todaysSales ?? 0)) })
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Total Orders", value: total.toString() },
        { label: "Total Revenue", value: formatPKR(data?.kpis.todaysSales ?? 0) },
        { label: "Channels Active", value: channels.length.toString() },
        { label: "Top Channel", value: channels.sort((a, b) => b.value - a.value)[0]?.name?.replace("_", " ") ?? "—" },
      ]} />
      <ReportSection title="Channel Performance">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Channel</th>
              <th className="text-right py-2 px-3 font-bold">Orders</th>
              <th className="text-right py-2 px-3 font-bold">Share %</th>
              <th className="text-right py-2 px-3 font-bold">Est. Revenue</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-1.5 px-3 font-semibold capitalize">{c.name.replace("_", " ")}</td>
                <td className="py-1.5 px-3 text-right">{c.value}</td>
                <td className="py-1.5 px-3 text-right">{total > 0 ? Math.round((c.value / total) * 100) : 0}%</td>
                <td className="py-1.5 px-3 text-right font-semibold">{formatPKR(channelRev[c.name] ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

function TopProductsReport({ data }: { data: DData | null }) {
  const products = data?.topProducts ?? []
  const totalQty = products.reduce((s, p) => s + p.qty, 0)
  const totalRev = products.reduce((s, p) => s + p.revenue, 0)
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Products Ranked", value: products.length.toString() },
        { label: "Total Units Sold", value: totalQty.toString() },
        { label: "Total Revenue", value: formatPKR(totalRev) },
        { label: "Top Seller", value: products[0]?.name ?? "—" },
      ]} />
      <ReportSection title="Product Ranking by Revenue">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-center py-2 px-2 font-bold w-10">#</th>
              <th className="text-left py-2 px-3 font-bold">Product Name</th>
              <th className="text-right py-2 px-3 font-bold">Qty Sold</th>
              <th className="text-right py-2 px-3 font-bold">Unit Price</th>
              <th className="text-right py-2 px-3 font-bold">Revenue</th>
              <th className="text-right py-2 px-3 font-bold">% Rev</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-1.5 px-2 text-center font-bold">{i + 1}</td>
                <td className="py-1.5 px-3 font-semibold">{p.name}</td>
                <td className="py-1.5 px-3 text-right">{p.qty}</td>
                <td className="py-1.5 px-3 text-right">{formatPKR(p.qty > 0 ? Math.round(p.revenue / p.qty) : 0)}</td>
                <td className="py-1.5 px-3 text-right font-semibold">{formatPKR(p.revenue)}</td>
                <td className="py-1.5 px-3 text-right text-gray-600">{totalRev > 0 ? Math.round((p.revenue / totalRev) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

function InvoiceReport({ data }: { data: DData | null }) {
  const [orderNo, setOrderNo] = useState("")
  const orders = data?.activeOrders ?? []
  const order = orders.find((o: any) => orderNo === "" || o.number.toString() === orderNo) ?? orders[0]

  if (!order) {
    return <div className="text-center py-12 text-gray-500 text-sm">No active orders available to generate invoice.</div>
  }

  return (
    <div>
      <div className="print:hidden mb-4">
        <label className="text-xs font-semibold block mb-1">Select Order Number</label>
        <select value={orderNo} onChange={e => setOrderNo(e.target.value)} className="w-full max-w-xs rounded-md border bg-white px-3 py-2 text-sm">
          {orders.map((o: any) => <option key={o.id} value={o.number}>{`#${o.number} — ${o.customerName ?? "Walk-in"} — ${formatPKR(o.total)}`}</option>)}
        </select>
      </div>

      {/* Invoice layout */}
      <div className="border-2 border-gray-300 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-2xl font-extrabold">TAX INVOICE</div>
            <div className="text-xs text-gray-500">Original for Recipient</div>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold">Invoice #: INV-{order.number}</div>
            <div>Date: {new Date(order.createdAt).toLocaleDateString("en-PK")}</div>
            <div>Time: {new Date(order.createdAt).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
          <div className="border rounded p-3">
            <div className="font-bold text-[10px] uppercase text-gray-400 mb-1">From</div>
            <div className="font-bold">FusionFlow Restaurant</div>
            <div>{order.branch?.name ?? "Gulberg III Flagship"}</div>
            <div>Lahore, Pakistan</div>
            <div>NTN: 1234567-8</div>
            <div>STRN: 3217654-0987654-1</div>
          </div>
          <div className="border rounded p-3">
            <div className="font-bold text-[10px] uppercase text-gray-400 mb-1">Bill To</div>
            <div className="font-bold">{order.customerName ?? "Walk-in Customer"}</div>
            <div>Phone: {order.customerPhone ?? "—"}</div>
            <div>Type: <span className="capitalize font-semibold">{order.type.replace("_", " ")}</span></div>
            {order.table && <div>Table: {order.table}</div>}
          </div>
        </div>

        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-2 border-black bg-gray-100">
              <th className="text-center py-2 px-2 font-bold w-8">#</th>
              <th className="text-left py-2 px-3 font-bold">Item Description</th>
              <th className="text-center py-2 px-2 font-bold w-16">Qty</th>
              <th className="text-right py-2 px-3 font-bold w-24">Rate</th>
              <th className="text-right py-2 px-3 font-bold w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any, i: number) => (
              <tr key={i} className="border-b border-gray-300">
                <td className="py-1.5 px-2 text-center">{i + 1}</td>
                <td className="py-1.5 px-3">
                  <div className="font-semibold">{item.name}</div>
                  {item.customizations && <div className="text-[10px] text-gray-500">{item.customizations}</div>}
                </td>
                <td className="py-1.5 px-2 text-center">{item.quantity}</td>
                <td className="py-1.5 px-3 text-right">{formatPKR(item.price)}</td>
                <td className="py-1.5 px-3 text-right font-semibold">{formatPKR(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <div className="w-64 text-xs space-y-1">
            <div className="flex justify-between border-b border-gray-200 py-1">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">{formatPKR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-1">
              <span className="text-gray-600">GST (13%):</span>
              <span className="font-semibold">{formatPKR(order.tax)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 py-1">
              <span className="text-gray-600">Discount:</span>
              <span className="font-semibold">{formatPKR(order.discount ?? 0)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-black py-2 text-base font-extrabold">
              <span>TOTAL:</span>
              <span>{formatPKR(order.total)}</span>
            </div>
            <div className="text-[10px] text-gray-500 pt-1">
              Payment: <span className="capitalize font-semibold">{order.paymentMethod ?? "Cash"}</span> · Status: <span className="font-semibold">{order.paymentStatus}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t-2 border-gray-200 text-center text-[10px] text-gray-500">
          <div className="font-bold">Thank you for dining with us!</div>
          <div>This is a computer-generated invoice and does not require a signature.</div>
          <div>For queries: info@fusionflow.dev · +92 300 0000000</div>
        </div>
      </div>
    </div>
  )
}

function KdsReport({ data }: { data: DData | null }) {
  const active = data?.activeOrders ?? []
  const stationLoad = data?.stationLoad ?? {}
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Active Orders", value: (data?.kpis.activeOrders ?? 0).toString() },
        { label: "Stations Active", value: Object.keys(stationLoad).length.toString() },
        { label: "Avg Prep Time", value: "11.4 min" },
        { label: "Orders Today", value: (data?.kpis.todaysOrders ?? 0).toString() },
      ]} />
      <ReportSection title="Kitchen Station Load">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Station</th>
              <th className="text-right py-2 px-3 font-bold">Active Orders</th>
              <th className="text-right py-2 px-3 font-bold">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stationLoad).map(([station, count]) => (
              <tr key={station} className="border-b border-gray-200">
                <td className="py-1.5 px-3 font-semibold capitalize">{station}</td>
                <td className="py-1.5 px-3 text-right">{count as number}</td>
                <td className="py-1.5 px-3 text-right">{Math.min(100, (count as number) * 20)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>
      <ReportSection title="Active Orders in Kitchen">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Order #</th>
              <th className="text-left py-2 px-3 font-bold">Type</th>
              <th className="text-left py-2 px-3 font-bold">Items</th>
              <th className="text-left py-2 px-3 font-bold">Status</th>
              <th className="text-right py-2 px-3 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {active.slice(0, 15).map((o: any, i: number) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-1.5 px-3 font-mono">#{o.number}</td>
                <td className="py-1.5 px-3 capitalize">{o.type.replace("_", " ")}</td>
                <td className="py-1.5 px-3">{o.items?.length ?? 0}</td>
                <td className="py-1.5 px-3 capitalize font-semibold">{o.status}</td>
                <td className="py-1.5 px-3 text-right">{formatPKR(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

function ProductionReport() {
  const batches = [
    { id: "DOU-2401", item: "Pizza Dough Balls", qty: "120 pcs", yield: 96, cost: 4800, status: "In Progress" },
    { id: "SAU-2401", item: "Tomato Sauce Batch", qty: "40 L", yield: 100, cost: 12800, status: "Ready" },
    { id: "CHK-2401", item: "Marinated Chicken", qty: "25 kg", yield: 92, cost: 19000, status: "In Progress" },
    { id: "VEG-2401", item: "Fresh Vegetable Prep", qty: "30 kg", yield: 88, cost: 5400, status: "Planned" },
    { id: "CHZ-2401", item: "Cheese Portioning", qty: "18 kg", yield: 98, cost: 26100, status: "Ready" },
  ]
  const totalCost = batches.reduce((s, b) => s + b.cost, 0)
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Total Batches", value: batches.length.toString() },
        { label: "Ready", value: batches.filter(b => b.status === "Ready").length.toString() },
        { label: "In Progress", value: batches.filter(b => b.status === "In Progress").length.toString() },
        { label: "Production Cost", value: formatPKR(totalCost) },
      ]} />
      <ReportSection title="Daily Production Batches">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Batch #</th>
              <th className="text-left py-2 px-3 font-bold">Item</th>
              <th className="text-right py-2 px-3 font-bold">Quantity</th>
              <th className="text-right py-2 px-3 font-bold">Yield %</th>
              <th className="text-right py-2 px-3 font-bold">Cost</th>
              <th className="text-left py-2 px-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-1.5 px-3 font-mono">{b.id}</td>
                <td className="py-1.5 px-3 font-semibold">{b.item}</td>
                <td className="py-1.5 px-3 text-right">{b.qty}</td>
                <td className="py-1.5 px-3 text-right">{b.yield}%</td>
                <td className="py-1.5 px-3 text-right">{formatPKR(b.cost)}</td>
                <td className="py-1.5 px-3">{b.status}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold bg-gray-50">
              <td className="py-2 px-3" colSpan={4}>TOTAL PRODUCTION COST</td>
              <td className="py-2 px-3 text-right">{formatPKR(totalCost)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </ReportSection>
    </div>
  )
}

function DeliveryReport({ data }: { data: DData | null }) {
  const riders = data?.riders ?? []
  const avgRating = riders.length ? (riders.reduce((s: number, r: any) => s + r.rating, 0) / riders.length).toFixed(1) : "—"
  const totalDeliveries = riders.reduce((s: number, r: any) => s + r.totalDeliveries, 0)
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Total Riders", value: riders.length.toString() },
        { label: "Available Now", value: riders.filter((r: any) => r.status === "available").length.toString() },
        { label: "Avg Rating", value: `★ ${avgRating}` },
        { label: "Total Deliveries", value: totalDeliveries.toString() },
      ]} />
      <ReportSection title="Rider Performance">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Rider</th>
              <th className="text-left py-2 px-3 font-bold">Vehicle</th>
              <th className="text-left py-2 px-3 font-bold">Status</th>
              <th className="text-right py-2 px-3 font-bold">Deliveries</th>
              <th className="text-right py-2 px-3 font-bold">Rating</th>
              <th className="text-right py-2 px-3 font-bold">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {riders.map((r: any, i: number) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-1.5 px-3 font-semibold">{r.name}</td>
                <td className="py-1.5 px-3 capitalize">{r.vehicle}</td>
                <td className="py-1.5 px-3 capitalize">{r.status.replace("_", " ")}</td>
                <td className="py-1.5 px-3 text-right">{r.totalDeliveries}</td>
                <td className="py-1.5 px-3 text-right">★ {r.rating}</td>
                <td className="py-1.5 px-3 text-right">{formatPKR(r.earnings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

function InventoryValuationReport({ data }: { data: DData | null }) {
  const inv = data?.inventory ?? []
  const byCat: Record<string, { items: number; value: number }> = {}
  inv.forEach(i => {
    const c = i.category
    if (!byCat[c]) byCat[c] = { items: 0, value: 0 }
    byCat[c].items++
    byCat[c].value += i.quantity * i.cost
  })
  const totalValue = inv.reduce((s, i) => s + i.quantity * i.cost, 0)
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Total SKUs", value: inv.length.toString() },
        { label: "Categories", value: Object.keys(byCat).length.toString() },
        { label: "Total Value", value: formatPKR(totalValue) },
        { label: "Low Stock Items", value: (data?.kpis.lowStockCount ?? 0).toString() },
      ]} />
      <ReportSection title="Inventory Valuation by Category">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Category</th>
              <th className="text-right py-2 px-3 font-bold">Items</th>
              <th className="text-right py-2 px-3 font-bold">Value</th>
              <th className="text-right py-2 px-3 font-bold">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(byCat).map(([cat, v]) => (
              <tr key={cat} className="border-b border-gray-200">
                <td className="py-1.5 px-3 font-semibold capitalize">{cat.replace("_", " ")}</td>
                <td className="py-1.5 px-3 text-right">{v.items}</td>
                <td className="py-1.5 px-3 text-right font-semibold">{formatPKR(v.value)}</td>
                <td className="py-1.5 px-3 text-right text-gray-600">{totalValue > 0 ? Math.round((v.value / totalValue) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold bg-gray-50">
              <td className="py-2 px-3">TOTAL INVENTORY VALUE</td>
              <td className="py-2 px-3 text-right">{inv.length}</td>
              <td className="py-2 px-3 text-right">{formatPKR(totalValue)}</td>
              <td className="py-2 px-3 text-right">100%</td>
            </tr>
          </tfoot>
        </table>
      </ReportSection>
    </div>
  )
}

function LowStockReport({ data }: { data: DData | null }) {
  const low = data?.lowStock ?? []
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Low Stock Items", value: low.length.toString() },
        { label: "Critical (<60%)", value: low.filter(i => i.quantity / i.minStock < 0.6).length.toString() },
        { label: "Reorder Value", value: formatPKR(low.reduce((s, i) => s + (i.minStock * 2 - i.quantity) * i.cost, 0)) },
        { label: "Branches Affected", value: new Set(low.map(i => i.branchId)).size.toString() },
      ]} />
      <ReportSection title="Items Below Minimum Stock">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Item</th>
              <th className="text-left py-2 px-3 font-bold">Category</th>
              <th className="text-left py-2 px-3 font-bold">Branch</th>
              <th className="text-right py-2 px-3 font-bold">Current</th>
              <th className="text-right py-2 px-3 font-bold">Minimum</th>
              <th className="text-right py-2 px-3 font-bold">Reorder Qty</th>
              <th className="text-right py-2 px-3 font-bold">Est. Cost</th>
            </tr>
          </thead>
          <tbody>
            {low.map((i, idx) => {
              const reorder = Math.round((i.minStock * 2 - i.quantity) * 10) / 10
              return (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-1.5 px-3 font-semibold">{i.name}</td>
                  <td className="py-1.5 px-3 capitalize">{i.category.replace("_", " ")}</td>
                  <td className="py-1.5 px-3">{i.branch?.name?.split(" ").slice(0, 2).join(" ") ?? "—"}</td>
                  <td className="py-1.5 px-3 text-right text-red-600 font-bold">{i.quantity}{i.unit}</td>
                  <td className="py-1.5 px-3 text-right">{i.minStock}{i.unit}</td>
                  <td className="py-1.5 px-3 text-right font-semibold">{reorder}{i.unit}</td>
                  <td className="py-1.5 px-3 text-right">{formatPKR(reorder * i.cost)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

function PnlReport({ data }: { data: DData | null }) {
  const revenue = data?.kpis.todaysSales ?? 840000
  const cogs = data?.kpis.foodCost ?? 268000
  const grossProfit = revenue - cogs
  const labor = Math.round(revenue * 0.24)
  const opex = Math.round(revenue * 0.18)
  const netIncome = grossProfit - labor - opex
  return (
    <div>
      <ReportSection title="Profit & Loss Statement">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <PLRow label="Revenue" value={revenue} bold />
            <PLRow label="Less: Cost of Goods Sold" value={-cogs} />
            <PLRow label="Gross Profit" value={grossProfit} bold border />
            <PLRow label="Operating Expenses" sub />
            <PLRow label="  Salaries & Wages" value={-labor} />
            <PLRow label="  Rent & Utilities" value={-Math.round(revenue * 0.08)} />
            <PLRow label="  Marketing" value={-Math.round(revenue * 0.04)} />
            <PLRow label="  Other Opex" value={-Math.round(revenue * 0.06)} />
            <PLRow label="Total Operating Expenses" value={-(labor + Math.round(revenue * 0.18))} bold />
            <PLRow label="Operating Income" value={netIncome} bold border />
            <PLRow label="NET INCOME" value={netIncome} bold border highlight />
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

function BalanceSheetReport() {
  return (
    <div>
      <ReportSection title="Balance Sheet">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="font-bold text-sm border-b border-black pb-1 mb-2">ASSETS</div>
            <BSTable rows={[
              { label: "Cash & Bank", value: 4310000 },
              { label: "Accounts Receivable", value: 343500 },
              { label: "Inventory", value: 498000 },
              { label: "Prepaid Expenses", value: 95000 },
              { label: "Fixed Assets (Net)", value: 6310000 },
            ]} total={{ label: "Total Assets", value: 11556500 }} />
          </div>
          <div>
            <div className="font-bold text-sm border-b border-black pb-1 mb-2">LIABILITIES & EQUITY</div>
            <BSTable rows={[
              { label: "Accounts Payable", value: 359000 },
              { label: "Sales Tax Payable", value: 286000 },
              { label: "Payroll Liabilities", value: 130000 },
              { label: "Bank Loans", value: 2720000 },
              { label: "Owner's Capital", value: 5000000 },
              { label: "Retained Earnings", value: 3051500 },
            ]} total={{ label: "Total L+E", value: 11556500 }} />
          </div>
        </div>
      </ReportSection>
    </div>
  )
}

function TaxReport({ data }: { data: DData | null }) {
  const revenue = data?.kpis.todaysSales ?? 840000
  const cogs = data?.kpis.foodCost ?? 268000
  const outputTax = Math.round(revenue * 0.13)
  const inputTax = Math.round(cogs * 0.13)
  const netTax = outputTax - inputTax
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Output Tax (Sales 13%)", value: formatPKR(outputTax) },
        { label: "Input Tax (Purchases 13%)", value: formatPKR(inputTax) },
        { label: "Net GST Payable", value: formatPKR(netTax) },
        { label: "Filing Status", value: "Pending" },
      ]} />
      <ReportSection title="GST Return Summary">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <PLRow label="Standard-rated supplies (13%)" value={revenue} />
            <PLRow label="Output Tax Collected" value={outputTax} bold />
            <PLRow label="Input Tax Paid on Purchases" value={inputTax} />
            <PLRow label="NET GST PAYABLE" value={netTax} bold border highlight />
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

function PayrollReport({ data }: { data: DData | null }) {
  const employees = data?.employees ?? []
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Employees", value: employees.length.toString() },
        { label: "Present Today", value: employees.filter((e: any) => e.attendance === "present").length.toString() },
        { label: "Monthly Payroll", value: formatPKR(employees.reduce((s: number, e: any) => s + e.salary, 0)) },
        { label: "Avg Salary", value: formatPKR(employees.length ? Math.round(employees.reduce((s: number, e: any) => s + e.salary, 0) / employees.length) : 0) },
      ]} />
      <ReportSection title="Payroll Register — Current Month">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Employee</th>
              <th className="text-left py-2 px-3 font-bold">Role</th>
              <th className="text-left py-2 px-3 font-bold">Shift</th>
              <th className="text-right py-2 px-3 font-bold">Base Salary</th>
              <th className="text-right py-2 px-3 font-bold">Tax Est.</th>
              <th className="text-right py-2 px-3 font-bold">Net Pay</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e: any, i: number) => {
              const tax = e.salary > 200000 ? Math.round(e.salary * 0.3) : e.salary > 100000 ? Math.round(e.salary * 0.2) : e.salary > 50000 ? Math.round(e.salary * 0.1) : 0
              return (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-1.5 px-3 font-semibold">{e.name}</td>
                  <td className="py-1.5 px-3 capitalize">{e.role}</td>
                  <td className="py-1.5 px-3 capitalize">{e.shift}</td>
                  <td className="py-1.5 px-3 text-right">{formatPKR(e.salary)}</td>
                  <td className="py-1.5 px-3 text-right text-red-600">({formatPKR(tax)})</td>
                  <td className="py-1.5 px-3 text-right font-bold">{formatPKR(e.salary - tax)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold bg-gray-50">
              <td className="py-2 px-3" colSpan={3}>TOTAL PAYROLL</td>
              <td className="py-2 px-3 text-right">{formatPKR(employees.reduce((s: number, e: any) => s + e.salary, 0))}</td>
              <td className="py-2 px-3 text-right text-red-600">({formatPKR(employees.reduce((s: number, e: any) => s + (e.salary > 200000 ? e.salary * 0.3 : e.salary > 100000 ? e.salary * 0.2 : e.salary > 50000 ? e.salary * 0.1 : 0), 0))})</td>
              <td className="py-2 px-3 text-right">{formatPKR(employees.reduce((s: number, e: any) => s + e.salary - (e.salary > 200000 ? e.salary * 0.3 : e.salary > 100000 ? e.salary * 0.2 : e.salary > 50000 ? e.salary * 0.1 : 0), 0))}</td>
            </tr>
          </tfoot>
        </table>
      </ReportSection>
    </div>
  )
}

function AttendanceReport({ data }: { data: DData | null }) {
  const employees = data?.employees ?? []
  const present = employees.filter((e: any) => e.attendance === "present").length
  const late = employees.filter((e: any) => e.attendance === "late").length
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Total Staff", value: employees.length.toString() },
        { label: "Present", value: present.toString() },
        { label: "Late", value: late.toString() },
        { label: "Attendance Rate", value: `${Math.round((present / Math.max(employees.length, 1)) * 100)}%` },
      ]} />
      <ReportSection title="Daily Attendance Register">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Employee</th>
              <th className="text-left py-2 px-3 font-bold">Role</th>
              <th className="text-left py-2 px-3 font-bold">Shift</th>
              <th className="text-left py-2 px-3 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e: any, i: number) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-1.5 px-3 font-semibold">{e.name}</td>
                <td className="py-1.5 px-3 capitalize">{e.role}</td>
                <td className="py-1.5 px-3 capitalize">{e.shift}</td>
                <td className="py-1.5 px-3 capitalize font-semibold">{e.attendance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

function CustomerReport({ data }: { data: DData | null }) {
  const customers = data?.customers ?? []
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Total Customers", value: customers.length.toString() },
        { label: "Total Loyalty Points", value: customers.reduce((s: number, c: any) => s + c.loyaltyPoints, 0).toLocaleString() },
        { label: "Lifetime Value", value: formatPKR(customers.reduce((s: number, c: any) => s + c.totalSpent, 0)) },
        { label: "Platinum Members", value: customers.filter((c: any) => c.tier === "Platinum").length.toString() },
      ]} />
      <ReportSection title="Customer Loyalty Summary">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Customer</th>
              <th className="text-left py-2 px-3 font-bold">Tier</th>
              <th className="text-right py-2 px-3 font-bold">Orders</th>
              <th className="text-right py-2 px-3 font-bold">Points</th>
              <th className="text-right py-2 px-3 font-bold">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c: any, i: number) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-1.5 px-3 font-semibold">{c.name}</td>
                <td className="py-1.5 px-3">{c.tier}</td>
                <td className="py-1.5 px-3 text-right">{c.ordersCount}</td>
                <td className="py-1.5 px-3 text-right">{c.loyaltyPoints.toLocaleString()}</td>
                <td className="py-1.5 px-3 text-right font-semibold">{formatPKR(c.totalSpent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

function MarketingReport() {
  const campaigns = [
    { name: "Ramadan Iftar Deal", channel: "WhatsApp", sent: 2100, redeemed: 124, revenue: 184000, cost: 25000 },
    { name: "Friday Family Feast", channel: "SMS", sent: 540, redeemed: 58, revenue: 86400, cost: 8000 },
    { name: "Win-back 30d", channel: "Email", sent: 320, redeemed: 12, revenue: 17800, cost: 3000 },
    { name: "Birthday Free Dessert", channel: "Push", sent: 84, redeemed: 18, revenue: 21600, cost: 1200 },
  ]
  const totalRev = campaigns.reduce((s, c) => s + c.revenue, 0)
  const totalCost = campaigns.reduce((s, c) => s + c.cost, 0)
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Campaigns", value: campaigns.length.toString() },
        { label: "Total Sent", value: campaigns.reduce((s, c) => s + c.sent, 0).toLocaleString() },
        { label: "Revenue Generated", value: formatPKR(totalRev) },
        { label: "Overall ROI", value: `${Math.round(((totalRev - totalCost) / totalCost) * 100)}%` },
      ]} />
      <ReportSection title="Campaign Performance & ROI">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Campaign</th>
              <th className="text-left py-2 px-3 font-bold">Channel</th>
              <th className="text-right py-2 px-3 font-bold">Sent</th>
              <th className="text-right py-2 px-3 font-bold">Redeemed</th>
              <th className="text-right py-2 px-3 font-bold">Revenue</th>
              <th className="text-right py-2 px-3 font-bold">Cost</th>
              <th className="text-right py-2 px-3 font-bold">ROI</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-1.5 px-3 font-semibold">{c.name}</td>
                <td className="py-1.5 px-3">{c.channel}</td>
                <td className="py-1.5 px-3 text-right">{c.sent}</td>
                <td className="py-1.5 px-3 text-right">{c.redeemed}</td>
                <td className="py-1.5 px-3 text-right">{formatPKR(c.revenue)}</td>
                <td className="py-1.5 px-3 text-right">{formatPKR(c.cost)}</td>
                <td className="py-1.5 px-3 text-right font-bold">{Math.round(((c.revenue - c.cost) / c.cost) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

function FranchiseReport({ data }: { data: DData | null }) {
  const branches = data?.branchStats ?? []
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Total Branches", value: branches.length.toString() },
        { label: "Open Now", value: branches.filter((b: any) => b.isOpen).length.toString() },
        { label: "Network Sales", value: formatPKR(branches.reduce((s: number, b: any) => s + b.sales, 0)) },
        { label: "Royalty Due", value: formatPKR(branches.reduce((s: number, b: any) => s + b.sales * (b.royaltyPct ?? 6) / 100, 0)) },
      ]} />
      <ReportSection title="Franchise Branch Ranking">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-center py-2 px-2 font-bold w-8">#</th>
              <th className="text-left py-2 px-3 font-bold">Branch</th>
              <th className="text-left py-2 px-3 font-bold">Brand</th>
              <th className="text-right py-2 px-3 font-bold">Orders</th>
              <th className="text-right py-2 px-3 font-bold">Sales</th>
              <th className="text-right py-2 px-3 font-bold">Royalty %</th>
              <th className="text-right py-2 px-3 font-bold">Royalty Due</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b: any, i: number) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-1.5 px-2 text-center font-bold">{i + 1}</td>
                <td className="py-1.5 px-3 font-semibold">{b.name}</td>
                <td className="py-1.5 px-3">{b.brand}</td>
                <td className="py-1.5 px-3 text-right">{b.orders}</td>
                <td className="py-1.5 px-3 text-right font-semibold">{formatPKR(b.sales)}</td>
                <td className="py-1.5 px-3 text-right">{b.royaltyPct}%</td>
                <td className="py-1.5 px-3 text-right">{formatPKR(b.sales * (b.royaltyPct ?? 6) / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

function ComplianceReport() {
  const inspections = [
    { id: "INS-082", date: "2025-07-25", type: "HACCP Audit", score: 94, status: "Passed" },
    { id: "INS-081", date: "2025-07-24", type: "Food Safety", score: 88, status: "Conditional" },
    { id: "INS-080", date: "2025-07-22", type: "Hygiene Check", score: 96, status: "Passed" },
    { id: "INS-079", date: "2025-07-20", type: "Pest Control", score: 92, status: "Passed" },
    { id: "INS-078", date: "2025-07-18", type: "Fire Safety", score: 85, status: "Conditional" },
  ]
  const avg = Math.round(inspections.reduce((s, i) => s + i.score, 0) / inspections.length)
  return (
    <div>
      <ReportStatGrid stats={[
        { label: "Inspections", value: inspections.length.toString() },
        { label: "Avg Score", value: `${avg}%` },
        { label: "Passed", value: inspections.filter(i => i.status === "Passed").length.toString() },
        { label: "Conditional", value: inspections.filter(i => i.status === "Conditional").length.toString() },
      ]} />
      <ReportSection title="Inspection Audit Trail">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left py-2 px-3 font-bold">Inspection #</th>
              <th className="text-left py-2 px-3 font-bold">Date</th>
              <th className="text-left py-2 px-3 font-bold">Type</th>
              <th className="text-right py-2 px-3 font-bold">Score</th>
              <th className="text-left py-2 px-3 font-bold">Result</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((i, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-1.5 px-3 font-mono">{i.id}</td>
                <td className="py-1.5 px-3">{i.date}</td>
                <td className="py-1.5 px-3 font-semibold">{i.type}</td>
                <td className="py-1.5 px-3 text-right font-bold">{i.score}%</td>
                <td className="py-1.5 px-3 font-semibold">{i.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportSection>
    </div>
  )
}

// ── Shared report components ──
function ReportStatGrid({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s, i) => (
        <div key={i} className="border-l-4 border-gray-400 pl-3 py-1">
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{s.label}</div>
          <div className="text-lg font-extrabold">{s.value}</div>
        </div>
      ))}
    </div>
  )
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-sm font-bold uppercase tracking-wider text-gray-600 border-b border-gray-300 pb-1 mb-3">{title}</div>
      {children}
    </div>
  )
}

function PLRow({ label, value, bold, border, sub, highlight }: { label: string; value: number; bold?: boolean; border?: boolean; sub?: boolean; highlight?: boolean }) {
  return (
    <tr className={cn(border && "border-t border-gray-400", highlight && "bg-gray-100")}>
      <td className={cn("py-1 px-2", sub ? "text-[10px] uppercase text-gray-500 font-bold" : "text-xs", bold ? "font-bold" : "")}>{label}</td>
      <td className={cn("py-1 px-2 text-right font-mono", bold ? "font-bold" : "", value < 0 ? "text-red-600" : "")}>
        {value < 0 ? `(${formatPKR(Math.abs(value))})` : formatPKR(value)}
      </td>
    </tr>
  )
}

function BSTable({ rows, total }: { rows: { label: string; value: number }[]; total: { label: string; value: number } }) {
  return (
    <table className="w-full text-xs border-collapse">
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-gray-200">
            <td className="py-1 px-1">{r.label}</td>
            <td className="py-1 px-1 text-right font-mono">{formatPKR(r.value)}</td>
          </tr>
        ))}
        <tr className="border-t-2 border-black font-bold bg-gray-50">
          <td className="py-2 px-1">{total.label}</td>
          <td className="py-2 px-1 text-right font-mono">{formatPKR(total.value)}</td>
        </tr>
      </tbody>
    </table>
  )
}
