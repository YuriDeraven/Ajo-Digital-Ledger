"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  delay?: number
}

export function AnimatedCard({ children, className, hover = true, glow = false, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? {
        y: -8,
        scale: 1.02,
        rotateX: 5,
        rotateY: 5,
        transition: { duration: 0.3 }
      } : {}}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
      className={cn(
        "relative",
        glow && "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-blue-500/20 before:to-purple-500/20 before:blur-xl before:-z-10",
        className
      )}
    >
      <Card className={cn(
        "backdrop-blur-sm bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300",
        "hover:bg-white/90",
        "relative overflow-hidden"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        {children}
      </Card>
    </motion.div>
  )
}