"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  showWordmark?: boolean
  variant?: "full" | "icon"
}

// FusionFlow ERP logo — clean "FF" text badge on a gradient tile.
export function Logo({ className, size = 40, showWordmark = false, variant = "icon" }: LogoProps) {
  if (variant === "full" || showWordmark) {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <LogoIcon size={size} />
        <div className="leading-tight">
          <div className="font-extrabold tracking-tight text-[15px] flex items-center gap-1.5">
            FusionFlow
            <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-primary/20 text-primary">ERP</span>
          </div>
          <div className="text-[10px] text-muted-foreground font-medium">Restaurant Operating System</div>
        </div>
      </div>
    )
  }
  return <LogoIcon size={size} className={className} />
}

function LogoIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn("grid place-items-center rounded-xl text-white font-extrabold shrink-0 shadow-sm", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: "linear-gradient(135deg, oklch(0.55 0.2 28) 0%, oklch(0.58 0.18 45) 50%, oklch(0.62 0.15 145) 100%)",
        letterSpacing: "-0.02em",
      }}
      role="img"
      aria-label="FusionFlow ERP"
    >
      FF
    </div>
  )
}
