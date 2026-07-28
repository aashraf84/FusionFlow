"use client"

import { useMemo, useState } from "react"
import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { formatPKR } from "@/lib/data"
import {
  Wallet, TrendingUp, TrendingDown, FileText, BookOpen, Landmark, PiggyBank,
  Calculator, Receipt, Building2, Scale, Percent, Banknote, ArrowDownLeft,
  ArrowUpRight, CheckCircle2, AlertTriangle, Plus, Download, Calendar,
} from "lucide-react"
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface FData {
  kpis: { todaysSales: number; foodCost: number; grossProfit: number; todaysOrders: number }
}

const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

// ── Chart of Accounts ──
interface GLAccount { code: string; name: string; type: string; balance: number }
const COA: GLAccount[] = [
  // Assets (1000)
  { code: "1010", name: "Cash on Hand", type: "Current Asset", balance: 850000 },
  { code: "1020", name: "Bank — Current A/C", type: "Current Asset", balance: 2840000 },
  { code: "1030", name: "Bank — Payroll A/C", type: "Current Asset", balance: 620000 },
  { code: "1100", name: "Accounts Receivable", type: "Current Asset", balance: 343500 },
  { code: "1200", name: "Inventory — Raw Materials", type: "Current Asset", balance: 412000 },
  { code: "1210", name: "Inventory — Packaging", type: "Current Asset", balance: 86000 },
  { code: "1300", name: "Prepaid Expenses", type: "Current Asset", balance: 95000 },
  { code: "1500", name: "Equipment & Machinery", type: "Fixed Asset", balance: 3200000 },
  { code: "1510", name: "Furniture & Fixtures", type: "Fixed Asset", balance: 840000 },
  { code: "1520", name: "Vehicles (Delivery)", type: "Fixed Asset", balance: 1450000 },
  { code: "1530", name: "Leasehold Improvements", type: "Fixed Asset", balance: 2100000 },
  { code: "1590", name: "Accumulated Depreciation", type: "Contra Asset", balance: -1980000 },
  // Liabilities (2000)
  { code: "2010", name: "Accounts Payable", type: "Current Liability", balance: 359000 },
  { code: "2020", name: "Accrued Expenses", type: "Current Liability", balance: 124000 },
  { code: "2030", name: "Sales Tax Payable (GST)", type: "Current Liability", balance: 286000 },
  { code: "2040", name: "Payroll Tax Payable", type: "Current Liability", balance: 98000 },
  { code: "2050", name: "EOBI Payable", type: "Current Liability", balance: 32000 },
  { code: "2100", name: "Staff Advances", type: "Current Liability", balance: 67000 },
  { code: "2500", name: "Bank Loan — Equipment", type: "Long-term Liability", balance: 1800000 },
  { code: "2510", name: "Vehicle Loan", type: "Long-term Liability", balance: 920000 },
  // Equity (3000)
  { code: "3010", name: "Owner's Capital", type: "Equity", balance: 5000000 },
  { code: "3020", name: "Retained Earnings", type: "Equity", balance: 4280000 },
  { code: "3030", name: "Current Period Net Income", type: "Equity", balance: 0 },
  // Revenue (4000)
  { code: "4010", name: "Dine-In Sales", type: "Revenue", balance: 2840000 },
  { code: "4020", name: "Takeaway Sales", type: "Revenue", balance: 1620000 },
  { code: "4030", name: "Delivery Sales", type: "Revenue", balance: 1980000 },
  { code: "4040", name: "Drive-Thru Sales", type: "Revenue", balance: 840000 },
  { code: "4050", name: "Online Sales", type: "Revenue", balance: 1118000 },
  { code: "4100", name: "Franchise Royalty Income", type: "Revenue", balance: 184000 },
  // COGS (5000)
  { code: "5010", name: "Food Cost — Raw Materials", type: "COGS", balance: 2680000 },
  { code: "5020", name: "Packaging Cost", type: "COGS", balance: 184000 },
  // Operating Expenses (6000)
  { code: "6010", name: "Salaries & Wages", type: "Operating Expense", balance: 2010000 },
  { code: "6020", name: "Rent & Utilities", type: "Operating Expense", balance: 680000 },
  { code: "6030", name: "Marketing & Advertising", type: "Operating Expense", balance: 320000 },
  { code: "6040", name: "Repairs & Maintenance", type: "Operating Expense", balance: 145000 },
  { code: "6050", name: "Delivery Expense", type: "Operating Expense", balance: 210000 },
  { code: "6060", name: "Admin & Office", type: "Operating Expense", balance: 95000 },
  { code: "6070", name: "Depreciation Expense", type: "Operating Expense", balance: 165000 },
  { code: "6080", name: "Insurance", type: "Operating Expense", balance: 88000 },
]

