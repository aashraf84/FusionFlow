"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  showWordmark?: boolean
  variant?: "full" | "icon"
}

// Crave ERP logo — a warm gradient rounded tile with a stylized plate + fork/knife
export function Logo({ className, size = 40, showWordmark = false, variant = "icon" }: LogoProps) {
  if (variant === "full" || showWordmark) {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <LogoIcon size={size} />
        <div className="leading-tight">
          <div className="font-extrabold tracking-tight text-[15px] flex items-center gap-1.5">
            Crave
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
      aria-label="Crave ERP"
    >
      <defs>
        <linearGradient id="craveGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.62 0.2 28)" />
          <stop offset="0.55" stopColor="oklch(0.58 0.21 28)" />
          <stop offset="1" stopColor="oklch(0.7 0.16 60)" />
        </linearGradient>
        <linearGradient id="craveShine" x1="8" y1="6" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Rounded tile background */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#craveGrad)" />
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#craveShine)" />
      {/* Plate circle */}
      <circle cx="24" cy="24" r="13" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.95" />
      <circle cx="24" cy="24" r="9" fill="#fff" fillOpacity="0.12" />
      {/* Fork (left) */}
      <g stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M14 15.5 L14 19" />
        <path d="M16.2 15.5 L16.2 19" />
        <path d="M12 19 L18.2 19" />
        <path d="M15.1 19 L15.1 33" />
      </g>
      {/* Knife (right) */}
      <g stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M33.5 15 C36 16.5, 36 20, 34 21.5 L33.5 21.5 L33.5 33" />
      </g>
      {/* Steam dots */}
      <circle cx="21" cy="9" r="1.1" fill="#fff" fillOpacity="0.7" />
      <circle cx="24" cy="7.5" r="1.1" fill="#fff" fillOpacity="0.55" />
      <circle cx="27" cy="9" r="1.1" fill="#fff" fillOpacity="0.7" />
    </svg>
  )
}
