// store/authStore.ts

import { create } from "zustand"
import { User } from "@/types"
import {
  saveTokens,
  saveUser,
  getStoredUser,
  clearAuth,
  getAccessToken,
} from "@/lib/auth"
import api from "@/lib/api"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, new_password: string) => Promise<void>
  loadUserFromStorage: () => void
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  loadUserFromStorage: () => {
    const user = getStoredUser()
    const token = getAccessToken()
    if (user && token) {
      set({ user, isAuthenticated: true })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await api.post("/auth/login", { email, password })
      const { tokens, user } = res.data.data
      saveTokens(tokens)
      saveUser(user)
      set({ user, isAuthenticated: true })
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true })
    try {
      const res = await api.post("/auth/register", { name, email, password })
      const { tokens, user } = res.data.data
      saveTokens(tokens)
      saveUser(user)
      set({ user, isAuthenticated: true })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    clearAuth()
    set({ user: null, isAuthenticated: false })
    window.location.href = "/login"
  },

  forgotPassword: async (email) => {
    set({ isLoading: true })
    try {
      await api.post("/auth/forgot-password", { email })
    } finally {
      set({ isLoading: false })
    }
  },

  resetPassword: async (token, new_password) => {
    set({ isLoading: true })
    try {
      await api.post("/auth/reset-password", { token, new_password })
    } finally {
      set({ isLoading: false })
    }
  },

  refreshUser: async () => {
    try {
      const res = await api.get("/auth/me")
      const user = res.data.data
      saveUser(user)
      set({ user, isAuthenticated: true })
    } catch {
      clearAuth()
      set({ user: null, isAuthenticated: false })
    }
  },
}))