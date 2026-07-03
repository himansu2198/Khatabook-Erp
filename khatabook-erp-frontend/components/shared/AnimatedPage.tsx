// components/shared/AnimatedPage.tsx

"use client"

import { motion } from "framer-motion"
import type { Variants } from "framer-motion"

interface AnimatedPageProps {
  children: React.ReactNode
  className?: string
}

const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.22,
    },
  },
  exit: { opacity: 0, y: -16 },
}

export default function AnimatedPage({ children, className = "" }: AnimatedPageProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}