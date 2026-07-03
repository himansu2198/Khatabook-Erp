"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/PageHeader"
import StockItemTable from "@/components/masters/StockItemTable"
import AnimatedPage from "@/components/shared/AnimatedPage"
import { useStock } from "@/hooks/useStock"

export default function StockItemsPage() {
  const { items, isLoading, deleteItem } = useStock()

  return (
    <AnimatedPage>
      <PageHeader
        title="Stock Items"
        subtitle={`${items.length} item(s) in inventory`}
        backHref="/gateway"
        actions={
          <Link href="/masters/stock-items/create">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Item
              <span className="hidden sm:inline text-[10px] font-mono opacity-70 bg-white/20 px-1.5 py-0.5 rounded">
                Alt+S
              </span>
            </Button>
          </Link>
        }
      />

      <StockItemTable
        items={items}
        isLoading={isLoading}
        onDelete={deleteItem}
      />
    </AnimatedPage>
  )
}