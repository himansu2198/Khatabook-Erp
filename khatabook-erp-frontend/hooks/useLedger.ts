// hooks/useLedger.ts

"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import api from "@/lib/api"
import { Ledger, CreateLedgerPayload } from "@/types"

export function useLedger() {
  const [ledgers, setLedgers]   = useState<Ledger[]>([])
  const [isLoading, setLoading] = useState(false)

  const fetchLedgers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get("/masters/ledgers")
      setLedgers(res.data.data)
    } catch {
      toast.error("Failed to load ledgers")
    } finally {
      setLoading(false)
    }
  }, [])

  const createLedger = async (payload: CreateLedgerPayload) => {
    const res = await api.post("/masters/ledgers", payload)
    await fetchLedgers()
    return res.data.data as Ledger
  }

  const updateLedger = async (id: string, payload: Partial<CreateLedgerPayload>) => {
    const res = await api.put(`/masters/ledgers/${id}`, payload)
    await fetchLedgers()
    return res.data.data as Ledger
  }

  const deleteLedger = async (id: string) => {
    await api.delete(`/masters/ledgers/${id}`)
    await fetchLedgers()
  }

  const getLedger = async (id: string): Promise<Ledger> => {
    const res = await api.get(`/masters/ledgers/${id}`)
    return res.data.data
  }

  useEffect(() => {
    fetchLedgers()
  }, [fetchLedgers])

  return {
    ledgers,
    isLoading,
    fetchLedgers,
    createLedger,
    updateLedger,
    deleteLedger,
    getLedger,
  }
}