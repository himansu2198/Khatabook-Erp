// types/index.ts

export type LedgerType = "CUSTOMER" | "SUPPLIER" | "EXPENSE" | "INCOME" | "BANK" | "CASH"

export type VoucherType = "SALES" | "PURCHASE" | "PAYMENT" | "RECEIPT" | "JOURNAL" | "CONTRA"

export type UnitType = "PCS" | "BOX" | "KG" | "LTR" | "PACK"

// ── Auth ──────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  new_password: string
}

// ── Ledger ────────────────────────────────────────
export interface Ledger {
  id: string
  name: string
  type: LedgerType
  phone?: string
  email?: string
  address?: string
  gst_number?: string
  opening_balance: number
  current_balance: number
  created_at: string
  updated_at: string
}

export interface CreateLedgerPayload {
  name: string
  type: LedgerType
  phone?: string
  email?: string
  address?: string
  gst_number?: string
  opening_balance?: number
}

// ── Stock ─────────────────────────────────────────
export interface StockItem {
  id: string
  name: string
  sku: string
  hsn_code?: string
  unit: UnitType
  purchase_rate: number
  selling_rate: number
  opening_stock: number
  current_stock: number
  gst_percentage: number
  created_at: string
  updated_at: string
}

export interface CreateStockItemPayload {
  name: string
  sku: string
  hsn_code?: string
  unit: UnitType
  purchase_rate: number
  selling_rate: number
  opening_stock?: number
  gst_percentage: number
}

// ── Vouchers ──────────────────────────────────────
export interface VoucherLineItem {
  stock_item_id: string
  stock_item_name?: string
  quantity: number
  rate: number
  amount: number
  gst_percentage: number
  gst_amount: number
  total_amount: number
}

export interface Voucher {
  id: string
  voucher_number: string
  type: VoucherType
  date: string
  party_id: string
  party_name?: string
  line_items: VoucherLineItem[]
  subtotal: number
  total_gst: number
  total_amount: number
  notes?: string
  created_at: string
}

export interface CreateVoucherPayload {
  type: VoucherType
  date: string
  party_id: string
  line_items: Omit<VoucherLineItem, "stock_item_name" | "gst_amount" | "total_amount">[]
  notes?: string
}

// ── API Response ──────────────────────────────────
export interface ApiResponse<T> {
  status: "success" | "error"
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
}