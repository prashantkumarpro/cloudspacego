'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { usePlusActions } from '@/hooks/use-plus-actions'

export function MobilePlusButton() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggle = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)

  const { actions, hiddenInputs } = usePlusActions(close)

  // Close on outside click or escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      {hiddenInputs}

      {/* Backdrop overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] md:hidden transition-opacity duration-200 ease-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden='true'
      />

      {/* Speed Dial Container at bottom right, positioned above bottom navigation */}
      <div
        ref={containerRef}
        className='fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] z-40 md:hidden flex flex-col items-end'
      >
        {/* Actions speed-dial expanding vertically above the FAB */}
        <div
          className={`flex flex-col items-end gap-2 mb-2 -mr-1 transition-all duration-200 ease-out origin-bottom-right ${
            isOpen
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
          }`}
          role='menu'
          aria-orientation='vertical'
        >
          {actions.map((action, index) => {
            const Icon = action.icon
            // Calculate bottom-up stagger delay (closer to FAB expands first)
            const staggerDelay = isOpen
              ? (actions.length - 1 - index) * 35
              : index * 25

            return (
              <button
                key={action.id}
                onClick={action.onClick}
                style={{
                  transitionDelay: `${staggerDelay}ms`,
                }}
                className={`w-[188px] h-[50px] px-5 flex items-center gap-3.5 rounded-full bg-white dark:bg-[#13131A] text-foreground border border-black/[0.05] dark:border-white/[0.07] shadow-[0_3px_10px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:bg-[#FAF9FF] dark:hover:bg-[#1C1C26] hover:border-[#6E60EE]/30 active:scale-[0.97] transition-all duration-200 ease-out text-sm font-semibold cursor-pointer select-none text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE] focus-visible:ring-offset-2 ${
                  isOpen
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 translate-y-2 scale-90 pointer-events-none'
                }`}
                role='menuitem'
              >
                <Icon className='w-5 h-5 text-[#6E60EE] shrink-0' strokeWidth={2.2} />
                <span className='truncate'>{action.label}</span>
              </button>
            )
          })}
        </div>

        {/* Floating Action Button (FAB) */}
        <button
          onClick={toggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close actions menu' : 'Open actions menu'}
          className='w-[50px] h-[50px] rounded-full bg-[#6E60EE] hover:bg-[#6052E6] active:scale-95 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(110,96,238,0.4)] hover:shadow-[0_8px_24px_rgba(110,96,238,0.5)] transition-all duration-200 ease-out cursor-pointer focus:outline-none'
        >
          <div className='relative w-5 h-5 flex items-center justify-center'>
            <Plus
              className={`w-5 h-5 text-white absolute transition-all duration-200 ease-out ${
                isOpen ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
              }`}
              strokeWidth={2.5}
            />
            <X
              className={`w-5 h-5 text-white absolute transition-all duration-200 ease-out ${
                isOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-75'
              }`}
              strokeWidth={2.5}
            />
          </div>
        </button>
      </div>
    </>
  )
}
