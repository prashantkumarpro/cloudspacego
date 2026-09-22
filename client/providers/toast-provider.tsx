'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Toast, ToastItem, ToastAction, ToastType } from '@/components/ui/toast'

interface ToastOptions {
  title: string
  description?: string
  type?: ToastType
  action?: ToastAction
  duration?: number
}

interface ToastContextType {
  toasts: ToastItem[]
  show: (options: ToastOptions) => string
  success: (title: string, description?: string, action?: ToastAction) => string
  error: (title: string, description?: string, action?: ToastAction) => string
  info: (title: string, description?: string, action?: ToastAction) => string
  warning: (title: string, description?: string, action?: ToastAction) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const show = useCallback(
    ({ title, description, type = 'success', action, duration = 4000 }: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const newToast: ToastItem = {
        id,
        title,
        description,
        type,
        action,
        duration
      }

      setToasts(prev => [...prev.slice(-3), newToast]) // Keep at most 4 active toasts

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }

      return id
    },
    [dismiss]
  )

  const success = useCallback(
    (title: string, description?: string, action?: ToastAction) => {
      return show({ title, description, type: 'success', action })
    },
    [show]
  )

  const error = useCallback(
    (title: string, description?: string, action?: ToastAction) => {
      return show({ title, description, type: 'error', action, duration: 5000 })
    },
    [show]
  )

  const info = useCallback(
    (title: string, description?: string, action?: ToastAction) => {
      return show({ title, description, type: 'info', action })
    },
    [show]
  )

  const warning = useCallback(
    (title: string, description?: string, action?: ToastAction) => {
      return show({ title, description, type: 'warning', action })
    },
    [show]
  )

  return (
    <ToastContext.Provider value={{ toasts, show, success, error, info, warning, dismiss }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-32px)] sm:max-w-md w-full"
      >
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
