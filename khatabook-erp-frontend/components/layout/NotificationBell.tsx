"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Package, AlertTriangle, X, CheckCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

interface Notification {
  id:      string
  title:   string
  message: string
  type:    "warning" | "info" | "error"
  href:    string
  time:    string
  read:    boolean
}

export default function NotificationBell() {
  const router                            = useRouter()
  const [open,          setOpen]          = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const bellRef                           = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const newNotifs: Notification[] = []

      const stockRes = await api.get("/masters/stock")
      const items    = stockRes.data.data

      items.forEach((item: any) => {
        if (item.current_stock === 0) {
          newNotifs.push({
            id:      `out-stock-${item.id}`,
            title:   "Out of Stock!",
            message: `${item.name} is completely out of stock`,
            type:    "error",
            href:    "/masters/stock-items",
            time:    "Just now",
            read:    false,
          })
        } else if (item.current_stock <= 5) {
          newNotifs.push({
            id:      `low-stock-${item.id}`,
            title:   "Low Stock Alert",
            message: `${item.name} has only ${item.current_stock} ${item.unit} left`,
            type:    "warning",
            href:    "/masters/stock-items",
            time:    "Just now",
            read:    false,
          })
        }
      })

      const salesRes = await api.get("/vouchers/sales")
      const sales    = salesRes.data.data
      if (sales.length > 0) {
        const latest = sales[0]
        newNotifs.push({
          id:      `sale-${latest.id}`,
          title:   "Recent Sale",
          message: `${latest.voucher_number} — ${latest.party_name || "Customer"} · ₹${Number(latest.total_amount)?.toLocaleString("en-IN")}`,
          type:    "info",
          href:    "/vouchers/sales",
          time:    latest.date ?? "Recently",
          read:    false,
        })
      }

      setNotifications(newNotifs)
      setUnreadCount(newNotifs.filter((n) => !n.read).length)
    } catch {
      // Silently fail
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleNotifClick = (notif: Notification) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === notif.id ? { ...n, read: true } : n)
    )
    setUnreadCount((c) => Math.max(0, c - 1))
    router.push(notif.href)
    setOpen(false)
  }

  const removeNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      setUnreadCount(updated.filter((n) => !n.read).length)
      return updated
    })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":   return <Package       className="h-4 w-4 text-red-500"    />
      default:        return <Bell          className="h-4 w-4 text-blue-500"   />
    }
  }

  const getBg = (type: string) => {
    switch (type) {
      case "warning": return "bg-yellow-50 dark:bg-yellow-900/20"
      case "error":   return "bg-red-50 dark:bg-red-900/20"
      default:        return "bg-blue-50 dark:bg-blue-900/20"
    }
  }

  return (
    <div ref={bellRef} className="relative">

      {/* Bell Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Invisible backdrop */}
            <div
              className="fixed inset-0 z-[998]"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{ opacity: 0, scale: 0.95, y: -8    }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 w-72 bg-card border border-border rounded-xl shadow-2xl z-[999] overflow-hidden"
              style={{ maxWidth: "calc(100vw - 16px)" }}
            >

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                    <p className="text-sm text-muted-foreground">
                      No notifications
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All caught up! 🎉
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0   }}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${
                        !notif.read ? getBg(notif.type) : ""
                      }`}
                      onClick={() => handleNotifClick(notif)}
                    >
                      {/* Icon */}
                      <div className="mt-0.5 shrink-0">
                        {getIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-semibold truncate ${
                            !notif.read
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="h-2 w-2 bg-blue-500 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {notif.time}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={(e) => removeNotif(notif.id, e)}
                        className="shrink-0 text-muted-foreground hover:text-red-500 mt-0.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-center">
                  <button
                    onClick={() => {
                      router.push("/reports")
                      setOpen(false)
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    View Stock Reports →
                  </button>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}