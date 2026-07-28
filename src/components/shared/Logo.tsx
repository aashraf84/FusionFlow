"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  showWordmark?: boolean
  variant?: "full" | "icon"
}

// FusionFlow ERP logo — QSR-inspired badge with golden arch + bold wordmark.
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
  // QSR-inspired: bold red rounded badge with a golden "M"-like arch forming the F,
  // evoking McDonald's arches + KFC's bold container + Cheezious's chunky lettering.
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
        <linearGradient id="ffBadge" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.52 0.21 27)" />
          <stop offset="1" stopColor="oklch(0.48 0.2 32)" />
        </linearGradient>
        <linearGradient id="ffArch" x1="14" y1="10" x2="34" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.82 0.17 85)" />
          <stop offset="1" stopColor="oklch(0.75 0.16 75)" />
        </linearGradient>
      </defs>
      {/* Bold rounded badge (KFC/Cheezious style container) */}
      <rect x="3" y="3" width="42" height="42" rx="13" fill="url(#ffBadge)" />
      <rect x="3" y="3" width="42" height="42" rx="13" fill="none" stroke="oklch(0.9 0.05 85)" strokeWidth="1" strokeOpacity="0.3" />

      {/* Golden arch forming an "F" — McDonald's-style arch + FusionFlow F */}
      {/* The arch (curve) on the left + horizontal bars = F shape */}
      <path
        d="M16 12 L16 36"
        stroke="url(#ffArch)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M16 12 L27 12"
        stroke="url(#ffArch)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M16 23 L25 23"
        stroke="url(#ffArch)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Flow dot — the "fusion" accent */}
      <circle cx="32" cy="30" r="3" fill="url(#ffArch)" />
      <circle cx="32" cy="30" r="3" fill="none" stroke="oklch(0.52 0.21 27)" strokeWidth="0.5" />
    </svg>
  )
}
