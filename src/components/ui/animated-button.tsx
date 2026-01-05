"use client"

import { motion } from "framer-motion"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface AnimatedButtonProps extends ButtonProps {
  loading?: boolean
  children: React.ReactNode
  ripple?: boolean
}

export function AnimatedButton({ 
  loading = false, 
  ripple = true, 
  children, 
  className, 
  disabled,
  ...props 
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        className={cn(
          "relative overflow-hidden group",
          "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
          "text-white font-semibold shadow-lg hover:shadow-xl",
          "transition-all duration-300",
          ripple && "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        <motion.div
          className="flex items-center gap-2"
          animate={loading ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {children}
        </motion.div>
        
        {ripple && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
        )}
      </Button>
    </motion.div>
  )
}