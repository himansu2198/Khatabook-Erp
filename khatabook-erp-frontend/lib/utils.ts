// lib/utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in Indian format ₹
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format date to DD-MM-YYYY
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

// Today's date as YYYY-MM-DD for input[type=date]
export function todayISO(): string {
  return new Date().toISOString().split("T")[0]
}

// Generate voucher number
export function generateVoucherNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count).padStart(4, "0")}`
}

// Calculate GST
export function calculateGST(amount: number, gstPercent: number) {
  const gstAmount = (amount * gstPercent) / 100
  return {
    baseAmount: amount,
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    totalAmount: parseFloat((amount + gstAmount).toFixed(2)),
  }
}

// Truncate long text
export function truncate(str: string, length = 30): string {
  return str.length > length ? str.slice(0, length) + "..." : str
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}