"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/PageHeader"
import AnimatedPage from "@/components/shared/AnimatedPage"
import api from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface PageProps {
  params: Promise<{ id: string }>
}

interface Transaction {
  date:            string
  voucher_number:  string
  type:            string
  debit:           number
  credit:          number
  amount:          number
  running_balance: number
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function LedgerStatementPage({ params }: PageProps) {
  const { id }  = use(params)
  const router  = useRouter()

  const [data,      setData]      = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get(`/masters/ledgers/${id}/statement`)
      .then((r) => setData(r.data.data))
      .catch(() => {
        toast.error("Failed to load ledger statement")
        router.push("/masters/ledger")
      })
      .finally(() => setIsLoading(false))
  }, [id])

  const exportToExcel = async () => {
    if (!data?.transactions?.length) {
      toast.error("No transactions to export")
      return
    }
    const XLSX = await import("xlsx")
    const rows = data.transactions.map((t: Transaction) => ({
      "Date":            t.date,
      "Voucher No":      t.voucher_number,
      "Type":            t.type,
      "Debit":           t.debit,
      "Credit":          t.credit,
      "Running Balance": t.running_balance,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Statement")
    XLSX.writeFile(wb, `ledger-statement-${data.ledger.name}.xlsx`)
    toast.success("Statement exported!")
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data) return null

  const { ledger, transactions, total_debit, total_credit } = data

  return (
    <AnimatedPage>
      <PageHeader
        title={`${ledger.name} — Statement`}
        subtitle={`${ledger.type} Account`}
        backHref={`/masters/ledger/${id}`}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
            onClick={exportToExcel}
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        }
      />

      <div className="max-w-4xl space-y-6">

        {/* Summary cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <motion.div
            variants={cardVariants}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="text-xs text-muted-foreground mb-1">Opening Balance</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(ledger.opening_balance)}
            </p>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
            <p className="text-xl font-bold text-foreground">
              {transactions.length}
            </p>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className={`rounded-xl p-4 border ${
              ledger.current_balance >= 0
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            <p className="text-xs text-muted-foreground mb-1">Closing Balance</p>
            <p className={`text-xl font-bold ${
              ledger.current_balance >= 0 ? "text-green-600" : "text-red-500"
            }`}>
              {formatCurrency(ledger.current_balance)}
            </p>
          </motion.div>
        </motion.div>

        {/* Transactions table */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-sm">
              Transaction History
            </h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Total Debit:{" "}
                <span className="text-green-600 font-medium">
                  {formatCurrency(total_debit)}
                </span>
              </span>
              <span>
                Total Credit:{" "}
                <span className="text-orange-500 font-medium">
                  {formatCurrency(total_credit)}
                </span>
              </span>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              No transactions found for this ledger
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    {[
                      "Date", "Voucher No", "Type",
                      "Debit", "Credit", "Balance",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Opening balance row */}
                  <tr className="bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground text-xs">—</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      Opening Balance
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Opening
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">—</td>
                    <td className="px-4 py-3 text-muted-foreground">—</td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatCurrency(ledger.opening_balance)}
                    </td>
                  </tr>

                  {/* Transaction rows */}
                  {transactions.map((t: Transaction, i: number) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-background" : "bg-muted/10"}
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {t.date}
                      </td>
                      <td className="px-4 py-3 font-medium text-primary text-xs">
                        {t.voucher_number}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          t.type === "Sales"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {t.debit > 0 ? (
                          <span className="text-green-600 font-medium">
                            {formatCurrency(t.debit)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {t.credit > 0 ? (
                          <span className="text-orange-500 font-medium">
                            {formatCurrency(t.credit)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        <span className={
                          t.running_balance >= 0
                            ? "text-foreground"
                            : "text-red-500"
                        }>
                          {formatCurrency(t.running_balance)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatedPage>
  )
}