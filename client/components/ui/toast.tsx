'use client'

import React from 'react'
import { Check, AlertCircle, Info, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  title: string
  description?: string
  type?: ToastType
  action?: ToastAction
  duration?: number
}

export interface ToastProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return (
          <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        )
      case 'info':
        return (
          <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        )
      case 'warning':
        return (
          <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        )
      case 'success':
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
        )
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto bg-card-bg border border-card-border rounded-xl shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/50 p-3 sm:p-3.5 flex items-center justify-between gap-3 text-foreground transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in duration-200 select-none w-full"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {getIcon()}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold text-foreground truncate">
            {toast.title}
          </span>
          {toast.description && (
            <p className="text-[11px] text-text-secondary mt-0.5 leading-snug truncate">
              {toast.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-1">
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick()
              onDismiss(toast.id)
            }}
            className="text-xs font-bold text-[#6E60EE] hover:text-[#5B4EE0] bg-[#6E60EE]/10 hover:bg-[#6E60EE]/20 px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 active:scale-95 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#6E60EE]"
          >
            {toast.action.label}
          </button>
        )}

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-foreground hover:bg-input-bg transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
