"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, BookMarked, Loader2, ArrowRight, Home } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/authStore"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const loginSchema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export default function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
      toast.success("Welcome back!")
      window.location.href = "/gateway"
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Invalid email or password"
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0  }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width:     `${120 + i * 80}px`,
                height:    `${120 + i * 80}px`,
                top:       "50%",
                left:      "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 20 + i * 5,
                repeat:   Infinity,
                ease:     "linear",
              }}
            />
          ))}
        </div>

        {/* Logo — clickable to home */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <BookMarked className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Khatabook ERP
          </span>
        </Link>

        <div className="relative z-10 space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-bold text-white leading-tight"
          >
            Manage your business{" "}
            <span className="text-white/70">smarter.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="text-white/70 text-lg leading-relaxed"
          >
            Billing, Inventory & Accounting — all in one place.
            Built for Indian businesses.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex gap-8 pt-4"
          >
            {[
              { label: "Ledgers",   value: "∞"    },
              { label: "Vouchers",  value: "Fast" },
              { label: "GST Ready", value: "✓"    },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-white font-bold text-2xl">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="text-white/40 text-sm relative z-10">
          © 2025 Khatabook ERP. All rights reserved.
        </p>
      </motion.div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-md space-y-8"
        >

          {/* Mobile logo + back to home */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between lg:hidden"
          >
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BookMarked className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Khatabook ERP</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground text-sm">
              Sign in to your account to continue
            </p>
          </motion.div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            autoComplete="off"
          >
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="login-email">Email address</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="off"
                autoFocus
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("password")}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye    className="h-4 w-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Sign up link */}
          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-muted-foreground"
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Create one
            </Link>
          </motion.p>

          {/* Back to Home — bottom only */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center"
          >
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </motion.div>

          {/* Keyboard hint */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground"
          >
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">
              Tab
            </kbd>
            <span>to navigate</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">
              Enter
            </kbd>
            <span>to submit</span>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}