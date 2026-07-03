// app/(dashboard)/masters/ledger/page.tsx

"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/PageHeader"
import LedgerTable from "@/components/masters/LedgerTable"
import AnimatedPage from "@/components/shared/AnimatedPage"
import { useLedger } from "@/hooks/useLedger"

export default function LedgerListPage() {
  const { ledgers, isLoading, deleteLedger } = useLedger()

  return (
    <AnimatedPage>
      <PageHeader
        title="Ledgers"
        subtitle={`${ledgers.length} ledger(s) found`}
        backHref="/gateway"
        actions={
          <Link href="/masters/ledger/create">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Ledger
              <span className="hidden sm:inline text-[10px] font-mono opacity-70 bg-white/20 px-1.5 py-0.5 rounded">
                Alt+L
              </span>
            </Button>
          </Link>
        }
      />

      <LedgerTable
        ledgers={ledgers}
        isLoading={isLoading}
        onDelete={deleteLedger}
      />
    </AnimatedPage>
  )
}