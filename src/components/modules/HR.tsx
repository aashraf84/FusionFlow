"use client"

import { useMemo, useState } from "react"
import { useAppStore } from "@/lib/store"
import { useFetch } from "@/hooks/use-fetch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { formatPKR } from "@/lib/data"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Wallet,
  TrendingUp,
  Search,
  Plus,
  Phone,
  Award,
  CalendarDays,
  Printer,
  CheckCircle2,
  XCircle,
  Star,
  GraduationCap,
  FileText,
  Target,
  Briefcase,
  Banknote,
  Receipt,
  PiggyBank,
  Sun,
  Moon,
  Coffee,
  LogIn,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  IdCard,
  Clock3,
  Plane,
  HeartPulse,
  Baby,
  CalendarCheck,
  Hourglass,
  Check,
  ShieldCheck,
} from "lucide-react"
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { toast } from "sonner"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Employee {
  id: string
  name: string
  role: string
  branchId?: string
  branch?: { name: string }
  phone?: string
  salary: number
  status: string
  attendance: string
  shift: string
}

interface HRData {
  employees: Employee[]
}

interface PayrollEntry {
  employeeId: string
  baseSalary: number
  hourlyRate: number
  otRate: number
  otHours: number
  otPay: number
  commissions: number
  tips: number
  grossPay: number
  tax: number
  eobi: number
  insurance: number
  totalDeductions: number
  netPay: number
  status: "pending" | "paid"
}

interface AttendanceRecord {
  employeeId: string
  date: string
  clockIn: string | null
  clockOut: string | null
  hours: number
  status: "present" | "late" | "absent" | "leave"
  lateBy: number // minutes
}

interface LeaveRequest {
  id: string
  employeeId: string
  type: "annual" | "sick" | "casual" | "maternity"
  startDate: string
  endDate: string
  days: number
  reason: string
  status: "pending" | "approved" | "rejected"
  appliedOn: string
}

interface PerformanceReview {
  id: string
  employeeId: string
  reviewer: string
  rating: number
  kpis: { name: string; score: number }[]
  goals: string[]
  reviewDate: string
  status: "draft" | "completed"
}

interface TrainingRecord {
  id: string
  employeeId: string
  course: string
  completionDate: string
  certificationExpiry: string
  status: "completed" | "in_progress" | "expired"
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const HOURLY_DIVISOR = 200 // 200 monthly working hours => hourly rate = salary / 200
const OT_MULTIPLIER = 1.5
const EOBI_RATE = 0.02
const EOBI_MIN = 500

// Progressive monthly tax brackets
const TAX_BRACKETS: { upTo: number; rate: number }[] = [
  { upTo: 50000, rate: 0 },
  { upTo: 100000, rate: 0.1 },
  { upTo: 200000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
]

const ROLE_STYLE: Record<string, string> = {
  manager: "bg-primary/15 text-primary",
  supervisor: "bg-chart-3/15 text-chart-3",
  cashier: "bg-chart-2/15 text-chart-2",
  chef: "bg-chart-4/15 text-chart-4",
  rider: "bg-chart-5/15 text-chart-5",
  cleaner: "bg-muted text-muted-foreground",
}

const ATT_STYLE: Record<string, string> = {
  present: "bg-chart-3/15 text-chart-3",
  late: "bg-chart-4/15 text-chart-4",
  absent: "bg-destructive/15 text-destructive",
  leave: "bg-chart-5/15 text-chart-5",
}

const ATT_DOT: Record<string, string> = {
  present: "bg-chart-3",
  late: "bg-chart-4",
  absent: "bg-destructive",
  leave: "bg-chart-5",
}

const LEAVE_TYPE_STYLE: Record<string, string> = {
  annual: "bg-chart-3/15 text-chart-3",
  sick: "bg-chart-4/15 text-chart-4",
  casual: "bg-chart-2/15 text-chart-2",
  maternity: "bg-chart-5/15 text-chart-5",
}

const LEAVE_TYPE_ICON = {
  annual: Plane,
  sick: HeartPulse,
  casual: Coffee,
  maternity: Baby,
} as const

const LEAVE_STATUS_STYLE: Record<string, string> = {
  pending: "bg-chart-2/15 text-chart-2",
  approved: "bg-chart-3/15 text-chart-3",
  rejected: "bg-destructive/15 text-destructive",
}

const TRAINING_STATUS_STYLE: Record<string, string> = {
  completed: "bg-chart-3/15 text-chart-3",
  in_progress: "bg-chart-2/15 text-chart-2",
  expired: "bg-destructive/15 text-destructive",
}

const PAYROLL_STATUS_STYLE: Record<string, string> = {
  pending: "bg-chart-2/15 text-chart-2",
  paid: "bg-chart-3/15 text-chart-3",
}

const REVIEWERS = [
  "Ahsan Khan",
  "Sara Malik",
  "Bilal Raza",
  "Hina Tariq",
  "Faisal Ahmed",
  "Nida Yusuf",
]

const TRAINING_COURSES = [
  { name: "Food Safety & HACCP Certification", duration: 365 },
  { name: "Customer Service Excellence", duration: 730 },
  { name: "POS System Mastery", duration: 1095 },
  { name: "Fire Safety Procedures", duration: 365 },
  { name: "Allergen Awareness", duration: 730 },
  { name: "Inventory Management", duration: 1095 },
  { name: "Cash Handling Procedures", duration: 730 },
  { name: "Pizza Making Masterclass", duration: 540 },
  { name: "First Aid & CPR", duration: 730 },
  { name: "Conflict Resolution", duration: 540 },
]

const KPI_NAMES = [
  "Quality of Work",
  "Punctuality",
  "Teamwork",
  "Customer Service",
  "Speed & Efficiency",
]

const GOAL_TEMPLATES = [
  "Reduce order errors by 15% next quarter",
  "Complete food safety recertification",
  "Improve average ticket time by 2 minutes",
  "Cross-train on pizza station",
  "Lead weekly team huddles",
  "Maintain 95%+ attendance for 3 months",
  "Mentor 2 junior team members",
  "Achieve 4.5+ customer satisfaction score",
  "Reduce waste by 10% in station",
  "Complete advanced POS training",
]

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic RNG helpers (so mock data is stable across renders)
// ─────────────────────────────────────────────────────────────────────────────

function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return h
}

function makeRng(seed: number) {
  let s = seed || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length]
}

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function dateISOOffset(base: string, days: number): string {
  const d = new Date(base + "T00:00:00")
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function fmtDate(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""))
  return d.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })
}

// ─────────────────────────────────────────────────────────────────────────────
// Payroll calculation engine
// ─────────────────────────────────────────────────────────────────────────────

