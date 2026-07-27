"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  showWordmark?: boolean
  variant?: "full" | "icon"
}

// FusionFlow ERP logo — "FF" monogram on a gradient tile.
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="FusionFlow ERP"
    >
      <defs>
        <linearGradient id="ffGrad" x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.62 0.2 28)" />
          <stop offset="0.5" stopColor="oklch(0.6 0.18 50)" />
          <stop offset="1" stopColor="oklch(0.66 0.15 145)" />
        </linearGradient>
        <linearGradient id="ffShine" x1="8" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Rounded tile background */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ffGrad)" />
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ffShine)" />

      {/* FF monogram — two interlocking F shapes */}
      {/* Left F */}
      <path
        d="M11 13 L20 13 M11 13 L11 35 M11 23 L18 23"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Right F (slightly offset/interlocking) */}
      <path
        d="M26 13 L37 13 M26 13 L26 35 M26 23 L35 23"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
      />

      {/* Flow accent — small dots representing the fusion flow */}
      <circle cx="22.5" cy="18" r="1.2" fill="#fff" opacity="0.9" />
      <circle cx="22.5" cy="24" r="1" fill="#fff" opacity="0.6" />
    </svg>
  )
}
