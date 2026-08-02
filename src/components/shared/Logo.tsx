"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  showWordmark?: boolean
  variant?: "full" | "icon"
}

// FusionFlow ERP logo — professional enterprise brand mark.
// A rounded badge with a fork & knife forming an "F" silhouette,
// crowned by a pizza slice and crossed by a burger element.
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
          <div className="text-[10px] text-muted-foreground font-medium">Fast Food Operating System</div>
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
        {/* Primary gradient — warm tomato to deep red */}
        <linearGradient id="ffBadgeGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.56 0.21 28)" />
          <stop offset="0.6" stopColor="oklch(0.48 0.22 32)" />
          <stop offset="1" stopColor="oklch(0.40 0.18 35)" />
        </linearGradient>
        {/* Gold gradient for utensils */}
        <linearGradient id="ffGold" x1="14" y1="10" x2="34" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.85 0.15 85)" />
          <stop offset="1" stopColor="oklch(0.72 0.16 70)" />
        </linearGradient>
        {/* Cheese/amber gradient for pizza slice */}
        <linearGradient id="ffCheese" x1="18" y1="6" x2="30" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.82 0.17 80)" />
          <stop offset="1" stopColor="oklch(0.75 0.16 65)" />
        </linearGradient>
        {/* Subtle shine overlay */}
        <linearGradient id="ffShine" x1="8" y1="4" x2="28" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── Outer badge (rounded squircle) ── */}
      <rect x="3" y="3" width="42" height="42" rx="13" fill="url(#ffBadgeGrad)" />
      <rect x="3" y="3" width="42" height="42" rx="13" fill="url(#ffShine)" />
      {/* Subtle inner border ring */}
      <rect x="4.5" y="4.5" width="39" height="39" rx="11.5" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1" />

      {/* ── Pizza slice (top center — the "crown" of the brand) ── */}
      {/* Slice shape pointing down */}
      <path
        d="M24 6 L18 18 L30 18 Z"
        fill="url(#ffCheese)"
        stroke="#ffffff"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* Crust arc on top of slice */}
      <path
        d="M18 18 Q24 14 30 18"
        fill="none"
        stroke="oklch(0.55 0.14 50)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Pepperoni dots on slice */}
      <circle cx="22" cy="14.5" r="1.2" fill="oklch(0.50 0.20 28)" />
      <circle cx="26" cy="15" r="1" fill="oklch(0.50 0.20 28)" />

      {/* ── Fork (left side — forms left stroke of "F") ── */}
      <g stroke="url(#ffGold)" strokeWidth="2" strokeLinecap="round" fill="none">
        {/* Tines */}
        <path d="M13 20 L13 24" />
        <path d="M16 20 L16 24" />
        {/* Base connecting tines */}
        <path d="M12 24 L17 24" />
        {/* Handle going down — the vertical of F */}
        <path d="M14.5 24 L14.5 40" />
      </g>

      {/* ── Knife (right side — forms right part, with burger patty accent) ── */}
      <g stroke="url(#ffGold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Blade */}
        <path d="M33 20 C35.5 21.5, 35.5 24.5, 33.5 26 L33 26 L33 40" />
        {/* Handle */}
        <path d="M33 40 L33 40" />
      </g>

      {/* ── Top horizontal bar of "F" (connecting fork + knife at top) ── */}
      <path
        d="M14.5 24 L33 24"
        stroke="url(#ffGold)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* ── Middle horizontal bar of "F" (burger patty accent) ── */}
      <rect x="14.5" y="31" width="18.5" height="3" rx="1.5" fill="url(#ffGold)" />
      {/* Sesame seeds on the "burger" bar */}
      <circle cx="19" cy="32.5" r="0.5" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="24" cy="32.5" r="0.5" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="29" cy="32.5" r="0.5" fill="#ffffff" fillOpacity="0.7" />

      {/* ── Flow dot (bottom right — the "fusion" accent) ── */}
      <circle cx="35" cy="37" r="2" fill="url(#ffCheese)" />
      <circle cx="35" cy="37" r="2" fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.5" />

      {/* ── Small flow trail dots ── */}
      <circle cx="38.5" cy="34" r="1" fill="#ffffff" fillOpacity="0.4" />
      <circle cx="40.5" cy="31.5" r="0.7" fill="#ffffff" fillOpacity="0.25" />
    </svg>
  )
}
