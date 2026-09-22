import React from 'react'

import { cn } from '../../lib/utils/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  startIcon?: React.ReactNode
  endAction?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = 'text', label, error, startIcon, endAction, ...props },
    ref
  ) => {
    return (
      <div className='w-full flex flex-col gap-1.5'>
        {label && (
          <label className='text-xs font-semibold text-text-secondary select-none'>
            {label}
          </label>
        )}

        <div className='relative'>
          {startIcon && (
            <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted'>
              {startIcon}
            </span>
          )}

          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full h-10 bg-input-bg text-foreground rounded-lg px-3.5 py-2 text-sm font-normal placeholder:text-text-muted border border-card-border transition-all duration-200 focus:bg-card-bg focus:border-[#6E60EE]/60 focus:outline-none focus:ring-2 focus:ring-[#6E60EE]/20 disabled:opacity-50 disabled:cursor-not-allowed',
              startIcon ? 'pl-10' : '',
              endAction ? 'pr-10' : '',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : '',
              className
            )}
            {...props}
          />

          {endAction && (
            <div className='absolute right-3.5 top-1/2 -translate-y-1/2'>
              {endAction}
            </div>
          )}
        </div>

        {error && (
          <span className='text-[11px] font-medium text-red-500'>
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

