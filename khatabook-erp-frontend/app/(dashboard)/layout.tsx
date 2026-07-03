"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import KeyboardShortcutHandler from "@/components/layout/KeyboardShortcutHandler"
import GlobalSearch from "@/components/shared/GlobalSearch"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { loadUserFromStorage, refreshUser } = useAuthStore()

  useEffect(() => {
    loadUserFromStorage()
    refreshUser().catch(() => router.push("/login"))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <KeyboardShortcutHandler />
      <GlobalSearch />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}