// ── Journal Entries ──
interface JE { id: string; date: string; desc: string; debit: string; credit: string; amount: number; ref: string }
const JOURNAL: JE[] = [
  { id: "JE-0421", date: "2025-07-25", desc: "Daily POS sales settlement", debit: "1010", credit: "4010", amount: 284000, ref: "POS-0725" },
  { id: "JE-0422", date: "2025-07-25", desc: "Inventory purchase — Nestlé cheese", debit: "1200", credit: "2010", amount: 87000, ref: "PO-118" },
  { id: "JE-0423", date: "2025-07-25", desc: "Salary advance — Sara Malik", debit: "2100", credit: "1030", amount: 30000, ref: "ADV-44" },
  { id: "JE-0424", date: "2025-07-24", desc: "GST collected on sales", debit: "4010", credit: "2030", amount: 286000, ref: "GST-JUL" },
  { id: "JE-0425", date: "2025-07-24", desc: "Utility bill — LESCO electricity", debit: "6020", credit: "1020", amount: 145000, ref: "BILL-882" },
  { id: "JE-0426", date: "2025-07-24", desc: "Delivery bike fuel", debit: "6050", credit: "1010", amount: 28000, ref: "PETTY-71" },
  { id: "JE-0427", date: "2025-07-23", desc: "Monthly depreciation — July", debit: "6070", credit: "1590", amount: 165000, ref: "DEP-JUL" },
  { id: "JE-0428", date: "2025-07-23", desc: "Marketing campaign — Ramadan", debit: "6030", credit: "1020", amount: 95000, ref: "MKT-22" },
  { id: "JE-0429", date: "2025-07-22", desc: "Franchise royalty received — DHA", debit: "1020", credit: "4100", amount: 18400, ref: "ROY-DHA" },
  { id: "JE-0430", date: "2025-07-22", desc: "Equipment repair — Pizza oven", debit: "6040", credit: "1010", amount: 42000, ref: "REP-15" },
  { id: "JE-0431", date: "2025-07-21", desc: "Payroll run — July", debit: "6010", credit: "1030", amount: 2010000, ref: "PAY-JUL" },
  { id: "JE-0432", date: "2025-07-21", desc: "Payroll tax withholding", debit: "6010", credit: "2040", amount: 98000, ref: "TAX-JUL" },
  { id: "JE-0433", date: "2025-07-20", desc: "Online order settlement", debit: "1020", credit: "4050", amount: 320000, ref: "ONL-0720" },
  { id: "JE-0434", date: "2025-07-20", desc: "Insurance premium — Q3", debit: "6080", credit: "1020", amount: 88000, ref: "INS-Q3" },
  { id: "JE-0435", date: "2025-07-19", desc: "Vehicle loan installment", debit: "2510", credit: "1020", amount: 76000, ref: "LN-V01" },
]

// ── Fixed Assets ──
interface Asset { id: string; name: string; cat: string; date: string; cost: number; salvage: number; life: number; accumDep: number }
const ASSETS: Asset[] = [
  { id: "FA-01", name: "Pizza Oven — Conveyor", cat: "Equipment", date: "2023-01-15", cost: 1200000, salvage: 120000, life: 8, accumDep: 225000 },
  { id: "FA-02", name: "Deep Fryer — Commercial", cat: "Equipment", date: "2023-03-10", cost: 450000, salvage: 45000, life: 6, accumDep: 93750 },
  { id: "FA-03", name: "Dough Mixer 40kg", cat: "Equipment", date: "2023-06-20", cost: 380000, salvage: 38000, life: 7, accumDep: 65142 },
  { id: "FA-04", name: "Refrigeration Unit", cat: "Equipment", date: "2022-11-05", cost: 680000, salvage: 68000, life: 10, accumDep: 176800 },
  { id: "FA-05", name: "POS Terminals (×6)", cat: "Equipment", date: "2024-01-10", cost: 490000, salvage: 49000, life: 5, accumDep: 49000 },
  { id: "FA-06", name: "Dining Tables & Chairs", cat: "Furniture", date: "2023-01-15", cost: 540000, salvage: 54000, life: 10, accumDep: 135000 },
  { id: "FA-07", name: "Kitchen Workstations", cat: "Furniture", date: "2023-02-20", cost: 300000, salvage: 30000, life: 8, accumDep: 56250 },
  { id: "FA-08", name: "Delivery Bike — B-001", cat: "Vehicle", date: "2023-04-12", cost: 185000, salvage: 18500, life: 5, accumDep: 55500 },
  { id: "FA-09", name: "Delivery Bike — B-002", cat: "Vehicle", date: "2023-04-12", cost: 185000, salvage: 18500, life: 5, accumDep: 55500 },
  { id: "FA-10", name: "Delivery Van", cat: "Vehicle", date: "2024-02-01", cost: 1080000, salvage: 108000, life: 8, accumDep: 135000 },
  { id: "FA-11", name: "Branch Fit-Out — Gulberg", cat: "Leasehold", date: "2023-01-01", cost: 1200000, salvage: 0, life: 10, accumDep: 300000 },
  { id: "FA-12", name: "Branch Fit-Out — DHA", cat: "Leasehold", date: "2023-06-01", cost: 900000, salvage: 0, life: 10, accumDep: 180000 },
  { id: "FA-13", name: "AC Units (×8)", cat: "Equipment", date: "2023-03-01", cost: 320000, salvage: 32000, life: 8, accumDep: 60000 },
  { id: "FA-14", name: "CCTV & Security System", cat: "Equipment", date: "2023-01-20", cost: 180000, salvage: 18000, life: 6, accumDep: 37500 },
  { id: "FA-15", name: "Signage & Branding", cat: "Leasehold", date: "2023-01-10", cost: 240000, salvage: 0, life: 5, accumDep: 96000 },
]

