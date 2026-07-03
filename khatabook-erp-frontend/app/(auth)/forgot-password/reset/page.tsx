"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, BookMarked, Loader2, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/authStore"

const schema = z.object({
  new_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
})

type ResetForm = z.infer<typeof schema>

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const { resetPassword, isLoading } = useAuthStore()
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      toast.error("Invalid or missing reset token.")
      return
    }
    try {
      await resetPassword(token, data.new_password)
      toast.success("Password reset successfully! Please sign in.")
      router.push("/login")
    } catch {
      toast.error("Reset link is invalid or expired. Please try again.")
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm"
    >
      <motion.div variants={itemVariants} className="flex justify-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <KeyRound className="h-7 w-7 text-primary" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center space-y-1">
        <h2 className="text-xl font-bold text-foreground">Set new password</h2>
        <p className="text-sm text-muted-foreground">
          Must be at least 8 characters with 1 uppercase and 1 number
        </p>
      </motion.div>

      {!token && (
        <motion.div
          variants={itemVariants}
          className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 text-center"
        >
          Invalid reset link. Please request a new one.
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="new_password">New password</Label>
          <div className="relative">
            <Input
              id="new_password"
              type={showNew ? "text" : "password"}
              placeholder="••••••••"
              autoFocus
              {...register("new_password")}
              className={errors.new_password ? "border-red-500 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowNew((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.new_password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500"
            >
              {errors.new_password.message}
            </motion.p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="confirm_password">Confirm new password</Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirm_password")}
              className={errors.confirm_password ? "border-red-500 pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirm_password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500"
            >
              {errors.confirm_password.message}
            </motion.p>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={isLoading || !token}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </motion.div>
      </form>

      <motion.div variants={itemVariants} className="text-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to sign in
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-2.5 mb-10"
        >
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <BookMarked className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Khatabook ERP
          </span>
        </motion.div>

        <Suspense
          fallback={
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}