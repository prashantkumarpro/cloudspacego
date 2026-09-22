'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'

export interface SectionActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export const SectionAction = React.forwardRef<
  HTMLButtonElement,
  SectionActionProps
>(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type='button'
      className={cn(
        'inline-flex items-center justify-center font-medium text-xs text-[#6E60EE] dark:text-[#8E82F8] hover:text-[#5B4EE0] dark:hover:text-[#A499FA] hover:bg-[#6E60EE]/10 dark:hover:bg-[#6E60EE]/15 px-2.5 py-1 rounded-lg border-none bg-transparent transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/40 select-none active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

SectionAction.displayName = 'SectionAction'
