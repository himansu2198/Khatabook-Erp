"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { getInitials } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import NotificationBell from "@/components/layout/NotificationBell"

const ROUTE_LABELS: Record<string, string> = {
  "/gateway":                    "Gateway",
  "/masters/ledger":             "Ledgers",
  "/masters/ledger/create":      "Create Ledger",
  "/masters/stock-items":        "Stock Items",
  "/masters/stock-items/create": "Create Stock Item",
  "/vouchers/sales":             "Sales Vouchers",
  "/vouchers/sales/create":      "New Sales Voucher",
  "/vouchers/purchase":          "Purchase Vouchers",
  "/vouchers/purchase/create":   "New Purchase Voucher",
  "/reports":                    "Reports",
}

function getPageTitle(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]
  if (pathname.includes("/masters/ledger/"))      return "Ledger Detail"
  if (pathname.includes("/masters/stock-items/")) return "Stock Item Detail"
  return "Khatabook ERP"
}

export default function Topbar() {
  const pathname            = usePathname()
  const { user }            = useAuthStore()
  const title               = getPageTitle(pathname)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const openSearch = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key:      "k",
        ctrlKey:  true,
        bubbles:  true,
      })
    )
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y:  0 }}
      transition={{ duration: 0.2 }}
      className="h-14 border-b border-border bg-card/80 backdrop-blur-sm px-6 flex items-center justify-between shrink-0"
    >
      {/* Page title */}
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>

      {/* Right actions */}
      <div className="flex items-center gap-2">

        {/* Search button */}
        <button
          onClick={openSearch}
          className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <Search className="h-3 w-3" />
          <span>Search</span>
          <kbd className="ml-1 px-1 py-0.5 rounded bg-background border border-border font-mono text-[10px]">
            Ctrl+K
          </kbd>
        </button>

        {/* Dark mode toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun  className="h-4 w-4 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        {/* Avatar */}
        {user && (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground cursor-pointer">
            {getInitials(user.name)}
          </div>
        )}
      </div>
    </motion.header>
  )
}