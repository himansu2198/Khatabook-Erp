"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  BookMarked, ArrowRight, ChevronRight,
  BarChart3, Package, FileText,
  ShieldCheck, Zap, Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAccessToken } from "@/lib/auth"

// ── Animation Variants ──
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.1 } },
}

// ── Smart Nav Buttons ──
function NavButtons() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = getAccessToken()
    setIsLoggedIn(!!token)
  }, [])

  if (!mounted) return null

  if (isLoggedIn) {
    return (
      <Link href="/gateway">
        <Button size="sm" className="gap-1.5">
          Go to Dashboard
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <Button variant="ghost" size="sm">Sign in</Button>
      </Link>
      <Link href="/register">
        <Button size="sm" className="gap-1.5">
          Get started
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  )
}

// ── Smart Hero Buttons ──
function HeroButtons() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = getAccessToken()
    setIsLoggedIn(!!token)
  }, [])

  if (!mounted) return null

  if (isLoggedIn) {
    return (
      <>
        <Link href="/gateway">
          <Button size="lg" className="gap-2 px-8">
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/login">
          <Button
            size="lg"
            variant="outline"
            className="gap-2 px-8"
            onClick={() => {
              import("@/lib/auth").then(({ clearAuth }) => clearAuth())
            }}
          >
            Switch Account
          </Button>
        </Link>
      </>
    )
  }

  return (
    <>
      <Link href="/register">
        <Button size="lg" className="gap-2 px-8">
          Start for free
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      <Link href="/login">
        <Button size="lg" variant="outline" className="gap-2 px-8">
          Sign in
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </>
  )
}

// ── Features ──
const FEATURES = [
  {
    icon:        <BarChart3 className="h-6 w-6" />,
    title:       "Smart Accounting",
    description: "Track ledgers, balances, and transactions in real time. Full statement history for every account.",
    color:       "bg-blue-500/10 text-blue-600",
  },
  {
    icon:        <Package className="h-6 w-6" />,
    title:       "Inventory Management",
    description: "Auto stock-in on purchase, stock-out on sale. Low stock alerts and full inventory valuation.",
    color:       "bg-violet-500/10 text-violet-600",
  },
  {
    icon:        <FileText className="h-6 w-6" />,
    title:       "GST Invoicing",
    description: "Generate professional PDF invoices with GST calculation. Print or download instantly.",
    color:       "bg-green-500/10 text-green-600",
  },
  {
    icon:        <Zap className="h-6 w-6" />,
    title:       "Keyboard First",
    description: "Navigate entirely with keyboard shortcuts like TallyPrime. Alt+L, F8, F9 and more.",
    color:       "bg-yellow-500/10 text-yellow-600",
  },
  {
    icon:        <ShieldCheck className="h-6 w-6" />,
    title:       "Secure & Cloud",
    description: "JWT authentication, secure API, and Supabase PostgreSQL database with real-time sync.",
    color:       "bg-red-500/10 text-red-600",
  },
  {
    icon:        <Globe className="h-6 w-6" />,
    title:       "Reports & Export",
    description: "Stock summary, sales register, purchase register. Export to Excel with one click.",
    color:       "bg-orange-500/10 text-orange-600",
  },
]

// ── How It Works ──
const HOW_IT_WORKS = [
  {
    step:        "01",
    title:       "Create Ledgers",
    description: "Add your customers, suppliers, and bank accounts as ledgers",
  },
  {
    step:        "02",
    title:       "Add Stock Items",
    description: "Create your product catalogue with purchase and selling rates",
  },
  {
    step:        "03",
    title:       "Record Vouchers",
    description: "Create sales and purchase vouchers — stock updates automatically",
  },
  {
    step:        "04",
    title:       "View Reports",
    description: "Get real-time profit/loss, stock summary, and ledger statements",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0   }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <BookMarked className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              Khatabook ERP
            </span>
          </Link>
          <NavButtons />
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
              <Zap className="h-3 w-3" />
              TallyPrime-inspired ERP for Indian businesses
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
          >
            Manage your business{" "}
            <span className="text-primary">smarter.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Billing, Inventory & Accounting — all in one place.
            Built for Indian businesses with GST-ready invoicing,
            keyboard-first workflow, and real-time reports.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
          >
            <HeroButtons />
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-3 gap-8 max-w-md mx-auto pt-12"
          >
            {[
              { value: "∞",    label: "Ledgers"  },
              { value: "Fast", label: "Vouchers" },
              { value: "✓",    label: "GST Ready"},
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Everything your business needs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A complete ERP system inspired by TallyPrime,
            built with modern web technology.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            How it works
          </h2>
          <p className="text-muted-foreground">
            Get started in minutes — no setup required
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {HOW_IT_WORKS.map((h, i) => (
            <motion.div
              key={h.step}
              variants={fadeUp}
              className="relative text-center"
            >
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[60%] w-full h-px bg-border" />
              )}
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center mx-auto mb-4 relative z-10">
                {h.step}
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm">
                {h.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {h.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-primary rounded-2xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2 border-white"
                style={{
                  width:     `${150 + i * 100}px`,
                  height:    `${150 + i * 100}px`,
                  top:       "50%",
                  left:      "50%",
                  transform: "translate(-50%, -50%)",
                }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{
                  duration: 20 + i * 5,
                  repeat:   Infinity,
                  ease:     "linear",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground">
              Ready to manage smarter?
            </h2>
            <p className="text-primary-foreground/70 max-w-md mx-auto">
              Join businesses already using Khatabook ERP
              for their daily accounting and inventory needs.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 px-8"
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-primary flex items-center justify-center">
              <BookMarked className="h-3 w-3 text-primary-foreground" />
            </div>
            <span>Khatabook ERP</span>
          </div>
          <p>© 2025 Khatabook ERP. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login"    className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}