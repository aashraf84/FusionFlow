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
import { motion } from "framer-motion"

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
        {/* Visual pizza */}
        <Card className="overflow-hidden">
          <div className="relative bg-gradient-to-br from-chart-4/10 to-chart-2/10 grid place-items-center py-8">
            <motion.div
              key={size.id + crust.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
              style={{ width: size.id === "xlarge" ? 220 : size.id === "large" ? 190 : size.id === "medium" ? 160 : 130, height: size.id === "xlarge" ? 220 : size.id === "large" ? 190 : size.id === "medium" ? 160 : 130 }}
            >
              {/* Pizza base */}
              <div className={cn(
                "absolute inset-0 rounded-full grid place-items-center",
                crust.id === "stuffed" ? "bg-chart-4" : crust.id === "pan" ? "bg-amber-700/80" : "bg-amber-200"
              )} style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                <div className="absolute inset-[10%] rounded-full bg-red-100/90 overflow-hidden">
                  {/* sauce */}
                  <div className={cn(
                    "absolute inset-0 rounded-full",
                    sauce.id === "tomato" && "bg-red-500/70",
                    sauce.id === "bbq" && "bg-amber-800/70",
                    sauce.id === "white" && "bg-yellow-100/80",
                    sauce.id === "pesto" && "bg-green-700/70",
                    sauce.id === "spicy" && "bg-red-700/80"
                  )} />
                  {/* cheese speckle */}
                  {cheese.id !== "light" && (
                    <div className="absolute inset-0 opacity-80" style={{
                      backgroundImage: "radial-gradient(white 2px, transparent 2px), radial-gradient(white 3px, transparent 3px)",
                      backgroundSize: "20px 20px, 32px 32px",
                      backgroundPosition: "0 0, 10px 10px",
                    }} />
                  )}
                  {/* toppings as dots */}
                  {Object.entries(toppings).map(([id, t]) => {
                    const colorMap: Record<string, string> = {
                      pepperoni: "bg-red-700", chicken: "bg-amber-200", beef: "bg-amber-900",
                      mushroom: "bg-stone-300", capsicum: "bg-green-500", onion: "bg-purple-200",
                      olive: "bg-black", jalapeno: "bg-green-700", pineapple: "bg-yellow-400",
                      corn: "bg-yellow-300", tomato: "bg-red-500", bacon: "bg-red-900",
                      feta: "bg-white", spinach: "bg-green-600",
                    }
                    return Array.from({ length: t.qty * 3 }).map((_, i) => (
                      <span key={`${id}-${i}`} className={cn("absolute h-2.5 w-2.5 rounded-full", colorMap[id])} style={{
                        top: `${15 + ((i * 37) % 70)}%`,
                        left: `${12 + ((i * 53) % 76)}%`,
                      }} />
                    ))
                  })}
                </div>
              </div>
              {halfHalf && <div className="absolute inset-0 grid place-items-center pointer-events-none"><div className="h-full w-0.5 bg-black/40" /></div>}
            </motion.div>
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <Badge className="bg-chart-1 text-white"><Flame className="h-3 w-3 mr-1" />{calories} cal</Badge>
              <Badge variant="secondary"><Leaf className="h-3 w-3 mr-1" />{size.slices} slices</Badge>
            </div>
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-background"><Wheat className="h-3 w-3 mr-1" />{crust.label.split(" ")[0]}</Badge>
            </div>
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
