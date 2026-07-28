"use client"

import { useState } from "react"
import { useFetch } from "@/hooks/use-fetch"
import { useAppStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { formatPKR } from "@/lib/data"
import {
  ShoppingCart, Truck, Package, CheckCircle2, Clock, XCircle, Plus, Search,
  FileText, Phone, MapPin, Star, TrendingUp, AlertTriangle, Calendar, Download, Wallet,
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface InvData { inventory: any[] }

interface Vendor {
  id: string; name: string; category: string; contact: string; phone: string
  city: string; rating: number; totalOrders: number; outstanding: number
  leadTime: number; paymentTerms: string; status: "active" | "blocked"
}
const VENDORS: Vendor[] = [
  { id: "V-01", name: "Nestlé Pakistan", category: "Dairy & Cheese", contact: "Asad Mahmood", phone: "+924235781111", city: "Lahore", rating: 4.8, totalOrders: 184, outstanding: 245000, leadTime: 2, paymentTerms: "Net 30", status: "active" },
  { id: "V-02", name: "Dawn Foods", category: "Flour & Bakery", contact: "Naveed Iqbal", phone: "+924235912200", city: "Lahore", rating: 4.6, totalOrders: 142, outstanding: 86000, leadTime: 1, paymentTerms: "Net 15", status: "active" },
  { id: "V-03", name: "K&N's Chicken", category: "Poultry", contact: "Farhan Ali", phone: "+922134567890", city: "Karachi", rating: 4.9, totalOrders: 98, outstanding: 0, leadTime: 3, paymentTerms: "Net 15", status: "active" },
  { id: "V-04", name: "Metro Cash & Carry", category: "General Supplies", contact: "Sana Tariq", phone: "+924238876543", city: "Lahore", rating: 4.3, totalOrders: 210, outstanding: 54000, leadTime: 2, paymentTerms: "Net 30", status: "active" },
  { id: "V-05", name: "Pizza Hut Supply Co", category: "Packaging", contact: "Usman Ghani", phone: "+922136677889", city: "Karachi", rating: 4.5, totalOrders: 76, outstanding: 32000, leadTime: 4, paymentTerms: "Advance", status: "active" },
  { id: "V-06", name: "Coca-Cola Beverages", category: "Beverages", contact: "Rizwan Khan", phone: "+924260644211", city: "Lahore", rating: 4.7, totalOrders: 124, outstanding: 67000, leadTime: 1, paymentTerms: "Net 30", status: "active" },
  { id: "V-07", name: "Fresh Harvest Farms", category: "Vegetables", contact: "Maria Yousaf", phone: "+923004556677", city: "Sheikhupura", rating: 4.2, totalOrders: 285, outstanding: 18000, leadTime: 1, paymentTerms: "COD", status: "active" },
  { id: "V-08", name: "Al-Madina Oil Mills", category: "Cooking Oil", contact: "Tariq Javed", phone: "+924237788990", city: "Lahore", rating: 4.0, totalOrders: 56, outstanding: 0, leadTime: 2, paymentTerms: "Net 15", status: "blocked" },
]

interface PO {
  id: string; vendorId: string; vendorName: string; date: string; expected: string
  items: number; total: number; status: "draft" | "sent" | "partial" | "received" | "cancelled"
  branch: string; paid: boolean
}
const PURCHASE_ORDERS: PO[] = [
  { id: "PO-0418", vendorId: "V-01", vendorName: "Nestlé Pakistan", date: "2025-07-24", expected: "2025-07-26", items: 5, total: 245000, status: "sent", branch: "BR-GUL", paid: false },
  { id: "PO-0417", vendorId: "V-03", vendorName: "K&N's Chicken", date: "2025-07-23", expected: "2025-07-25", items: 3, total: 178000, status: "partial", branch: "BR-GUL", paid: false },
  { id: "PO-0416", vendorId: "V-02", vendorName: "Dawn Foods", date: "2025-07-22", expected: "2025-07-23", items: 8, total: 86000, status: "received", branch: "BR-GUL", paid: true },
  { id: "PO-0415", vendorId: "V-07", vendorName: "Fresh Harvest Farms", date: "2025-07-25", expected: "2025-07-25", items: 12, total: 18000, status: "received", branch: "BR-GUL", paid: true },
  { id: "PO-0414", vendorId: "V-06", vendorName: "Coca-Cola Beverages", date: "2025-07-20", expected: "2025-07-21", items: 6, total: 67000, status: "received", branch: "BR-DHA", paid: true },
  { id: "PO-0413", vendorId: "V-05", vendorName: "Pizza Hut Supply Co", date: "2025-07-19", expected: "2025-07-23", items: 4, total: 32000, status: "received", branch: "BR-JOH", paid: false },
  { id: "PO-0412", vendorId: "V-04", vendorName: "Metro Cash & Carry", date: "2025-07-18", expected: "2025-07-20", items: 15, total: 54000, status: "received", branch: "BR-GUL", paid: false },
  { id: "PO-0411", vendorId: "V-01", vendorName: "Nestlé Pakistan", date: "2025-07-15", expected: "2025-07-17", items: 7, total: 198000, status: "received", branch: "BR-GUL", paid: true },
  { id: "PO-0410", vendorId: "V-02", vendorName: "Dawn Foods", date: "2025-07-12", expected: "2025-07-13", items: 10, total: 102000, status: "cancelled", branch: "BR-CK1", paid: false },
  { id: "PO-0409", vendorId: "V-06", vendorName: "Coca-Cola Beverages", date: "2025-07-10", expected: "2025-07-11", items: 8, total: 88000, status: "received", branch: "BR-KHI", paid: true },
]

const PO_STATUS_META = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground", icon: FileText },
  sent: { label: "Sent", cls: "bg-chart-2/15 text-chart-2", icon: Clock },
  partial: { label: "Partial GRN", cls: "bg-chart-4/15 text-chart-4", icon: Package },
  received: { label: "Received", cls: "bg-chart-3/15 text-chart-3", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", cls: "bg-destructive/15 text-destructive", icon: XCircle },
}

export function Purchasing() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data } = useFetch<InvData>(`/api/dashboard${branchParam}`, {})
  const [tab, setTab] = useState("overview")
  const [search, setSearch] = useState("")

  const totalOutstanding = VENDORS.reduce((s, v) => s + v.outstanding, 0)
  const activePOs = PURCHASE_ORDERS.filter(p => p.status === "sent" || p.status === "partial").length
  const receivedThisMonth = PURCHASE_ORDERS.filter(p => p.status === "received").length
  const totalSpend = PURCHASE_ORDERS.filter(p => p.status === "received").reduce((s, p) => s + p.total, 0)

  const filteredPOs = PURCHASE_ORDERS.filter(p => !search || p.id.toLowerCase().includes(search.toLowerCase()) || p.vendorName.toLowerCase().includes(search.toLowerCase()))
  const filteredVendors = VENDORS.filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase()))

  // spend by vendor chart
  const spendByVendor = VENDORS.map(v => ({
    name: v.name.split(" ")[0],
    spend: PURCHASE_ORDERS.filter(p => p.vendorId === v.id && p.status === "received").reduce((s, p) => s + p.total, 0),
  })).filter(d => d.spend > 0).sort((a, b) => b.spend - a.spend).slice(0, 6)

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto pf-scroll pb-1">
          <TabsList className="h-auto bg-muted/50 p-1">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "pos", label: "Purchase Orders", icon: ShoppingCart },
              { id: "vendors", label: "Vendors", icon: Truck },
              { id: "grn", label: "Goods Receiving", icon: Package },
            ].map(t => (
              <TabsTrigger key={t.id} value={t.id} className="text-xs gap-1.5 px-3 py-1.5">
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Tile icon={ShoppingCart} label="Active POs" value={activePOs} sub="pending delivery" color="var(--chart-2)" />
            <Tile icon={CheckCircle2} label="Received (Month)" value={receivedThisMonth} sub="POs fulfilled" color="var(--chart-3)" />
            <Tile icon={Wallet} label="Total Spend" value={formatPKR(totalSpend)} sub="this month" color="var(--chart-1)" />
            <Tile icon={AlertTriangle} label="Outstanding AP" value={formatPKR(totalOutstanding)} sub="to vendors" color="var(--chart-4)" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30">
                <h3 className="font-bold text-sm">Spend by Vendor</h3>
                <p className="text-[11px] text-muted-foreground">Top 6 vendors this month</p>
              </div>
              <div className="h-[260px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendByVendor} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v >= 1000 ? Math.round(v / 1000) + "k" : String(v)} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={80} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                    <Bar dataKey="spend" radius={[0, 6, 6, 0]} barSize={20}>
                      {spendByVendor.map((_, i) => <Cell key={i} fill={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--primary)"][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30">
                <h3 className="font-bold text-sm">Reorder Suggestions</h3>
                <p className="text-[11px] text-muted-foreground">Auto-generated from low stock</p>
              </div>
              <div className="p-2 max-h-[260px] overflow-y-auto pf-scroll">
                {data?.inventory.filter(i => i.quantity <= i.minStock).slice(0, 8).map(i => {
                  const vendor = VENDORS.find(v => v.category.toLowerCase().includes(i.name.toLowerCase().includes("cheese") ? "dairy" : i.name.toLowerCase().includes("flour") ? "flour" : i.name.toLowerCase().includes("chicken") ? "poultry" : i.name.toLowerCase().includes("oil") ? "oil" : i.name.toLowerCase().includes("box") ? "packaging" : "general")) ?? VENDORS[3]
                  return (
                    <motion.div key={i.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/40">
                      <Package className="h-3.5 w-3.5 text-chart-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{i.name}</div>
                        <div className="text-[10px] text-muted-foreground">{vendor.name} · {i.minStock * 2}{i.unit} suggested</div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-[10px] shrink-0" onClick={() => toast.success(`PO created for ${i.name}`)}>
                        Create PO
                      </Button>
                    </motion.div>
                  )
                })}
                {(!data || data.inventory.filter(i => i.quantity <= i.minStock).length === 0) && (
                  <div className="p-6 text-center text-xs text-muted-foreground"><CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-chart-3" />All stock healthy</div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── PURCHASE ORDERS ── */}
        <TabsContent value="pos" className="mt-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="font-bold text-sm">Purchase Orders</h3>
              <div className="sm:ml-auto flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search POs…" className="h-8 w-44 pl-8 text-xs" />
                </div>
                <Button size="sm" onClick={() => toast.info("New purchase order")}><Plus className="h-3.5 w-3.5 mr-1" /> New PO</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">PO #</th>
                    <th className="text-left px-4 py-2">Vendor</th>
                    <th className="text-left px-4 py-2 hidden sm:table-cell">Date</th>
                    <th className="text-left px-4 py-2 hidden md:table-cell">Expected</th>
                    <th className="text-right px-4 py-2 hidden sm:table-cell">Items</th>
                    <th className="text-right px-4 py-2">Total</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="text-center px-4 py-2 hidden lg:table-cell">Paid</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPOs.map(po => {
                    const m = PO_STATUS_META[po.status]
                    const Icon = m.icon
                    return (
                      <tr key={po.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5"><span className="font-mono text-xs font-bold">{po.id}</span></td>
                        <td className="px-4 py-2.5 text-xs font-medium">{po.vendorName}</td>
                        <td className="px-4 py-2.5 hidden sm:table-cell text-xs text-muted-foreground">{po.date}</td>
                        <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">{po.expected}</td>
                        <td className="px-4 py-2.5 hidden sm:table-cell text-right text-xs">{po.items}</td>
                        <td className="px-4 py-2.5 text-right text-xs font-bold">{formatPKR(po.total)}</td>
                        <td className="px-4 py-2.5">
                          <Badge className={cn("text-[9px]", m.cls)}><Icon className="h-2.5 w-2.5 mr-0.5" />{m.label}</Badge>
                        </td>
                        <td className="px-4 py-2.5 hidden lg:table-cell text-center">
                          {po.paid ? <CheckCircle2 className="h-4 w-4 text-chart-3 mx-auto" /> : <Clock className="h-4 w-4 text-chart-4 mx-auto" />}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => toast.info(`View ${po.id}`)}>View</Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── VENDORS ── */}
        <TabsContent value="vendors" className="mt-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
              <h3 className="font-bold text-sm">Vendor Directory</h3>
              <div className="ml-auto relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors…" className="h-8 w-48 pl-8 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
              {filteredVendors.map(v => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("rounded-xl border p-3", v.status === "blocked" && "opacity-60")}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">{v.name}</div>
                      <Badge variant="outline" className="text-[9px] mt-0.5">{v.category}</Badge>
                    </div>
                    <Badge variant={v.status === "active" ? "default" : "destructive"} className="text-[9px] capitalize">{v.status}</Badge>
                  </div>
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{v.contact} · {v.phone}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{v.city} · Lead {v.leadTime}d</div>
                    <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />{v.paymentTerms}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-2 text-center">
                    <div className="rounded bg-muted/40 py-1">
                      <div className="text-[9px] text-muted-foreground">ORDERS</div>
                      <div className="text-xs font-bold">{v.totalOrders}</div>
                    </div>
                    <div className="rounded bg-muted/40 py-1">
                      <div className="text-[9px] text-muted-foreground">RATING</div>
                      <div className="text-xs font-bold text-chart-2">★ {v.rating}</div>
                    </div>
                    <div className="rounded bg-muted/40 py-1">
                      <div className="text-[9px] text-muted-foreground">DUE</div>
                      <div className={cn("text-xs font-bold", v.outstanding > 0 ? "text-chart-4" : "text-chart-3")}>{formatPKR(v.outstanding)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]" onClick={() => toast.info(`New PO for ${v.name}`)}>
                      <Plus className="h-3 w-3 mr-1" /> New PO
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info(`Calling ${v.contact}`)}>
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ── GOODS RECEIVING ── */}
        <TabsContent value="grn" className="mt-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Goods Receiving Notes (GRN)</h3>
                <p className="text-[11px] text-muted-foreground">Receive inventory against purchase orders</p>
              </div>
              <Button size="sm" onClick={() => toast.info("New GRN")}><Plus className="h-3.5 w-3.5 mr-1" /> New GRN</Button>
            </div>
            <div className="divide-y max-h-[520px] overflow-y-auto pf-scroll">
              {PURCHASE_ORDERS.filter(p => p.status === "partial" || p.status === "received").map(po => {
                const vendor = VENDORS.find(v => v.id === po.vendorId)
                const received = po.status === "received"
                return (
                  <div key={po.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                    <div className={cn("grid place-items-center h-10 w-10 rounded-lg shrink-0", received ? "bg-chart-3/15 text-chart-3" : "bg-chart-4/15 text-chart-4")}>
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold">{po.id}</span>
                        <Badge variant="outline" className="text-[9px]">{po.items} items</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{po.vendorName} · {formatPKR(po.total)}</div>
                      <div className="text-[10px] text-muted-foreground">Expected {po.expected} · {vendor?.leadTime}d lead</div>
                    </div>
                    {received ? (
                      <Badge className="text-[9px] bg-chart-3/15 text-chart-3"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Fully Received</Badge>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Badge className="text-[9px] bg-chart-4/15 text-chart-4">Partial</Badge>
                        <Button size="sm" className="h-7 text-[10px]" onClick={() => toast.success(`GRN completed for ${po.id}`)}>Receive</Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, color }: { icon: typeof ShoppingCart; label: string; value: string | number; sub: string; color: string }) {
  return (
    <Card>
      <div className="p-4 flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase">{label}</div>
          <div className="text-xl font-extrabold">{value}</div>
          <div className="text-[10px] text-muted-foreground">{sub}</div>
        </div>
      </div>
    </Card>
  )
}

