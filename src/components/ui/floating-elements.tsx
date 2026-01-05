"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FloatingElementProps {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
  intensity?: number
}

export function FloatingElement({ 
  children, 
  className, 
  duration = 3, 
  delay = 0,
  intensity = 10
}: FloatingElementProps) {
  return (
    <motion.div
      className={cn("inline-block", className)}
      animate={{
        y: [0, -intensity, 0],
        rotateZ: [0, 1, 0, -1, 0]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface PulseGlowProps {
  children: React.ReactNode
  className?: string
  color?: "blue" | "purple" | "green" | "pink"
}

export function PulseGlow({ children, className, color = "blue" }: PulseGlowProps) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    pink: "from-pink-500 to-rose-500"
  }

  return (
    <motion.div
      className={cn("relative", className)}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        className={cn(
          "absolute inset-0 rounded-lg bg-gradient-to-r opacity-20 blur-xl",
          colorClasses[color]
        )}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      {children}
    </motion.div>
  )
}