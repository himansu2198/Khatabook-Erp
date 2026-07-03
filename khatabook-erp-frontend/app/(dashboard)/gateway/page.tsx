"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  BookOpen,
  Package,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Users,
  ArrowRight,
  IndianRupee,
  ClipboardList,
  AlertTriangle,
  X,
  TrendingDown,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import AnimatedPage from "@/components/shared/AnimatedPage"
import api from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

// ── Variants ──────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

// ── Quick Actions ──────────────────────────────────
const QUICK_ACTIONS = [
  {
    title:       "Ledgers",
    description: "Manage customer & supplier accounts",
    href:        "/masters/ledger",
    icon:        <BookOpen className="h-6 w-6" />,
    shortcut:    "Alt+L",
    color:       "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    border:      "hover:border-blue-300 dark:hover:border-blue-700",
  },
  {
    title:       "Stock Items",
    description: "Products, SKU, rates & inventory",
    href:        "/masters/stock-items",
    icon:        <Package className="h-6 w-6" />,
    shortcut:    "Alt+S",
    color:       "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    border:      "hover:border-violet-300 dark:hover:border-violet-700",
  },
  {
    title:       "Sales Voucher",
    description: "Create sales & generate invoices",
    href:        "/vouchers/sales/create",
    icon:        <ShoppingCart className="h-6 w-6" />,
    shortcut:    "F8",
    color:       "bg-green-500/10 text-green-600 dark:text-green-400",
    border:      "hover:border-green-300 dark:hover:border-green-700",
  },
  {
    title:       "Purchase Voucher",
    description: "Record purchases & update stock",
    href:        "/vouchers/purchase/create",
    icon:        <Receipt className="h-6 w-6" />,
    shortcut:    "F9",
    color:       "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    border:      "hover:border-orange-300 dark:hover:border-orange-700",
  },
  {
    title:       "All Sales",
    description: "View all sales vouchers",
    href:        "/vouchers/sales",
    icon:        <TrendingUp className="h-6 w-6" />,
    shortcut:    "",
    color:       "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    border:      "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  {
    title:       "All Purchases",
    description: "View all purchase vouchers",
    href:        "/vouchers/purchase",
    icon:        <ClipboardList className="h-6 w-6" />,
    shortcut:    "",
    color:       "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    border:      "hover:border-rose-300 dark:hover:border-rose-700",
  },
]

// ── Types ──────────────────────────────────────────
interface StockItem {
  id:            string
  name:          string
  sku:           string
  current_stock: number
  unit:          string
}

interface DashboardStats {
  totalLedgers:   number
  totalStock:     number
  totalSales:     number
  totalPurchases: number
  profit:         number
  lowStockItems:  StockItem[]
}

export default function GatewayPage() {
  const { user }   = useAuthStore()
  const router     = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalLedgers:   0,
    totalStock:     0,
    totalSales:     0,
    totalPurchases: 0,
    profit:         0,
    lowStockItems:  [],
  })
  const [showLowStock, setShowLowStock] = useState(false)
  const [isLoading,    setIsLoading]    = useState(true)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ledgersRes, stockRes, salesRes, purchaseRes] = await Promise.all([
          api.get("/masters/ledgers"),
          api.get("/masters/stock"),
          api.get("/vouchers/sales"),
          api.get("/vouchers/purchase"),
        ])

        const totalSales     = salesRes.data.data.reduce(
          (s: number, v: any) => s + v.total_amount, 0
        )
        const totalPurchases = purchaseRes.data.data.reduce(
          (s: number, v: any) => s + v.total_amount, 0
        )
        const lowStockItems  = stockRes.data.data.filter(
          (i: any) => i.current_stock <= 5
        )

        setStats({
          totalLedgers:   ledgersRes.data.data.length,
          totalStock:     stockRes.data.data.length,
          totalSales,
          totalPurchases,
          profit:         totalSales - totalPurchases,
          lowStockItems,
        })
      } catch {
        console.log("Stats fetch failed")
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <AnimatedPage>
      <div className="space-y-8 max-w-6xl mx-auto">

        {/* ── Low Stock Alert Banner ── */}
        <AnimatePresence>
          {stats.lowStockItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0   }}
              exit={{ opacity: 0, y: -10    }}
              className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    {stats.lowStockItems.length} item(s) running low on stock!
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    {stats.lowStockItems.map((i) => i.name).join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/reports")}
                  className="text-xs text-yellow-700 dark:text-yellow-400 underline hover:no-underline"
                >
                  View Report
                </button>
                <button
                  onClick={() => setStats((s) => ({ ...s, lowStockItems: [] }))}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Welcome Banner ── */}
       <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y:   0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-primary p-8"
        >
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium mb-1">
              {getGreeting()},
            </p>
            <h1 className="text-2xl font-bold text-primary-foreground mb-1">
              {user?.name ?? "User"} 👋
            </h1>
            <p className="text-primary-foreground/70 text-sm">
              Welcome to Khatabook ERP — your business dashboard
            </p>
          </div>
        </motion.div>
      
        
        {/* ── Stats Row ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Total Ledgers */}
          <motion.div
            variants={cardVariants}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-blue-500">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium text-muted-foreground">
                Total Ledgers
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? "—" : stats.totalLedgers}
            </p>
          </motion.div>

          {/* Stock Items */}
          <motion.div
            variants={cardVariants}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-violet-500">
              <Package className="h-4 w-4" />
              <span className="text-xs font-medium text-muted-foreground">
                Stock Items
              </span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? "—" : stats.totalStock}
              </p>
              {stats.lowStockItems.length > 0 && (
                <span className="text-xs text-yellow-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {stats.lowStockItems.length} low
                </span>
              )}
            </div>
          </motion.div>

          {/* Total Sales */}
          <motion.div
            variants={cardVariants}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-green-500">
              <IndianRupee className="h-4 w-4" />
              <span className="text-xs font-medium text-muted-foreground">
                Total Sales
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {isLoading ? "—" : formatCurrency(stats.totalSales)}
            </p>
          </motion.div>

          {/* Total Purchases */}
          <motion.div
            variants={cardVariants}
            className="bg-card border border-border rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-orange-500">
              <IndianRupee className="h-4 w-4" />
              <span className="text-xs font-medium text-muted-foreground">
                Total Purchases
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-500">
              {isLoading ? "—" : formatCurrency(stats.totalPurchases)}
            </p>
          </motion.div>
        </motion.div>

        {/* ── Profit / Loss Card ── */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y:  0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl border p-6 flex items-center justify-between ${
              stats.profit >= 0
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            <div>
              <p className={`text-sm font-medium mb-1 ${
                stats.profit >= 0
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}>
                {stats.profit >= 0 ? "📈 Net Profit" : "📉 Net Loss"}
              </p>
              <p className={`text-3xl font-bold ${
                stats.profit >= 0 ? "text-green-600" : "text-red-500"
              }`}>
                {formatCurrency(Math.abs(stats.profit))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sales ({formatCurrency(stats.totalSales)}) −
                Purchases ({formatCurrency(stats.totalPurchases)})
              </p>
            </div>

            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
              stats.profit >= 0
                ? "bg-green-100 dark:bg-green-900/40"
                : "bg-red-100 dark:bg-red-900/40"
            }`}>
              {stats.profit >= 0 ? (
                <TrendingUp   className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500"   />
              )}
            </div>
          </motion.div>
        )}

        {/* ── Quick Actions ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x:   0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-4"
          >
            <h2 className="text-base font-semibold text-foreground">
              Quick Actions
            </h2>
            <span className="text-xs text-muted-foreground">
              Use keyboard shortcuts to navigate faster
            </span>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {QUICK_ACTIONS.map((action) => (
              <motion.div key={action.title} variants={cardVariants}>
                <Link href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className={`
                      group bg-card border border-border rounded-xl p-5
                      cursor-pointer transition-colors duration-200
                      ${action.border}
                    `}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-xl ${action.color}`}>
                        {action.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        {action.shortcut && (
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {action.shortcut}
                          </span>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Keyboard Shortcuts ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y:  0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Keyboard Shortcuts
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "Ctrl+H",  label: "Dashboard"        },
              { key: "Ctrl+K",  label: "Global Search"    },
              { key: "Alt+L",   label: "Create Ledger"    },
              { key: "Alt+S",   label: "Create Stock"     },
              { key: "F8",      label: "Sales Voucher"    },
              { key: "F9",      label: "Purchase Voucher" },
              { key: "Alt+R",   label: "Reports"          },
              { key: "Ctrl+Q",  label: "Logout"           },
            ].map((s) => (
              <div
                key={s.key}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <kbd className="px-2 py-1 rounded bg-muted border border-border font-mono text-[11px] text-foreground whitespace-nowrap">
                  {s.key}
                </kbd>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </AnimatedPage>
  )
}