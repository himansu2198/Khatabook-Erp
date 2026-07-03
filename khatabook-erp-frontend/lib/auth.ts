// lib/auth.ts

import { AuthTokens, User } from "@/types"

const ACCESS_TOKEN_KEY = "khatabook_access_token"
const REFRESH_TOKEN_KEY = "khatabook_refresh_token"
const USER_KEY = "khatabook_user"

export function saveTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
  // Save cookie for middleware
  document.cookie = `khatabook_access_token=${tokens.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  // Clear cookie
  document.cookie = "khatabook_access_token=; path=/; max-age=0"
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}