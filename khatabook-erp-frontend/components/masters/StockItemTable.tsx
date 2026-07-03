"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import DataTable from "@/components/shared/DataTable"
import ConfirmDialog from "@/components/shared/ConfirmDialog"
import { StockItem } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface StockItemTableProps {
  items: StockItem[]
  isLoading: boolean
  onDelete: (id: string) => Promise<void>
}

export default function StockItemTable({
  items,
  isLoading,
  onDelete,
}: StockItemTableProps) {
  const router = useRouter()
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await onDelete(deleteId)
      toast.success("Stock item deleted successfully")
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })
          ?.response?.data?.detail ?? "Failed to delete stock item"
      toast.error(message)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<StockItem, unknown>[] = [
    {
      accessorKey: "name",
      header: "Item Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.sku}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }) => (
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
          {row.original.unit}
        </span>
      ),
    },
    {
      accessorKey: "purchase_rate",
      header: "Purchase Rate",
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {formatCurrency(row.original.purchase_rate)}
        </span>
      ),
    },
    {
      accessorKey: "selling_rate",
      header: "Selling Rate",
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {formatCurrency(row.original.selling_rate)}
        </span>
      ),
    },
    {
      accessorKey: "current_stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.current_stock
        return (
          <span
            className={`text-sm font-medium ${
              stock <= 0
                ? "text-red-500"
                : stock <= 10
                ? "text-yellow-500"
                : "text-green-600"
            }`}
          >
            {stock} {row.original.unit}
          </span>
        )
      },
    },
    {
      accessorKey: "gst_percentage",
      header: "GST",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.gst_percentage}%
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() =>
              router.push(`/masters/stock-items/${row.original.id}`)
            }
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-blue-600"
            onClick={() =>
              router.push(
                `/masters/stock-items/${row.original.id}?edit=true`
              )
            }
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-500"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        data={items}
        columns={columns}
        searchPlaceholder="Search stock items..."
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Stock Item?"
        description="This will permanently delete the stock item. Items used in vouchers cannot be deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  )
}