// app/(dashboard)/masters/ledger/create/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import PageHeader from "@/components/shared/PageHeader"
import LedgerForm from "@/components/masters/LedgerForm"
import AnimatedPage from "@/components/shared/AnimatedPage"
import { useLedger } from "@/hooks/useLedger"
import { CreateLedgerPayload } from "@/types"

export default function CreateLedgerPage() {
  const router = useRouter()
  const { createLedger, isLoading } = useLedger()

  const handleSubmit = async (data: CreateLedgerPayload) => {
    try {
      await createLedger(data)
      toast.success("Ledger created successfully!")
      router.push("/masters/ledger")
    } catch {
      toast.error("Failed to create ledger. Please try again.")
    }
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Create Ledger"
        subtitle="Add a new customer, supplier or account"
        backHref="/masters/ledger"
      />

      <div className="max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-6">
          <LedgerForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Create Ledger"
          />
        </div>
      </div>
    </AnimatedPage>
  )
}