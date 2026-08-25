"use client"

import { useMemo, useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatPKR, PIZZA_SIZES, PIZZA_CRUSTS, CHEESE_LEVELS, SAUCES, TOPPINGS } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Pizza, Plus, Minus, ShoppingCart, Flame, Leaf, Wheat, Snowflake, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState as useStateReact } from "react"

export function PizzaBuilder() {
  const addToCart = useAppStore((s) => s.addToCart)
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  const [size, setSize] = useState<(typeof PIZZA_SIZES)[number]>(PIZZA_SIZES[1])
  const [crust, setCrust] = useState<(typeof PIZZA_CRUSTS)[number]>(PIZZA_CRUSTS[1])
  const [cheese, setCheese] = useState<(typeof CHEESE_LEVELS)[number]>(CHEESE_LEVELS[1])
  const [sauce, setSauce] = useState<(typeof SAUCES)[number]>(SAUCES[0])
  const [toppings, setToppings] = useState<Record<string, { qty: number; half?: "left" | "right" }>>({})
  const [halfHalf, setHalfHalf] = useState(false)
  const [notes, setNotes] = useState("")
  const [cooking, setCooking] = useState<"regular" | "well" | "crispy">("regular")

  const toggleTopping = (id: string) => {
    setToppings((t) => {
      const next = { ...t }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = { qty: 1 }
      }
      return next
    })
  }
  const cycleQty = (id: string, dir: 1 | -1) => {
    setToppings((t) => {
      const cur = t[id]
      if (!cur) return t
      const q = Math.max(1, Math.min(3, cur.qty + dir))
      return { ...t, [id]: { ...cur, qty: q } }
    })
  }

  const { price, breakdown } = useMemo(() => {
    let p = size.base
    const b: { label: string; amount: number }[] = [{ label: size.label, amount: size.base }]
    if (crust.delta) { p += crust.delta; b.push({ label: crust.label, amount: crust.delta }) }
    if (cheese.delta) { p += cheese.delta; b.push({ label: cheese.label, amount: cheese.delta }) }
    if (sauce.delta) { p += sauce.delta; b.push({ label: sauce.label, amount: sauce.delta }) }
    for (const [id, t] of Object.entries(toppings)) {
      const top = TOPPINGS.find((x) => x.id === id)
      if (!top) continue
      const amt = top.price * t.qty
      p += amt
      b.push({ label: `${top.label}${t.qty > 1 ? ` ×${t.qty}` : ""}`, amount: amt })
    }
    if (halfHalf) { const f = Math.round(p * 0.1); p += f; b.push({ label: "Half & Half surcharge", amount: f }) }
    return { price: p, breakdown: b }
  }, [size, crust, cheese, sauce, toppings, halfHalf])

  const calories = useMemo(() => {
    let c = (size.slices * 90) + (crust.id === "stuffed" ? 320 : crust.id === "pan" ? 180 : 0)
    for (const [id, t] of Object.entries(toppings)) {
      const top = TOPPINGS.find((x) => x.id === id)
      if (top) c += (id === "bacon" || id === "beef" || id === "chicken" || id === "pepperoni" ? 90 : 45) * t.qty
    }
    if (cheese.id === "double") c += 280
    if (cheese.id === "extra") c += 150
    return c
  }, [size, crust, cheese, toppings])

  const reset = () => {
    setSize(PIZZA_SIZES[1]); setCrust(PIZZA_CRUSTS[1]); setCheese(CHEESE_LEVELS[1]); setSauce(SAUCES[0])
    setToppings({}); setHalfHalf(false); setNotes(""); setCooking("regular")
  }

  const addPizza = () => {
    const customSummary = [
      size.label,
      crust.label,
      cheese.label,
      sauce.label,
      ...Object.entries(toppings).map(([id, t]) => {
        const top = TOPPINGS.find((x) => x.id === id)!
        return `${top.label}${t.qty > 1 ? ` ×${t.qty}` : ""}`
      }),
      halfHalf ? "Half & Half" : "",
      `Cook: ${cooking}`,
    ].filter(Boolean).join(", ")
    addToCart({
      productId: "P-CUSTOM",
      name: "Custom Pizza",
      price,
      quantity: 1,
      station: "pizza",
      customizations: customSummary,
    })
    toast.success("Custom pizza added to cart", { description: `${formatPKR(price)} · ${size.label}` })
    setActiveModule("pos")
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
      {/* LEFT — configurator */}
      <div className="space-y-4">
        {/* Visual pizza — realistic with smoke effect */}
        <Card className="overflow-hidden">
          <div className="relative grid place-items-center py-10" style={{ background: "radial-gradient(ellipse at center, oklch(0.96 0.02 50), oklch(0.88 0.03 45))" }}>
            {/* Smoke effect */}
            <SmokeEffect />

            {/* Pizza */}
            <motion.div
              key={size.id + crust.id + sauce.id + cheese.id + JSON.stringify(toppings)}
              initial={{ scale: 0.7, opacity: 0, rotateY: -30 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="relative"
              style={{
                width: size.id === "xlarge" ? 240 : size.id === "large" ? 200 : size.id === "medium" ? 170 : 140,
                height: size.id === "xlarge" ? 240 : size.id === "large" ? 200 : size.id === "medium" ? 170 : 140,
              }}
            >
              {/* Crust ring (outer) */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: crust.id === "stuffed"
                    ? "linear-gradient(135deg, oklch(0.72 0.14 65), oklch(0.65 0.12 60), oklch(0.55 0.10 55))"
                    : crust.id === "pan"
                      ? "linear-gradient(135deg, oklch(0.68 0.12 55), oklch(0.55 0.10 50))"
                      : crust.id === "sicilian"
                        ? "linear-gradient(135deg, oklch(0.70 0.13 60), oklch(0.58 0.10 55))"
                        : "linear-gradient(135deg, oklch(0.75 0.14 70), oklch(0.65 0.12 65), oklch(0.55 0.10 60))",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.2), inset 0 -4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)",
                }}
              />

              {/* Stuffed crust cheese pockets */}
              {crust.id === "stuffed" && (
                <div className="absolute inset-0 rounded-full">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i / 16) * 360
                    return (
                      <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: "8%",
                          height: "8%",
                          top: "50%",
                          left: "50%",
                          background: "radial-gradient(circle, oklch(0.90 0.12 80), oklch(0.78 0.10 65))",
                          transform: `rotate(${angle}deg) translateY(-46%) rotate(-${angle}deg)`,
                          transformOrigin: "center",
                          boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.1)",
                        }}
                      />
                    )
                  })}
                </div>
              )}

              {/* Sauce layer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute rounded-full overflow-hidden"
                style={{
                  inset: "8%",
                  background: sauce.id === "tomato"
                    ? "radial-gradient(circle, oklch(0.48 0.18 28), oklch(0.42 0.16 25))"
                    : sauce.id === "bbq"
                      ? "radial-gradient(circle, oklch(0.35 0.06 40), oklch(0.28 0.05 35))"
                      : sauce.id === "white"
                        ? "radial-gradient(circle, oklch(0.88 0.04 80), oklch(0.82 0.03 75))"
                        : sauce.id === "pesto"
                          ? "radial-gradient(circle, oklch(0.45 0.08 145), oklch(0.38 0.07 140))"
                          : "radial-gradient(circle, oklch(0.42 0.15 20), oklch(0.36 0.13 18))",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {/* Sauce texture — subtle swirls */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `repeating-conic-gradient(from 0deg, transparent 0deg, ${sauce.id === "tomato" ? "oklch(0.55 0.16 25)" : sauce.id === "bbq" ? "oklch(0.40 0.05 40)" : "oklch(0.50 0.12 25)"} 15deg, transparent 30deg)`,
                  }}
                />
              </motion.div>

              {/* Cheese layer */}
              {cheese.id !== "light" && (
                <motion.div
                  key={cheese.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="absolute rounded-full overflow-hidden"
                  style={{
                    inset: "10%",
                    background: cheese.id === "double"
                      ? "radial-gradient(circle, oklch(0.88 0.10 75 / 0.7), oklch(0.82 0.08 70 / 0.5))"
                      : cheese.id === "extra"
                        ? "radial-gradient(circle, oklch(0.90 0.09 78 / 0.5), oklch(0.85 0.07 72 / 0.3))"
                        : "radial-gradient(circle, oklch(0.92 0.06 80 / 0.3), transparent)",
                  }}
                >
                  {/* Cheese melt blobs */}
                  {cheese.id !== "regular" && Array.from({ length: cheese.id === "double" ? 14 : 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: `${12 + (i % 3) * 6}%`,
                        height: `${12 + (i % 3) * 6}%`,
                        top: `${(i * 23) % 75}%`,
                        left: `${(i * 37) % 75}%`,
                        background: "radial-gradient(circle at 30% 30%, oklch(0.92 0.10 78), oklch(0.82 0.08 72))",
                        opacity: 0.8,
                        filter: "blur(1px)",
                      }}
                    />
                  ))}
                  {/* Golden cheese spots (baked) */}
                  {cheese.id !== "regular" && Array.from({ length: cheese.id === "double" ? 8 : 5 }).map((_, i) => (
                    <div
                      key={`spot-${i}`}
                      className="absolute rounded-full"
                      style={{
                        width: "6%",
                        height: "6%",
                        top: `${10 + (i * 19) % 70}%`,
                        left: `${15 + (i * 29) % 65}%`,
                        background: "oklch(0.72 0.10 60)",
                        opacity: 0.6,
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Toppings — realistic shapes */}
              <div className="absolute rounded-full overflow-hidden" style={{ inset: "10%" }}>
                {Object.entries(toppings).map(([id, t]) => (
                  <ToppingVisual key={id} id={id} qty={t.qty} />
                ))}
              </div>

              {/* Half & half divider */}
              {halfHalf && (
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="h-full w-0.5 bg-black/30" style={{ boxShadow: "0 0 4px rgba(0,0,0,0.3)" }} />
                </div>
              )}

              {/* Glossy highlight */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: "5%",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.05) 100%)",
                }}
              />
            </motion.div>

            {/* Info badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <Badge className="bg-chart-1 text-white shadow-sm"><Flame className="h-3 w-3 mr-1" />{calories} cal</Badge>
              </motion.div>
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <Badge variant="secondary" className="shadow-sm"><Leaf className="h-3 w-3 mr-1" />{size.slices} slices</Badge>
              </motion.div>
            </div>
            <div className="absolute top-3 right-3">
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <Badge variant="outline" className="bg-background shadow-sm"><Wheat className="h-3 w-3 mr-1" />{crust.label.split(" ")[0]}</Badge>
              </motion.div>
            </div>

            {/* Baking indicator */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2"
            >
              <div className="flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-[10px] font-semibold text-muted-foreground shadow-sm">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-chart-4"
                />
                Freshly prepared · Ready to bake
              </div>
            </motion.div>
          </div>
        </Card>

        {/* Size */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Snowflake className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm">Pizza Size</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PIZZA_SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s)}
                  className={cn(
                    "rounded-lg border-2 p-3 text-left transition-all pf-tile",
                    size.id === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="font-semibold text-sm">{s.label.split(" ")[0]}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label.match(/\((.*?)\)/)?.[1]}</div>
                  <div className="text-sm font-bold text-primary mt-1">{formatPKR(s.base)}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crust + Cheese */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-sm mb-3">Crust Type</h3>
              <div className="space-y-1.5">
                {PIZZA_CRUSTS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCrust(c)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
                      crust.id === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <span className="font-medium">{c.label}</span>
                    {c.delta > 0 && <span className={cn("text-xs font-bold", crust.id === c.id ? "text-primary-foreground/80" : "text-primary")}>+{formatPKR(c.delta)}</span>}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold text-sm mb-3">Cheese Level</h3>
              <div className="space-y-1.5">
                {CHEESE_LEVELS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCheese(c)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
                      cheese.id === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <span className="font-medium">{c.label}</span>
                    {c.delta > 0 && <span className={cn("text-xs font-bold", cheese.id === c.id ? "text-primary-foreground/80" : "text-primary")}>+{formatPKR(c.delta)}</span>}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sauce */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-3">Sauce Selection</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SAUCES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSauce(s)}
                  className={cn(
                    "rounded-lg border-2 p-2.5 text-center transition-all pf-tile",
                    sauce.id === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="text-xs font-semibold leading-tight">{s.label}</div>
                  {s.delta > 0 && <div className="text-[10px] text-primary font-bold mt-0.5">+{formatPKR(s.delta)}</div>}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Toppings */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Premium Toppings</h3>
              <Badge variant="secondary">{Object.keys(toppings).length} selected</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {TOPPINGS.map((t) => {
                const sel = !!toppings[t.id]
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "rounded-lg border-2 p-2.5 transition-all",
                      sel ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}
                  >
                    <button onClick={() => toggleTopping(t.id)} className="w-full flex items-center justify-between gap-1">
                      <span className="font-medium text-xs text-left leading-tight">{t.label}</span>
                      <span className="text-[10px] text-primary font-bold whitespace-nowrap">{formatPKR(t.price)}</span>
                    </button>
                    {sel && (
                      <div className="flex items-center justify-between mt-2">
                        <button onClick={() => cycleQty(t.id, -1)} className="grid place-items-center h-6 w-6 rounded bg-muted hover:bg-muted/70">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold">×{toppings[t.id].qty}</span>
                        <button onClick={() => cycleQty(t.id, 1)} className="grid place-items-center h-6 w-6 rounded bg-muted hover:bg-muted/70">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT — summary / pricing */}
      <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground">
                <Pizza className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-sm">Your Custom Pizza</div>
                <div className="text-[11px] text-muted-foreground">Live pricing engine</div>
              </div>
            </div>

            {/* Options extras */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 cursor-pointer">
                <span className="text-xs font-medium">Half & Half Pizza</span>
                <input type="checkbox" checked={halfHalf} onChange={(e) => setHalfHalf(e.target.checked)} className="accent-[var(--primary)] h-4 w-4" />
              </label>
              <div>
                <div className="text-xs font-semibold mb-1.5 px-1">Cooking Preference</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["regular", "well", "crispy"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCooking(c)}
                      className={cn(
                        "rounded-lg py-1.5 text-xs font-medium capitalize transition-all",
                        cooking === c ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Customer notes (e.g. no oregano, extra chili flakes)…"
                className="w-full rounded-lg border bg-background px-3 py-2 text-xs resize-none h-16"
              />
            </div>

            {/* Breakdown */}
            <div className="rounded-lg border divide-y">
              {breakdown.map((b, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="font-semibold">{formatPKR(b.amount)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <div className="text-[11px] text-muted-foreground">Total Price</div>
                <div className="text-2xl font-extrabold text-primary">{formatPKR(price)}</div>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <div>~{Math.round(price / size.slices)}/slice</div>
                <div>{calories} cal total</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
              </Button>
              <Button size="sm" onClick={addPizza}>
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Add to Order
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-[11px] font-bold uppercase text-muted-foreground mb-2">Allergen & Nutrition</div>
            <div className="flex flex-wrap gap-1.5">
              {["Gluten", "Dairy", "May contain Soy"].map((a) => (
                <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/40 py-2"><div className="text-sm font-bold">{Math.round(calories / size.slices)}</div><div className="text-[9px] text-muted-foreground">CAL/Slice</div></div>
              <div className="rounded-lg bg-muted/40 py-2"><div className="text-sm font-bold">{size.slices}</div><div className="text-[9px] text-muted-foreground">SLICES</div></div>
              <div className="rounded-lg bg-muted/40 py-2"><div className="text-sm font-bold">14m</div><div className="text-[9px] text-muted-foreground">PREP TIME</div></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Smoke effect — rising steam from hot pizza ──
function SmokeEffect() {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 200, height: 120 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 20 + i * 8,
            height: 20 + i * 8,
            left: `${20 + i * 15}%`,
            bottom: 0,
            background: "radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%)",
            filter: "blur(4px)",
          }}
          animate={{
            y: [0, -80 - i * 20],
            x: [0, i % 2 === 0 ? 15 : -15, 0],
            opacity: [0, 0.5, 0],
            scale: [0.5, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}

// ── Realistic topping visuals ──
function ToppingVisual({ id, qty }: { id: string; qty: number }) {
  const count = qty * 4

  // Each topping has a realistic shape and color
  const toppingStyles: Record<string, {
    render: (top: string, left: string, size: number, key: string) => React.ReactNode
  }> = {
    pepperoni: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute rounded-full"
          style={{
            width: `${size}%`, height: `${size}%`, top, left,
            background: "radial-gradient(circle at 35% 35%, oklch(0.52 0.18 28), oklch(0.42 0.16 25))",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(0,0,0,0.2)",
          }}
        >
          {/* Pepperoni spots */}
          <div className="absolute rounded-full bg-oklch(0.35 0.10 20)" style={{ width: "20%", height: "20%", top: "20%", left: "30%" }} />
          <div className="absolute rounded-full bg-oklch(0.35 0.10 20)" style={{ width: "15%", height: "15%", top: "60%", left: "60%" }} />
        </motion.div>
      ),
    },
    chicken: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute rounded-lg"
          style={{
            width: `${size * 0.8}%`, height: `${size * 0.6}%`, top, left,
            background: "linear-gradient(135deg, oklch(0.78 0.06 70), oklch(0.68 0.08 60))",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            borderRadius: "30% 70% 50% 50%",
          }}
        />
      ),
    },
    beef: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute"
          style={{
            width: `${size * 0.7}%`, height: `${size * 0.5}%`, top, left,
            background: "linear-gradient(135deg, oklch(0.38 0.06 30), oklch(0.30 0.05 25))",
            borderRadius: "40% 60% 50% 50%",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}
        />
      ),
    },
    mushroom: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute rounded-full"
          style={{
            width: `${size * 0.6}%`, height: `${size * 0.6}%`, top, left,
            background: "radial-gradient(circle at 30% 30%, oklch(0.82 0.02 0), oklch(0.68 0.03 0))",
            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          }}
        >
          <div className="absolute rounded-full" style={{ width: "50%", height: "50%", top: "25%", left: "25%", background: "oklch(0.75 0.03 0)" }} />
        </motion.div>
      ),
    },
    capsicum: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute"
          style={{
            width: `${size * 0.7}%`, height: `${size * 0.4}%`, top, left,
            background: "linear-gradient(135deg, oklch(0.55 0.16 145), oklch(0.45 0.14 140))",
            borderRadius: "40% 60% 50% 50%",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        />
      ),
    },
    onion: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute rounded-full"
          style={{
            width: `${size * 0.5}%`, height: `${size * 0.5}%`, top, left,
            background: "radial-gradient(circle, oklch(0.88 0.03 300), oklch(0.82 0.02 290))",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            opacity: 0.85,
          }}
        >
          <div className="absolute inset-1 rounded-full border border-oklch(0.75 0.02 290 / 0.5)" />
        </motion.div>
      ),
    },
    olive: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute rounded-full"
          style={{
            width: `${size * 0.35}%`, height: `${size * 0.35}%`, top, left,
            background: "radial-gradient(circle, oklch(0.18 0.02 0), oklch(0.12 0.01 0))",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}
        >
          <div className="absolute rounded-full" style={{ width: "30%", height: "30%", top: "35%", left: "35%", background: "oklch(0.35 0.03 0)" }} />
        </motion.div>
      ),
    },
    jalapeno: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute"
          style={{
            width: `${size * 0.5}%`, height: `${size * 0.7}%`, top, left,
            background: "linear-gradient(135deg, oklch(0.55 0.14 145), oklch(0.45 0.12 140))",
            borderRadius: "50% 50% 30% 30%",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        >
          <div className="absolute rounded-full" style={{ width: "40%", height: "20%", top: "40%", left: "30%", background: "oklch(0.60 0.10 70 / 0.4)" }} />
        </motion.div>
      ),
    },
    pineapple: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute rounded-md"
          style={{
            width: `${size * 0.5}%`, height: `${size * 0.5}%`, top, left,
            background: "linear-gradient(135deg, oklch(0.85 0.14 95), oklch(0.78 0.12 85))",
            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          }}
        />
      ),
    },
    corn: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute rounded-full"
          style={{
            width: `${size * 0.25}%`, height: `${size * 0.25}%`, top, left,
            background: "radial-gradient(circle at 30% 30%, oklch(0.82 0.14 90), oklch(0.75 0.12 80))",
            boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
          }}
        />
      ),
    },
    tomato: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute rounded-full"
          style={{
            width: `${size * 0.5}%`, height: `${size * 0.5}%`, top, left,
            background: "radial-gradient(circle at 30% 30%, oklch(0.58 0.18 25), oklch(0.48 0.16 22))",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        >
          <div className="absolute rounded-full bg-oklch(0.35 0.08 25)" style={{ width: "25%", height: "25%", top: "15%", left: "20%" }} />
        </motion.div>
      ),
    },
    bacon: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute"
          style={{
            width: `${size * 0.8}%`, height: `${size * 0.3}%`, top, left,
            background: "repeating-linear-gradient(90deg, oklch(0.45 0.12 25) 0%, oklch(0.35 0.10 20) 30%, oklch(0.50 0.13 28) 50%, oklch(0.38 0.10 22) 70%, oklch(0.45 0.12 25) 100%)",
            borderRadius: "20%",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          }}
        />
      ),
    },
    feta: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute rounded-sm"
          style={{
            width: `${size * 0.5}%`, height: `${size * 0.4}%`, top, left,
            background: "linear-gradient(135deg, oklch(0.95 0.02 0), oklch(0.88 0.03 0))",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            opacity: 0.9,
          }}
        />
      ),
    },
    spinach: {
      render: (top, left, size, key) => (
        <motion.div
          key={key}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="absolute"
          style={{
            width: `${size * 0.6}%`, height: `${size * 0.4}%`, top, left,
            background: "linear-gradient(135deg, oklch(0.50 0.12 145), oklch(0.42 0.10 140))",
            borderRadius: "50% 10% 50% 10%",
            boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
          }}
        />
      ),
    },
  }

  const style = toppingStyles[id]
  if (!style) return null

  // Distribute toppings in a pseudo-random but deterministic pattern
  const positions = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 + (id.charCodeAt(0) * 0.1)
    const radius = 0.15 + ((i * 0.13) % 0.65) // 15% to 80% from center
    const top = `${50 + Math.sin(angle) * radius * 50}%`
    const left = `${50 + Math.cos(angle) * radius * 50}%`
    const size = 10 + (i % 3) * 4
    return { top, left, size, key: `${id}-${i}` }
  })

  return (
    <>
      {positions.map((p) => style.render(p.top, p.left, p.size, p.key))}
    </>
  )
}
