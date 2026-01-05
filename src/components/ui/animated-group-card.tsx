"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Calendar, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface SavingsGroup {
  id: string
  name: string
  description?: string
  inviteCode: string
  createdBy: string
  createdAt: string
  _count: {
    members: number
    transactions: number
  }
  balance: number
}

interface AnimatedGroupCardProps {
  group: SavingsGroup
  isSelected: boolean
  onClick: () => void
  index: number
}

export function AnimatedGroupCard({ group, isSelected, onClick, index }: AnimatedGroupCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
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
      whileTap={{ scale: 0.98 }}
      style={{
        transformStyle: "preserve-3d"
      }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={cn(
        "relative overflow-hidden backdrop-blur-sm transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.02]",
        isSelected 
          ? "bg-gradient-to-r from-blue-50/90 to-purple-50/90 border-blue-300/50 shadow-lg ring-2 ring-blue-400/30" 
          : "bg-white/80 border-gray-200/50 hover:bg-white/90"
      )}>
        {/* Animated background gradient */}
        <motion.div
          className={cn(
            "absolute inset-0 opacity-5",
            isSelected 
              ? "bg-gradient-to-r from-blue-400 to-purple-400" 
              : "bg-gradient-to-r from-gray-400 to-gray-500"
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
          />
        )}
        
        <CardContent className="p-4 relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <motion.h3 
                className="font-semibold text-gray-900 mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.1 }}
              >
                {group.name}
              </motion.h3>
              {group.description && (
                <motion.p 
                  className="text-sm text-gray-600 line-clamp-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {group.description}
                </motion.p>
              )}
            </div>
            
            <motion.button
              className="p-1 rounded-lg hover:bg-gray-100/50 transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </motion.button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            {/* Balance */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <motion.div
                className="text-lg font-bold text-green-600"
                animate={isSelected ? {
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: isSelected ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                ${group.balance.toFixed(2)}
              </motion.div>
              <div className="text-xs text-gray-500">Balance</div>
            </motion.div>
            
            {/* Members */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.4 }}
            >
              <div className="flex items-center justify-center gap-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-lg font-semibold text-blue-600">
                  {group._count.members}
                </span>
              </div>
              <div className="text-xs text-gray-500">Members</div>
            </motion.div>
            
            {/* Transactions */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-lg font-semibold text-purple-600">
                  {group._count.transactions}
                </span>
              </div>
              <div className="text-xs text-gray-500">Transactions</div>
            </motion.div>
          </div>
          
          {/* Invite code and date */}
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.6 }}
            >
              <Badge variant="outline" className="text-xs">
                {group.inviteCode}
              </Badge>
            </motion.div>
            <motion.div
              className="flex items-center gap-1 text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.7 }}
            >
              <Calendar className="h-3 w-3" />
              {new Date(group.createdAt).toLocaleDateString()}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}