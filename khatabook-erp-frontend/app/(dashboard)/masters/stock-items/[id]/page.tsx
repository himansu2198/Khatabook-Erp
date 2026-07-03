"use client"

import { use, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/PageHeader"
import StockItemForm from "@/components/masters/StockItemForm"
import AnimatedPage from "@/components/shared/AnimatedPage"
import { StockItem, CreateStockItemPayload } from "@/types"
import { formatCurrency } from "@/lib/utils"
import api from "@/lib/api"

interface PageProps {
  params: Promise<{ id: string }>
}

const INFO = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground">{value || "—"}</p>
  </div>
)

export default function StockItemDetailPage({ params }: PageProps) {
  // ── Next.js 15 — unwrap params ──
  const { id }       = use(params)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isEditMode   = searchParams.get("edit") === "true"

  const [item,      setItem]      = useState<StockItem | null>(null)
  const [fetching,  setFetching]  = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const res = await api.get(`/masters/stock/${id}`)
        setItem(res.data.data)
      } catch (err: any) {
        console.error("Stock item fetch error:", err?.response?.status)
        toast.error("Stock item not found")
        router.push("/masters/stock-items")
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [id])

  const handleUpdate = async (data: CreateStockItemPayload) => {
    setIsLoading(true)
    try {
      const res = await api.put(`/masters/stock/${id}`, data)
      setItem(res.data.data)
      toast.success("Stock item updated successfully!")
      router.push("/masters/stock-items")
    } catch {
      toast.error("Failed to update stock item.")
    } finally {
      setIsLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="space-y-4 max-w-2xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!item) return null

  return (
    <AnimatedPage>
      <PageHeader
        title={item.name}
        subtitle={`SKU: ${item.sku}`}
        backHref="/masters/stock-items"
        actions={
          !isEditMode ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() =>
                router.push(`/masters/stock-items/${id}?edit=true`)
              }
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="gap-2"
              onClick={() => router.push(`/masters/stock-items/${id}`)}
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          )
        }
      />

      <div className="max-w-2xl space-y-6">

        {/* ── View Mode ── */}
        {!isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            className="bg-card border border-border rounded-xl p-6 space-y-6"
          >
            {/* Stock highlight */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Current Stock
                </p>
                <p className={`text-2xl font-bold ${
                  item.current_stock <= 0
                    ? "text-red-500"
                    : item.current_stock <= 10
                    ? "text-yellow-500"
                    : "text-green-600"
                }`}>
                  {item.current_stock} {item.unit}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">
                  Opening Stock
                </p>
                <p className="text-sm font-medium text-foreground">
                  {item.opening_stock} {item.unit}
                </p>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <INFO label="SKU Code"     value={item.sku}                                  />
              <INFO label="Unit"         value={item.unit}                                 />
              <INFO label="HSN Code"     value={item.hsn_code ?? "—"}                     />
              <INFO label="GST Rate"     value={`${item.gst_percentage}%`}                />
              <INFO label="Purchase Rate" value={formatCurrency(item.purchase_rate)}      />
              <INFO label="Selling Rate" value={formatCurrency(item.selling_rate)}        />
            </div>

            {/* Profit preview */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-3 font-medium">
                Profit Analysis
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Purchase</p>
                  <p className="font-semibold text-foreground text-sm">
                    {formatCurrency(item.purchase_rate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Selling</p>
                  <p className="font-semibold text-foreground text-sm">
                    {formatCurrency(item.selling_rate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Profit</p>
                  <p className={`font-semibold text-sm ${
                    item.selling_rate - item.purchase_rate >= 0
                      ? "text-green-600"
                      : "text-red-500"
                  }`}>
                    {formatCurrency(item.selling_rate - item.purchase_rate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Stock value */}
            <div className="p-4 rounded-xl border border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Total Stock Value
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(item.current_stock * item.purchase_rate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">
                  Potential Revenue
                </p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(item.current_stock * item.selling_rate)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Edit Mode ── */}
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <StockItemForm
              defaultValues={item}
              onSubmit={handleUpdate}
              isLoading={isLoading}
              submitLabel="Update Stock Item"
            />
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  )
}