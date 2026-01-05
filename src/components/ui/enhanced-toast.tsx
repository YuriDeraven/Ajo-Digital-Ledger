"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { useState, useEffect } from "react"

interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

function ToastComponent({ toast, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const duration = toast.duration || 5000
    const interval = 50
    const decrement = (100 / duration) * interval

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          onClose(toast.id)
          return 0
        }
        return prev - decrement
      })
    }, interval)

    return () => clearInterval(timer)
  }, [toast.id, toast.duration, onClose])

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  }

  const colors = {
    success: "border-green-200 bg-green-50",
    error: "border-red-200 bg-red-50",
    warning: "border-yellow-200 bg-yellow-50",
    info: "border-blue-200 bg-blue-50"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative p-4 rounded-lg border shadow-lg backdrop-blur-sm ${colors[toast.type]} min-w-[300px] max-w-md`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          {icons[toast.type]}
        </motion.div>
        <div className="flex-1">
          <motion.h4 
            className="font-semibold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {toast.title}
          </motion.h4>
          {toast.message && (
            <motion.p 
              className="text-sm text-gray-600 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {toast.message}
            </motion.p>
          )}
        </div>
        <motion.button
          onClick={() => onClose(toast.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
      
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gray-300 rounded-b-lg overflow-hidden"
        initial={{ width: "100%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.05, ease: "linear" }}
      >
        <motion.div
          className={`h-full ${
            toast.type === "success" ? "bg-green-500" :
            toast.type === "error" ? "bg-red-500" :
            toast.type === "warning" ? "bg-yellow-500" :
            "bg-blue-500"
          }`}
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  useEffect(() => {
    // Global toast function
    (window as any).toast = addToast
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for using toasts
export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    ;(window as any).toast?.({ ...toast, id })
  }

  return {
    success: (title: string, message?: string) => 
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => 
      addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => 
      addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => 
      addToast({ type: 'info', title, message }),
  }
}