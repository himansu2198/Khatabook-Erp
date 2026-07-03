// components/layout/KeyboardShortcutHandler.tsx

"use client"

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

export default function KeyboardShortcutHandler() {
  // Just mounts the hook globally inside the dashboard layout
  useKeyboardShortcuts()
  return null
}