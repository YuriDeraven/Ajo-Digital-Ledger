"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
}

interface ParticleEffectsProps {
  trigger?: boolean
  type?: "success" | "error" | "celebration" | "floating"
  count?: number
}

export function ParticleEffects({ 
  trigger = false, 
  type = "celebration", 
  count = 20 
}: ParticleEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (trigger) {
      const colors = type === "success" 
        ? ["#10b981", "#34d399", "#6ee7b7"]
        : type === "error"
        ? ["#ef4444", "#f87171", "#fca5a5"]
        : type === "celebration"
        ? ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
        : ["#8b5cf6", "#3b82f6", "#06b6d4"]

      const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 2 + 1
      }))

      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [trigger, type, count])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
            }}
            initial={{ 
              scale: 0, 
              opacity: 1,
              rotate: 0
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
              rotate: [0, 180, 360],
              y: [0, -100, -200]
            }}
            exit={{ 
              scale: 0, 
              opacity: 0 
            }}
            transition={{ 
              duration: particle.duration,
              ease: "easeOut"
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ConfettiProps {
  trigger?: boolean
  duration?: number
}

export function Confetti({ trigger = false, duration = 3000 }: ConfettiProps) {
  const [confettiPieces, setConfettiPieces] = useState<Array<{
    id: number
    x: number
    rotation: number
    color: string
    delay: number
  }>>([])

  useEffect(() => {
    if (trigger) {
      const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5
      }))

      setConfettiPieces(pieces)

      const timer = setTimeout(() => {
        setConfettiPieces([])
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [trigger, duration])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {confettiPieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute w-2 h-3"
            style={{
              left: `${piece.x}%`,
              top: "-20px",
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
            }}
            initial={{ 
              y: -20,
              rotate: 0,
              opacity: 1
            }}
            animate={{ 
              y: window.innerHeight + 20,
              rotate: piece.rotation + 720,
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 3,
              delay: piece.delay,
              ease: "linear"
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface SparkleProps {
  children: React.ReactNode
  trigger?: boolean
}

export function Sparkle({ children, trigger = false }: SparkleProps) {
  const [sparkles, setSparkles] = useState<Array<{
    id: number
    x: number
    y: number
  }>>([])

  useEffect(() => {
    if (trigger) {
      const newSparkles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
      }))

      setSparkles(newSparkles)

      const timer = setTimeout(() => {
        setSparkles([])
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [trigger])

  return (
    <div className="relative inline-block">
      {children}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              x: sparkle.x,
              y: sparkle.y,
            }}
            initial={{ 
              scale: 0,
              opacity: 1
            }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [1, 1, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut"
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}