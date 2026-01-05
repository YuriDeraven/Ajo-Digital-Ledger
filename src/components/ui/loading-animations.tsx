"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  lines?: number
  height?: string
}

export function LoadingSkeleton({ className, lines = 3, height = "h-4" }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(height, "bg-gray-200 rounded-lg")}
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

interface StaggeredChildrenProps {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
}

export function StaggeredChildren({ 
  children, 
  className, 
  staggerDelay = 0.1 
}: StaggeredChildrenProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: index * staggerDelay 
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

interface SlideInProps {
  children: React.ReactNode
  direction?: "left" | "right" | "up" | "down"
  delay?: number
  duration?: number
  className?: string
}

export function SlideIn({ 
  children, 
  direction = "up", 
  delay = 0,
  duration = 0.5,
  className 
}: SlideInProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "left": return { x: -50, opacity: 0 }
      case "right": return { x: 50, opacity: 0 }
      case "up": return { y: 50, opacity: 0 }
      case "down": return { y: -50, opacity: 0 }
      default: return { y: 50, opacity: 0 }
    }
  }

  return (
    <motion.div
      className={className}
      initial={getInitialPosition()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  )
}