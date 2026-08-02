"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { Logo } from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ROLES, type Role } from "@/lib/auth"
import {
  ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Zap,
  KeyRound, CheckCircle2, Loader2, Fingerprint, Cpu, Monitor,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

type LoginMode = "register" | "login" | "success"

const DEMO_ACCOUNTS: { role: Role; email: string; label: string; desc: string }[] = [
  { role: "admin", email: "demo.admin@fusionflow.dev", label: "Admin", desc: "Full ERP management" },
  { role: "manager", email: "demo.manager@fusionflow.dev", label: "Manager", desc: "Branch operations" },
  { role: "cashier", email: "demo.cashier@fusionflow.dev", label: "Cashier", desc: "POS & front-of-house" },
  { role: "chef", email: "demo.chef@fusionflow.dev", label: "Chef", desc: "Kitchen & production" },
  { role: "rider", email: "demo.rider@fusionflow.dev", label: "Rider", desc: "Delivery only" },
  { role: "viewer", email: "demo.viewer@fusionflow.dev", label: "Viewer", desc: "Read-only audits" },
]

export function LoginScreen() {
  const login = useAuthStore((s) => s.login)
  const switchRole = useAuthStore((s) => s.switchRole)
  const [mode, setMode] = useState<LoginMode>("register")
  const [serialKey, setSerialKey] = useState("")
  const [registering, setRegistering] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState({ id: "", name: "" })

  const [email, setEmail] = useState("demo.admin@fusionflow.dev")
  const [password, setPassword] = useState("fusionflow123")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Generate device fingerprint on mount
  useEffect(() => {
    const nav = navigator as any
    const fingerprint = btoa(
      `${nav.userAgent?.slice(0, 50) ?? "unknown"}-${screen.width}x${screen.height}-${nav.language ?? "en"}-${Date.now().toString(36)}`
    ).slice(0, 16).toUpperCase()
    const deviceName = `${nav.platform?.slice(0, 10) ?? "Device"}-${fingerprint.slice(0, 6)}`
    // eslint-disable-next-line react-hooks/set-state-in-effect -- device fingerprint init on mount
    setDeviceInfo({ id: fingerprint, name: deviceName })
  }, [])

  // Serial key registration — validates against API
  const registerDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (serialKey.trim().length < 12) {
      toast.error("Invalid serial key", { description: "Serial key must be at least 12 characters" })
      return
    }
    setRegistering(true)
    try {
      const res = await fetch("/api/device/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serialKey: serialKey.trim(),
          deviceName: deviceInfo.name,
          deviceId: deviceInfo.id,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Registration failed")
        setRegistering(false)
        return
      }
      // Success — show animation
      setRegistering(false)
      setMode("success")
      toast.success("Device registered successfully!", { description: `Plan: ${json.plan} · Device: ${deviceInfo.name}` })
      setTimeout(() => setMode("login"), 3000)
    } catch {
      toast.error("Network error during registration")
      setRegistering(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await login(email, password)
    setLoading(false)
    if (!res.ok) {
      setError(res.error ?? "Login failed")
      toast.error(res.error ?? "Login failed")
    } else {
      toast.success("Welcome to FusionFlow ERP")
    }
  }

  const quickLogin = async (role: Role, accEmail: string) => {
    setLoading(true)
    setError("")
    setEmail(accEmail)
    await switchRole(role)
    setLoading(false)
    toast.success(`Signed in as ${role}`)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div
        className="hidden lg:flex lg:w-[44%] relative overflow-hidden flex-col justify-between p-10 text-white"
        style={{ background: "linear-gradient(135deg, oklch(0.5 0.2 28) 0%, oklch(0.42 0.16 38) 50%, oklch(0.35 0.12 50) 100%)" }}
      >
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-25" style={{ background: "oklch(0.7 0.16 75)" }} />
        <div className="absolute bottom-10 -left-10 h-60 w-60 rounded-full opacity-20" style={{ background: "oklch(0.6 0.15 145)" }} />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

        <div className="relative">
          <Logo size={56} variant="icon" className="drop-shadow-xl" />
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight leading-tight">FusionFlow ERP</h1>
          <p className="mt-2 text-white/80 text-lg font-medium">The Enterprise Fast Food Operating System</p>
          <p className="mt-4 text-white/70 text-sm max-w-md leading-relaxed">
            Run pizza chains, burger brands, fried chicken, cafés, cloud kitchens and franchises from one unified platform — POS, KDS, delivery, inventory, CRM, finance, HR & AI insights with role-based access control.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-3">
          {[
            { icon: Zap, label: "24 Modules", sub: "Full QSR suite" },
            { icon: ShieldCheck, label: "7 Roles", sub: "Granular RBAC" },
            { icon: Sparkles, label: "AI Insights", sub: "Predictive engine" },
          ].map((f) => (
            <div key={f.label} className="rounded-xl bg-white/10 backdrop-blur-sm p-3 border border-white/10">
              <f.icon className="h-5 w-5 mb-2" />
              <div className="font-bold text-sm">{f.label}</div>
              <div className="text-[10px] text-white/60">{f.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — auth panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center justify-center mb-6">
            <Logo size={48} variant="full" />
          </div>

          <AnimatePresence mode="wait">
            {/* ── MODE: REGISTER (Serial Key) ── */}
            {mode === "register" && (
              <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <KeyRound className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-extrabold tracking-tight">Device Registration</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">Enter your serial key to register this device and activate FusionFlow ERP.</p>
                </div>

                {/* Device info card */}
                <div className="rounded-xl border bg-muted/30 p-3 mb-4 flex items-center gap-3">
                  <div className="grid place-items-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <Cpu className="h-3 w-3" /> {deviceInfo.name || "Detecting device..."}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">ID: {deviceInfo.id || "..."}</div>
                  </div>
                  <Fingerprint className="h-4 w-4 text-chart-3 shrink-0" />
                </div>

                <form onSubmit={registerDevice} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block">Serial Key / License Key</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={serialKey}
                        onChange={(e) => setSerialKey(e.target.value.toUpperCase())}
                        placeholder="FF-XXXX-XXXX-XXXX-XXXX"
                        className="pl-9 h-11 font-mono tracking-wider uppercase"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Enter the 16+ character serial key provided with your license</p>
                  </div>

                  <Button type="submit" className="w-full h-11 font-semibold" disabled={registering}>
                    {registering ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registering Device...</>
                    ) : (
                      <><Fingerprint className="h-4 w-4 mr-2" /> Register This Device</>
                    )}
                  </Button>
                </form>

                {/* Demo login section under serial key */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">Explore without registration</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center mb-3">Quick demo login — explore the full ERP instantly</p>
                  <div className="grid grid-cols-2 gap-2">
                    {DEMO_ACCOUNTS.map((a) => {
                      const roleDef = ROLES.find((r) => r.id === a.role)!
                      return (
                        <button
                          key={a.role}
                          onClick={() => quickLogin(a.role, a.email)}
                          disabled={loading}
                          className="text-left rounded-lg border p-2.5 hover:border-primary/40 hover:bg-accent/40 transition-all disabled:opacity-50"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ background: roleDef.color }} />
                            <span className="text-xs font-bold">{a.label}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</div>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground mt-3">
                    All demo accounts use password <code className="font-mono bg-muted px-1 py-0.5 rounded">fusionflow123</code>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── MODE: SUCCESS (Animation) ── */}
            {mode === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                {/* Animated success ring */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="relative mx-auto mb-6"
                >
                  <div className="grid place-items-center h-24 w-24 rounded-full bg-chart-3/15 mx-auto">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                    >
                      <CheckCircle2 className="h-14 w-14 text-chart-3" />
                    </motion.div>
                  </div>
                  {/* Expanding rings */}
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-chart-3"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                    />
                  ))}
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-extrabold mb-2"
                >
                  Device Registered!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-muted-foreground mb-4"
                >
                  Your device has been activated successfully.<br />
                  Preparing login...
                </motion.p>

                {/* Progress bar */}
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-1 bg-chart-3 rounded-full mx-auto max-w-[200px]"
                />

                {/* Device confirmed badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-chart-3/10 px-3 py-1.5 text-xs font-semibold text-chart-3"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Device: {deviceInfo.name}
                </motion.div>
              </motion.div>
            )}

            {/* ── MODE: LOGIN ── */}
            {mode === "login" && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-5 w-5 text-chart-3" />
                    <h2 className="text-2xl font-extrabold tracking-tight">Sign in</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">Device activated. Sign in to access your dashboard.</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@fusionflow.dev"
                        className="pl-9 h-11"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-9 pr-9 h-11"
                        required
                      />
                      <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-destructive/10 text-destructive text-xs font-medium px-3 py-2 border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                    {loading ? "Signing in…" : <>Sign In <ArrowRight className="h-4 w-4 ml-1.5" /></>}
                  </Button>
                </form>

                {/* Demo login under login form */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">Quick demo login</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DEMO_ACCOUNTS.map((a) => {
                      const roleDef = ROLES.find((r) => r.id === a.role)!
                      return (
                        <button
                          key={a.role}
                          onClick={() => quickLogin(a.role, a.email)}
                          disabled={loading}
                          className="flex flex-col items-center gap-1 py-2 rounded-lg border hover:border-primary/40 hover:bg-accent/40 transition-all disabled:opacity-50"
                        >
                          <span className="h-2 w-2 rounded-full" style={{ background: roleDef.color }} />
                          <span className="text-[10px] font-bold">{a.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Back to registration */}
                <button
                  onClick={() => setMode("register")}
                  className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground mt-4"
                >
                  ← Register a different device
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
