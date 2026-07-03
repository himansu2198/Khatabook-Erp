import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import ToasterProvider from "@/components/shared/ToasterProvider"

const geist = Geist({
  subsets:  ["latin"],
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title:       "Khatabook ERP",
  description: "Billing, Inventory & Accounting Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.className} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}