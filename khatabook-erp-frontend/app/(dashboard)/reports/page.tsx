"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  Package, TrendingUp, ShoppingBag,
  AlertTriangle, Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/shared/PageHeader"
import AnimatedPage from "@/components/shared/AnimatedPage"
import api from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { getAccessToken } from "@/lib/auth"

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
}

interface StockItem {
  id:             string
  name:           string
  sku:            string
  unit:           string
  current_stock:  number
  purchase_rate:  number
  selling_rate:   number
  stock_value:    number
  status:         "low" | "ok" | "good"
  gst_percentage: number
}

interface VoucherRow {
  id:             string
  voucher_number: string
  date:           string
  party_name:     string
  subtotal:       number
  total_gst:      number
  total_amount:   number
}

type ActiveTab = "stock" | "sales" | "purchase"

function ReportsContent() {
  const searchParams = useSearchParams()
  const tabParam     = searchParams.get("tab") as ActiveTab | null

  const [activeTab,    setActiveTab]    = useState<ActiveTab>(tabParam ?? "stock")
  const [stockData,    setStockData]    = useState<any>(null)
  const [salesData,    setSalesData]    = useState<any>(null)
  const [purchaseData, setPurchaseData] = useState<any>(null)
  const [isLoading,    setIsLoading]    = useState(false)

  const fetchReport = async (type: ActiveTab) => {
    setIsLoading(true)
    try {
      if (type === "stock") {
        const res = await api.get("/reports/stock-summary")
        setStockData(res.data.data)
      } else if (type === "sales") {
        const res = await api.get("/reports/sales-register")
        setSalesData(res.data.data)
      } else if (type === "purchase") {
        const res = await api.get("/reports/purchase-register")
        setPurchaseData(res.data.data)
      }
    } catch {
      toast.error("Failed to load report")
    } finally {
      setIsLoading(false)
    }
  }

  // Load initial tab from URL
  useEffect(() => {
    const tab = (tabParam ?? "stock") as ActiveTab
    setActiveTab(tab)
    fetchReport(tab)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam])

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab)
    fetchReport(tab)
    // Update URL without navigation
    window.history.pushState({}, "", `/reports?tab=${tab}`)
  }

  // ── PDF Download ──
  const downloadPDF = async (voucherId: string, voucherNumber: string) => {
    try {
      const token    = getAccessToken()
      const response = await fetch(
        `http://localhost:8000/api/vouchers/sales/${voucherId}/pdf`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
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
    }
  }

  // ── Excel Export ──
  const exportToExcel = async (type: ActiveTab) => {
    const XLSX  = await import("xlsx")
    let data: any[] = []
    let filename     = ""
    let sheetName    = ""

    if (type === "stock" && stockData?.items) {
      data = stockData.items.map((item: StockItem) => ({
        "Item Name":     item.name,
        "SKU":           item.sku,
        "Unit":          item.unit,
        "Current Stock": item.current_stock,
        "Purchase Rate": item.purchase_rate,
        "Selling Rate":  item.selling_rate,
        "Stock Value":   item.stock_value,
        "Status":        item.status,
      }))
      filename  = "stock-summary.xlsx"
      sheetName = "Stock Summary"
    } else if (type === "sales" && salesData?.vouchers) {
      data = salesData.vouchers.map((v: VoucherRow) => ({
        "Voucher No": v.voucher_number,
        "Date":       v.date,
        "Customer":   v.party_name,
        "Subtotal":   v.subtotal,
        "GST":        v.total_gst,
        "Total":      v.total_amount,
      }))
      filename  = "sales-register.xlsx"
      sheetName = "Sales Register"
    } else if (type === "purchase" && purchaseData?.vouchers) {
      data = purchaseData.vouchers.map((v: VoucherRow) => ({
        "Voucher No": v.voucher_number,
        "Date":       v.date,
        "Supplier":   v.party_name,
        "Subtotal":   v.subtotal,
        "GST":        v.total_gst,
        "Total":      v.total_amount,
      }))
      filename  = "purchase-register.xlsx"
      sheetName = "Purchase Register"
    }

    if (!data.length) {
      toast.error("No data to export")
      return
    }

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, filename)
    toast.success("Excel file downloaded!")
  }

  const TABS = [
    { key: "stock"    as ActiveTab, label: "Stock Summary",     icon: <Package     className="h-4 w-4" /> },
    { key: "sales"    as ActiveTab, label: "Sales Register",    icon: <TrendingUp  className="h-4 w-4" /> },
    { key: "purchase" as ActiveTab, label: "Purchase Register", icon: <ShoppingBag className="h-4 w-4" /> },
  ]

  return (
    <AnimatedPage>
      <PageHeader
        title="Reports"
        subtitle="Stock, Sales and Purchase summaries"
        backHref="/gateway"
      />

      {/* ── Tabs + Export ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
          onClick={() => exportToExcel(activeTab)}
        >
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* ── Stock Summary ── */}
      {activeTab === "stock" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {stockData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Items</p>
                <p className="text-2xl font-bold text-foreground">{stockData.total_items}</p>
              </motion.div>
              <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Stock Value</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(stockData.total_value)}
                </p>
              </motion.div>
              <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <p className="text-xs text-muted-foreground">Low Stock Items</p>
                </div>
                <p className="text-2xl font-bold text-yellow-500">
                  {stockData.low_stock_count}
                </p>
              </motion.div>
            </div>
          )}

          <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Stock Items</h3>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      {["Item", "SKU", "Unit", "Current Stock", "Purchase Rate", "Selling Rate", "Stock Value", "Status"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stockData?.items?.map((item: StockItem, i: number) => (
                      <tr key={item.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.sku}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.unit}</td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${
                            item.status === "low"  ? "text-red-500"
                            : item.status === "ok" ? "text-yellow-500"
                            : "text-green-600"
                          }`}>
                            {item.current_stock} {item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground">{formatCurrency(item.purchase_rate)}</td>
                        <td className="px-4 py-3 text-foreground">{formatCurrency(item.selling_rate)}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(item.stock_value)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            item.status === "low"  ? "bg-red-100 text-red-600"
                            : item.status === "ok" ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                          }`}>
                            {item.status === "low" ? "⚠ Low" : item.status === "ok" ? "OK" : "Good"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!stockData?.items?.length && (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                          No stock items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* ── Sales Register ── */}
      {activeTab === "sales" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {salesData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Vouchers</p>
                <p className="text-2xl font-bold text-foreground">{salesData.count}</p>
              </motion.div>
              <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(salesData.total_sales)}
                </p>
              </motion.div>
              <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total GST Collected</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(salesData.total_gst)}
                </p>
              </motion.div>
            </div>
          )}

          <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Sales Register</h3>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      {["Voucher No", "Date", "Customer", "Subtotal", "GST", "Total", "Invoice"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {salesData?.vouchers?.map((v: VoucherRow, i: number) => (
                      <tr key={v.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="px-4 py-3 font-medium text-primary">{v.voucher_number}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.date}</td>
                        <td className="px-4 py-3 text-foreground">{v.party_name}</td>
                        <td className="px-4 py-3 text-foreground">{formatCurrency(v.subtotal)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatCurrency(v.total_gst)}</td>
                        <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(v.total_amount)}</td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => downloadPDF(v.id, v.voucher_number)}
                          >
                            <Download className="h-3 w-3" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!salesData?.vouchers?.length && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                          No sales vouchers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* ── Purchase Register ── */}
      {activeTab === "purchase" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {purchaseData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Vouchers</p>
                <p className="text-2xl font-bold text-foreground">{purchaseData.count}</p>
              </motion.div>
              <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Purchases</p>
                <p className="text-2xl font-bold text-orange-500">
                  {formatCurrency(purchaseData.total_purchases)}
                </p>
              </motion.div>
              <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Total GST Paid</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(purchaseData.total_gst)}
                </p>
              </motion.div>
            </div>
          )}

          <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Purchase Register</h3>
            </div>
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      {["Voucher No", "Date", "Supplier", "Subtotal", "GST", "Total"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseData?.vouchers?.map((v: VoucherRow, i: number) => (
                      <tr key={v.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="px-4 py-3 font-medium text-primary">{v.voucher_number}</td>
                        <td className="px-4 py-3 text-muted-foreground">{v.date}</td>
                        <td className="px-4 py-3 text-foreground">{v.party_name}</td>
                        <td className="px-4 py-3 text-foreground">{formatCurrency(v.subtotal)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatCurrency(v.total_gst)}</td>
                        <td className="px-4 py-3 font-semibold text-orange-500">
                          {formatCurrency(v.total_amount)}
                        </td>
                      </tr>
                    ))}
                    {!purchaseData?.vouchers?.length && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                          No purchase vouchers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

    </AnimatedPage>
  )
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground">
          Loading reports...
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  )
}