// FusionFlow ERP — per-module color tones (macOS Tahoe 27 palette)
// Each module gets a unique accent color using macOS system colors.

import type { ModuleId } from "./data"

export interface ModuleTheme {
  color: string
  colorLight: string
  colorDark: string
}

export const MODULE_THEMES: Record<ModuleId, ModuleTheme> = {
  dashboard:          { color: "oklch(0.55 0.25 264)",   colorLight: "oklch(0.55 0.25 264 / 0.1)",  colorDark: "oklch(0.45 0.22 264)" },
  pos:                { color: "oklch(0.72 0.20 165)",   colorLight: "oklch(0.72 0.20 165 / 0.1)", colorDark: "oklch(0.52 0.18 165)" },
  "pizza-builder":    { color: "oklch(0.75 0.19 70)",    colorLight: "oklch(0.75 0.19 70 / 0.1)",  colorDark: "oklch(0.55 0.17 70)" },
  kds:                { color: "oklch(0.68 0.19 145)",   colorLight: "oklch(0.68 0.19 145 / 0.1)", colorDark: "oklch(0.50 0.17 145)" },
  production:         { color: "oklch(0.62 0.24 295)",   colorLight: "oklch(0.62 0.24 295 / 0.1)", colorDark: "oklch(0.48 0.22 295)" },
  delivery:           { color: "oklch(0.60 0.22 200)",   colorLight: "oklch(0.60 0.22 200 / 0.1)", colorDark: "oklch(0.45 0.20 200)" },
  tables:             { color: "oklch(0.65 0.20 330)",   colorLight: "oklch(0.65 0.20 330 / 0.1)", colorDark: "oklch(0.50 0.18 330)" },
  "drive-thru":       { color: "oklch(0.70 0.20 25)",    colorLight: "oklch(0.70 0.20 25 / 0.1)",  colorDark: "oklch(0.52 0.18 25)" },
  inventory:          { color: "oklch(0.68 0.18 175)",   colorLight: "oklch(0.68 0.18 175 / 0.1)", colorDark: "oklch(0.50 0.16 175)" },
  purchasing:         { color: "oklch(0.65 0.19 155)",   colorLight: "oklch(0.65 0.19 155 / 0.1)", colorDark: "oklch(0.48 0.17 155)" },
  menu:               { color: "oklch(0.72 0.18 85)",    colorLight: "oklch(0.72 0.18 85 / 0.1)",  colorDark: "oklch(0.54 0.16 85)" },
  online:             { color: "oklch(0.58 0.22 240)",   colorLight: "oklch(0.58 0.22 240 / 0.1)", colorDark: "oklch(0.44 0.20 240)" },
  crm:                { color: "oklch(0.62 0.24 310)",   colorLight: "oklch(0.62 0.24 310 / 0.1)", colorDark: "oklch(0.48 0.22 310)" },
  marketing:          { color: "oklch(0.68 0.22 350)",   colorLight: "oklch(0.68 0.22 350 / 0.1)", colorDark: "oklch(0.52 0.20 350)" },
  analytics:          { color: "oklch(0.55 0.22 260)",   colorLight: "oklch(0.55 0.22 260 / 0.1)", colorDark: "oklch(0.42 0.20 260)" },
  compliance:         { color: "oklch(0.65 0.19 145)",   colorLight: "oklch(0.65 0.19 145 / 0.1)", colorDark: "oklch(0.48 0.17 145)" },
  franchise:          { color: "oklch(0.70 0.20 40)",    colorLight: "oklch(0.70 0.20 40 / 0.1)",  colorDark: "oklch(0.52 0.18 40)" },
  hr:                 { color: "oklch(0.62 0.20 185)",   colorLight: "oklch(0.62 0.20 185 / 0.1)", colorDark: "oklch(0.46 0.18 185)" },
  finance:            { color: "oklch(0.65 0.19 150)",   colorLight: "oklch(0.65 0.19 150 / 0.1)", colorDark: "oklch(0.48 0.17 150)" },
  ai:                 { color: "oklch(0.62 0.24 295)",   colorLight: "oklch(0.62 0.24 295 / 0.1)", colorDark: "oklch(0.48 0.22 295)" },
  reports:            { color: "oklch(0.58 0.22 225)",   colorLight: "oklch(0.58 0.22 225 / 0.1)", colorDark: "oklch(0.44 0.20 225)" },
  settings:           { color: "oklch(0.55 0.18 255)",   colorLight: "oklch(0.55 0.18 255 / 0.1)", colorDark: "oklch(0.42 0.16 255)" },
  users:              { color: "oklch(0.65 0.20 340)",   colorLight: "oklch(0.65 0.20 340 / 0.1)", colorDark: "oklch(0.50 0.18 340)" },
  owner:              { color: "oklch(0.70 0.20 75)",    colorLight: "oklch(0.70 0.20 75 / 0.1)",  colorDark: "oklch(0.52 0.18 75)" },
}

export function getModuleTheme(moduleId: ModuleId): ModuleTheme {
  return MODULE_THEMES[moduleId] ?? MODULE_THEMES.dashboard
}
