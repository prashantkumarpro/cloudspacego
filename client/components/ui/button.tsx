import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'soft' | 'outline' | 'icon' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-card-bg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]',

          // Size mappings
          variant !== 'icon' && {
            'px-3.5 h-9 text-xs': size === 'sm',
            'px-4 h-10 text-sm': size === 'md',
            'px-5 h-11 text-sm': size === 'lg'
          },

          // Variant mappings
          {
            // Primary
            'bg-[#6E60EE] text-white hover:bg-[#6052E6] shadow-xs':
              variant === 'primary',

            // Soft
            'bg-input-bg text-foreground hover:bg-divider border border-card-border':
              variant === 'soft',

            // Outline
            'bg-transparent text-foreground border border-card-border hover:bg-input-bg':
              variant === 'outline',

            // Ghost
            'bg-transparent text-text-secondary hover:text-foreground hover:bg-input-bg':
              variant === 'ghost',

            // Icon
            'rounded-full bg-card-bg text-foreground border border-card-border hover:bg-input-bg w-10 h-10 p-0 flex items-center justify-center':
              variant === 'icon',

            // Danger
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger'
          },

          // Shape: Standard buttons: 8–10px (rounded-lg), Icon buttons: circular
          variant !== 'icon' ? 'rounded-lg' : 'rounded-full',

          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

