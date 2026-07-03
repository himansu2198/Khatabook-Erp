"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import api from "@/lib/api"
import { StockItem, CreateStockItemPayload } from "@/types"

export function useStock() {
  const [items,     setItems]   = useState<StockItem[]>([])
  const [isLoading, setLoading] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get("/masters/stock")
      setItems(res.data.data)
    } catch {
      toast.error("Failed to load stock items")
    } finally {
      setLoading(false)
    }
  }, [])

  const createItem = async (payload: CreateStockItemPayload) => {
    const res = await api.post("/masters/stock", payload)
    await fetchItems()
    return res.data.data as StockItem
  }

  const updateItem = async (id: string, payload: Partial<CreateStockItemPayload>) => {
    const res = await api.put(`/masters/stock/${id}`, payload)
    await fetchItems()
    return res.data.data as StockItem
  }

  const deleteItem = async (id: string) => {
    await api.delete(`/masters/stock/${id}`)
    await fetchItems()
  }

  const getItem = async (id: string): Promise<StockItem> => {
    const res = await api.get(`/masters/stock/${id}`)
    return res.data.data
  }

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return {
    items,
    isLoading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    getItem,
  }
}