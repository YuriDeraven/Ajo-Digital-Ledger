"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GradientBackgroundProps {
  children: React.ReactNode
  className?: string
}

export function GradientBackground({ children, className }: GradientBackgroundProps) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden", className)}>
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
            "linear-gradient(135deg, #4facfe 0%, #667eea 25%, #764ba2 50%, #f093fb 75%, #f5576c 100%)",
            "linear-gradient(135deg, #f5576c 0%, #4facfe 25%, #667eea 50%, #764ba2 75%, #f093fb 100%)",
            "linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #667eea 75%, #764ba2 100%)",
            "linear-gradient(135deg, #764ba2 0%, #f093fb 25%, #f5576c 50%, #4facfe 75%, #667eea 100%)",
            "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)"
          ]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ opacity: 0.1 }}
      />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl",
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent",
        className
      )}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}