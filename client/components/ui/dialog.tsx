'use client'

import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils/cn'

export type DialogSize = 'sm' | 'md' | 'lg'

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  size?: DialogSize
  maxWidth?: string
  headerDivider?: boolean
  icon?: React.ReactNode
}

const SIZE_MAP: Record<DialogSize, string> = {
  sm: 'max-w-[380px] sm:max-w-[400px]',
  md: 'max-w-[440px] sm:max-w-[460px]',
  lg: 'max-w-[500px] sm:max-w-[540px]',
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
  size = 'md',
  maxWidth,
  headerDivider = false,
  icon,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const resolvedWidth = maxWidth || SIZE_MAP[size] || SIZE_MAP.md

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/75 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Card Surface */}
      <div
        ref={dialogRef}
        className={cn(
          "relative z-10 w-full bg-card-bg border border-card-border rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/5 dark:shadow-2xl dark:shadow-black/40 transition-all duration-150 flex flex-col text-foreground animate-in fade-in zoom-in-95 duration-150",
          resolvedWidth,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton || icon) && (
          <div className={cn(
            "flex items-start justify-between gap-3 mb-3.5",
            headerDivider && "pb-3 border-b border-card-border/60"
          )}>
            <div className="flex items-start gap-2.5 min-w-0 pr-2">
              {icon && (
                <div className="shrink-0 mt-0.5">
                  {icon}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                {title && (
                  <h3
                    id="dialog-title"
                    className="text-sm sm:text-base font-bold text-foreground tracking-tight leading-snug"
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p
                    id="dialog-description"
                    className="text-xs text-text-secondary mt-0.5 leading-normal"
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-foreground hover:bg-input-bg transition-colors cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50 active:scale-95 -mr-1 -mt-1"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="w-full text-foreground text-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
