"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, BookOpen, Package,
  FileText, X, Plus,
} from "lucide-react"
import api from "@/lib/api"

interface SearchResult {
  id:       string
  title:    string
  subtitle: string
  type:     "ledger" | "stock" | "sales" | "purchase"
  href:     string
}

export default function GlobalSearch() {
  const router                      = useRouter()
  const [open,    setOpen]          = useState(false)
  const [query,   setQuery]         = useState("")
  const [results, setResults]       = useState<SearchResult[]>([])
  const [loading, setLoading]       = useState(false)
  const [selected, setSelected]     = useState(0)
  const inputRef                    = useRef<HTMLInputElement>(null)

  // ── Open on Ctrl+K ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // ── Focus input when opened ──
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setSelected(0)
    } else {
      setQuery("")
      setResults([])
    }
  }, [open])

  // ── Arrow key navigation ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, results.length - 1))
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      }
      if (e.key === "Enter" && results[selected]) {
        handleSelect(results[selected])
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, selected])

  // ── Search with debounce ──
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const search = async () => {
      setLoading(true)
      try {
        const [ledgersRes, stockRes] = await Promise.all([
          api.get("/masters/ledgers"),
          api.get("/masters/stock"),
        ])

        const q = query.toLowerCase()

        const ledgers: SearchResult[] = ledgersRes.data.data
          .filter((l: any) => l.name.toLowerCase().includes(q))
          .slice(0, 4)
          .map((l: any) => ({
            id:       l.id,
            title:    l.name,
            subtitle: `${l.type} · Balance: ₹${l.current_balance?.toFixed(2) ?? "0.00"}`,
            type:     "ledger" as const,
            href:     `/masters/ledger/${l.id}`,
          }))

        const stocks: SearchResult[] = stockRes.data.data
          .filter((s: any) =>
            s.name.toLowerCase().includes(q) ||
            s.sku.toLowerCase().includes(q)
          )
          .slice(0, 4)
          .map((s: any) => ({
            id:       s.id,
            title:    s.name,
            subtitle: `${s.sku} · Stock: ${s.current_stock} ${s.unit}`,
            type:     "stock" as const,
            href:     `/masters/stock-items/${s.id}`,
          }))

        setResults([...ledgers, ...stocks])
        setSelected(0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query])

  const getIcon = (type: string) => {
    switch (type) {
      case "ledger":   return <BookOpen className="h-4 w-4 text-blue-500"    />
      case "stock":    return <Package  className="h-4 w-4 text-violet-500"  />
      case "sales":    return <FileText className="h-4 w-4 text-green-500"   />
      case "purchase": return <FileText className="h-4 w-4 text-orange-500"  />
      default:         return <Search   className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    setOpen(false)
  }

  const QUICK_LINKS = [
    { label: "Create Ledger",       href: "/masters/ledger/create",      shortcut: "Alt+L" },
    { label: "Create Stock Item",   href: "/masters/stock-items/create", shortcut: "Alt+S" },
    { label: "New Sales Voucher",   href: "/vouchers/sales/create",      shortcut: "F8"    },
    { label: "New Purchase Voucher",href: "/vouchers/purchase/create",   shortcut: "F9"    },
    { label: "Reports",             href: "/reports",                    shortcut: "Alt+R" },
  ]

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1,    y: 0   }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4"
            >
              <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">

                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search ledgers, stock items..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  {query ? (
                    <button
                      onClick={() => setQuery("")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-muted-foreground">
                      Esc
                    </kbd>
                  )}
                </div>

                {/* Results / Quick Links */}
                <div className="max-h-80 overflow-y-auto">

                  {/* Loading */}
                  {loading && (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  )}

                  {/* No results */}
                  {!loading && query && results.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        No results for &quot;{query}&quot;
                      </p>
                    </div>
                  )}

                  {/* Search results */}
                  {!loading && results.length > 0 && (
                    <div className="p-2">
                      <p className="text-[11px] text-muted-foreground px-3 py-1.5 font-medium uppercase tracking-wider">
                        Results
                      </p>
                      {results.map((result, i) => (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                            i === selected
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted/60"
                          }`}
                        >
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            {getIcon(result.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono shrink-0">
                            {result.type}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick links when empty */}
                  {!query && (
                    <div className="p-2">
                      <p className="text-[11px] text-muted-foreground px-3 py-1.5 font-medium uppercase tracking-wider">
                        Quick Actions
                      </p>
                      {QUICK_LINKS.map((link) => (
                        <button
                          key={link.href}
                          onClick={() => {
                            router.push(link.href)
                            setOpen(false)
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-foreground">{link.label}</span>
                          </div>
                          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-muted-foreground">
                            {link.shortcut}
                          </kbd>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer hint */}
                <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">↵</kbd>
                    select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono">Esc</kbd>
                    close
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}