"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, FileText, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/PageHeader"
import AnimatedPage from "@/components/shared/AnimatedPage"
import api from "@/lib/api"
import { Voucher } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"
import { getAccessToken } from "@/lib/auth"

export default function SalesVoucherListPage() {
  const router                            = useRouter()
  const [vouchers,    setVouchers]        = useState<Voucher[]>([])
  const [isLoading,   setIsLoading]       = useState(true)
  const [downloading, setDownloading]     = useState<string | null>(null)
  const [printing,    setPrinting]        = useState<string | null>(null)

  useEffect(() => {
    api.get("/vouchers/sales")
      .then((r) => setVouchers(r.data.data))
      .catch(() => toast.error("Failed to load sales vouchers"))
      .finally(() => setIsLoading(false))
  }, [])

  // ── PDF Download ──
  const downloadPDF = async (voucherId: string, voucherNumber: string) => {
    setDownloading(voucherId)
    try {
      const token    = getAccessToken()
      const response = await fetch(
        `http://localhost:8000/api/vouchers/sales/${voucherId}/pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) throw new Error("Failed")
      const blob = await response.blob()
      const url  = window.URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href     = url
      a.download = `invoice-${voucherNumber}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("Invoice downloaded!")
    } catch {
      toast.error("Failed to download invoice")
    } finally {
      setDownloading(null)
    }
  }

  // ── Print Invoice ──
  const printInvoice = async (voucher: Voucher) => {
    setPrinting(voucher.id)
    try {
      const token    = getAccessToken()
      const response = await fetch(
        `http://localhost:8000/api/vouchers/sales/${voucher.id}/print`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const html = await response.text()

      const printWindow = window.open("", "_blank", "width=800,height=600")
      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
      }
      toast.success("Print dialog opened!")
    } catch {
      toast.error("Failed to print invoice")
    } finally {
      setPrinting(null)
    }
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Sales Vouchers"
        subtitle={`${vouchers.length} voucher(s)`}
        backHref="/gateway"
        actions={
          <Link href="/vouchers/sales/create">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Sale
              <span className="hidden sm:inline text-[10px] font-mono opacity-70 bg-white/20 px-1.5 py-0.5 rounded">
                F8
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
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            No sales vouchers yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first sales voucher to get started
          </p>
          <Link href="/vouchers/sales/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Sales Voucher
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
              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
            >
              {/* Left */}
              <div
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => router.push(`/vouchers/sales/${v.id}`)}
              >
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-green-600" />
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

              {/* Right */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(v.total_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    GST: {formatCurrency(v.total_gst)}
                  </p>
                </div>

                {/* Print button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  disabled={printing === v.id}
                  onClick={() => printInvoice(v)}
                >
                  <Printer className="h-3.5 w-3.5" />
                  {printing === v.id ? "..." : "Print"}
                </Button>

                {/* PDF button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  disabled={downloading === v.id}
                  onClick={() => downloadPDF(v.id, v.voucher_number)}
                >
                  <Download className="h-3.5 w-3.5" />
                  {downloading === v.id ? "..." : "PDF"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatedPage>
  )
}