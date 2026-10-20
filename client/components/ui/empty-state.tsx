'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'
import { Button, type ButtonProps } from './button'
import type { LucideIcon } from 'lucide-react'

export interface EmptyStateAction {
  label: string
  onClick?: () => void
  icon?: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode
  variant?: ButtonProps['variant']
  disabled?: boolean
  className?: string
  extraNode?: React.ReactNode
}

export interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode
  title: string
  description?: string
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  actions?: React.ReactNode
  className?: string
  iconClassName?: string
}

function isReactComponent(val: unknown): val is React.ComponentType<{ className?: string }> {
  if (!val) return false
  if (typeof val === 'function') return true
  if (typeof val === 'object' && val !== null && '$$typeof' in val) {
    return true
  }
  return false
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  actions,
  className,
  iconClassName
}: EmptyStateProps) {
  const renderAction = (action: EmptyStateAction, defaultVariant: ButtonProps['variant']) => {
    const renderActionIcon = () => {
      if (!action.icon) return null
      if (React.isValidElement(action.icon)) return action.icon
      if (isReactComponent(action.icon)) {
        const IconComponent = action.icon
        return <IconComponent className='w-3.5 h-3.5 shrink-0' />
      }
      return null
    }

    return (
      <React.Fragment key={action.label}>
        <Button
          type='button'
          variant={action.variant || defaultVariant}
          size='sm'
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            action.variant === 'primary' || (!action.variant && defaultVariant === 'primary')
              ? 'h-8.5 px-3.5 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs flex items-center gap-1.5'
              : 'h-8.5 px-3.5 text-xs font-semibold bg-input-bg text-foreground hover:bg-divider border border-card-border flex items-center gap-1.5',
            action.className
          )}
        >
          {renderActionIcon()}
          <span>{action.label}</span>
        </Button>
        {action.extraNode}
      </React.Fragment>
    )
  }

  const renderIcon = () => {
    if (!Icon) return null
    if (React.isValidElement(Icon)) return Icon
    if (isReactComponent(Icon)) {
      const IconComponent = Icon
      return <IconComponent className={cn('w-6 h-6 text-text-secondary', iconClassName)} />
    }
    return null
  }

  return (
    <div
      className={cn(
        'w-full py-12 px-4 sm:px-6 flex flex-col items-center justify-center text-center select-none bg-card-bg border border-card-border rounded-xl shadow-xs transition-colors',
        className
      )}
    >
      {Icon && (
        <div className='w-12 h-12 rounded-xl bg-input-bg border border-card-border/60 flex items-center justify-center text-text-muted mb-3 shrink-0'>
          {renderIcon()}
        </div>
      )}

      <h4 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
        {title}
      </h4>

      {description && (
        <p className='text-xs text-text-secondary mt-1.5 max-w-[320px] leading-relaxed font-normal'>
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction || actions) && (
        <div className='mt-4 flex flex-wrap items-center justify-center gap-2.5'>
          {primaryAction && renderAction(primaryAction, 'primary')}
          {secondaryAction && renderAction(secondaryAction, 'soft')}
          {actions}
        </div>
      )}
    </div>
  )
}
