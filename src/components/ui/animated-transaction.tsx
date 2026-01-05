"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDownCircle, ArrowUpCircle, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  amount: number
  type: "CONTRIBUTION" | "PAYOUT"
  description?: string
  createdAt: string
  user: {
    name?: string
    email: string
  }
}

interface AnimatedTransactionProps {
  transaction: Transaction
  index: number
}

export function AnimatedTransaction({ transaction, index }: AnimatedTransactionProps) {
  const isContribution = transaction.type === 'CONTRIBUTION'
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.02,
        translateZ: 20,
        transition: { duration: 0.2 }
      }}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      <Card className={cn(
        "relative overflow-hidden backdrop-blur-sm transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.02]",
        isContribution 
          ? "bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200/50" 
          : "bg-gradient-to-r from-red-50/80 to-rose-50/80 border-red-200/50"
      )}>
        {/* Animated background effect */}
        <motion.div
          className={cn(
            "absolute inset-0 opacity-10",
            isContribution 
              ? "bg-gradient-to-r from-green-400 to-emerald-400" 
              : "bg-gradient-to-r from-red-400 to-rose-400"
          )}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <CardContent className="p-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Animated icon */}
              <motion.div
                className={cn(
                  "p-3 rounded-full",
                  isContribution 
                    ? "bg-green-100 text-green-600" 
                    : "bg-red-100 text-red-600"
                )}
                whileHover={{ 
                  rotate: 360,
                  scale: 1.1,
                  transition: { duration: 0.6 }
                }}
                whileTap={{ scale: 0.9 }}
              >
                {isContribution ? (
                  <ArrowDownCircle className="h-5 w-5" />
                ) : (
                  <ArrowUpCircle className="h-5 w-5" />
                )}
              </motion.div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <Badge variant="secondary" className="text-xs">
                      {transaction.user.name || transaction.user.email}
                    </Badge>
                  </motion.div>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {transaction.description || transaction.type.toLowerCase()}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {/* Amount with animation */}
            <motion.div 
              className="text-right"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.1 + 0.3,
                type: "spring",
                stiffness: 200
              }}
            >
              <p className={cn(
                "font-bold text-lg",
                isContribution ? "text-green-600" : "text-red-600"
              )}>
                {isContribution ? '+' : '-'}${transaction.amount.toFixed(2)}
              </p>
              <motion.div
                className={cn(
                  "text-xs px-2 py-1 rounded-full inline-block mt-1",
                  isContribution 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                )}
                whileHover={{ scale: 1.05 }}
              >
                {transaction.type}
              </motion.div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}