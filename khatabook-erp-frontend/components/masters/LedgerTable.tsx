"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DataTable from "@/components/shared/DataTable"
import ConfirmDialog from "@/components/shared/ConfirmDialog"
import { Ledger, LedgerType } from "@/types"
import { formatCurrency } from "@/lib/utils"

const TYPE_COLORS: Record<LedgerType, string> = {
  CUSTOMER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SUPPLIER: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  EXPENSE:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  INCOME:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  BANK:     "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  CASH:     "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
}

interface LedgerTableProps {
  ledgers:   Ledger[]
  isLoading: boolean
  onDelete:  (id: string) => Promise<void>
}

export default function LedgerTable({
  ledgers,
  isLoading,
  onDelete,
}: LedgerTableProps) {
  const router                          = useRouter()
  const [deleteId,   setDeleteId]       = useState<string | null>(null)
  const [isDeleting, setIsDeleting]     = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await onDelete(deleteId)
      toast.success("Ledger deleted successfully")
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })
          ?.response?.data?.detail ?? "Failed to delete ledger"
      toast.error(message)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<Ledger, unknown>[] = [
    {
      accessorKey: "name",
      header:      "Ledger Name",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header:      "Type",
      cell: ({ row }) => (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          TYPE_COLORS[row.original.type]
        }`}>
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header:      "Phone",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.phone || "—"}
        </span>
      ),
    },
    {
      accessorKey: "current_balance",
      header:      "Balance",
      cell: ({ row }) => {
        const balance = row.original.current_balance
        return (
          <span className={`font-medium text-sm ${
            balance < 0 ? "text-red-500" : "text-green-600"
          }`}>
            {formatCurrency(balance)}
          </span>
        )
      },
    },
    {
      id:     "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {/* View */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => {
              const id = row.original.id
              console.log("Navigating to ledger:", id)
              router.push(`/masters/ledger/${id}`)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {/* Edit */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-blue-600"
            onClick={() => {
              const id = row.original.id
              router.push(`/masters/ledger/${id}?edit=true`)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {/* Delete */}
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
        data={ledgers}
        columns={columns}
        searchPlaceholder="Search ledgers..."
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Ledger?"
        description="This will permanently delete the ledger and all associated data. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  )
}