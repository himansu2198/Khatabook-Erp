"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import { Loader2, Banknote, Building2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PageHeader from "@/components/shared/PageHeader"
import AnimatedPage from "@/components/shared/AnimatedPage"
import api from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

interface Ledger {
  id:   string
  name: string
  type: string
}

interface PaymentForm {
  party_id:     string
  paid_from_id: string
  amount:       number
  payment_mode: string
  narration:    string
  date:         string
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

const PAYMENT_MODES = [
  { value: "CASH",   label: "Cash",         icon: <Banknote   className="h-4 w-4 text-green-500"  /> },
  { value: "BANK",   label: "Bank Transfer", icon: <Building2  className="h-4 w-4 text-blue-500"   /> },
  { value: "CHEQUE", label: "Cheque",        icon: <CreditCard className="h-4 w-4 text-violet-500" /> },
]

export default function CreatePaymentVoucherPage() {
  const router                    = useRouter()
  const [ledgers,    setLedgers]  = useState<Ledger[]>([])
  const [isLoading,  setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentForm>({
    defaultValues: {
      payment_mode: "CASH",
      date:         new Date().toISOString().split("T")[0],
    },
  })

  const selectedPartyId    = watch("party_id")
  const selectedPaidFromId = watch("paid_from_id")
  const selectedMode       = watch("payment_mode")
  const amount             = watch("amount")

  useEffect(() => {
    api.get("/masters/ledgers")
      .then((r) => setLedgers(r.data.data))
      .catch(() => toast.error("Failed to load ledgers"))
      .finally(() => setIsFetching(false))
  }, [])

  const onSubmit = async (data: PaymentForm) => {
    if (!data.party_id) {
      toast.error("Please select a party")
      return
    }
    if (!data.paid_from_id) {
      toast.error("Please select paid from account")
      return
    }
    if (!data.amount || data.amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsLoading(true)
    try {
      await api.post("/vouchers/payment", {
        party_id:     data.party_id,
        paid_from_id: data.paid_from_id,
        amount:       Number(data.amount),
        payment_mode: data.payment_mode,
        narration:    data.narration || "",
        date:         data.date,
      })
      toast.success("Payment voucher created successfully!")
      router.push("/vouchers/payment")
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? "Failed to create payment voucher"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Separate ledgers by type
  const partyLedgers    = ledgers.filter((l) =>
    ["CUSTOMER", "SUPPLIER", "EXPENSE"].includes(l.type)
  )
  const bankCashLedgers = ledgers.filter((l) =>
    ["BANK", "CASH"].includes(l.type)
  )

  const selectedParty    = ledgers.find((l) => l.id === selectedPartyId)
  const selectedPaidFrom = ledgers.find((l) => l.id === selectedPaidFromId)

  if (isFetching) {
    return (
      <div className="space-y-4 max-w-2xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="New Payment Voucher"
        subtitle="Record payment to supplier, rent, salary etc."
        backHref="/vouchers/payment"
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="space-y-5"
          >
            {/* Pay To (Party) */}
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Payment Details
              </h3>

              {/* Party */}
              <div className="space-y-1.5">
                <Label>
                  Pay To (Party) <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(val) => setValue("party_id", val)}
                >
                  <SelectTrigger className={!selectedPartyId && "border-muted"}>
                    <SelectValue placeholder="Select supplier / expense account" />
                  </SelectTrigger>
                  <SelectContent>
                    {partyLedgers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        No supplier/expense ledgers found.
                        Create one first!
                      </div>
                    ) : (
                      partyLedgers.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          <div className="flex items-center gap-2">
                            <span>{l.name}</span>
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {l.type}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedParty && (
                  <p className="text-xs text-muted-foreground">
                    Type: {selectedParty.type}
                  </p>
                )}
              </div>

              {/* Paid From */}
              <div className="space-y-1.5">
                <Label>
                  Paid From (Bank/Cash) <span className="text-red-500">*</span>
                </Label>
                <Select
                  onValueChange={(val) => setValue("paid_from_id", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank or cash account" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankCashLedgers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        No bank/cash ledgers found.
                        Create a BANK or CASH ledger first!
                      </div>
                    ) : (
                      bankCashLedgers.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          <div className="flex items-center gap-2">
                            <span>{l.name}</span>
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {l.type}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedPaidFrom && (
                  <p className="text-xs text-muted-foreground">
                    Account: {selectedPaidFrom.name}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Amount + Date */}
            <motion.div
              variants={itemVariants}
              className="bg-card border border-border rounded-xl p-5 space-y-4"
            >
              <h3 className="text-sm font-semibold text-foreground">
                Amount & Date
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="pay-amount">
                    Amount (Rs.) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pay-amount"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    autoComplete="off"
                    {...register("amount", {
                      required:      "Amount is required",
                      valueAsNumber: true,
                      min:           { value: 1, message: "Amount must be greater than 0" },
                    })}
                    className={errors.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && (
                    <p className="text-xs text-red-500">{errors.amount.message}</p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="pay-date">Date</Label>
                  <Input
                    id="pay-date"
                    type="date"
                    autoComplete="off"
                    {...register("date")}
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Mode */}
            <motion.div
              variants={itemVariants}
              className="bg-card border border-border rounded-xl p-5 space-y-4"
            >
              <h3 className="text-sm font-semibold text-foreground">
                Payment Mode
              </h3>

              <div className="grid grid-cols-3 gap-3">
                {PAYMENT_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setValue("payment_mode", mode.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedMode === mode.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {mode.icon}
                    <span className="text-xs font-medium text-foreground">
                      {mode.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Narration */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="pay-narration">
                Narration / Remarks
              </Label>
              <Textarea
                id="pay-narration"
                placeholder="e.g. Rent payment for June, Salary to staff..."
                autoComplete="off"
                rows={3}
                {...register("narration")}
              />
            </motion.div>

            {/* Summary Preview */}
            {selectedParty && amount > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4"
              >
                <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-3">
                  Payment Summary
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pay To:</span>
                    <span className="font-medium text-foreground">
                      {selectedParty.name}
                    </span>
                  </div>
                  {selectedPaidFrom && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid From:</span>
                      <span className="font-medium text-foreground">
                        {selectedPaidFrom.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode:</span>
                    <span className="font-medium text-foreground">
                      {selectedMode}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-orange-200 dark:border-orange-800 pt-2 mt-2">
                    <span className="font-semibold text-foreground">
                      Total Amount:
                    </span>
                    <span className="font-bold text-orange-600 text-base">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit */}
            <motion.div variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gap-2"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Payment Voucher...
                  </>
                ) : (
                  <>
                    <Banknote className="h-4 w-4" />
                    Create Payment Voucher
                  </>
                )}
              </Button>
            </motion.div>

          </motion.div>
        </form>
      </div>
    </AnimatedPage>
  )
}