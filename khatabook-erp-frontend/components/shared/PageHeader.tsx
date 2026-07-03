// components/shared/PageHeader.tsx

"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  actions?: React.ReactNode
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  actions,
  className,
}: PageHeaderProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y:  0  }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center justify-between pb-4 border-b border-border mb-6",
        className
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {backHref && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(backHref)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right — action buttons */}
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </motion.div>
  )
}