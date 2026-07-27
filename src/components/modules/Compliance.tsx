"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { formatPKR } from "@/lib/data"
import {
  ShieldCheck, Thermometer, ClipboardCheck, AlertTriangle, CheckCircle2, Clock,
  XCircle, Calendar, FileText, Beaker, Utensils, Bug, Flame, Droplet, Wind,
  Plus, Star, TrendingUp, Award, Activity,
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts"

interface Inspection {
  id: string; date: string; type: string; area: string; inspector: string
  score: number; findings: number; status: "passed" | "conditional" | "failed"
  notes: string
}
const INSPECTIONS: Inspection[] = [
  { id: "INS-082", date: "2025-07-25", type: "HACCP Audit", area: "Kitchen — Pizza Station", inspector: "Dr. Saima Khan", score: 94, findings: 1, status: "passed", notes: "Excellent hygiene standards. Minor: dough scraper needed." },
  { id: "INS-081", date: "2025-07-24", type: "Food Safety", area: "Storage — Cold Room", inspector: "Tariq Ahmed", score: 88, findings: 2, status: "conditional", notes: "Temperature log gap on 22-Jul. Corrective action taken." },
  { id: "INS-080", date: "2025-07-22", type: "Hygiene Check", area: "Dining Area", inspector: "Nida Yusuf", score: 96, findings: 0, status: "passed", notes: "Spotless. All surfaces sanitized." },
  { id: "INS-079", date: "2025-07-20", type: "Pest Control", area: "Entire Premises", inspector: "BugOff Services", score: 92, findings: 1, status: "passed", notes: "No signs of pests. Traps serviced." },
  { id: "INS-078", date: "2025-07-18", type: "Fire Safety", area: "Kitchen", inspector: "FireSafe Pakistan", score: 85, findings: 3, status: "conditional", notes: "Fire extinguisher expiry 30-Sep. Replace ANSUL nozzle." },
  { id: "INS-077", date: "2025-07-15", type: "HACCP Audit", area: "Prep Area", inspector: "Dr. Saima Khan", score: 97, findings: 0, status: "passed", notes: "Exemplary CCP monitoring." },
  { id: "INS-076", date: "2025-07-10", type: "Health Inspection", area: "All Stations", inspector: "Punjab FDA", score: 91, findings: 1, status: "passed", notes: "License renewed. Staff certificates current." },
  { id: "INS-075", date: "2025-07-05", type: "Allergen Audit", area: "Kitchen", inspector: "Nida Yusuf", score: 89, findings: 2, status: "conditional", notes: "Separate utensils for nut-allergy orders required." },
]

const TEMP_LOGS = [
  { time: "06:00", fridge: 3.2, freezer: -18.5, holding: 4.1 },
  { time: "08:00", fridge: 3.5, freezer: -18.2, holding: 4.3 },
  { time: "10:00", fridge: 3.8, freezer: -17.9, holding: 4.5 },
  { time: "12:00", fridge: 4.1, freezer: -17.5, holding: 4.8 },
  { time: "14:00", fridge: 4.3, freezer: -17.8, holding: 5.0 },
  { time: "16:00", fridge: 3.9, freezer: -18.0, holding: 4.6 },
  { time: "18:00", fridge: 3.6, freezer: -18.3, holding: 4.2 },
  { time: "20:00", fridge: 3.4, freezer: -18.6, holding: 4.0 },
  { time: "22:00", fridge: 3.3, freezer: -18.8, holding: 3.9 },
]

const CCP_LIST = [
  { id: "CCP-01", name: "Cold Storage Temperature", critical: "≤ 5°C", status: "controlled", lastCheck: "2m ago", freq: "Every 2h" },
  { id: "CCP-02", name: "Freezer Temperature", critical: "≤ -18°C", status: "controlled", lastCheck: "2m ago", freq: "Every 2h" },
  { id: "CCP-03", name: "Hot Holding Temperature", critical: "≥ 63°C", status: "controlled", lastCheck: "15m ago", freq: "Every 1h" },
  { id: "CCP-04", name: "Cooking Temperature (Chicken)", critical: "≥ 75°C core", status: "controlled", lastCheck: "8m ago", freq: "Each batch" },
  { id: "CCP-05", name: "Cooking Temperature (Beef)", critical: "≥ 71°C core", status: "controlled", lastCheck: "12m ago", freq: "Each batch" },
  { id: "CCP-06", name: "Cross-Contamination Control", critical: "Color-coded boards", status: "warning", lastCheck: "1h ago", freq: "Continuous" },
  { id: "CCP-07", name: "Hand Wash Compliance", critical: "Every 30 min", status: "controlled", lastCheck: "5m ago", freq: "Every 30 min" },
  { id: "CCP-08", name: "Allergen Separation", critical: "Dedicated prep", status: "controlled", lastCheck: "20m ago", freq: "Each order" },
  { id: "CCP-09", name: "Chemical Storage", critical: "Locked cabinet", status: "controlled", lastCheck: "2h ago", freq: "Per shift" },
  { id: "CCP-10", name: "Waste Disposal", critical: "Sealed bins", status: "controlled", lastCheck: "30m ago", freq: "Per shift" },
]

const TRAINING = [
  { id: "T-01", name: "Ahsan Khan", course: "HACCP Level 2", completed: "2025-03-15", expiry: "2026-03-15", status: "valid" },
  { id: "T-02", name: "Sara Malik", course: "Food Handler Certification", completed: "2025-01-20", expiry: "2026-01-20", status: "valid" },
  { id: "T-03", name: "Bilal Raza", course: "Allergen Awareness", completed: "2025-06-10", expiry: "2026-06-10", status: "valid" },
  { id: "T-04", name: "Imran Sheikh", course: "HACCP Level 2", completed: "2024-08-05", expiry: "2025-08-05", status: "expiring" },
  { id: "T-05", name: "Owais Khan", course: "Fire Safety Training", completed: "2024-12-01", expiry: "2025-12-01", status: "valid" },
  { id: "T-06", name: "Kiran Ali", course: "Food Handler Certification", completed: "2024-07-15", expiry: "2025-07-15", status: "expired" },
]

const CERTS = [
  { name: "HACCP Certification", issuer: "Pakistan Standards", number: "HACCP-PK-2024-1182", valid: "2024-01-01", expiry: "2027-01-01", status: "valid" },
  { name: "ISO 22000:2018", issuer: "SGS Pakistan", number: "ISO22-PK-5567", valid: "2023-09-01", expiry: "2026-09-01", status: "valid" },
  { name: "Halal Certification", issuer: "Jamiat Ulema Pakistan", number: "HALAL-LHR-9921", valid: "2024-04-01", expiry: "2025-04-01", status: "expiring" },
  { name: "Food Business License", issuer: "Punjab Food Authority", number: "PFA-LHR-2024-4451", valid: "2024-06-01", expiry: "2025-06-01", status: "valid" },
  { name: "Halal Certification", issuer: "Jamiat Ulema Pakistan", number: "HALAL-KHI-9922", valid: "2023-11-01", expiry: "2024-11-01", status: "expired" },
]

const STATUS_META = {
  passed: { label: "Passed", cls: "bg-chart-3/15 text-chart-3", icon: CheckCircle2 },
  conditional: { label: "Conditional", cls: "bg-chart-4/15 text-chart-4", icon: AlertTriangle },
  failed: { label: "Failed", cls: "bg-destructive/15 text-destructive", icon: XCircle },
}
const CCP_STATUS = {
  controlled: { label: "Controlled", cls: "bg-chart-3/15 text-chart-3", dot: "bg-chart-3" },
  warning: { label: "Warning", cls: "bg-chart-4/15 text-chart-4", dot: "bg-chart-4" },
  critical: { label: "Critical", cls: "bg-destructive/15 text-destructive", dot: "bg-destructive" },
}
const CERT_STATUS = {
  valid: { label: "Valid", cls: "bg-chart-3/15 text-chart-3" },
  expiring: { label: "Expiring Soon", cls: "bg-chart-4/15 text-chart-4" },
  expired: { label: "Expired", cls: "bg-destructive/15 text-destructive" },
}

export function Compliance() {
  const [tab, setTab] = useState("overview")

  const avgScore = Math.round(INSPECTIONS.reduce((s, i) => s + i.score, 0) / INSPECTIONS.length)
  const passed = INSPECTIONS.filter(i => i.status === "passed").length
  const conditional = INSPECTIONS.filter(i => i.status === "conditional").length
  const ccpControlled = CCP_LIST.filter(c => c.status === "controlled").length
  const ccpWarnings = CCP_LIST.filter(c => c.status === "warning").length
  const expiringCerts = CERTS.filter(c => c.status === "expiring" || c.status === "expired").length
  const expiredTraining = TRAINING.filter(t => t.status === "expired" || t.status === "expiring").length

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto pf-scroll pb-1">
          <TabsList className="h-auto bg-muted/50 p-1">
            {[
              { id: "overview", label: "Overview", icon: ShieldCheck },
              { id: "inspections", label: "Inspections", icon: ClipboardCheck },
              { id: "ccp", label: "Critical Control Points", icon: Beaker },
              { id: "temperature", label: "Temperature Logs", icon: Thermometer },
              { id: "training", label: "Training", icon: Award },
              { id: "certificates", label: "Certificates", icon: FileText },
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
            <Tile icon={Star} label="Avg Inspection Score" value={`${avgScore}%`} sub={`${passed}/${INSPECTIONS.length} passed`} color="var(--chart-3)" />
            <Tile icon={Beaker} label="CCPs Controlled" value={`${ccpControlled}/${CCP_LIST.length}`} sub={`${ccpWarnings} warnings`} color={ccpWarnings > 0 ? "var(--chart-4)" : "var(--chart-3)"} />
            <Tile icon={AlertTriangle} label="Open Findings" value={INSPECTIONS.reduce((s, i) => s + i.findings, 0)} sub="across inspections" color="var(--chart-4)" />
            <Tile icon={FileText} label="Expiring Certs" value={expiringCerts} sub={`${expiredTraining} trainings`} color="var(--chart-5)" />
          </div>

          {/* Compliance score gauge */}
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h3 className="font-bold text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-chart-3" /> Overall Compliance Score</h3>
            </div>
            <div className="p-4 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative h-32 w-32 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--chart-3)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(avgScore / 100) * 264} 264`} />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-chart-3">{avgScore}</div>
                    <div className="text-[9px] text-muted-foreground uppercase font-semibold">Score</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                <ScoreItem icon={ClipboardCheck} label="Inspections" value={`${passed} passed`} pct={Math.round((passed / INSPECTIONS.length) * 100)} />
                <ScoreItem icon={Beaker} label="CCP Control" value={`${ccpControlled}/${CCP_LIST.length}`} pct={Math.round((ccpControlled / CCP_LIST.length) * 100)} />
                <ScoreItem icon={Award} label="Training Current" value={`${TRAINING.filter(t => t.status === "valid").length}/${TRAINING.length}`} pct={Math.round((TRAINING.filter(t => t.status === "valid").length / TRAINING.length) * 100)} />
                <ScoreItem icon={FileText} label="Certifications" value={`${CERTS.filter(c => c.status === "valid").length}/${CERTS.length}`} pct={Math.round((CERTS.filter(c => c.status === "valid").length / CERTS.length) * 100)} />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30">
                <h3 className="font-bold text-sm">Recent Inspections</h3>
              </div>
              <div className="divide-y max-h-[280px] overflow-y-auto pf-scroll">
                {INSPECTIONS.slice(0, 5).map(i => {
                  const m = STATUS_META[i.status]
                  return (
                    <div key={i.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/30">
                      <div className={cn("grid place-items-center h-9 w-9 rounded-lg shrink-0", m.cls)}>
                        <m.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{i.type}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{i.area} · {i.date}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold">{i.score}%</div>
                        <Badge className={cn("text-[9px]", m.cls)}>{m.label}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-chart-4" />
                <h3 className="font-bold text-sm">Active Findings & Corrective Actions</h3>
              </div>
              <div className="p-2 space-y-1.5">
                {INSPECTIONS.filter(i => i.findings > 0).map(i => (
                  <div key={i.id} className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-muted/40">
                    <AlertTriangle className="h-3.5 w-3.5 text-chart-4 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold">{i.type} — {i.area}</div>
                      <div className="text-[10px] text-muted-foreground">{i.notes}</div>
                    </div>
                    <Button size="sm" variant="outline" className="h-6 text-[9px] shrink-0" onClick={() => toast.success("Corrective action logged")}>Resolve</Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── INSPECTIONS ── */}
        <TabsContent value="inspections" className="mt-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-sm">Inspection Records</h3>
              <Button size="sm" onClick={() => toast.info("Schedule inspection")}><Plus className="h-3.5 w-3.5 mr-1" /> Schedule</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">ID</th>
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-left px-4 py-2 hidden md:table-cell">Area</th>
                    <th className="text-left px-4 py-2 hidden lg:table-cell">Inspector</th>
                    <th className="text-right px-4 py-2">Score</th>
                    <th className="text-center px-4 py-2">Findings</th>
                    <th className="px-4 py-2">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {INSPECTIONS.map(i => {
                    const m = STATUS_META[i.status]
                    return (
                      <tr key={i.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5"><span className="font-mono text-xs font-bold">{i.id}</span></td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{i.date}</td>
                        <td className="px-4 py-2.5 text-xs font-medium">{i.type}</td>
                        <td className="px-4 py-2.5 hidden md:table-cell text-xs">{i.area}</td>
                        <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-muted-foreground">{i.inspector}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={cn("text-sm font-extrabold", i.score >= 90 ? "text-chart-3" : i.score >= 80 ? "text-chart-4" : "text-destructive")}>{i.score}%</span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {i.findings > 0 ? <Badge variant="outline" className="text-[9px] text-chart-4">{i.findings}</Badge> : <CheckCircle2 className="h-4 w-4 text-chart-3 mx-auto" />}
                        </td>
                        <td className="px-4 py-2.5"><Badge className={cn("text-[9px]", m.cls)}><m.icon className="h-2.5 w-2.5 mr-0.5" />{m.label}</Badge></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── CCP ── */}
        <TabsContent value="ccp" className="mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Tile icon={Beaker} label="Total CCPs" value={CCP_LIST.length} sub="monitoring points" color="var(--chart-1)" />
            <Tile icon={CheckCircle2} label="Controlled" value={ccpControlled} sub="in limits" color="var(--chart-3)" />
            <Tile icon={AlertTriangle} label="Warnings" value={ccpWarnings} sub="need attention" color="var(--chart-4)" />
            <Tile icon={Activity} label="Checks Today" value={142} sub="recorded" color="var(--chart-2)" />
          </div>
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h3 className="font-bold text-sm flex items-center gap-2"><Beaker className="h-4 w-4 text-primary" /> HACCP Critical Control Points</h3>
              <p className="text-[11px] text-muted-foreground">Continuous monitoring · food safety</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
              {CCP_LIST.map(ccp => {
                const m = CCP_STATUS[ccp.status as keyof typeof CCP_STATUS]
                return (
                  <motion.div key={ccp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("rounded-xl border-2 p-3", ccp.status === "controlled" ? "border-chart-3/30" : "border-chart-4/50 bg-chart-4/5")}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-xs">{ccp.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{ccp.id} · {ccp.freq}</div>
                      </div>
                      <Badge className={cn("text-[9px]", m.cls)}><span className={cn("h-1.5 w-1.5 rounded-full mr-0.5", m.dot)} />{m.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Critical limit:</span>
                      <span className="font-bold font-mono">{ccp.critical}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mt-1">
                      <span className="text-muted-foreground">Last check:</span>
                      <span className="font-semibold">{ccp.lastCheck}</span>
                    </div>
                    {ccp.status !== "controlled" && (
                      <Button size="sm" className="w-full mt-2 h-7 text-[10px]" onClick={() => toast.success(`Corrective action for ${ccp.name}`)}>Take Action</Button>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ── TEMPERATURE LOGS ── */}
        <TabsContent value="temperature" className="mt-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h3 className="font-bold text-sm flex items-center gap-2"><Thermometer className="h-4 w-4 text-chart-4" /> Temperature Monitoring — Today</h3>
              <p className="text-[11px] text-muted-foreground">Automated IoT sensor readings · every 2 hours</p>
            </div>
            <div className="h-[300px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TEMP_LOGS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" unit="°C" domain={[-25, 10]} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v}°C`} />
                  <ReferenceLine y={5} stroke="var(--destructive)" strokeDasharray="4 4" label={{ value: "Fridge limit 5°C", fontSize: 9, fill: "var(--destructive)" }} />
                  <ReferenceLine y={-18} stroke="var(--chart-4)" strokeDasharray="4 4" label={{ value: "Freezer limit -18°C", fontSize: 9, fill: "var(--chart-4)" }} />
                  <Line type="monotone" dataKey="fridge" stroke="var(--chart-3)" strokeWidth={2.5} dot={{ r: 3 }} name="Fridge (°C)" />
                  <Line type="monotone" dataKey="freezer" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3 }} name="Freezer (°C)" />
                  <Line type="monotone" dataKey="holding" stroke="var(--chart-4)" strokeWidth={2.5} dot={{ r: 3 }} name="Holding (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h3 className="font-bold text-sm">Temperature Log Entries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">Time</th>
                    <th className="text-right px-4 py-2">Fridge (≤5°C)</th>
                    <th className="text-right px-4 py-2">Freezer (≤-18°C)</th>
                    <th className="text-right px-4 py-2">Holding (≤5°C)</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {TEMP_LOGS.map(t => {
                    const fridgeOk = t.fridge <= 5
                    const freezerOk = t.freezer <= -18
                    const allOk = fridgeOk && freezerOk
                    return (
                      <tr key={t.time} className="hover:bg-muted/20">
                        <td className="px-4 py-2 text-xs font-mono font-semibold">{t.time}</td>
                        <td className={cn("px-4 py-2 text-right text-xs font-bold", fridgeOk ? "text-chart-3" : "text-destructive")}>{t.fridge}°C</td>
                        <td className={cn("px-4 py-2 text-right text-xs font-bold", freezerOk ? "text-chart-3" : "text-destructive")}>{t.freezer}°C</td>
                        <td className="px-4 py-2 text-right text-xs font-bold text-chart-3">{t.holding}°C</td>
                        <td className="px-4 py-2">
                          {allOk ? <Badge className="text-[9px] bg-chart-3/15 text-chart-3"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />OK</Badge> : <Badge className="text-[9px] bg-chart-4/15 text-chart-4"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" />Check</Badge>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── TRAINING ── */}
        <TabsContent value="training" className="mt-4">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2"><Award className="h-4 w-4 text-chart-2" /> Staff Training Records</h3>
              <Button size="sm" onClick={() => toast.info("Assign training")}><Plus className="h-3.5 w-3.5 mr-1" /> Assign</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">Employee</th>
                    <th className="text-left px-4 py-2">Course</th>
                    <th className="text-left px-4 py-2 hidden sm:table-cell">Completed</th>
                    <th className="text-left px-4 py-2">Expires</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {TRAINING.map(t => (
                    <tr key={t.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 text-xs font-semibold">{t.name}</td>
                      <td className="px-4 py-2.5 text-xs">{t.course}</td>
                      <td className="px-4 py-2.5 hidden sm:table-cell text-xs text-muted-foreground">{t.completed}</td>
                      <td className="px-4 py-2.5 text-xs">{t.expiry}</td>
                      <td className="px-4 py-2.5">
                        <Badge className={cn("text-[9px]", t.status === "valid" ? "bg-chart-3/15 text-chart-3" : t.status === "expiring" ? "bg-chart-4/15 text-chart-4" : "bg-destructive/15 text-destructive")}>
                          {t.status === "valid" ? "Valid" : t.status === "expiring" ? "Expiring" : "Expired"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {t.status !== "valid" && <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => toast.success(`Training reassigned to ${t.name}`)}>Renew</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── CERTIFICATES ── */}
        <TabsContent value="certificates" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CERTS.map(c => {
              const m = CERT_STATUS[c.status as keyof typeof CERT_STATUS]
              return (
                <Card key={c.number} className={cn("overflow-hidden border-2", c.status === "valid" ? "border-chart-3/30" : c.status === "expiring" ? "border-chart-4/50" : "border-destructive/50")}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="grid place-items-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <Badge className={cn("text-[9px]", m.cls)}>{m.label}</Badge>
                    </div>
                    <div className="font-bold text-sm">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.issuer}</div>
                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Cert #</span><span className="font-mono font-semibold">{c.number}</span></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Valid from</span><span className="font-semibold">{c.valid}</span></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Expires</span><span className={cn("font-semibold", c.status !== "valid" && "text-chart-4")}>{c.expiry}</span></div>
                    </div>
                    {c.status !== "valid" && (
                      <Button size="sm" variant="outline" className="w-full mt-3 h-8 text-xs" onClick={() => toast.success(`Renewal initiated for ${c.name}`)}>Initiate Renewal</Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Tile({ icon: Icon, label, value, sub, color }: { icon: typeof ShieldCheck; label: string; value: string | number; sub: string; color: string }) {
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

function ScoreItem({ icon: Icon, label, value, pct }: { icon: typeof ShieldCheck; label: string; value: string; pct: number }) {
  return (
    <div className="rounded-lg border p-2.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold">{value}</span>
        <span className="text-xs font-bold text-chart-3">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-chart-3" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
