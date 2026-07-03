"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  BookOpen,
  Package,
  Receipt,
  ChevronDown,
  ChevronRight,
  LogOut,
  BookMarked,
  BarChart3,
  Banknote,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { getInitials } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface NavChild {
  label:     string
  href:      string
  shortcut?: string
}

interface NavItem {
  label:     string
  href?:     string
  icon:      React.ReactNode
  children?: NavChild[]
  shortcut?: string
}

const NAV_ITEMS: NavItem[] = [
  {
    label:    "Gateway",
    href:     "/gateway",
    icon:     <LayoutDashboard className="h-4 w-4" />,
    shortcut: "Ctrl+H",
  },
  {
    label: "Masters",
    icon:  <BookOpen className="h-4 w-4" />,
    children: [
      { label: "Ledgers",     href: "/masters/ledger",      shortcut: "Alt+L" },
      { label: "Stock Items", href: "/masters/stock-items", shortcut: "Alt+S" },
    ],
  },
  {
    label: "Vouchers",
    icon:  <Receipt className="h-4 w-4" />,
    children: [
      { label: "Sales",    href: "/vouchers/sales",    shortcut: "F8" },
      { label: "Purchase", href: "/vouchers/purchase", shortcut: "F9" },
      { label: "Payment",  href: "/vouchers/payment",  shortcut: "F5" },
    ],
  },
  {
    label:    "Inventory",
    href:     "/masters/stock-items",
    icon:     <Package className="h-4 w-4" />,
    shortcut: "Ctrl+I",
  },
  {
    label: "Reports",
    icon:  <BarChart3 className="h-4 w-4" />,
    children: [
      { label: "Stock Summary",     href: "/reports?tab=stock",    shortcut: "Alt+R" },
      { label: "Sales Register",    href: "/reports?tab=sales"                       },
      { label: "Purchase Register", href: "/reports?tab=purchase"                    },
    ],
  },
]

interface SidebarItemProps {
  item:      NavItem
  collapsed: boolean
}

function SidebarItemInner({ item, collapsed }: SidebarItemProps) {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const currentTab   = searchParams.get("tab")

  const [open, setOpen] = useState(
    item.children?.some((c) => {
      const [path] = c.href.split("?")
      return pathname.startsWith(path)
    }) ?? false
  )

  const isActive = item.href ? pathname === item.href : false

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            open && "text-foreground bg-muted/40"
          )}
        >
          {item.icon}
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.span>
            </>
          )}
        </button>

        <AnimatePresence initial={false}>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-7 mt-1 space-y-0.5 border-l border-border pl-3">
                {item.children.map((child) => {
                  const [childPath, childQuery] = child.href.split("?")
                  const childTab = childQuery
                    ? new URLSearchParams(childQuery).get("tab")
                    : null

                  const childActive =
                    pathname === childPath &&
                    (childTab ? currentTab === childTab : !currentTab)

                  return (
                    <Link
                      key={child.label}
                      href={child.href}
                      className={cn(
                        "flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
                        childActive
                          ? "text-primary font-medium bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <span>{child.label}</span>
                      {child.shortcut && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                          {child.shortcut}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}
    >
      {item.icon}
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.shortcut && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
              {item.shortcut}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

function SidebarItem({ item, collapsed }: SidebarItemProps) {
  return (
    <Suspense fallback={null}>
      <SidebarItemInner item={item} collapsed={collapsed} />
    </Suspense>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout }          = useAuthStore()

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-screen bg-card border-r border-border flex flex-col overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <BookMarked className="h-4 w-4 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-sm tracking-tight text-foreground whitespace-nowrap overflow-hidden"
              >
                Khatabook ERP
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <Separator />

      {/* User + Collapse */}
      <div className="p-2 space-y-1">
        {user && !collapsed && (
          <div className="px-3 py-2 rounded-lg bg-muted/40">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            "w-full text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30",
            collapsed ? "justify-center px-0" : "justify-start gap-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "w-full text-muted-foreground",
            collapsed ? "justify-center px-0" : "justify-start gap-2"
          )}
        >
          <motion.span animate={{ rotate: collapsed ? 0 : 180 }}>
            <ChevronRight className="h-4 w-4" />
          </motion.span>
          {!collapsed && <span className="text-xs">Collapse</span>}
        </Button>
      </div>
    </motion.aside>
  )
}