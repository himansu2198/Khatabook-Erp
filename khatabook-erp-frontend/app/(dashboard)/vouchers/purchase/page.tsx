"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/PageHeader"
import AnimatedPage from "@/components/shared/AnimatedPage"
import api from "@/lib/api"
import { Voucher } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

export default function PurchaseVoucherListPage() {
  const router = useRouter()
  const [vouchers,  setVouchers]  = useState<Voucher[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get("/vouchers/purchase")
      .then((r) => setVouchers(r.data.data))
      .catch(() => toast.error("Failed to load purchase vouchers"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <AnimatedPage>
      <PageHeader
        title="Purchase Vouchers"
        subtitle={`${vouchers.length} voucher(s)`}
        backHref="/gateway"
        actions={
          <Link href="/vouchers/purchase/create">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Purchase
              <span className="hidden sm:inline text-[10px] font-mono opacity-70 bg-white/20 px-1.5 py-0.5 rounded">
                F9
              </span>
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : vouchers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            No purchase vouchers yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first purchase voucher to get started
          </p>
          <Link href="/vouchers/purchase/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Purchase Voucher
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
              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => router.push(`/vouchers/purchase/${v.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {v.voucher_number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {v.party_name} · {formatDate(v.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  {formatCurrency(v.total_amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  GST: {formatCurrency(v.total_gst)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatedPage>
  )
}