// ── Bank Reconciliation ──
const RECONCILE = {
  bankName: "HBL — Current Account",
  statementBalance: 2815000,
  bookBalance: 2840000,
  depositsInTransit: [
    { id: "DP-01", desc: "Online payment settlement", amount: 185000, date: "2025-07-25" },
    { id: "DP-02", desc: "Franchise royalty — DHA", amount: 18400, date: "2025-07-24" },
  ],
  outstandingChecks: [
    { id: "CH-4451", desc: "Rent payment — July", amount: 145000, date: "2025-07-20" },
    { id: "CH-4452", desc: "Equipment repair", amount: 42000, date: "2025-07-22" },
  ],
  bankCharges: [
    { id: "BC-01", desc: "Account maintenance fee", amount: 2500 },
    { id: "BC-02", desc: "Transaction charges", amount: 1800 },
  ],
  interestEarned: 4300,
}

// ── Budget ──
const BUDGET = [
  { cat: "Revenue", budget: 8500000, actual: 8402000 },
  { cat: "Food Cost", budget: 2700000, actual: 2680000 },
  { cat: "Salaries", budget: 2000000, actual: 2010000 },
  { cat: "Rent & Utilities", budget: 700000, actual: 680000 },
  { cat: "Marketing", budget: 350000, actual: 320000 },
  { cat: "Delivery", budget: 250000, actual: 210000 },
  { cat: "Maintenance", budget: 150000, actual: 145000 },
  { cat: "Admin", budget: 100000, actual: 95000 },
  { cat: "Depreciation", budget: 170000, actual: 165000 },
  { cat: "Insurance", budget: 90000, actual: 88000 },
]