function calcTax(gross: number): number {
  let tax = 0
  let prev = 0
  for (const b of TAX_BRACKETS) {
    if (gross > b.upTo) {
      tax += (b.upTo - prev) * b.rate
      prev = b.upTo
    } else {
      tax += (gross - prev) * b.rate
      break
    }
  }
  return Math.round(tax)
}

function calcEobi(gross: number): number {
  return Math.max(Math.round(gross * EOBI_RATE), EOBI_MIN)
}

function insuranceForRole(role: string): number {
  switch (role) {
    case "manager":
      return 3000
    case "supervisor":
      return 2000
    case "chef":
    case "cashier":
    case "rider":
      return 1500
    default:
      return 1000
  }
}

function buildPayroll(employees: Employee[]): PayrollEntry[] {
  return employees.map((e) => {
    const r = makeRng(hashStr(e.id + "payroll"))
    const baseSalary = Math.round(e.salary)
    const hourlyRate = baseSalary / HOURLY_DIVISOR
    const otRate = hourlyRate * OT_MULTIPLIER
    // OT hours: 0-36/month, weighted toward 8-24 for full-timers
    const otHours = Math.floor(r() * 36)
    const otPay = Math.round(otHours * otRate)

    // Commissions: managers & supervisors get branch perf, cashiers get upsell
    let commissions = 0
    if (e.role === "manager") commissions = Math.round(5000 + r() * 15000)
    else if (e.role === "supervisor") commissions = Math.round(2000 + r() * 6000)
    else if (e.role === "cashier") commissions = Math.round(500 + r() * 4500)

    // Tips: shared pool for front-of-house & kitchen
    let tips = 0
    if (["chef", "cashier", "supervisor", "rider"].includes(e.role)) {
      tips = Math.round(800 + r() * 4200)
    }

    const grossPay = baseSalary + otPay + commissions + tips
    const tax = calcTax(grossPay)
    const eobi = calcEobi(grossPay)
    const insurance = insuranceForRole(e.role)
    const totalDeductions = tax + eobi + insurance
    const netPay = grossPay - totalDeductions

    return {
      employeeId: e.id,
      baseSalary,
      hourlyRate,
      otRate,
      otHours,
      otPay,
      commissions,
      tips,
      grossPay,
      tax,
      eobi,
      insurance,
      totalDeductions,
      netPay,
      status: "pending",
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Attendance generation
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function buildAttendance(employees: Employee[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = []
  for (const e of employees) {
    const r = makeRng(hashStr(e.id + "att"))
    for (let d = 6; d >= 0; d--) {
      const date = daysAgoISO(d)
      const dayIdx = (new Date(date).getDay() + 6) % 7 // 0 = Mon
      const roll = r()
      let status: AttendanceRecord["status"]
      let clockIn: string | null = null
      let clockOut: string | null = null
      let lateBy = 0

      // Today uses the live employee.attendance value
      if (d === 0) {
        status = e.attendance as AttendanceRecord["status"]
      } else if (dayIdx === 6) {
        // Sundays often off
        status = roll < 0.6 ? "absent" : roll < 0.85 ? "present" : "leave"
      } else {
        if (roll < 0.78) status = "present"
        else if (roll < 0.9) status = "late"
        else if (roll < 0.96) status = "absent"
        else status = "leave"
      }

      if (status === "present" || status === "late") {
        // shift-based start times
        const startHour = e.shift === "morning" ? 6 : e.shift === "evening" ? 14 : 22
        const startMin = 0
        if (status === "late") {
          lateBy = 5 + Math.floor(r() * 35)
        }
        const inMinutes = startHour * 60 + startMin + lateBy + Math.floor(r() * 10)
        const outMinutes = inMinutes + 8 * 60 + Math.floor(r() * 60) // 8-9 hour shift
        const inH = Math.floor(inMinutes / 60) % 24
        const inM = inMinutes % 60
        const outH = Math.floor(outMinutes / 60) % 24
        const outM = outMinutes % 60
        clockIn = `${String(inH).padStart(2, "0")}:${String(inM).padStart(2, "0")}`
        clockOut = `${String(outH).padStart(2, "0")}:${String(outM).padStart(2, "0")}`
      }

      const hours =
        clockIn && clockOut
          ? Math.round(
              ((parseInt(clockOut.slice(0, 2)) * 60 + parseInt(clockOut.slice(3))) -
                (parseInt(clockIn.slice(0, 2)) * 60 + parseInt(clockIn.slice(3)))) /
                60 *
                10,
            ) / 10
          : 0

      records.push({
        employeeId: e.id,
        date,
        clockIn,
        clockOut,
        hours,
        status,
        lateBy,
      })
    }
  }
  return records
}

// ─────────────────────────────────────────────────────────────────────────────
// Leave / performance / training mock generators
// ─────────────────────────────────────────────────────────────────────────────

const LEAVE_REASONS: Record<LeaveRequest["type"], string[]> = {
  annual: ["Family vacation", "Religious observance", "Personal trip"],
  sick: ["Flu & fever", "Migraine", "Stomach infection", "Dental procedure"],
  casual: ["Family function", "Personal errand", "Bank work"],
  maternity: ["Maternity leave (initial 12 weeks)"],
}

function buildLeave(employees: Employee[]): LeaveRequest[] {
  const reqs: LeaveRequest[] = []
  let counter = 1
  for (const e of employees) {
    const r = makeRng(hashStr(e.id + "leave"))
    // 35% of employees have an active leave request
    if (r() > 0.35) continue
    const types: LeaveRequest["type"][] = ["annual", "sick", "casual", "maternity"]
    // restrict maternity to female-leaning names (best-effort heuristic)
    const eligibleTypes = e.role === "manager" && r() > 0.8
      ? ["annual", "sick", "casual"]
      : types
    const type = pick(eligibleTypes as LeaveRequest["type"][], r())
    const startOffset = -Math.floor(r() * 20) + Math.floor(r() * 15)
    const startDate = dateISOOffset(new Date().toISOString().slice(0, 10), startOffset)
    const dayCount = type === "maternity" ? 84 : 1 + Math.floor(r() * 5)
    const endDate = dateISOOffset(startDate, dayCount - 1)
    const status: LeaveRequest["status"] = r() < 0.4 ? "pending" : r() < 0.7 ? "approved" : "rejected"
    reqs.push({
      id: `LV-${String(counter++).padStart(4, "0")}`,
      employeeId: e.id,
      type,
      startDate,
      endDate,
      days: dayCount,
      reason: pick(LEAVE_REASONS[type], r()),
      status,
      appliedOn: dateISOOffset(startDate, -3 - Math.floor(r() * 5)),
    })
    // Some employees have a second request
    if (r() > 0.6) {
      const type2 = pick(["annual", "sick", "casual"] as LeaveRequest["type"][], r())
      const startOffset2 = -Math.floor(r() * 60) - 10
      const startDate2 = dateISOOffset(new Date().toISOString().slice(0, 10), startOffset2)
      const dayCount2 = 1 + Math.floor(r() * 3)
      reqs.push({
        id: `LV-${String(counter++).padStart(4, "0")}`,
        employeeId: e.id,
        type: type2,
        startDate: startDate2,
        endDate: dateISOOffset(startDate2, dayCount2 - 1),
        days: dayCount2,
        reason: pick(LEAVE_REASONS[type2], r()),
        status: r() < 0.8 ? "approved" : "rejected",
        appliedOn: dateISOOffset(startDate2, -2),
      })
    }
  }
  return reqs.sort((a, b) => (a.appliedOn < b.appliedOn ? 1 : -1))
}

function buildPerformance(employees: Employee[]): PerformanceReview[] {
  return employees.map((e, i) => {
    const r = makeRng(hashStr(e.id + "perf"))
    const base = e.role === "manager" ? 4 : e.role === "supervisor" ? 3.6 : 3.4
    const kpis = KPI_NAMES.map((name) => ({
      name,
      score: Math.round(Math.min(5, Math.max(2.5, base + (r() - 0.4) * 1.4)) * 10) / 10,
    }))
    const rating = Math.round((kpis.reduce((s, k) => s + k.score, 0) / kpis.length) * 10) / 10
    const goalCount = 2 + Math.floor(r() * 2)
    const goals: string[] = []
    for (let g = 0; g < goalCount; g++) {
      const t = pick(GOAL_TEMPLATES, r())
      if (!goals.includes(t)) goals.push(t)
    }
    return {
      id: `PR-${String(i + 1).padStart(4, "0")}`,
      employeeId: e.id,
      reviewer: REVIEWERS[i % REVIEWERS.length],
      rating,
      kpis,
      goals,
      reviewDate: daysAgoISO(Math.floor(r() * 90)),
      status: r() < 0.85 ? "completed" : "draft",
    }
  })
}

function buildTraining(employees: Employee[]): TrainingRecord[] {
  const records: TrainingRecord[] = []
  let counter = 1
  for (const e of employees) {
    const r = makeRng(hashStr(e.id + "train"))
    const count = 1 + Math.floor(r() * 2)
    const used = new Set<string>()
    for (let i = 0; i < count; i++) {
      const course = pick(TRAINING_COURSES, r())
      if (used.has(course.name)) continue
      used.add(course.name)
      const completionOffset = -Math.floor(r() * (course.duration - 30))
      const completionDate = dateISOOffset(new Date().toISOString().slice(0, 10), completionOffset)
      const expiryDate = dateISOOffset(completionDate, course.duration)
      const now = new Date().toISOString().slice(0, 10)
      let status: TrainingRecord["status"]
      if (expiryDate < now) status = "expired"
      else if (completionOffset > -14) status = "in_progress"
      else status = "completed"
      records.push({
        id: `TR-${String(counter++).padStart(4, "0")}`,
        employeeId: e.id,
        course: course.name,
        completionDate: status === "in_progress" ? "—" : completionDate,
        certificationExpiry: status === "in_progress" ? "—" : expiryDate,
        status,
      })
    }
  }
  return records
}

// ─────────────────────────────────────────────────────────────────────────────
// Main HR component
// ─────────────────────────────────────────────────────────────────────────────

export function HR() {
  const activeBranchId = useAppStore((s) => s.activeBranchId)
  const branchParam = activeBranchId === "__ALL__" ? "" : `?branchId=${activeBranchId}`
  const { data, loading } = useFetch<HRData>(`/api/dashboard${branchParam}`, {})

  const [tab, setTab] = useState<string>("overview")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [payPeriod, setPayPeriod] = useState(() => new Date().toISOString().slice(0, 7))
  const [paidOverrides, setPaidOverrides] = useState<Record<string, boolean>>({})
  const [leaveOverrides, setLeaveOverrides] = useState<Record<string, "approved" | "rejected">>({})
  const [payslipFor, setPayslipFor] = useState<string | null>(null)

  const employees = data?.employees ?? []

  // Base mock data — recomputed via useMemo whenever employees change.
  // Payroll/leave mutations live in *override* maps so we never mutate the
  // derived base arrays. Because employee/leave IDs are stable per branch,
  // overrides silently no-op when the branch (and therefore the employee
  // roster) changes.
  const basePayroll = useMemo(() => buildPayroll(employees), [employees])
  const baseLeave = useMemo(() => buildLeave(employees), [employees])
  const attendanceRecords = useMemo(() => buildAttendance(employees), [employees])
  const performanceReviews = useMemo(() => buildPerformance(employees), [employees])
  const trainingRecords = useMemo(() => buildTraining(employees), [employees])

  const payrollEntries: PayrollEntry[] = useMemo(
    () => basePayroll.map((p) => (paidOverrides[p.employeeId] ? { ...p, status: "paid" as const } : p)),
    [basePayroll, paidOverrides],
  )
  const leaveRequests: LeaveRequest[] = useMemo(
    () => baseLeave.map((l) => (leaveOverrides[l.id] ? { ...l, status: leaveOverrides[l.id] } : l)),
    [baseLeave, leaveOverrides],
  )

  // ── Derived KPIs ──
  const presentCount = employees.filter((e) => e.attendance === "present").length
  const lateCount = employees.filter((e) => e.attendance === "late").length
  const absentCount = employees.filter((e) => e.attendance === "absent").length
  const leaveCount = employees.filter((e) => e.attendance === "leave").length
  const activeCount = employees.filter((e) => e.status === "active").length

  const grossPayroll = payrollEntries.reduce((s, p) => s + p.grossPay, 0)
  const totalDeductions = payrollEntries.reduce((s, p) => s + p.totalDeductions, 0)
  const netPayroll = payrollEntries.reduce((s, p) => s + p.netPay, 0)
  const paidCount = payrollEntries.filter((p) => p.status === "paid").length

  // 7-day attendance rate
  const attRate = useMemo(() => {
    if (!attendanceRecords.length) return 0
    const present = attendanceRecords.filter((r) => r.status === "present" || r.status === "late").length
    return Math.round((present / attendanceRecords.length) * 100)
  }, [attendanceRecords])

  const roles = Array.from(new Set(employees.map((e) => e.role)))
  const branches = Array.from(new Set(employees.map((e) => e.branchId ?? "").filter(Boolean)))

  const filteredEmployees = employees.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    if (roleFilter !== "all" && e.role !== roleFilter) return false
    return true
  })

  // ── Payroll actions ──
  function markPaid(employeeId: string) {
    setPaidOverrides((prev) => ({ ...prev, [employeeId]: true }))
    const emp = employees.find((e) => e.id === employeeId)
    toast.success(`${emp?.name ?? "Employee"} marked as paid`)
  }

  function runPayroll() {
    if (!payrollEntries.length) return
    const pending = payrollEntries.filter((p) => p.status === "pending").length
    const next: Record<string, boolean> = {}
    for (const p of basePayroll) next[p.employeeId] = true
    setPaidOverrides(next)
    toast.success(`Payroll run complete`, {
      description: `${pending} employee${pending === 1 ? "" : "s"} processed · Net ${formatPKR(netPayroll)}`,
    })
  }

  function shiftPeriod(delta: number) {
    const [y, m] = payPeriod.split("-").map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    setPayPeriod(d.toISOString().slice(0, 7))
  }

  const payPeriodLabel = useMemo(() => {
    const [y, m] = payPeriod.split("-").map(Number)
    return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }, [payPeriod])

  // ── Leave actions ──
  function setLeaveStatus(id: string, status: "approved" | "rejected") {
    setLeaveOverrides((prev) => ({ ...prev, [id]: status }))
    const req = leaveRequests.find((l) => l.id === id)
    const emp = employees.find((e) => e.id === req?.employeeId)
    toast[status === "approved" ? "success" : "info"](
      `Leave ${status}`,
      { description: `${emp?.name ?? "Employee"} — ${req?.days} day(s)` },
    )
  }

  // ── Loading skeleton ──
  if (loading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-full max-w-2xl rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  // Lookup helpers
  const empById = (id: string) => employees.find((e) => e.id === id)
  const payslipEntry = payslipFor ? payrollEntries.find((p) => p.employeeId === payslipFor) : null
  const payslipEmp = payslipFor ? empById(payslipFor) : null

  // Overview chart data
  const attDonutData = [
    { name: "Present", value: presentCount, color: "var(--chart-3)" },
    { name: "Late", value: lateCount, color: "var(--chart-4)" },
    { name: "Absent", value: absentCount, color: "var(--destructive)" },
    { name: "On Leave", value: leaveCount, color: "var(--chart-5)" },
  ].filter((d) => d.value > 0)

  const shiftData = [
    { name: "Morning", count: employees.filter((e) => e.shift === "morning").length, color: "var(--chart-2)" },
    { name: "Evening", count: employees.filter((e) => e.shift === "evening").length, color: "var(--chart-4)" },
    { name: "Night", count: employees.filter((e) => e.shift === "night").length, color: "var(--chart-5)" },
  ]

  const topPerformers = [...performanceReviews]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
          <TabsList className="w-full justify-start h-auto flex-nowrap overflow-visible">
            <TabsTrigger value="overview" className="flex-none gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex-none gap-1.5">
              <Users className="h-3.5 w-3.5" /> Employees
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex-none gap-1.5">
              <Wallet className="h-3.5 w-3.5" /> Payroll
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex-none gap-1.5">
              <Clock3 className="h-3.5 w-3.5" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex-none gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Leave
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex-none gap-1.5">
              <Target className="h-3.5 w-3.5" /> Performance
            </TabsTrigger>
            <TabsTrigger value="training" className="flex-none gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" /> Training
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            OVERVIEW TAB
           ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview">
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Tile
                icon={Users}
                label="Total Staff"
                value={String(employees.length)}
                sub={`${activeCount} active`}
                color="var(--primary)"
              />
              <Tile
                icon={UserCheck}
                label="Present Today"
                value={String(presentCount + lateCount)}
                sub={`${lateCount} late`}
                color="var(--chart-3)"
              />
              <Tile
                icon={CalendarDays}
                label="On Leave"
                value={String(leaveCount)}
                sub={`${leaveRequests.filter((l) => l.status === "pending").length} pending`}
                color="var(--chart-5)"
              />
              <Tile
                icon={Wallet}
                label="Monthly Payroll"
                value={formatPKR(grossPayroll)}
                sub={`${employees.length} employees`}
                color="var(--chart-2)"
              />
              <Tile
                icon={TrendingUp}
                label="Avg Attendance"
                value={`${attRate}%`}
                sub="last 7 days"
                color="var(--chart-4)"
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Attendance donut */}
              <Card className="overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/30">
                  <h3 className="font-bold text-sm">Today&apos;s Attendance</h3>
                </div>
                <div className="p-4">
                  <div className="h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attDonutData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {attDonutData.map((d) => (
                            <Cell key={d.name} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 grid place-items-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-2xl font-extrabold">
                          {Math.round(((presentCount + lateCount) / Math.max(employees.length, 1)) * 100)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">In Today</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {attDonutData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                        <span className="ml-auto font-bold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Shift coverage bars */}
              <Card className="overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-chart-4" />
                  <h3 className="font-bold text-sm">Shift Coverage</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shiftData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                        <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" allowDecimals={false} />
                        <Tooltip
                          cursor={{ fill: "var(--muted)" }}
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={42}>
                          {shiftData.map((s) => (
                            <Cell key={s.name} fill={s.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {[
                      { shift: "Morning", time: "06:00 – 14:00", count: shiftData[0].count, color: "var(--chart-2)", Icon: Sun },
                      { shift: "Evening", time: "14:00 – 22:00", count: shiftData[1].count, color: "var(--chart-4)", Icon: Sun },
                      { shift: "Night", time: "22:00 – 06:00", count: shiftData[2].count, color: "var(--chart-5)", Icon: Moon },
                    ].map((s) => (
                      <div key={s.shift} className="flex items-center gap-2 text-xs">
                        <s.Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                        <span className="font-semibold">{s.shift}</span>
                        <span className="text-muted-foreground text-[10px]">{s.time}</span>
                        <Badge variant="secondary" className="text-[9px] ml-auto">{s.count} staff</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Top performers */}
              <Card className="overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-chart-2" />
                  <h3 className="font-bold text-sm">Top Performers</h3>
                </div>
                <div className="p-2 space-y-1">
                  {topPerformers.map((p, i) => {
                    const emp = empById(p.employeeId)
                    if (!emp) return null
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40"
                      >
                        <span
                          className="grid place-items-center h-6 w-6 rounded-full text-[10px] font-bold"
                          style={{
                            background: i === 0 ? "var(--chart-2)" : "color-mix(in oklch, var(--chart-2) 15%, transparent)",
                            color: i === 0 ? "white" : "var(--chart-2)",
                          }}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">{emp.name}</div>
                          <div className="text-[10px] text-muted-foreground capitalize">{emp.role}</div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "h-3 w-3",
                                s <= Math.round(p.rating)
                                  ? "fill-chart-2 text-chart-2"
                                  : "text-muted-foreground/40",
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {topPerformers.length === 0 && (
                    <div className="text-xs text-muted-foreground p-4 text-center">No reviews yet</div>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            EMPLOYEES TAB
           ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="employees">
          <motion.div
            key="employees"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-2">
                <div>
                  <h3 className="font-bold text-sm">Employee Directory</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {filteredEmployees.length} of {employees.length} staff
                  </p>
                </div>
                <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name…"
                      className="h-8 w-44 pl-8 text-xs"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                  >
                    <option value="all">All roles</option>
                    {roles.map((r) => (
                      <option key={r} value={r} className="capitalize">
                        {r}
                      </option>
                    ))}
                  </select>
                  {branches.length > 1 && (
                    <select className="h-8 rounded-md border bg-background px-2 text-xs">
                      <option value="all">All branches</option>
                      {branches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  )}
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => toast.info("Add employee form", { description: "Would open a form modal in production" })}
                  >
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
                      <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Branch</th>
                      <th className="text-left px-4 py-2 font-semibold hidden sm:table-cell">Shift</th>
                      <th className="text-left px-4 py-2 font-semibold">Attendance</th>
                      <th className="text-left px-4 py-2 font-semibold hidden lg:table-cell">Phone</th>
                      <th className="text-right px-4 py-2 font-semibold">Salary</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredEmployees.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="grid place-items-center h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                              {e.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-xs">{e.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{e.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge className={cn("text-[9px] capitalize", ROLE_STYLE[e.role] ?? "bg-muted")}>
                            {e.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          <div className="text-xs">{e.branch?.name ?? "—"}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{e.branchId ?? "—"}</div>
                        </td>
                        <td className="px-4 py-2.5 hidden sm:table-cell">
                          <span className="text-xs capitalize flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {e.shift}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge className={cn("text-[9px] capitalize", ATT_STYLE[e.attendance] ?? "bg-muted")}>
                            {e.attendance}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-muted-foreground">
                          {e.phone ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-bold">{formatPKR(e.salary)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => toast.info(`Calling ${e.name}`, { description: e.phone ?? "No phone on file" })}
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                setPayslipFor(e.id)
                                setTab("payroll")
                              }}
                            >
                              <IdCard className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEmployees.length === 0 && (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    No employees match your filters.
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            PAYROLL TAB
           ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="payroll">
          <motion.div
            key="payroll"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Tile
                icon={Banknote}
                label="Gross Payroll"
                value={formatPKR(grossPayroll)}
                sub={`${employees.length} employees`}
                color="var(--chart-3)"
              />
              <Tile
                icon={Receipt}
                label="Total Deductions"
                value={formatPKR(totalDeductions)}
                sub="Tax + EOBI + Insurance"
                color="var(--chart-4)"
              />
              <Tile
                icon={PiggyBank}
                label="Net Payroll"
                value={formatPKR(netPayroll)}
                sub={`${paidCount}/${employees.length} paid`}
                color="var(--primary)"
              />
              <Tile
                icon={Users}
                label="Employees"
                value={String(employees.length)}
                sub={`${paidCount} paid · ${employees.length - paidCount} pending`}
                color="var(--chart-2)"
              />
            </div>

            {/* Payroll run table */}
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <div>
                    <h3 className="font-bold text-sm">Payroll Run</h3>
                    <p className="text-[10px] text-muted-foreground">
                      OT: hourly ÷ {HOURLY_DIVISOR} × {OT_MULTIPLIER} · EOBI: max(2%, Rs {EOBI_MIN})
                    </p>
                  </div>
                </div>
                <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
                  {/* Pay period navigator */}
                  <div className="flex items-center gap-1 rounded-md border bg-background h-8 px-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => shiftPeriod(-1)}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs font-semibold min-w-[120px] text-center">{payPeriodLabel}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => shiftPeriod(1)}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={runPayroll}
                    disabled={!payrollEntries.some((p) => p.status === "pending")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Run Payroll
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1100px]">
                  <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold">Employee</th>
                      <th className="text-right px-4 py-2 font-semibold">Base</th>
                      <th className="text-right px-4 py-2 font-semibold">Overtime</th>
                      <th className="text-right px-4 py-2 font-semibold">Comm.</th>
                      <th className="text-right px-4 py-2 font-semibold">Tips</th>
                      <th className="text-right px-4 py-2 font-semibold">Gross</th>
                      <th className="text-right px-4 py-2 font-semibold">Tax</th>
                      <th className="text-right px-4 py-2 font-semibold">EOBI/Ins</th>
                      <th className="text-right px-4 py-2 font-semibold">Net Pay</th>
                      <th className="text-center px-4 py-2 font-semibold">Status</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(payrollEntries).map((p) => {
                      const emp = empById(p.employeeId)
                      if (!emp) return null
                      return (
                        <tr key={p.employeeId} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="grid place-items-center h-7 w-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                                {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-xs truncate">{emp.name}</div>
                                <div className="text-[10px] text-muted-foreground capitalize">{emp.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-mono">{formatPKR(p.baseSalary)}</td>
                          <td className="px-4 py-2.5 text-right text-xs">
                            <div className="font-mono">{formatPKR(p.otPay)}</div>
                            <div className="text-[9px] text-muted-foreground">
                              {p.otHours}h × {formatPKR(Math.round(p.otRate))}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-mono text-chart-3">
                            {p.commissions > 0 ? formatPKR(p.commissions) : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-mono text-chart-2">
                            {p.tips > 0 ? formatPKR(p.tips) : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-bold">{formatPKR(p.grossPay)}</td>
                          <td className="px-4 py-2.5 text-right text-xs font-mono text-destructive">
                            {p.tax > 0 ? formatPKR(p.tax) : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-mono text-destructive">
                            {formatPKR(p.eobi + p.insurance)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-extrabold text-primary">
                            {formatPKR(p.netPay)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge className={cn("text-[9px] capitalize", PAYROLL_STATUS_STYLE[p.status])}>
                              {p.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] gap-1"
                                onClick={() => setPayslipFor(p.employeeId)}
                              >
                                <FileText className="h-3 w-3" /> Payslip
                              </Button>
                              {p.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => markPaid(p.employeeId)}
                                  title="Mark as paid"
                                >
                                  <Check className="h-3.5 w-3.5 text-chart-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/40 font-bold text-xs">
                      <td className="px-4 py-2.5" colSpan={1}>
                        Totals ({employees.length})
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {formatPKR((payrollEntries).reduce((s, p) => s + p.baseSalary, 0))}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        {formatPKR((payrollEntries).reduce((s, p) => s + p.otPay, 0))}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-chart-3">
                        {formatPKR((payrollEntries).reduce((s, p) => s + p.commissions, 0))}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-chart-2">
                        {formatPKR((payrollEntries).reduce((s, p) => s + p.tips, 0))}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">{formatPKR(grossPayroll)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-destructive">
                        {formatPKR((payrollEntries).reduce((s, p) => s + p.tax, 0))}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-destructive">
                        {formatPKR((payrollEntries).reduce((s, p) => s + p.eobi + p.insurance, 0))}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-primary">{formatPKR(netPayroll)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
                {(!payrollEntries || payrollEntries.length === 0) && (
                  <div className="text-center py-12 text-sm text-muted-foreground">No payroll records.</div>
                )}
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            ATTENDANCE TAB
           ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="attendance">
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Today's clock summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Tile
                icon={LogIn}
                label="Clocked In"
                value={String(presentCount + lateCount)}
                sub="today"
                color="var(--chart-3)"
              />
              <Tile
                icon={AlertTriangle}
                label="Late Arrivals"
                value={String(lateCount)}
                sub="today"
                color="var(--chart-4)"
              />
              <Tile
                icon={UserX}
                label="Absent"
                value={String(absentCount)}
                sub="today"
                color="var(--destructive)"
              />
              <Tile
                icon={Hourglass}
                label="Avg Hours"
                value={
                  (() => {
                    const today = attendanceRecords.filter((r) => r.date === daysAgoISO(0) && r.hours > 0)
                    if (!today.length) return "—"
                    return (today.reduce((s, r) => s + r.hours, 0) / today.length).toFixed(1) + "h"
                  })()
                }
                sub="today per active"
                color="var(--chart-5)"
              />
            </div>

            {/* Today's time-clock */}
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm">Today&apos;s Time Clock</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[760px]">
                  <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold">Employee</th>
                      <th className="text-left px-4 py-2 font-semibold">Shift</th>
                      <th className="text-center px-4 py-2 font-semibold">Clock In</th>
                      <th className="text-center px-4 py-2 font-semibold">Clock Out</th>
                      <th className="text-right px-4 py-2 font-semibold">Hours</th>
                      <th className="text-center px-4 py-2 font-semibold">Late By</th>
                      <th className="text-center px-4 py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {employees.map((e) => {
                      const rec = attendanceRecords.find(
                        (r) => r.employeeId === e.id && r.date === daysAgoISO(0),
                      )
                      if (!rec) return null
                      return (
                        <tr key={e.id} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="grid place-items-center h-7 w-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                                {e.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-xs truncate">{e.name}</div>
                                <div className="text-[10px] text-muted-foreground capitalize">{e.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-xs capitalize">{e.shift}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs font-mono">
                            {rec.clockIn ?? <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs font-mono">
                            {rec.clockOut ?? <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-bold">
                            {rec.hours > 0 ? `${rec.hours}h` : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs">
                            {rec.lateBy > 0 ? (
                              <span className="text-chart-4 font-semibold">+{rec.lateBy}m</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge className={cn("text-[9px] capitalize", ATT_STYLE[rec.status])}>
                              {rec.status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Weekly grid */}
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-1.5">
                <CalendarCheck className="h-4 w-4 text-chart-3" />
                <h3 className="font-bold text-sm">Weekly Attendance Grid</h3>
                <span className="ml-auto text-[10px] text-muted-foreground">Last 7 days</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[760px]">
                  <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold sticky left-0 bg-muted/30">Employee</th>
                      {DAYS.map((d) => (
                        <th key={d} className="text-center px-2 py-2 font-semibold">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {employees.map((e) => {
                      const empRecs = attendanceRecords
                        .filter((r) => r.employeeId === e.id)
                        .sort((a, b) => (a.date < b.date ? -1 : 1))
                      return (
                        <tr key={e.id} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5 sticky left-0 bg-background">
                            <div className="flex items-center gap-2">
                              <div className="grid place-items-center h-6 w-6 rounded-full bg-primary/10 text-primary text-[9px] font-bold shrink-0">
                                {e.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-xs truncate">{e.name}</div>
                                <div className="text-[9px] text-muted-foreground capitalize">{e.role}</div>
                              </div>
                            </div>
                          </td>
                          {empRecs.map((r) => (
                            <td key={r.date} className="px-2 py-2.5 text-center">
                              <div
                                className={cn(
                                  "h-7 w-7 mx-auto rounded-md grid place-items-center text-[9px] font-bold text-white",
                                  ATT_DOT[r.status],
                                )}
                                title={`${r.date} — ${r.status}${r.lateBy > 0 ? ` (+${r.lateBy}m)` : ""}`}
                              >
                                {r.status === "present"
                                  ? "P"
                                  : r.status === "late"
                                    ? "L"
                                    : r.status === "absent"
                                      ? "A"
                                      : "Lv"}
                              </div>
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t bg-muted/20 flex flex-wrap items-center gap-3 text-[10px]">
                <span className="text-muted-foreground uppercase font-semibold">Legend:</span>
                {[
                  { l: "Present", c: ATT_DOT.present },
                  { l: "Late", c: ATT_DOT.late },
                  { l: "Absent", c: ATT_DOT.absent },
                  { l: "Leave", c: ATT_DOT.leave },
                ].map((x) => (
                  <span key={x.l} className="flex items-center gap-1">
                    <span className={cn("h-2.5 w-2.5 rounded-sm", x.c)} />
                    <span className="text-muted-foreground">{x.l}</span>
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            LEAVE TAB
           ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="leave">
          <motion.div
            key="leave"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Leave balance summary */}
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-1.5">
                <PiggyBank className="h-4 w-4 text-chart-3" />
                <h3 className="font-bold text-sm">Leave Balance Summary</h3>
                <span className="ml-auto text-[10px] text-muted-foreground">Annual quota: 18 days · Sick: 12 · Casual: 10</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[680px]">
                  <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold">Employee</th>
                      <th className="text-center px-4 py-2 font-semibold">Annual</th>
                      <th className="text-center px-4 py-2 font-semibold">Sick</th>
                      <th className="text-center px-4 py-2 font-semibold">Casual</th>
                      <th className="text-center px-4 py-2 font-semibold">Total Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {employees.slice(0, 8).map((e) => {
                      const used = (leaveRequests).filter(
                        (l) => l.employeeId === e.id && l.status === "approved",
                      )
                      const annualUsed = used.filter((l) => l.type === "annual").reduce((s, l) => s + l.days, 0)
                      const sickUsed = used.filter((l) => l.type === "sick").reduce((s, l) => s + l.days, 0)
                      const casualUsed = used.filter((l) => l.type === "casual").reduce((s, l) => s + l.days, 0)
                      return (
                        <tr key={e.id} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="grid place-items-center h-7 w-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                                {e.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-xs truncate">{e.name}</div>
                                <div className="text-[10px] text-muted-foreground capitalize">{e.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <LeaveBalCell used={annualUsed} total={18} color="var(--chart-3)" />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <LeaveBalCell used={sickUsed} total={12} color="var(--chart-4)" />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <LeaveBalCell used={casualUsed} total={10} color="var(--chart-2)" />
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs font-bold">
                            {annualUsed + sickUsed + casualUsed}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Leave requests */}
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-chart-5" />
                <h3 className="font-bold text-sm">Leave Requests</h3>
                <Badge variant="secondary" className="text-[9px] ml-auto">
                  {(leaveRequests).filter((l) => l.status === "pending").length} pending
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[860px]">
                  <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold">Employee</th>
                      <th className="text-left px-4 py-2 font-semibold">Type</th>
                      <th className="text-left px-4 py-2 font-semibold">Dates</th>
                      <th className="text-center px-4 py-2 font-semibold">Days</th>
                      <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Reason</th>
                      <th className="text-center px-4 py-2 font-semibold">Status</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(leaveRequests).map((l) => {
                      const emp = empById(l.employeeId)
                      if (!emp) return null
                      const Icon = LEAVE_TYPE_ICON[l.type]
                      return (
                        <tr key={l.id} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="grid place-items-center h-7 w-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                                {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-xs truncate">{emp.name}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{l.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge className={cn("text-[9px] capitalize gap-1", LEAVE_TYPE_STYLE[l.type])}>
                              <Icon className="h-3 w-3" />
                              {l.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-xs">
                            <div>{fmtDate(l.startDate)}</div>
                            <div className="text-[10px] text-muted-foreground">→ {fmtDate(l.endDate)}</div>
                          </td>
                          <td className="px-4 py-2.5 text-center text-xs font-bold">{l.days}</td>
                          <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">
                            {l.reason}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge className={cn("text-[9px] capitalize", LEAVE_STATUS_STYLE[l.status])}>
                              {l.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {l.status === "pending" ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[10px] gap-1 border-chart-3/40 text-chart-3 hover:bg-chart-3/10"
                                  onClick={() => setLeaveStatus(l.id, "approved")}
                                >
                                  <Check className="h-3 w-3" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[10px] gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                                  onClick={() => setLeaveStatus(l.id, "rejected")}
                                >
                                  <XCircle className="h-3 w-3" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">{fmtDate(l.appliedOn)}</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {(!leaveRequests || leaveRequests.length === 0) && (
                  <div className="text-center py-12 text-sm text-muted-foreground">No leave requests.</div>
                )}
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            PERFORMANCE TAB
           ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="performance">
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Tile
                icon={Target}
                label="Reviews Done"
                value={String(performanceReviews.filter((r) => r.status === "completed").length)}
                sub={`${performanceReviews.filter((r) => r.status === "draft").length} drafts`}
                color="var(--chart-3)"
              />
              <Tile
                icon={Star}
                label="Avg Rating"
                value={
                  performanceReviews.length
                    ? (
                        performanceReviews.reduce((s, r) => s + r.rating, 0) /
                        performanceReviews.length
                      ).toFixed(2)
                    : "—"
                }
                sub="out of 5.0"
                color="var(--chart-2)"
              />
              <Tile
                icon={Award}
                label="Top Performers"
                value={String(performanceReviews.filter((r) => r.rating >= 4.5).length)}
                sub="rated 4.5+"
                color="var(--chart-4)"
              />
              <Tile
                icon={AlertTriangle}
                label="Needs Improvement"
                value={String(performanceReviews.filter((r) => r.rating < 3.5).length)}
                sub="rated below 3.5"
                color="var(--destructive)"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {performanceReviews.map((r) => {
                const emp = empById(r.employeeId)
                if (!emp) return null
                const ratingColor =
                  r.rating >= 4.5 ? "var(--chart-3)" : r.rating >= 3.5 ? "var(--chart-2)" : "var(--chart-4)"
                return (
                  <Card key={r.id} className="overflow-hidden">
                    <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
                      <div className="grid place-items-center h-8 w-8 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                        {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm truncate">{emp.name}</div>
                        <div className="text-[10px] text-muted-foreground capitalize">
                          {emp.role} · {emp.branch?.name ?? "—"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold" style={{ color: ratingColor }}>
                          {r.rating.toFixed(1)}
                        </div>
                        <div className="flex items-center gap-0.5 justify-end">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "h-2.5 w-2.5",
                                s <= Math.round(r.rating) ? "fill-chart-2 text-chart-2" : "text-muted-foreground/30",
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                        {r.kpis.map((k) => (
                          <div key={k.name}>
                            <div className="flex items-center justify-between text-[10px] mb-0.5">
                              <span className="text-muted-foreground">{k.name}</span>
                              <span className="font-bold">{k.score.toFixed(1)}</span>
                            </div>
                            <Progress value={(k.score / 5) * 100} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-1 flex items-center gap-1">
                          <Target className="h-3 w-3" /> Goals
                        </div>
                        <ul className="space-y-1">
                          {r.goals.map((g, i) => (
                            <li key={i} className="text-[11px] flex items-start gap-1.5">
                              <span className="text-chart-3 mt-0.5">•</span>
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t text-[10px] text-muted-foreground">
                        <span>Reviewer: <span className="font-semibold text-foreground">{r.reviewer}</span></span>
                        <span>{fmtDate(r.reviewDate)}</span>
                      </div>
                    </div>
                  </Card>
                )
              })}
              {performanceReviews.length === 0 && (
                <Card className="p-12 text-center text-sm text-muted-foreground col-span-full">
                  No performance reviews yet.
                </Card>
              )}
            </div>
          </motion.div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════════
            TRAINING TAB
           ═══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="training">
          <motion.div
            key="training"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Tile
                icon={GraduationCap}
                label="Total Records"
                value={String(trainingRecords.length)}
                sub={`${employees.length} employees`}
                color="var(--primary)"
              />
              <Tile
                icon={CheckCircle2}
                label="Certified"
                value={String(trainingRecords.filter((t) => t.status === "completed").length)}
                sub="active certificates"
                color="var(--chart-3)"
              />
              <Tile
                icon={Hourglass}
                label="In Progress"
                value={String(trainingRecords.filter((t) => t.status === "in_progress").length)}
                sub="currently training"
                color="var(--chart-2)"
              />
              <Tile
                icon={AlertTriangle}
                label="Expired"
                value={String(trainingRecords.filter((t) => t.status === "expired").length)}
                sub="need renewal"
                color="var(--destructive)"
              />
            </div>

            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-chart-3" />
                <h3 className="font-bold text-sm">Training & Certifications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[820px]">
                  <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold">Employee</th>
                      <th className="text-left px-4 py-2 font-semibold">Course</th>
                      <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Completed</th>
                      <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Expires</th>
                      <th className="text-center px-4 py-2 font-semibold">Status</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {trainingRecords.map((t) => {
                      const emp = empById(t.employeeId)
                      if (!emp) return null
                      return (
                        <tr key={t.id} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="grid place-items-center h-7 w-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                                {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-xs truncate">{emp.name}</div>
                                <div className="text-[10px] text-muted-foreground capitalize">{emp.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="text-xs font-medium">{t.course}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{t.id}</div>
                          </td>
                          <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">
                            {fmtDate(t.completionDate)}
                          </td>
                          <td className="px-4 py-2.5 hidden md:table-cell text-xs text-muted-foreground">
                            {fmtDate(t.certificationExpiry)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge className={cn("text-[9px] capitalize", TRAINING_STATUS_STYLE[t.status])}>
                              {t.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[10px]"
                              onClick={() =>
                                toast.info("Certificate", {
                                  description: `${t.course} — ${emp.name}`,
                                })
                              }
                            >
                              <FileText className="h-3 w-3 mr-1" /> View
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {trainingRecords.length === 0 && (
                  <div className="text-center py-12 text-sm text-muted-foreground">No training records.</div>
                )}
              </div>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════════════════
          PAYSLIP DIALOG
         ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!payslipFor} onOpenChange={(o) => !o && setPayslipFor(null)}>
        <DialogContent className="sm:max-w-[600px] print:max-w-none print:p-0 print:border-0 print:shadow-none">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Employee Payslip
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown for {payPeriodLabel}. Use Print to save as PDF.
            </DialogDescription>
          </DialogHeader>

          {payslipEntry && payslipEmp && (
            <div className="space-y-4">
              {/* Payslip "paper" */}
              <div className="payslip border rounded-lg overflow-hidden">
                {/* Letterhead */}
                <div className="bg-primary text-primary-foreground px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-base leading-tight">FUSIONFLOW ERP</div>
                    <div className="text-[10px] opacity-90">Restaurant Management System</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] opacity-90 uppercase tracking-wide">Payslip</div>
                    <div className="text-xs font-bold">{payPeriodLabel}</div>
                  </div>
                </div>

                {/* Employee info */}
                <div className="px-5 py-3 bg-muted/30 border-b grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <InfoRow label="Employee" value={payslipEmp.name} />
                  <InfoRow label="Employee ID" value={payslipEmp.id} />
                  <InfoRow label="Role" value={<span className="capitalize">{payslipEmp.role}</span>} />
                  <InfoRow label="Branch" value={payslipEmp.branch?.name ?? "—"} />
                  <InfoRow label="Shift" value={<span className="capitalize">{payslipEmp.shift}</span>} />
                  <InfoRow
                    label="Pay Date"
                    value={new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                  />
                </div>

                {/* Earnings */}
                <div className="px-5 py-3">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1">
                    <Banknote className="h-3 w-3 text-chart-3" /> Earnings
                  </div>
                  <div className="space-y-1">
                    <PayslipRow label="Base Salary" value={formatPKR(payslipEntry.baseSalary)} />
                    <PayslipRow
                      label={`Overtime (${payslipEntry.otHours}h × ${formatPKR(Math.round(payslipEntry.otRate))})`}
                      value={formatPKR(payslipEntry.otPay)}
                    />
                    {payslipEntry.commissions > 0 && (
                      <PayslipRow label="Commissions / Bonus" value={formatPKR(payslipEntry.commissions)} />
                    )}
                    {payslipEntry.tips > 0 && (
                      <PayslipRow label="Tips (shared pool)" value={formatPKR(payslipEntry.tips)} />
                    )}
                  </div>
                  <PayslipRow
                    label="Gross Pay"
                    value={formatPKR(payslipEntry.grossPay)}
                    bold
                    className="mt-2 pt-2 border-t"
                  />
                </div>

                {/* Deductions */}
                <div className="px-5 py-3 border-t bg-muted/20">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1">
                    <Receipt className="h-3 w-3 text-chart-4" /> Deductions
                  </div>
                  <div className="space-y-1">
                    <PayslipRow
                      label="Income Tax (progressive)"
                      value={payslipEntry.tax > 0 ? `− ${formatPKR(payslipEntry.tax)}` : "—"}
                      muted={payslipEntry.tax === 0}
                    />
                    <PayslipRow
                      label={`EOBI (2%, min Rs ${EOBI_MIN})`}
                      value={`− ${formatPKR(payslipEntry.eobi)}`}
                    />
                    <PayslipRow label="Health Insurance" value={`− ${formatPKR(payslipEntry.insurance)}`} />
                  </div>
                  <PayslipRow
                    label="Total Deductions"
                    value={`− ${formatPKR(payslipEntry.totalDeductions)}`}
                    bold
                    className="mt-2 pt-2 border-t text-destructive"
                  />
                </div>

                {/* Net pay banner */}
                <div className="px-5 py-4 bg-primary text-primary-foreground flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase opacity-90 font-semibold">Net Pay</div>
                    <div className="text-[10px] opacity-80">
                      {payslipEntry.status === "paid" ? "Paid via bank transfer" : "Pending payroll run"}
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold">{formatPKR(payslipEntry.netPay)}</div>
                </div>

                {/* Footer */}
                <div className="px-5 py-2.5 text-[9px] text-muted-foreground text-center border-t">
                  This is a computer-generated payslip from FusionFlow ERP · Generated{" "}
                  {new Date().toLocaleString("en-PK")} · Status:{" "}
                  <span className="font-semibold uppercase">{payslipEntry.status}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 print:hidden">
                <Button variant="outline" size="sm" onClick={() => setPayslipFor(null)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.success("Payslip downloaded", {
                      description: `${payslipEmp.name} — ${payPeriodLabel}`,
                    })
                  }}
                >
                  <FileText className="h-3.5 w-3.5 mr-1" /> Download PDF
                </Button>
                <Button size="sm" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5 mr-1" /> Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Tile({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof Users
  label: string
  value: string | number
  sub: string
  color: string
}) {
  return (
    <Card>
      <div className="p-4 flex items-center gap-3">
        <div
          className="grid place-items-center h-10 w-10 rounded-xl shrink-0"
          style={{ background: `color-mix(in oklch, ${color} 15%, transparent)`, color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground font-semibold uppercase truncate">{label}</div>
          <div className="text-xl font-extrabold truncate">{value}</div>
          <div className="text-[10px] text-muted-foreground truncate">{sub}</div>
        </div>
      </div>
    </Card>
  )
}

function LeaveBalCell({ used, total, color }: { used: number; total: number; color: string }) {
  const remaining = Math.max(0, total - used)
  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <div className="text-xs font-bold" style={{ color }}>
        {remaining}
      </div>
      <div className="text-[9px] text-muted-foreground">/ {total}</div>
      <div className="h-1 w-12 rounded-full bg-muted overflow-hidden mt-0.5">
        <div className="h-full" style={{ width: `${(used / total) * 100}%`, background: color }} />
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  )
}

function PayslipRow({
  label,
  value,
  bold,
  muted,
  className,
}: {
  label: string
  value: string
  bold?: boolean
  muted?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2 text-xs", className)}>
      <span className={cn(bold ? "font-bold" : "text-muted-foreground", muted && "text-muted-foreground/60")}>
        {label}
      </span>
      <span className={cn("font-mono", bold && "font-extrabold", muted && "text-muted-foreground/60")}>
        {value}
      </span>
    </div>
  )
}
