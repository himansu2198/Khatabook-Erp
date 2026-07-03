// hooks/useAuth.ts

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"

export function useAuth() {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    loadUserFromStorage,
    refreshUser,
  } = useAuthStore()

  // On mount — load from storage then refresh from API
  useEffect(() => {
    loadUserFromStorage()
    if (isAuthenticated) {
      refreshUser()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    router,
  }
}