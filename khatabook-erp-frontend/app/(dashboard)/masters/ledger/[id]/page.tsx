"use client"

import { use, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Pencil, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/PageHeader"
import LedgerForm from "@/components/masters/LedgerForm"
import AnimatedPage from "@/components/shared/AnimatedPage"
import { CreateLedgerPayload, Ledger } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
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

export default function LedgerDetailPage({ params }: PageProps) {
  // ── Next.js 15 — unwrap params with React.use() ──
  const { id }       = use(params)
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isEditMode   = searchParams.get("edit") === "true"

  const [ledger,    setLedger]    = useState<Ledger | null>(null)
  const [fetching,  setFetching]  = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/masters/ledgers/${id}`)
        setLedger(res.data.data)
      } catch (err: any) {
        console.error("Ledger fetch error:", err?.response?.status, err?.message)
        toast.error("Ledger not found")
        router.push("/masters/ledger")
      } finally {
        setFetching(false)
      }
    }
    if (id) load()
  }, [id])

  const handleUpdate = async (data: CreateLedgerPayload) => {
    setIsLoading(true)
    try {
      const res = await api.put(`/masters/ledgers/${id}`, data)
      setLedger(res.data.data)
      toast.success("Ledger updated successfully!")
      router.push("/masters/ledger")
    } catch {
      toast.error("Failed to update ledger.")
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

  if (!ledger) return null

  return (
    <AnimatedPage>
      <PageHeader
        title={ledger.name}
        subtitle={`${ledger.type} Account`}
        backHref="/masters/ledger"
        actions={
          !isEditMode ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => router.push(`/masters/ledger/${id}/statement`)}
              >
                <FileText className="h-4 w-4" />
                Statement
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => router.push(`/masters/ledger/${id}?edit=true`)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="gap-2"
              onClick={() => router.push(`/masters/ledger/${id}`)}
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
            {/* Balance */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Current Balance
                </p>
                <p className={`text-2xl font-bold ${
                  ledger.current_balance < 0
                    ? "text-red-500"
                    : "text-green-600"
                }`}>
                  {formatCurrency(ledger.current_balance)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">
                  Opening Balance
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(ledger.opening_balance)}
                </p>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <INFO label="Phone"      value={ledger.phone      ?? ""} />
              <INFO label="Email"      value={ledger.email      ?? ""} />
              <INFO label="GST Number" value={ledger.gst_number ?? ""} />
              <INFO label="Type"       value={ledger.type            } />
              <INFO label="Created"    value={formatDate(ledger.created_at)} />
              <INFO label="Updated"    value={formatDate(ledger.updated_at)} />
            </div>

            {ledger.address && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {ledger.address}
                </p>
              </div>
            )}

            {/* Statement CTA */}
            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 w-full"
                onClick={() =>
                  router.push(`/masters/ledger/${id}/statement`)
                }
              >
                <FileText className="h-4 w-4" />
                View Full Transaction Statement
              </Button>
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
            <LedgerForm
              defaultValues={ledger}
              onSubmit={handleUpdate}
              isLoading={isLoading}
              submitLabel="Update Ledger"
            />
          </motion.div>
        )}
      </div>
    </AnimatedPage>
  )
}