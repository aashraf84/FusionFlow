"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartLine, ModuleId } from "./data"

interface AppState {
  activeModule: ModuleId
  setActiveModule: (m: ModuleId) => void

  activeBranchId: string
  setActiveBranch: (id: string) => void

  // POS cart
  cart: CartLine[]
  addToCart: (line: CartLine) => void
  updateCartQty: (index: number, qty: number) => void
  removeFromCart: (index: number) => void
  clearCart: () => void

  // POS session
  orderType: "dine_in" | "takeaway" | "delivery" | "drive_thru"
  setOrderType: (t: AppState["orderType"]) => void
  tableNo: string
  setTableNo: (t: string) => void

  // KDS station filter
  kdsStation: string
  setKdsStation: (s: string) => void

  sidebarOpen: boolean
  setSidebarOpen: (o: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeModule: "dashboard",
      setActiveModule: (m) => set({ activeModule: m }),

      activeBranchId: "__ALL__",
      setActiveBranch: (id) => set({ activeBranchId: id }),

      cart: [],
      addToCart: (line) =>
        set((s) => {
          // merge identical lines (same product + customizations)
          const key = (l: CartLine) => l.productId + "|" + (l.customizations ?? "")
          if (!line.customizations) {
            const idx = s.cart.findIndex((l) => key(l) === key(line))
            if (idx >= 0) {
              const next = [...s.cart]
              next[idx] = { ...next[idx], quantity: next[idx].quantity + line.quantity }
              return { cart: next }
            }
          }
          return { cart: [...s.cart, line] }
        }),
      updateCartQty: (index, qty) =>
        set((s) => {
          const next = [...s.cart]
          if (qty <= 0) {
            next.splice(index, 1)
          } else {
            next[index] = { ...next[index], quantity: qty }
          }
          return { cart: next }
        }),
      removeFromCart: (index) =>
        set((s) => {
          const next = [...s.cart]
          next.splice(index, 1)
          return { cart: next }
        }),
      clearCart: () => set({ cart: [] }),

      orderType: "dine_in",
      setOrderType: (t) => set({ orderType: t }),
      tableNo: "T-5",
      setTableNo: (t) => set({ tableNo: t }),

      kdsStation: "all",
      setKdsStation: (s) => set({ kdsStation: s }),

      sidebarOpen: false,
      setSidebarOpen: (o) => set({ sidebarOpen: o }),
    }),
    {
      name: "pizzaflow-store",
      version: 2,
      partialize: (s) => ({
        activeBranchId: s.activeBranchId,
        orderType: s.orderType,
        tableNo: s.tableNo,
      }),
      migrate: () => ({ activeBranchId: "__ALL__", orderType: "dine_in" as const, tableNo: "T-5" }),
    }
  )
)
