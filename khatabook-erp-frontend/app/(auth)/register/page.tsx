"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import { useForm } from "react-hook-form"
import {
  Eye, EyeOff, BookMarked, Loader2,
  ArrowRight, CheckCircle2, Home,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/authStore"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const registerSchema = z.object({
  name:            z.string().min(2, "Name must be at least 2 characters"),
  email:           z.string().email("Enter a valid email address"),
  password:        z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path:    ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

const FEATURES = [
  "Ledger & Stock management",
  "Sales & Purchase vouchers",
  "GST-ready invoicing",
  "Keyboard-first workflow",
]

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPassword,        setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data.name, data.email, data.password)
      toast.success("Account created! Welcome to Khatabook ERP")
      window.location.href = "/gateway"
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Registration failed. Please try again."
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
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width:     `${100 + i * 90}px`,
                height:    `${100 + i * 90}px`,
                top:       "50%",
                left:      "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{
                duration: 18 + i * 6,
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

        <div className="relative z-10 space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-bold text-white leading-tight"
          >
            Start managing your{" "}
            <span className="text-white/70">business today.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-3"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0   }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-white/80 shrink-0" />
                <span className="text-white/80 text-sm">{f}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <p className="text-white/40 text-sm relative z-10">
          © 2025 Khatabook ERP. All rights reserved.
        </p>
      </motion.div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-md space-y-6 py-8"
        >

          {/* Mobile logo + home */}
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
              Create your account
            </h2>
            <p className="text-muted-foreground text-sm">
              Get started with Khatabook ERP for free
            </p>
          </motion.div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            autoComplete="off"
          >
            {/* Name */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="reg-name">Full name</Label>
              <Input
                id="reg-name"
                placeholder="Rahul Sharma"
                autoFocus
                autoComplete="off"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="reg-email">Email address</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="off"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
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

            {/* Confirm Password */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="reg-confirm">Confirm password</Label>
              <div className="relative">
                <Input
                  id="reg-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye    className="h-4 w-4" />
                  }
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants} className="pt-1">
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Sign in link */}
          <motion.p
            variants={itemVariants}
            className="text-center text-sm text-muted-foreground"
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
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

        </motion.div>
      </div>
    </div>
  )
}