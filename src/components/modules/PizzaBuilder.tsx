"use client"

import { useMemo, useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatPKR, PIZZA_SIZES, PIZZA_CRUSTS, CHEESE_LEVELS, SAUCES, TOPPINGS } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Pizza, Plus, Minus, ShoppingCart, Flame, Leaf, Wheat, Snowflake, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

  // Select real pizza photo based on selected toppings
  const pizzaImage = useMemo(() => {
    const selectedToppings = Object.keys(toppings)
    const hasPepperoni = selectedToppings.includes("pepperoni")
    const hasChicken = selectedToppings.includes("chicken")
    const hasBeef = selectedToppings.includes("beef")
    const hasVeggie = selectedToppings.includes("mushroom") || selectedToppings.includes("capsicum") || selectedToppings.includes("onion") || selectedToppings.includes("olive") || selectedToppings.includes("spinach")
    const isExtraCheese = cheese.id === "extra" || cheese.id === "double"
    const hasManyToppings = selectedToppings.length >= 3

    if (hasPepperoni && hasManyToppings) return "/pizza/pepperoni-supreme.jpg"
    if (hasManyToppings && !hasChicken && !hasBeef) return "/pizza/supreme.jpg"
    if (hasChicken || hasBeef) return "/pizza/bbq-chicken.jpg"
    if (hasVeggie && !hasPepperoni && !hasChicken) return "/pizza/veggie.jpg"
    if (isExtraCheese && !hasPepperoni && !hasChicken) return "/pizza/extra-cheese.jpg"
    if (hasPepperoni) return "/pizza/pepperoni.jpg"
    return "/pizza/margherita.jpg"
  }, [toppings, cheese])

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
        {/* Visual pizza — professional photography with steam */}
        <Card className="overflow-hidden">
          <div
            className="relative grid place-items-center py-8"
            style={{
              background: "linear-gradient(180deg, oklch(0.15 0.02 40) 0%, oklch(0.12 0.02 35) 100%)",
            }}
          >
            {/* Steam effect */}
            <SmokeEffect />

            {/* Pizza photo with gentle float */}
            <motion.div
              key={pizzaImage}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative rounded-2xl overflow-hidden"
                style={{
                  width: size.id === "xlarge" ? 300 : size.id === "large" ? 260 : size.id === "medium" ? 220 : 180,
                  height: size.id === "xlarge" ? 300 : size.id === "large" ? 260 : size.id === "medium" ? 220 : 180,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)",
                }}
              >
                <img
                  src={pizzaImage}
                  alt="Your custom pizza"
                  className="w-full h-full object-cover"
                  style={{ filter: "saturate(1.1) contrast(1.05)" }}
                />
                {/* Subtle vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%)" }}
                />
              </motion.div>
            </motion.div>

            {/* Info badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <Badge className="bg-white/90 text-black shadow-lg"><Flame className="h-3 w-3 mr-1" />{calories} cal</Badge>
              </motion.div>
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <Badge className="bg-white/90 text-black shadow-lg"><Leaf className="h-3 w-3 mr-1" />{size.slices} slices</Badge>
              </motion.div>
            </div>
            <div className="absolute top-3 right-3">
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <Badge className="bg-white/90 text-black shadow-lg"><Wheat className="h-3 w-3 mr-1" />{crust.label.split(" ")[0]}</Badge>
              </motion.div>
            </div>

            {/* Bottom indicator */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2"
            >
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1 text-[10px] font-semibold text-white shadow-lg">
                <motion.span
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-2 w-2 rounded-full bg-chart-4"
                />
                Fresh from the oven
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

// ── Falling toppings — physics animation when toppings are added ──
function FallingToppings({ toppings }: { toppings: Record<string, { qty: number; half?: "left" | "right" }> }) {
  const toppingVisuals: Record<string, { color: string; shape: string; size: number }> = {
    pepperoni: { color: "oklch(0.52 0.18 28)", shape: "circle", size: 14 },
    chicken: { color: "oklch(0.75 0.08 60)", shape: "blob", size: 12 },
    beef: { color: "oklch(0.35 0.06 25)", shape: "blob", size: 12 },
    mushroom: { color: "oklch(0.80 0.02 0)", shape: "circle", size: 10 },
    capsicum: { color: "oklch(0.55 0.16 145)", shape: "strip", size: 14 },
    onion: { color: "oklch(0.85 0.02 290)", shape: "ring", size: 10 },
    olive: { color: "oklch(0.15 0.01 0)", shape: "circle", size: 6 },
    jalapeno: { color: "oklch(0.50 0.14 145)", shape: "oval", size: 10 },
    pineapple: { color: "oklch(0.82 0.14 90)", shape: "square", size: 10 },
    corn: { color: "oklch(0.80 0.14 85)", shape: "circle", size: 5 },
    tomato: { color: "oklch(0.55 0.18 25)", shape: "circle", size: 10 },
    bacon: { color: "oklch(0.45 0.12 25)", shape: "strip", size: 16 },
    feta: { color: "oklch(0.92 0.02 0)", shape: "square", size: 8 },
    spinach: { color: "oklch(0.48 0.12 145)", shape: "leaf", size: 12 },
  }

  const items: { id: string; key: string; visual: typeof toppingVisuals[string]; x: number; delay: number }[] = []

  Object.entries(toppings).forEach(([id, t]) => {
    const visual = toppingVisuals[id]
    if (!visual) return
    // Create one falling particle per qty (max 3 for performance)
    const count = Math.min(t.qty, 3)
    for (let i = 0; i < count; i++) {
      items.push({
        id,
        key: `${id}-${i}`,
        visual,
        x: 20 + (i * 30 + id.charCodeAt(0) * 7) % 60, // spread across pizza
        delay: i * 0.15,
      })
    }
  })

  return (
    <div className="absolute inset-0 rounded-full overflow-visible pointer-events-none" style={{ zIndex: 10 }}>
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.key}
            initial={{ y: -120, x: `${item.x}%`, opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              y: { type: "spring", stiffness: 200, damping: 8, delay: item.delay },
              opacity: { delay: item.delay, duration: 0.3 },
              scale: { delay: item.delay, type: "spring" },
              rotate: { duration: 0.8, ease: "easeOut" },
            }}
            className="absolute"
            style={{
              width: item.visual.size,
              height: item.visual.size,
              left: `${item.x}%`,
              top: 0,
            }}
          >
            <div
              className={cn(
                "w-full h-full",
                item.visual.shape === "circle" && "rounded-full",
                item.visual.shape === "square" && "rounded-sm",
                item.visual.shape === "blob" && "rounded-[40%_60%_50%_50%]",
                item.visual.shape === "strip" && "rounded-full",
                item.visual.shape === "ring" && "rounded-full border-2",
                item.visual.shape === "oval" && "rounded-full",
                item.visual.shape === "leaf" && "rounded-[50%_10%_50%_10%]",
              )}
              style={{
                background: item.visual.color,
                boxShadow: "0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.2)",
                border: item.visual.shape === "ring" ? `2px solid ${item.visual.color}` : undefined,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
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
