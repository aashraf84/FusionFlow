"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  showWordmark?: boolean
  variant?: "full" | "icon"
}

// FusionFlow ERP logo — three converging streams fusing into one unified flow,
// representing the unification of all restaurant operations into a single platform.
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
        <linearGradient id="fusionGrad" x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.62 0.2 28)" />
          <stop offset="0.5" stopColor="oklch(0.6 0.18 50)" />
          <stop offset="1" stopColor="oklch(0.66 0.15 145)" />
        </linearGradient>
        <linearGradient id="fusionShine" x1="8" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Rounded tile background */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fusionGrad)" />
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fusionShine)" />

      {/* Three converging streams (left side) fusing into one flow (right side) */}
      {/* Top stream — tomato red */}
      <path
        d="M6 14 C14 14, 18 20, 24 24"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      {/* Middle stream — straight, white */}
      <path
        d="M6 24 L24 24"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      {/* Bottom stream — amber */}
      <path
        d="M6 34 C14 34, 18 28, 24 24"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />

      {/* Fusion node — where three streams merge */}
      <circle cx="24" cy="24" r="3.5" fill="#fff" />
      <circle cx="24" cy="24" r="3.5" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.6">
        <animate attributeName="r" values="3.5;6;3.5" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
      </circle>

      {/* Unified flow — single arrow-like stream continuing right */}
      <path
        d="M27 24 C32 24, 36 24, 40 24"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Flow arrowhead */}
      <path
        d="M37 20 L42 24 L37 28"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Small flow particles along the unified stream */}
      <circle cx="31" cy="24" r="1" fill="#fff" opacity="0.5" />
      <circle cx="35" cy="24" r="1" fill="#fff" opacity="0.3" />
    </svg>
  )
}
