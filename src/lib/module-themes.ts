// FusionFlow ERP — per-module color tones for visual identity
// Each module gets a unique accent color used in sidebar active state, cards, and headers.

import type { ModuleId } from "./data"

export interface ModuleTheme {
  color: string          // primary accent (oklch)
  colorLight: string     // light tint for backgrounds
  colorDark: string      // darker shade for text on light
}

export const MODULE_THEMES: Record<ModuleId, ModuleTheme> = {
  dashboard:          { color: "oklch(0.55 0.2 28)",   colorLight: "oklch(0.55 0.2 28 / 0.1)",  colorDark: "oklch(0.45 0.2 28)" },
  pos:                { color: "oklch(0.6 0.18 145)",  colorLight: "oklch(0.6 0.18 145 / 0.1)", colorDark: "oklch(0.45 0.18 145)" },
  "pizza-builder":    { color: "oklch(0.62 0.19 50)",  colorLight: "oklch(0.62 0.19 50 / 0.1)", colorDark: "oklch(0.48 0.19 50)" },
  kds:                { color: "oklch(0.65 0.16 75)",  colorLight: "oklch(0.65 0.16 75 / 0.1)", colorDark: "oklch(0.5 0.16 75)" },
  production:         { color: "oklch(0.58 0.15 200)", colorLight: "oklch(0.58 0.15 200 / 0.1)",colorDark: "oklch(0.45 0.15 200)" },
  delivery:           { color: "oklch(0.6 0.16 250)",  colorLight: "oklch(0.6 0.16 250 / 0.1)", colorDark: "oklch(0.45 0.16 250)" },
  tables:             { color: "oklch(0.62 0.17 320)", colorLight: "oklch(0.62 0.17 320 / 0.1)",colorDark: "oklch(0.48 0.17 320)" },
  "drive-thru":       { color: "oklch(0.58 0.19 15)",  colorLight: "oklch(0.58 0.19 15 / 0.1)", colorDark: "oklch(0.45 0.19 15)" },
  inventory:          { color: "oklch(0.55 0.18 180)", colorLight: "oklch(0.55 0.18 180 / 0.1)",colorDark: "oklch(0.42 0.18 180)" },
  purchasing:         { color: "oklch(0.6 0.15 160)",  colorLight: "oklch(0.6 0.15 160 / 0.1)", colorDark: "oklch(0.45 0.15 160)" },
  menu:               { color: "oklch(0.58 0.17 95)",  colorLight: "oklch(0.58 0.17 95 / 0.1)", colorDark: "oklch(0.45 0.17 95)" },
  online:             { color: "oklch(0.6 0.16 230)",  colorLight: "oklch(0.6 0.16 230 / 0.1)", colorDark: "oklch(0.45 0.16 230)" },
  crm:                { color: "oklch(0.62 0.16 295)", colorLight: "oklch(0.62 0.16 295 / 0.1)",colorDark: "oklch(0.48 0.16 295)" },
  marketing:          { color: "oklch(0.6 0.18 350)",  colorLight: "oklch(0.6 0.18 350 / 0.1)", colorDark: "oklch(0.45 0.18 350)" },
  analytics:         { color: "oklch(0.55 0.15 260)",  colorLight: "oklch(0.55 0.15 260 / 0.1)",colorDark: "oklch(0.42 0.15 260)" },
  compliance:         { color: "oklch(0.6 0.16 145)",  colorLight: "oklch(0.6 0.16 145 / 0.1)", colorDark: "oklch(0.45 0.16 145)" },
  franchise:          { color: "oklch(0.58 0.18 40)",  colorLight: "oklch(0.58 0.18 40 / 0.1)", colorDark: "oklch(0.45 0.18 40)" },
  hr:                 { color: "oklch(0.6 0.15 195)",  colorLight: "oklch(0.6 0.15 195 / 0.1)", colorDark: "oklch(0.45 0.15 195)" },
  finance:            { color: "oklch(0.55 0.17 150)", colorLight: "oklch(0.55 0.17 150 / 0.1)",colorDark: "oklch(0.42 0.17 150)" },
  ai:                 { color: "oklch(0.6 0.2 300)",   colorLight: "oklch(0.6 0.2 300 / 0.1)",  colorDark: "oklch(0.45 0.2 300)" },
  reports:            { color: "oklch(0.58 0.16 215)", colorLight: "oklch(0.58 0.16 215 / 0.1)",colorDark: "oklch(0.45 0.16 215)" },
  settings:           { color: "oklch(0.55 0.1 265)",  colorLight: "oklch(0.55 0.1 265 / 0.1)", colorDark: "oklch(0.42 0.1 265)" },
  users:              { color: "oklch(0.58 0.15 340)", colorLight: "oklch(0.58 0.15 340 / 0.1)",colorDark: "oklch(0.45 0.15 340)" },
  owner:              { color: "oklch(0.55 0.19 75)",  colorLight: "oklch(0.55 0.19 75 / 0.1)", colorDark: "oklch(0.42 0.19 75)" },
}

export function getModuleTheme(moduleId: ModuleId): ModuleTheme {
  return MODULE_THEMES[moduleId] ?? MODULE_THEMES.dashboard
}
