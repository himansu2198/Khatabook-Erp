"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import PageHeader from "@/components/shared/PageHeader"
import StockItemForm from "@/components/masters/StockItemForm"
import AnimatedPage from "@/components/shared/AnimatedPage"
import { useStock } from "@/hooks/useStock"
import { CreateStockItemPayload } from "@/types"

export default function CreateStockItemPage() {
  const router = useRouter()
  const { createItem, isLoading } = useStock()

  const handleSubmit = async (data: CreateStockItemPayload) => {
    try {
      await createItem(data)
      toast.success("Stock item created successfully!")
      router.push("/masters/stock-items")
    } catch {
      toast.error("Failed to create stock item.")
    }
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Create Stock Item"
        subtitle="Add a new product to your inventory"
        backHref="/masters/stock-items"
      />

      <div className="max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-6">
          <StockItemForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Create Stock Item"
          />
        </div>
      </div>
    </AnimatedPage>
  )
}