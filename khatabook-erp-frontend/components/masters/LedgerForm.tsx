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
import { Textarea } from "@/components/ui/textarea"
import { CreateLedgerPayload, Ledger, LedgerType } from "@/types"

const LEDGER_TYPES: { value: LedgerType; label: string }[] = [
  { value: "CUSTOMER", label: "Customer (Sundry Debtor)" },
  { value: "SUPPLIER", label: "Supplier (Sundry Creditor)" },
  { value: "EXPENSE",  label: "Expense Account" },
  { value: "INCOME",   label: "Income Account" },
  { value: "BANK",     label: "Bank Account" },
  { value: "CASH",     label: "Cash Account" },
]

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

interface LedgerFormProps {
  defaultValues?: Ledger
  onSubmit: (data: CreateLedgerPayload) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export default function LedgerForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Save Ledger",
}: LedgerFormProps) {

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<CreateLedgerPayload>({
      defaultValues: {
        name:            defaultValues?.name            ?? "",
        type:            defaultValues?.type            ?? "CUSTOMER",
        phone:           defaultValues?.phone           ?? "",
        email:           defaultValues?.email           ?? "",
        address:         defaultValues?.address         ?? "",
        gst_number:      defaultValues?.gst_number      ?? "",
        opening_balance: defaultValues?.opening_balance ?? 0,
      },
    })

  const selectedType = watch("type")

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-5"
      >

        {/* Name */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="name">
            Ledger Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Rahul Traders, HDFC Bank"
            autoFocus
            {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 characters" } })}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </motion.div>

        {/* Type */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label>
            Ledger Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedType}
            onValueChange={(val) => setValue("type", val as LedgerType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ledger type" />
            </SelectTrigger>
            <SelectContent>
              {LEDGER_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Phone + Email */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="9876543210"
              {...register("phone")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="party@example.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
        </motion.div>

        {/* GST + Opening Balance */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="gst_number">GST Number</Label>
            <Input
              id="gst_number"
              placeholder="22AAAAA0000A1Z5"
              {...register("gst_number")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opening_balance">Opening Balance (₹)</Label>
            <Input
              id="opening_balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("opening_balance", { valueAsNumber: true })}
            />
          </div>
        </motion.div>

        {/* Address */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="Full address..."
            rows={3}
            {...register("address")}
            className="resize-none"
          />
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