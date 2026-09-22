'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { Tooltip } from './tooltip'

export interface ActionMenuItem {
  label: string
  onClick: () => void
  icon: React.ReactNode
  danger?: boolean
}

interface ActionMenuProps {
  items: ActionMenuItem[]
  className?: string
  triggerClassName?: string
  align?: 'left' | 'right'
  placement?: 'top' | 'bottom' | 'right' | 'bottom-right' | 'bottom-left'
  onOpenChange?: (isOpen: boolean) => void
}

export function ActionMenu ({ items, className, triggerClassName, align = 'right', placement = 'bottom', onOpenChange }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    const nextState = !isOpen
    setIsOpen(nextState)
    if (onOpenChange) {
      onOpenChange(nextState)
    }
  }

  const close = () => {
    setIsOpen(false)
    if (onOpenChange) {
      onOpenChange(false)
    }
  }

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      {/* Three-dots trigger button */}
      <Tooltip content="More actions" side="top">
        <button
          onClick={toggle}
          className={cn(
            'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-card-bg hover:bg-input-bg active:bg-[#6E60EE]/10 border border-card-border text-text-secondary hover:text-foreground active:text-[#6E60EE] active:border-[#6E60EE]/30 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-card-bg shrink-0 shadow-xs',
            isOpen && 'border-[#6E60EE]/40 text-[#6E60EE] bg-[#6E60EE]/10',
            triggerClassName
          )}
          aria-label='More actions'
          aria-expanded={isOpen}
        >
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
            <circle cx='12' cy='5' r='1.75' />
            <circle cx='12' cy='12' r='1.75' />
            <circle cx='12' cy='19' r='1.75' />
          </svg>
        </button>
      </Tooltip>

      {/* Context menu dropdown overlay */}
      {isOpen && (
        <div
          className={cn(
            'absolute w-48 bg-card-bg rounded-xl shadow-lg border border-card-border py-1.5 z-50 divide-y divide-card-border/40',
            placement === 'top' && 'bottom-9 right-0 animate-in fade-in slide-in-from-bottom-2 duration-150',
            placement === 'bottom' && 'top-8.5 right-0 animate-in fade-in slide-in-from-top-2 duration-150',
            placement === 'right' && 'left-full top-0 ml-2.5 animate-in fade-in slide-in-from-left-2 duration-150',
            placement === 'bottom-right' && 'right-0 top-8.5 animate-in fade-in slide-in-from-top-2 duration-150',
            placement === 'bottom-left' && 'left-0 top-8.5 animate-in fade-in slide-in-from-top-2 duration-150'
          )}
        >
          <div className='py-0.5'>
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick()
                  close()
                }}
                className={cn(
                  'w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer focus:outline-none rounded-lg mx-1 w-[calc(100%-8px)]',
                  item.danger
                    ? 'text-rose-500 hover:bg-rose-500/10'
                    : 'text-text-secondary hover:text-foreground hover:bg-input-bg'
                )}
              >
                <span className={item.danger ? 'text-rose-500' : 'text-text-secondary'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
