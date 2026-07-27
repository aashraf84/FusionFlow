"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { Logo } from "@/components/shared/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ROLES, type Role } from "@/lib/auth"
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, Zap } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

const DEMO_ACCOUNTS: { role: Role; email: string; label: string; desc: string }[] = [
  { role: "owner", email: "owner@fusionflow.dev", label: "Owner", desc: "Full access incl. SaaS portal" },
  { role: "admin", email: "admin@fusionflow.dev", label: "Admin", desc: "Full ERP management" },
  { role: "manager", email: "manager@fusionflow.dev", label: "Manager", desc: "Branch operations" },
  { role: "cashier", email: "cashier@fusionflow.dev", label: "Cashier", desc: "POS & front-of-house" },
  { role: "chef", email: "chef@fusionflow.dev", label: "Chef", desc: "Kitchen & production" },
  { role: "rider", email: "rider@fusionflow.dev", label: "Rider", desc: "Delivery only" },
  { role: "viewer", email: "viewer@fusionflow.dev", label: "Viewer", desc: "Read-only audits" },
]

export function LoginScreen() {
  const login = useAuthStore((s) => s.login)
  const switchRole = useAuthStore((s) => s.switchRole)
  const [email, setEmail] = useState("admin@fusionflow.dev")
  const [password, setPassword] = useState("fusionflow123")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
        className="hidden lg:flex lg:w-[46%] relative overflow-hidden flex-col justify-between p-10 text-white"
        style={{ background: "linear-gradient(135deg, oklch(0.5 0.2 28) 0%, oklch(0.42 0.16 38) 50%, oklch(0.35 0.12 50) 100%)" }}
      >
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-30" style={{ background: "oklch(0.7 0.16 75)" }} />
        <div className="absolute bottom-10 -left-10 h-60 w-60 rounded-full opacity-20" style={{ background: "oklch(0.6 0.15 145)" }} />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

        <div className="relative">
          <Logo size={56} variant="icon" className="drop-shadow-xl" />
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight leading-tight">FusionFlow ERP</h1>
          <p className="mt-2 text-white/80 text-lg font-medium">The Enterprise Restaurant Operating System</p>
          <p className="mt-4 text-white/70 text-sm max-w-md leading-relaxed">
            Run pizza chains, burger brands, fried chicken, cafés, cloud kitchens and franchises from one unified platform — POS, KDS, delivery, inventory, CRM, finance, HR & AI insights with role-based access control.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-3">
          {[
            { icon: Zap, label: "20 Modules", sub: "Full QSR suite" },
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

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center justify-center mb-6">
            <Logo size={48} variant="full" />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Welcome back. Access your restaurant operations.</p>
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

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Quick demo login</span>
              <div className="flex-1 h-px bg-border" />
            </div>
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
      </div>
    </div>
  )
}
