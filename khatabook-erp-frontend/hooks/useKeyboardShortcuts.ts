"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"

export function useKeyboardShortcuts() {
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const alt  = e.altKey
      const ctrl = e.ctrlKey
      const key  = e.key.toUpperCase()

      // Skip if typing in input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return

      // CTRL + H → Dashboard
      if (ctrl && key === "H") {
        e.preventDefault()
        router.push("/gateway")
      }

      // CTRL + Q → Logout
      if (ctrl && key === "Q") {
        e.preventDefault()
        logout()
      }

      // CTRL + I → Inventory
      if (ctrl && key === "I") {
        e.preventDefault()
        router.push("/masters/stock-items")
      }

      // ALT + L → Create Ledger
      if (alt && key === "L") {
        e.preventDefault()
        router.push("/masters/ledger/create")
      }

      // ALT + S → Create Stock Item
      if (alt && key === "S") {
        e.preventDefault()
        router.push("/masters/stock-items/create")
      }

      // ALT + R → Reports
      if (alt && key === "R") {
        e.preventDefault()
        router.push("/reports")
      }

      // F5 → Payment Voucher
      if (e.key === "F5") {
        e.preventDefault()
        router.push("/vouchers/payment/create")
      }

      // F8 → Sales Voucher
      if (e.key === "F8") {
        e.preventDefault()
        router.push("/vouchers/sales/create")
      }

      // F9 → Purchase Voucher
      if (e.key === "F9") {
        e.preventDefault()
        router.push("/vouchers/purchase/create")
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [router, logout])
}