"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { BookMarked, Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/authStore"

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
})

type ForgotForm = z.infer<typeof schema>

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuthStore()
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: ForgotForm) => {
    try {
      await forgotPassword(data.email)
      setSentTo(data.email)
      setEmailSent(true)
    } catch {
      toast.error("Could not send reset email. Please try again.")
    }
  }

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

        <AnimatePresence mode="wait">
          {!emailSent ? (
            <motion.div
              key="form"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm"
            >
              <motion.div variants={itemVariants} className="flex justify-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  Forgot your password?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoFocus
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} className="flex justify-center">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm text-center"
            >
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">Check your inbox</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We&apos;ve sent a password reset link to{" "}
                  <span className="font-medium text-foreground">{sentTo}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  The link expires in 15 minutes. Check your spam folder if you don&apos;t see it.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Button variant="outline" className="w-full" onClick={() => setEmailSent(false)}>
                  Try a different email
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}