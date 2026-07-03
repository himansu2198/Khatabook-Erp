// lib/api.ts
import axios from "axios"
import { getAccessToken, clearAuth, saveTokens } from "./auth"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
})

// Request interceptor
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      clearAuth()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api