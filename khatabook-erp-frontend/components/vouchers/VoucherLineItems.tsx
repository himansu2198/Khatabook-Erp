"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StockItem, VoucherLineItem } from "@/types"
import { formatCurrency, calculateGST } from "@/lib/utils"

interface VoucherLineItemsProps {
  items: StockItem[]
  lineItems: VoucherLineItem[]
  onChange: (lineItems: VoucherLineItem[]) => void
  priceKey?: "purchase_rate" | "selling_rate"
}

const emptyLine = (): VoucherLineItem => ({
  stock_item_id:  "",
  stock_item_name: "",
  quantity:       1,
  rate:           0,
  amount:         0,
  gst_percentage: 0,
  gst_amount:     0,
  total_amount:   0,
})

export default function VoucherLineItems({
  items,
  lineItems,
  onChange,
  priceKey = "selling_rate",
}: VoucherLineItemsProps) {

  const updateLine = (index: number, field: keyof VoucherLineItem, value: string | number) => {
    const updated = [...lineItems]
    const line    = { ...updated[index], [field]: value }

    // Auto-fill rate when item selected
    if (field === "stock_item_id") {
      const found = items.find((i) => i.id === value)
      if (found) {
        line.stock_item_name = found.name
        line.rate            = found[priceKey]
        line.gst_percentage  = found.gst_percentage
      }
    }

    // Recalculate amounts
    const qty    = Number(line.quantity) || 0
    const rate   = Number(line.rate)     || 0
    const amount = qty * rate
    const { gstAmount, totalAmount } = calculateGST(amount, Number(line.gst_percentage) || 0)

    line.amount       = parseFloat(amount.toFixed(2))
    line.gst_amount   = gstAmount
    line.total_amount = totalAmount

    updated[index] = line
    onChange(updated)
  }

  const addLine = () => onChange([...lineItems, emptyLine()])

  const removeLine = (index: number) => {
    const updated = lineItems.filter((_, i) => i !== index)
    onChange(updated.length ? updated : [emptyLine()])
  }

  // Totals
  const subtotal   = lineItems.reduce((s, l) => s + l.amount,       0)
  const totalGST   = lineItems.reduce((s, l) => s + l.gst_amount,   0)
  const grandTotal = lineItems.reduce((s, l) => s + l.total_amount,  0)

  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="hidden md:grid grid-cols-12 gap-2 px-2 text-xs font-medium text-muted-foreground">
        <div className="col-span-4">Item</div>
        <div className="col-span-2">Qty</div>
        <div className="col-span-2">Rate (₹)</div>
        <div className="col-span-1">GST%</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1" />
      </div>

      {/* Line rows */}
      <AnimatePresence initial={false}>
        {lineItems.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y:  0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-muted/30 border border-border"
          >
            {/* Item select */}
            <div className="col-span-12 md:col-span-4">
              <Select
                value={line.stock_item_id}
                onValueChange={(val) => updateLine(i, "stock_item_id", val)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select item..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.sku} — Stock: {item.current_stock} {item.unit}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Qty */}
            <div className="col-span-4 md:col-span-2">
              <Input
                type="number"
                min="1"
                step="1"
                value={line.quantity}
                onChange={(e) => updateLine(i, "quantity", Number(e.target.value))}
                className="h-8 text-sm"
                placeholder="Qty"
              />
            </div>

            {/* Rate */}
            <div className="col-span-4 md:col-span-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={line.rate}
                onChange={(e) => updateLine(i, "rate", Number(e.target.value))}
                className="h-8 text-sm"
                placeholder="Rate"
              />
            </div>

            {/* GST % */}
            <div className="col-span-3 md:col-span-1">
              <Input
                type="number"
                min="0"
                max="28"
                value={line.gst_percentage}
                onChange={(e) => updateLine(i, "gst_percentage", Number(e.target.value))}
                className="h-8 text-sm"
                placeholder="GST"
              />
            </div>

            {/* Total */}
            <div className="col-span-4 md:col-span-2 text-right">
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(line.total_amount)}
              </p>
              {line.gst_amount > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  +GST {formatCurrency(line.gst_amount)}
                </p>
              )}
            </div>

            {/* Remove */}
            <div className="col-span-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-red-500"
                onClick={() => removeLine(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add line button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 w-full border-dashed"
        onClick={addLine}
      >
        <Plus className="h-4 w-4" />
        Add Item
      </Button>

      {/* Totals summary */}
      {grandTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border pt-4 space-y-2"
        >
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total GST</span>
            <span>{formatCurrency(totalGST)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-foreground border-t border-border pt-2">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}