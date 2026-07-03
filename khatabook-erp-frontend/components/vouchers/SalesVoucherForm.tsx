"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import VoucherLineItems from "./VoucherLineItems"
import { Ledger, StockItem, VoucherLineItem, CreateVoucherPayload } from "@/types"
import { todayISO } from "@/lib/utils"

interface SalesVoucherFormProps {
  customers: Ledger[]
  stockItems: StockItem[]
  onSubmit: (data: CreateVoucherPayload) => Promise<void>
  isLoading?: boolean
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function SalesVoucherForm({
  customers,
  stockItems,
  onSubmit,
  isLoading = false,
}: SalesVoucherFormProps) {
  const [lineItems, setLineItems] = useState<VoucherLineItem[]>([
    {
      stock_item_id:   "",
      stock_item_name: "",
      quantity:        1,
      rate:            0,
      amount:          0,
      gst_percentage:  0,
      gst_amount:      0,
      total_amount:    0,
    },
  ])

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      party_id: "",
      date:     todayISO(),
      notes:    "",
    },
  })

  const selectedParty = watch("party_id")

  const grandTotal = lineItems.reduce((s, l) => s + l.total_amount, 0)
  const totalGST   = lineItems.reduce((s, l) => s + l.gst_amount,   0)
  const subtotal   = lineItems.reduce((s, l) => s + l.amount,       0)

  const handleFormSubmit = async (data: { party_id: string; date: string; notes: string }) => {
    const validLines = lineItems.filter((l) => l.stock_item_id && l.quantity > 0)
    if (!validLines.length) {
      return
    }

    await onSubmit({
      type:     "SALES",
      date:     data.date,
      party_id: data.party_id,
      notes:    data.notes,
      line_items: validLines.map((l) => ({
        stock_item_id:  l.stock_item_id,
        quantity:       l.quantity,
        rate:           l.rate,
        amount:         l.amount,
        gst_percentage: l.gst_percentage,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className="space-y-6"
      >

        {/* Customer + Date */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              Customer <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedParty}
              onValueChange={(val) => setValue("party_id", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    No customers found. Create a ledger first.
                  </div>
                ) : (
                  customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex flex-col">
                        <span>{c.name}</span>
                        {c.phone && (
                          <span className="text-xs text-muted-foreground">
                            {c.phone}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              {...register("date", { required: true })}
            />
          </div>
        </motion.div>

        {/* Line items */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Label>
            Items <span className="text-red-500">*</span>
          </Label>
          <div className="border border-border rounded-xl p-4 bg-card">
            <VoucherLineItems
              items={stockItems}
              lineItems={lineItems}
              onChange={setLineItems}
              priceKey="selling_rate"
            />
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes..."
            rows={2}
            {...register("notes")}
            className="resize-none"
          />
        </motion.div>

        {/* Submit row */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between pt-2 border-t border-border"
        >
          <div className="text-sm text-muted-foreground">
            Total:{" "}
            <span className="text-lg font-bold text-foreground">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !selectedParty || grandTotal === 0}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Create Sales Voucher
              </>
            )}
          </Button>
        </motion.div>

      </motion.div>
    </form>
  )
}