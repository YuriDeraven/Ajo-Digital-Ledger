"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: "green" | "blue" | "purple" | "orange"
  delay: number
}

function StatCard({ title, value, change, icon, color, delay }: StatCardProps) {
  const colorClasses = {
    green: "from-green-500 to-emerald-500",
    blue: "from-blue-500 to-cyan-500", 
    purple: "from-purple-500 to-pink-500",
    orange: "from-orange-500 to-red-500"
  }

  const bgClasses = {
    green: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200", 
    orange: "bg-orange-50 border-orange-200"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.05,
        rotateY: 5,
        rotateX: 5,
        z: 50,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      <Card className={cn(
        "relative overflow-hidden border-2 transition-all duration-300",
        "hover:shadow-2xl hover:scale-105",
        bgClasses[color]
      )}>
        {/* Animated gradient background */}
        <motion.div
          className={cn(
            "absolute inset-0 opacity-10 bg-gradient-to-br",
            colorClasses[color]
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={cn(
                "p-3 rounded-full bg-gradient-to-r text-white",
                colorClasses[color]
              )}
            >
              {icon}
            </motion.div>
            
            {change !== undefined && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.3 }}
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-semibold",
                  change > 0 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                )}
              >
                {change > 0 ? "+" : ""}{change}%
              </motion.div>
            )}
          </div>
          
          <div className="mt-4">
            <motion.p 
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2 }}
            >
              {value}
            </motion.p>
            <motion.p 
              className="text-sm text-gray-600 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.4 }}
            >
              {title}
            </motion.p>
          </div>
          
          {/* Floating particles */}
          <motion.div
            className="absolute top-2 right-2 w-1 h-1 bg-current rounded-full opacity-30"
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-2 left-2 w-1 h-1 bg-current rounded-full opacity-30"
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface InteractiveStatsProps {
  totalBalance: number
  totalMembers: number
  totalTransactions: number
  monthlyGrowth?: number
}

export function InteractiveStats({ 
  totalBalance, 
  totalMembers, 
  totalTransactions, 
  monthlyGrowth = 12 
}: InteractiveStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Balance"
        value={`$${totalBalance.toFixed(2)}`}
        change={monthlyGrowth}
        icon={<DollarSign className="h-6 w-6" />}
        color="green"
        delay={0}
      />
      
      <StatCard
        title="Total Members"
        value={totalMembers}
        change={8}
        icon={<Users className="h-6 w-6" />}
        color="blue"
        delay={0.1}
      />
      
      <StatCard
        title="Transactions"
        value={totalTransactions}
        change={15}
        icon={<Activity className="h-6 w-6" />}
        color="purple"
        delay={0.2}
      />
      
      <StatCard
        title="Growth Rate"
        value={`${monthlyGrowth}%`}
        change={monthlyGrowth}
        icon={<TrendingUp className="h-6 w-6" />}
        color="orange"
        delay={0.3}
      />
    </div>
  )
}