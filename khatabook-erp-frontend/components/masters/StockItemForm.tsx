"use client"

import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
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
import { CreateStockItemPayload, StockItem, UnitType } from "@/types"

const UNITS: { value: UnitType; label: string }[] = [
  { value: "PCS",  label: "PCS — Pieces"  },
  { value: "BOX",  label: "BOX — Box"     },
  { value: "KG",   label: "KG — Kilogram" },
  { value: "LTR",  label: "LTR — Litre"   },
  { value: "PACK", label: "PACK — Pack"   },
]

const GST_RATES = [0, 5, 12, 18, 28]

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

interface StockItemFormProps {
  defaultValues?: StockItem
  onSubmit: (data: CreateStockItemPayload) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export default function StockItemForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Save Stock Item",
}: StockItemFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateStockItemPayload>({
    defaultValues: {
      name:           defaultValues?.name           ?? "",
      sku:            defaultValues?.sku            ?? "",
      hsn_code:       defaultValues?.hsn_code       ?? "",
      unit:           defaultValues?.unit           ?? "PCS",
      purchase_rate:  defaultValues?.purchase_rate  ?? 0,
      selling_rate:   defaultValues?.selling_rate   ?? 0,
      opening_stock:  defaultValues?.opening_stock  ?? 0,
      gst_percentage: defaultValues?.gst_percentage ?? 18,
    },
  })

  const selectedUnit = watch("unit")
  const selectedGST  = watch("gst_percentage")

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-5"
      >

        {/* Name + SKU */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="item-name">
              Item Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="item-name"
              placeholder="e.g. Laptop, Mouse, Keyboard"
              autoFocus
              autoComplete="off"
              {...register("name", {
                required: "Item name is required",
                minLength: { value: 2, message: "Min 2 characters" },
              })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-sku">
              SKU Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="item-sku"
              placeholder="e.g. LAP-001, MOU-002"
              autoComplete="off"
              {...register("sku", {
                required: "SKU is required",
              })}
              className={errors.sku ? "border-red-500" : ""}
            />
            {errors.sku && (
              <p className="text-xs text-red-500">{errors.sku.message}</p>
            )}
          </div>
        </motion.div>

        {/* HSN + Unit */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="item-hsn">HSN Code</Label>
            <Input
              id="item-hsn"
              placeholder="e.g. 84713010"
              autoComplete="off"
              {...register("hsn_code")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Unit <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedUnit}
              onValueChange={(val) => setValue("unit", val as UnitType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Purchase Rate + Selling Rate */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="item-purchase-rate">
              Purchase Rate (Rs.) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="item-purchase-rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              autoComplete="off"
              {...register("purchase_rate", {
                required: "Purchase rate is required",
                valueAsNumber: true,
                min: { value: 0, message: "Cannot be negative" },
              })}
              className={errors.purchase_rate ? "border-red-500" : ""}
            />
            {errors.purchase_rate && (
              <p className="text-xs text-red-500">{errors.purchase_rate.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-selling-rate">
              Selling Rate (Rs.) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="item-selling-rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              autoComplete="off"
              {...register("selling_rate", {
                required: "Selling rate is required",
                valueAsNumber: true,
                min: { value: 0, message: "Cannot be negative" },
              })}
              className={errors.selling_rate ? "border-red-500" : ""}
            />
            {errors.selling_rate && (
              <p className="text-xs text-red-500">{errors.selling_rate.message}</p>
            )}
          </div>
        </motion.div>

        {/* Opening Stock + GST */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="item-opening-stock">Opening Stock (Qty)</Label>
            <Input
              id="item-opening-stock"
              type="number"
              min="0"
              placeholder="0"
              autoComplete="off"
              {...register("opening_stock", {
                valueAsNumber: true,
                min: { value: 0, message: "Cannot be negative" },
              })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              GST Rate <span className="text-red-500">*</span>
            </Label>
            <Select
              value={String(selectedGST)}
              onValueChange={(val) => setValue("gst_percentage", Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select GST %" />
              </SelectTrigger>
              <SelectContent>
                {GST_RATES.map((rate) => (
                  <SelectItem key={rate} value={String(rate)}>
                    {rate}% GST
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Profit Preview */}
        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Quick Preview
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Purchase</p>
                <p className="font-semibold text-foreground text-sm">
                  Rs.{watch("purchase_rate") || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Selling</p>
                <p className="font-semibold text-foreground text-sm">
                  Rs.{watch("selling_rate") || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Profit</p>
                <p className={`font-semibold text-sm ${
                  (watch("selling_rate") || 0) - (watch("purchase_rate") || 0) >= 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}>
                  Rs.{(
                    (watch("selling_rate") || 0) - (watch("purchase_rate") || 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="pt-2">
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </motion.div>

      </motion.div>
    </form>
  )
}