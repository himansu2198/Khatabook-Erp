"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import PageHeader from "@/components/shared/PageHeader"
import SalesVoucherForm from "@/components/vouchers/SalesVoucherForm"
import AnimatedPage from "@/components/shared/AnimatedPage"
import api from "@/lib/api"
import { Ledger, StockItem, CreateVoucherPayload } from "@/types"

export default function CreateSalesVoucherPage() {
  const router = useRouter()
  const [customers,  setCustomers]  = useState<Ledger[]>([])
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [isLoading,  setIsLoading]  = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/masters/ledgers?type=CUSTOMER"),
      api.get("/masters/stock"),
    ])
      .then(([ledgersRes, stockRes]) => {
        setCustomers(ledgersRes.data.data)
        setStockItems(stockRes.data.data)
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setIsFetching(false))
  }, [])

  const handleSubmit = async (data: CreateVoucherPayload) => {
    setIsLoading(true)
    try {
      await api.post("/vouchers/sales", data)
      toast.success("Sales voucher created!")
      router.push("/vouchers/sales")
    } catch {
      toast.error("Failed to create sales voucher.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="space-y-4 max-w-3xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="New Sales Voucher"
        subtitle="Record a sale and update customer balance"
        backHref="/vouchers/sales"
      />
      <div className="max-w-3xl">
        <div className="bg-card border border-border rounded-xl p-6">
          <SalesVoucherForm
            customers={customers}
            stockItems={stockItems}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AnimatedPage>
  )
}