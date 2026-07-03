"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, CreditCard, Banknote, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/PageHeader"
import AnimatedPage from "@/components/shared/AnimatedPage"
import api from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface PaymentVoucher {
  id:             string
  voucher_number: string
  date:           string
  party_name:     string
  paid_from_name: string
  amount:         number
  payment_mode:   string
  narration:      string
}

export default function PaymentVoucherListPage() {
  const [vouchers,  setVouchers]  = useState<PaymentVoucher[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get("/vouchers/payment")
      .then((r) => setVouchers(r.data.data))
      .catch(() => toast.error("Failed to load payment vouchers"))
      .finally(() => setIsLoading(false))
  }, [])

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "BANK":   return <Building2 className="h-4 w-4 text-blue-500"   />
      case "CHEQUE": return <CreditCard className="h-4 w-4 text-violet-500" />
      default:       return <Banknote   className="h-4 w-4 text-green-500"  />
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "BANK":   return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
      case "CHEQUE": return "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400"
      default:       return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
    }
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Payment Vouchers"
        subtitle={`${vouchers.length} voucher(s)`}
        backHref="/gateway"
        actions={
          <Link href="/vouchers/payment/create">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Payment
              <span className="hidden sm:inline text-[10px] font-mono opacity-70 bg-white/20 px-1.5 py-0.5 rounded">
                F5
              </span>
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : vouchers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Banknote className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            No payment vouchers yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Record payments to suppliers, rent, salaries etc.
          </p>
          <Link href="/vouchers/payment/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Payment Voucher
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {vouchers.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Banknote className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm">
                        {v.voucher_number}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getModeColor(v.payment_mode)}`}>
                        {v.payment_mode}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      To: <span className="font-medium">{v.party_name}</span>
                      {" · "}
                      From: <span className="font-medium">{v.paid_from_name}</span>
                      {" · "}
                      {v.date}
                    </p>
                    {v.narration && (
                      <p className="text-xs text-muted-foreground mt-0.5 italic">
                        {v.narration}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="text-right">
                  <p className="font-bold text-foreground text-lg">
                    {formatCurrency(v.amount)}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {getModeIcon(v.payment_mode)}
                    <p className="text-xs text-muted-foreground">
                      {v.payment_mode}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatedPage>
  )
}