export function Finance() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data, loading } = useFetch<FData>(`/api/dashboard${branchParam}`, {})
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

  const sales = data?.kpis.todaysSales ?? 580000
  const cogs = data?.kpis.foodCost ?? 164000
  const grossProfit = data?.kpis.grossProfit ?? 416000

  // 12-month trend (synthesized from daily KPIs)
  const pnl = useMemo(() => MONTHS.map((m, i) => {
    const rev = Math.round(620000 + i * 48000 + Math.sin(i * 0.8) * 90000 + Math.random() * 40000)
    const cost = Math.round(rev * 0.32)
    const labor = Math.round(rev * 0.24)
    const opex = Math.round(rev * 0.18)
    return { month: m, revenue: rev, cogs: cost, labor, opex, net: rev - cost - labor - opex }
  }), [])

  // Income statement figures (monthly + YTD)
  const revenue = pnl.reduce((s, p) => s + p.revenue, 0)
  const totalCogs = pnl.reduce((s, p) => s + p.cogs, 0)
  const grossProfitTotal = revenue - totalCogs
  const totalLabor = pnl.reduce((s, p) => s + p.labor, 0)
  const totalOpex = pnl.reduce((s, p) => s + p.opex, 0)
  const operatingIncome = grossProfitTotal - totalLabor - totalOpex
  const otherIncome = 184000 + 24000
  const tax = Math.round(operatingIncome * 0.25)
  const netIncome = operatingIncome + otherIncome - tax

  // Balance sheet figures
  const currentAssets = COA.filter(a => a.type === "Current Asset").reduce((s, a) => s + a.balance, 0)
  const fixedAssets = COA.filter(a => a.type === "Fixed Asset").reduce((s, a) => s + a.balance, 0)
  const accumDep = COA.find(a => a.code === "1590")!.balance
  const totalAssets = currentAssets + fixedAssets + accumDep
  const currentLiab = COA.filter(a => a.type === "Current Liability").reduce((s, a) => s + a.balance, 0)
  const ltLiab = COA.filter(a => a.type === "Long-term Liability").reduce((s, a) => s + a.balance, 0)
  const equity = COA.filter(a => a.type === "Equity").reduce((s, a) => s + a.balance, 0) + netIncome
  const totalLiabEquity = currentLiab + ltLiab + equity

  // Bank reconciliation calculation
  const adjustedBook = RECONCILE.bookBalance + RECONCILE.interestEarned - RECONCILE.bankCharges.reduce((s, b) => s + b.amount, 0)
  const adjustedBank = RECONCILE.statementBalance + RECONCILE.depositsInTransit.reduce((s, d) => s + d.amount, 0) - RECONCILE.outstandingChecks.reduce((s, c) => s + c.amount, 0)
  const reconDiff = adjustedBank - adjustedBook

  // Tax (GST)
  const outputTax = Math.round(revenue * 0.13)
  const inputTax = Math.round(totalCogs * 0.13)
  const netTax = outputTax - inputTax

  const accountTypes = ["Current Asset", "Fixed Asset", "Contra Asset", "Current Liability", "Long-term Liability", "Equity", "Revenue", "COGS", "Operating Expense"]
  const accountEntries = selectedAccount ? JOURNAL.filter(j => j.debit === selectedAccount || j.credit === selectedAccount) : []

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pf-scroll pb-1">
          <TabsList className="h-auto bg-muted/50 p-1">
            {[
              { id: "overview", label: "Overview", icon: Wallet },
              { id: "income", label: "Income Statement", icon: TrendingUp },
              { id: "balance", label: "Balance Sheet", icon: Scale },
              { id: "ledger", label: "General Ledger", icon: BookOpen },
              { id: "journal", label: "Journal Entries", icon: FileText },
              { id: "reconcile", label: "Bank Reconciliation", icon: Landmark },
              { id: "tax", label: "Tax & GST", icon: Percent },
              { id: "assets", label: "Fixed Assets", icon: Building2 },
              { id: "budget", label: "Budgeting", icon: Calculator },
            ].map(t => (
              <TabsTrigger key={t.id} value={t.id} className="text-xs gap-1.5 px-3 py-1.5">
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <Kpi icon={TrendingUp} label="Revenue (YTD)" value={formatPKR(revenue)} color="var(--chart-3)" delta="+12.4%" />
            <Kpi icon={PiggyBank} label="Net Income" value={formatPKR(netIncome)} color="var(--chart-1)" delta="+8.1%" />
            <Kpi icon={Wallet} label="Cash Balance" value={formatPKR(currentAssets)} color="var(--chart-2)" delta="+5.2%" />
            <Kpi icon={Building2} label="Total Assets" value={formatPKR(totalAssets)} color="var(--chart-4)" delta="+3.4%" />
            <Kpi icon={Receipt} label="Total Liabilities" value={formatPKR(currentLiab + ltLiab)} color="var(--chart-5)" delta="-2.1%" />
            <Kpi icon={Scale} label="Equity" value={formatPKR(equity)} color="var(--chart-3)" delta="+6.8%" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <Header title="P&L Trend" desc="Revenue vs Net Income — 12 months" />
              <div className="h-[280px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pnl}>
                    <defs>
                      <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.3} /><stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} /></linearGradient>
                      <linearGradient id="netG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v >= 1000 ? Math.round(v / 1000) + "k" : String(v)} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--chart-3)" strokeWidth={2.5} fill="url(#revG)" />
                    <Area type="monotone" dataKey="net" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#netG)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="overflow-hidden">
              <Header title="Expense Breakdown" desc="YTD operating expenses" />
              <div className="h-[280px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[
                      { name: "Food Cost", value: totalCogs },
                      { name: "Labor", value: totalLabor },
                      { name: "Rent & Utilities", value: 680000 },
                      { name: "Marketing", value: 320000 },
                      { name: "Other Opex", value: 533000 },
                    ]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                      {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <Header title="Cash Flow — 6 Months" desc="Inflow vs outflow" />
            <div className="h-[200px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnl.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v >= 1000 ? Math.round(v / 1000) + "k" : String(v)} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                  <Bar dataKey="revenue" fill="var(--chart-3)" radius={[4, 4, 0, 0]} barSize={14} name="Inflow" />
                  <Bar dataKey="cogs" fill="var(--chart-4)" radius={[4, 4, 0, 0]} barSize={14} name="Outflow" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        {/* ── INCOME STATEMENT ── */}
        <TabsContent value="income" className="mt-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-chart-3" /> Income Statement (P&L)</h3>
                <p className="text-[11px] text-muted-foreground">Multi-step · Fiscal Year 2025-26</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.success("P&L exported")}><Download className="h-3.5 w-3.5 mr-1" /> Export</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">Description</th>
                    <th className="text-right px-4 py-2 font-semibold">Current Month</th>
                    <th className="text-right px-4 py-2 font-semibold">YTD</th>
                    <th className="text-right px-4 py-2 font-semibold">% of Rev</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <PLRow label="Revenue — Dine-In" value={284000} ytd={2840000} rev={revenue} />
                  <PLRow label="Revenue — Takeaway" value={162000} ytd={1620000} rev={revenue} />
                  <PLRow label="Revenue — Delivery" value={198000} ytd={1980000} rev={revenue} />
                  <PLRow label="Revenue — Drive-Thru" value={84000} ytd={840000} rev={revenue} />
                  <PLRow label="Revenue — Online" value={112000} ytd={1118000} rev={revenue} />
                  <PLRow label="Franchise Royalty Income" value={18400} ytd={184000} rev={revenue} />
                  <PLRow label="Total Revenue" value={858400} ytd={revenue} bold />
                  <PLRow label="Less: Cost of Goods Sold" value={-268000} ytd={-totalCogs} neg />
                  <PLRow label="Gross Profit" value={590400} ytd={grossProfitTotal} bold highlight />
                  <PLRow label="Operating Expenses" sub />
                  <PLRow label="  Salaries & Wages" value={-201000} ytd={-totalLabor} neg />
                  <PLRow label="  Rent & Utilities" value={-68000} ytd={-680000} neg />
                  <PLRow label="  Marketing & Advertising" value={-32000} ytd={-320000} neg />
                  <PLRow label="  Repairs & Maintenance" value={-14500} ytd={-145000} neg />
                  <PLRow label="  Delivery Expense" value={-21000} ytd={-210000} neg />
                  <PLRow label="  Admin & Office" value={-9500} ytd={-95000} neg />
                  <PLRow label="  Depreciation" value={-16500} ytd={-165000} neg />
                  <PLRow label="  Insurance" value={-8800} ytd={-88000} neg />
                  <PLRow label="Total Operating Expenses" value={-451300} ytd={-(totalLabor + 680000 + 320000 + 145000 + 210000 + 95000 + 165000 + 88000)} bold />
                  <PLRow label="Operating Income" value={139100} ytd={operatingIncome} bold highlight />
                  <PLRow label="Other Income — Interest" value={2400} ytd={24000} />
                  <PLRow label="Income Before Tax" value={141500} ytd={operatingIncome + otherIncome} bold />
                  <PLRow label="Less: Income Tax (25%)" value={-35375} ytd={-tax} neg />
                  <PLRow label="NET INCOME" value={106125} ytd={netIncome} bold highlight large />
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── BALANCE SHEET ── */}
        <TabsContent value="balance" className="mt-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2"><Scale className="h-4 w-4 text-primary" /> Balance Sheet</h3>
              <Badge variant={Math.abs(totalAssets - totalLiabEquity) < 100 ? "default" : "destructive"} className="text-[10px]">
                {Math.abs(totalAssets - totalLiabEquity) < 100 ? (<><CheckCircle2 className="h-3 w-3 mr-1" /> Balanced</>) : (<><AlertTriangle className="h-3 w-3 mr-1" /> Check</>)}
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
              {/* Assets */}
              <div>
                <div className="px-4 py-2 bg-muted/40 font-bold text-xs uppercase text-muted-foreground">Assets</div>
                <BSRow label="Current Assets" sub />
                {COA.filter(a => a.type === "Current Asset").map(a => <BSRow key={a.code} label={`  ${a.code} · ${a.name}`} value={a.balance} />)}
                <BSRow label="Total Current Assets" value={currentAssets} bold />
                <BSRow label="Fixed Assets" sub />
                {COA.filter(a => a.type === "Fixed Asset").map(a => <BSRow key={a.code} label={`  ${a.code} · ${a.name}`} value={a.balance} />)}
                <BSRow label="Total Fixed Assets" value={fixedAssets} bold />
                <BSRow label={`  1590 · Accumulated Depreciation`} value={accumDep} neg />
                <BSRow label="TOTAL ASSETS" value={totalAssets} bold highlight large />
              </div>
              {/* Liabilities & Equity */}
              <div>
                <div className="px-4 py-2 bg-muted/40 font-bold text-xs uppercase text-muted-foreground">Liabilities</div>
                <BSRow label="Current Liabilities" sub />
                {COA.filter(a => a.type === "Current Liability").map(a => <BSRow key={a.code} label={`  ${a.code} · ${a.name}`} value={a.balance} />)}
                <BSRow label="Total Current Liabilities" value={currentLiab} bold />
                <BSRow label="Long-term Liabilities" sub />
                {COA.filter(a => a.type === "Long-term Liability").map(a => <BSRow key={a.code} label={`  ${a.code} · ${a.name}`} value={a.balance} />)}
                <BSRow label="Total LT Liabilities" value={ltLiab} bold />
                <BSRow label="Total Liabilities" value={currentLiab + ltLiab} bold />
                <div className="px-4 py-2 bg-muted/40 font-bold text-xs uppercase text-muted-foreground mt-2">Equity</div>
                {COA.filter(a => a.type === "Equity").map(a => <BSRow key={a.code} label={`  ${a.code} · ${a.name}`} value={a.balance} />)}
                <BSRow label="  Current Period Net Income" value={netIncome} />
                <BSRow label="Total Equity" value={equity} bold />
                <BSRow label="TOTAL LIAB. + EQUITY" value={totalLiabEquity} bold highlight large />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── GENERAL LEDGER ── */}
        <TabsContent value="ledger" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
            <Card className="overflow-hidden">
              <Header title="Chart of Accounts" desc={`${COA.length} accounts`} />
              <div className="max-h-[520px] overflow-y-auto pf-scroll">
                {accountTypes.map(type => {
                  const accts = COA.filter(a => a.type === type)
                  if (accts.length === 0) return null
                  const typeTotal = accts.reduce((s, a) => s + a.balance, 0)
                  return (
                    <div key={type}>
                      <div className="px-3 py-1.5 bg-muted/30 text-[10px] font-bold uppercase text-muted-foreground flex items-center justify-between">
                        <span>{type}</span>
                        <span>{formatPKR(typeTotal)}</span>
                      </div>
                      {accts.map(a => (
                        <button
                          key={a.code}
                          onClick={() => setSelectedAccount(a.code)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-muted/40 text-left border-b",
                            selectedAccount === a.code && "bg-primary/5"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <code className="text-[10px] text-muted-foreground font-mono">{a.code}</code>
                            <span className="font-medium">{a.name}</span>
                          </span>
                          <span className={cn("font-bold", a.balance < 0 && "text-destructive")}>{formatPKR(a.balance)}</span>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </Card>
            <Card className="overflow-hidden">
              <Header title={selectedAccount ? `Account ${selectedAccount} — ${COA.find(a => a.code === selectedAccount)?.name}` : "Select an account"} desc="Journal entries" />
              <div className="max-h-[520px] overflow-y-auto pf-scroll">
                {!selectedAccount ? (
                  <div className="p-12 text-center text-sm text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    Click an account to view its journal entries
                  </div>
                ) : accountEntries.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No entries for this account</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2">Date</th>
                        <th className="text-left px-3 py-2">Entry #</th>
                        <th className="text-left px-3 py-2">Description</th>
                        <th className="text-center px-3 py-2">Side</th>
                        <th className="text-right px-3 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {accountEntries.map(j => {
                        const isDebit = j.debit === selectedAccount
                        return (
                          <tr key={j.id} className="hover:bg-muted/20">
                            <td className="px-3 py-2 text-xs text-muted-foreground">{j.date}</td>
                            <td className="px-3 py-2 text-xs font-mono">{j.id}</td>
                            <td className="px-3 py-2 text-xs">{j.desc}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge variant="outline" className={cn("text-[9px]", isDebit ? "text-chart-3" : "text-destructive")}>{isDebit ? "Dr" : "Cr"}</Badge>
                            </td>
                            <td className={cn("px-3 py-2 text-right text-xs font-bold", isDebit ? "text-chart-3" : "text-destructive")}>
                              {isDebit ? "+" : "−"}{formatPKR(j.amount)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── JOURNAL ENTRIES ── */}
        <TabsContent value="journal" className="mt-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Journal Entries</h3>
              <Button size="sm" onClick={() => toast.info("New journal entry dialog")}><Plus className="h-3.5 w-3.5 mr-1" /> New Entry</Button>
            </div>
            <div className="overflow-x-auto max-h-[560px] overflow-y-auto pf-scroll">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-left px-4 py-2">Entry #</th>
                    <th className="text-left px-4 py-2">Description</th>
                    <th className="text-left px-4 py-2 hidden md:table-cell">Debit</th>
                    <th className="text-left px-4 py-2 hidden md:table-cell">Credit</th>
                    <th className="text-left px-4 py-2 hidden lg:table-cell">Reference</th>
                    <th className="text-right px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {JOURNAL.map(j => (
                    <tr key={j.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{j.date}</td>
                      <td className="px-4 py-2.5 text-xs font-mono font-semibold">{j.id}</td>
                      <td className="px-4 py-2.5 text-xs">{j.desc}</td>
                      <td className="px-4 py-2.5 text-xs hidden md:table-cell">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">{j.debit}</code>
                      </td>
                      <td className="px-4 py-2.5 text-xs hidden md:table-cell">
                        <code className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">{j.credit}</code>
                      </td>
                      <td className="px-4 py-2.5 text-xs hidden lg:table-cell text-muted-foreground font-mono">{j.ref}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-bold">{formatPKR(j.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── BANK RECONCILIATION ── */}
        <TabsContent value="reconcile" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <Header title={RECONCILE.bankName} desc="Reconciliation as of 25-Jul-2025" />
              <div className="p-4 space-y-3">
                <ReconRow label="Balance per bank statement" value={RECONCILE.statementBalance} />
                <div className="text-[10px] font-bold uppercase text-muted-foreground pl-3">Add: Deposits in Transit</div>
                {RECONCILE.depositsInTransit.map(d => <ReconRow key={d.id} label={`  ${d.desc}`} value={d.amount} small />)}
                <div className="text-[10px] font-bold uppercase text-muted-foreground pl-3">Less: Outstanding Checks</div>
                {RECONCILE.outstandingChecks.map(c => <ReconRow key={c.id} label={`  ${c.desc}`} value={-c.amount} small />)}
                <div className="border-t pt-2" />
                <ReconRow label="Adjusted Bank Balance" value={adjustedBank} bold />
              </div>
            </Card>
            <Card className="overflow-hidden">
              <Header title="Book Balance" desc="Per general ledger" />
              <div className="p-4 space-y-3">
                <ReconRow label="Balance per books" value={RECONCILE.bookBalance} />
                <div className="text-[10px] font-bold uppercase text-muted-foreground pl-3">Add: Interest Earned</div>
                <ReconRow label="  Bank interest" value={RECONCILE.interestEarned} small />
                <div className="text-[10px] font-bold uppercase text-muted-foreground pl-3">Less: Bank Charges</div>
                {RECONCILE.bankCharges.map(b => <ReconRow key={b.id} label={`  ${b.desc}`} value={-b.amount} small />)}
                <div className="border-t pt-2" />
                <ReconRow label="Adjusted Book Balance" value={adjustedBook} bold />
              </div>
            </Card>
          </div>
          <Card className={cn("overflow-hidden border-2", Math.abs(reconDiff) < 100 ? "border-chart-3" : "border-destructive")}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {Math.abs(reconDiff) < 100 ? (
                  <CheckCircle2 className="h-8 w-8 text-chart-3" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {Math.abs(reconDiff) < 100 ? "Reconciliation Successful" : "Reconciliation Discrepancy"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {Math.abs(reconDiff) < 100 ? "Bank and book balances match." : `Difference of ${formatPKR(Math.abs(reconDiff))} needs investigation.`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Difference</div>
                <div className={cn("text-xl font-extrabold", Math.abs(reconDiff) < 100 ? "text-chart-3" : "text-destructive")}>{formatPKR(reconDiff)}</div>
              </div>
              <Button onClick={() => toast.success("Reconciliation posted")}>Post Reconciliation</Button>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAX & GST ── */}
        <TabsContent value="tax" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi icon={Percent} label="Output Tax (Sales)" value={formatPKR(outputTax)} color="var(--chart-1)" />
            <Kpi icon={Receipt} label="Input Tax (Purchases)" value={formatPKR(inputTax)} color="var(--chart-4)" />
            <Kpi icon={Wallet} label="Net GST Payable" value={formatPKR(netTax)} color="var(--chart-5)" />
            <Kpi icon={Calendar} label="Filing Due" value="Aug 25" color="var(--chart-2)" />
          </div>
          <Card className="overflow-hidden">
            <Header title="GST Return — July 2025" desc="Standard-rated sales @ 13%" />
            <div className="p-4 space-y-2">
              <TaxRow label="Standard-rated supplies (13%)" value={revenue} rate="13%" tax={outputTax} />
              <TaxRow label="Zero-rated supplies (exports)" value={0} rate="0%" tax={0} />
              <TaxRow label="Exempt supplies" value={0} rate="—" tax={0} />
              <div className="border-t pt-2 flex items-center justify-between font-bold">
                <span>Total Output Tax</span>
                <span className="text-chart-1">{formatPKR(outputTax)}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span>Less: Input Tax (purchases)</span>
                <span className="text-chart-4">({formatPKR(inputTax)})</span>
              </div>
              <div className="border-t-2 pt-2 flex items-center justify-between text-base font-extrabold">
                <span>NET GST PAYABLE</span>
                <span className="text-primary">{formatPKR(netTax)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px]"><Calendar className="h-3 w-3 mr-1" /> Due: 25-Aug-2025</Badge>
                <Badge variant="secondary" className="text-[10px] bg-chart-4/15 text-chart-4">Pending Filing</Badge>
                <Button size="sm" className="ml-auto" onClick={() => toast.success("GST return filed")}><FileText className="h-3.5 w-3.5 mr-1" /> File Return</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── FIXED ASSETS ── */}
        <TabsContent value="assets" className="mt-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Fixed Asset Register</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">{ASSETS.length} assets</Badge>
                <Badge variant="secondary" className="text-[10px]">NBV: {formatPKR(ASSETS.reduce((s, a) => s + (a.cost - a.accumDep), 0))}</Badge>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">Asset</th>
                    <th className="text-left px-3 py-2 hidden md:table-cell">Category</th>
                    <th className="text-left px-3 py-2 hidden lg:table-cell">Purchase Date</th>
                    <th className="text-right px-3 py-2">Cost</th>
                    <th className="text-right px-3 py-2 hidden md:table-cell">Salvage</th>
                    <th className="text-center px-3 py-2 hidden lg:table-cell">Life (yr)</th>
                    <th className="text-right px-3 py-2 hidden md:table-cell">Annual Dep</th>
                    <th className="text-right px-3 py-2">Accum Dep</th>
                    <th className="text-right px-3 py-2">NBV</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ASSETS.map(a => {
                    const annualDep = Math.round((a.cost - a.salvage) / a.life)
                    const nbv = a.cost - a.accumDep
                    return (
                      <tr key={a.id} className="hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <div className="font-semibold text-xs">{a.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{a.id}</div>
                        </td>
                        <td className="px-3 py-2 hidden md:table-cell"><Badge variant="outline" className="text-[9px]">{a.cat}</Badge></td>
                        <td className="px-3 py-2 hidden lg:table-cell text-xs text-muted-foreground">{a.date}</td>
                        <td className="px-3 py-2 text-right text-xs font-bold">{formatPKR(a.cost)}</td>
                        <td className="px-3 py-2 text-right text-xs hidden md:table-cell text-muted-foreground">{formatPKR(a.salvage)}</td>
                        <td className="px-3 py-2 text-center text-xs hidden lg:table-cell">{a.life}</td>
                        <td className="px-3 py-2 text-right text-xs hidden md:table-cell text-chart-4">{formatPKR(annualDep)}</td>
                        <td className="px-3 py-2 text-right text-xs text-destructive">({formatPKR(a.accumDep)})</td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-chart-3">{formatPKR(nbv)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-muted/30 font-bold">
                  <tr>
                    <td className="px-3 py-2 text-xs" colSpan={3}>TOTAL</td>
                    <td className="px-3 py-2 text-right text-xs">{formatPKR(ASSETS.reduce((s, a) => s + a.cost, 0))}</td>
                    <td className="px-3 py-2 hidden md:table-cell" colSpan={3} />
                    <td className="px-3 py-2 text-right text-xs text-destructive">({formatPKR(ASSETS.reduce((s, a) => s + a.accumDep, 0))})</td>
                    <td className="px-3 py-2 text-right text-xs text-chart-3">{formatPKR(ASSETS.reduce((s, a) => s + (a.cost - a.accumDep), 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── BUDGETING ── */}
        <TabsContent value="budget" className="mt-4">
          <Card className="overflow-hidden">
            <Header title="Annual Budget vs Actual" desc="FY 2025-26 · variance analysis" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">Category</th>
                    <th className="text-right px-4 py-2">Budget</th>
                    <th className="text-right px-4 py-2">Actual</th>
                    <th className="text-right px-4 py-2">Variance</th>
                    <th className="text-right px-4 py-2">%</th>
                    <th className="px-4 py-2 w-32">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {BUDGET.map(b => {
                    const isRev = b.cat === "Revenue"
                    const variance = isRev ? b.actual - b.budget : b.budget - b.actual
                    const pct = Math.round((variance / b.budget) * 100)
                    const good = variance >= 0
                    return (
                      <tr key={b.cat} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 text-xs font-semibold">{b.cat}</td>
                        <td className="px-4 py-2.5 text-right text-xs">{formatPKR(b.budget)}</td>
                        <td className="px-4 py-2.5 text-right text-xs font-bold">{formatPKR(b.actual)}</td>
                        <td className={cn("px-4 py-2.5 text-right text-xs font-bold", good ? "text-chart-3" : "text-destructive")}>
                          {good ? "+" : ""}{formatPKR(variance)}
                        </td>
                        <td className={cn("px-4 py-2.5 text-right text-xs", good ? "text-chart-3" : "text-destructive")}>{good ? "+" : ""}{pct}%</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className={cn("h-full", good ? "bg-chart-3" : "bg-chart-4")} style={{ width: `${Math.min(100, Math.abs(pct) * 2)}%` }} />
                            </div>
                            <Badge variant="outline" className={cn("text-[9px]", good ? "text-chart-3" : "text-chart-4")}>{good ? "On Track" : "Over"}</Badge>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <Header title="Budget Forecast — Next Quarter" desc="AI-driven projection based on trends" />
            <div className="h-[200px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={["Q1", "Q2", "Q3", "Q4 (Forecast)"].map((q, i) => ({ q, actual: i < 3 ? 2200000 + i * 180000 : null, forecast: 2200000 + i * 180000 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="q" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : v >= 1000 ? Math.round(v / 1000) + "k" : String(v)} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatPKR(v)} />
                  <Line type="monotone" dataKey="actual" stroke="var(--chart-3)" strokeWidth={2.5} dot={{ r: 4 }} name="Actual" />
                  <Line type="monotone" dataKey="forecast" stroke="var(--chart-4)" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4 }} name="Forecast" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
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

function Kpi({ icon: Icon, label, value, color, delta }: { icon: typeof Wallet; label: string; value: string; color: string; delta?: string }) {
  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="grid place-items-center h-9 w-9 rounded-lg" style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}><Icon className="h-[18px] w-[18px]" /></div>
          {delta && <Badge variant="secondary" className="text-[10px] text-chart-3"><TrendingUp className="h-2.5 w-2.5 mr-0.5" />{delta}</Badge>}
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground font-semibold uppercase">{label}</div>
        <div className="text-lg font-extrabold">{value}</div>
      </div>
    </Card>
  )
}

function PLRow({ label, value, ytd, rev, bold, neg, highlight, sub, large }: { label: string; value: number; ytd: number; rev?: number; bold?: boolean; neg?: boolean; highlight?: boolean; sub?: boolean; large?: boolean }) {
  const pct = rev ? Math.round((ytd / rev) * 100) : 0
  return (
    <tr className={cn(bold && "bg-muted/20", highlight && "bg-primary/5")}>
      <td className={cn("px-4 py-1.5", sub ? "text-[10px] font-bold uppercase text-muted-foreground" : "text-xs", bold ? "font-bold" : "font-medium", large && "text-sm font-extrabold")}>{label}</td>
      <td className={cn("px-4 py-1.5 text-right", large && "text-base font-extrabold", bold ? "font-bold" : "font-medium", neg || value < 0 ? "text-destructive" : "")}>{value < 0 ? `(${formatPKR(Math.abs(value))})` : formatPKR(value)}</td>
      <td className={cn("px-4 py-1.5 text-right", large && "text-base font-extrabold", bold ? "font-bold" : "font-medium", neg || ytd < 0 ? "text-destructive" : "", highlight && "text-primary")}>{ytd < 0 ? `(${formatPKR(Math.abs(ytd))})` : formatPKR(ytd)}</td>
      <td className="px-4 py-1.5 text-right text-xs text-muted-foreground">{rev ? `${pct}%` : "—"}</td>
    </tr>
  )
}

function BSRow({ label, value, bold, neg, sub, highlight, large }: { label: string; value: number; bold?: boolean; neg?: boolean; sub?: boolean; highlight?: boolean; large?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-1.5 border-b",
      sub && "bg-muted/40 text-[10px] font-bold uppercase text-muted-foreground",
      bold && "font-bold bg-muted/20",
      highlight && "bg-primary/5",
      large && "text-base font-extrabold border-t-2"
    )}>
      <span className="text-xs">{label}</span>
      <span className={cn("text-xs font-bold", (neg || value < 0) && "text-destructive", highlight && "text-primary")}>{value < 0 ? `(${formatPKR(Math.abs(value))})` : formatPKR(value)}</span>
    </div>
  )
}

function ReconRow({ label, value, bold, small }: { label: string; value: number; bold?: boolean; small?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", bold && "font-bold text-base border-t pt-2", small && "text-[11px] text-muted-foreground")}>
      <span>{label}</span>
      <span className={cn("font-bold", value < 0 && "text-destructive")}>{value < 0 ? `(${formatPKR(Math.abs(value))})` : formatPKR(value)}</span>
    </div>
  )
}

function TaxRow({ label, value, rate, tax }: { label: string; value: number; rate: string; tax: number }) {
  return (
    <div className="flex items-center justify-between text-xs py-1">
      <span className="flex-1">{label}</span>
      <Badge variant="outline" className="text-[9px] mx-2">{rate}</Badge>
      <span className="w-24 text-right">{formatPKR(value)}</span>
      <span className="w-24 text-right font-bold text-chart-1">{formatPKR(tax)}</span>
    </div>
  )
}
