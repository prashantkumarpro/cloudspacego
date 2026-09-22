'use client'

import React from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/cn'

export interface ViewToggleProps {
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  className?: string
  gridTooltip?: string
  listTooltip?: string
}

export function ViewToggle({
  viewMode,
  onViewModeChange,
  className,
  gridTooltip = 'Grid view',
  listTooltip = 'List view'
}: ViewToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 bg-input-bg p-1 border border-card-border rounded-xl shrink-0 select-none',
        className
      )}
      role='group'
      aria-label='View mode selector'
    >
      <Tooltip content={gridTooltip} side='top'>
        <button
          type='button'
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50 active:scale-95',
            viewMode === 'grid'
              ? 'bg-card-bg text-[#6E60EE] shadow-xs border border-card-border/60'
              : 'text-text-secondary hover:text-foreground hover:bg-card-bg/50'
          )}
          aria-label='Grid view'
          aria-pressed={viewMode === 'grid'}
        >
          <LayoutGrid
            className='w-4 h-4'
            strokeWidth={viewMode === 'grid' ? 2.2 : 1.8}
          />
        </button>
      </Tooltip>

      <Tooltip content={listTooltip} side='top'>
        <button
          type='button'
          onClick={() => onViewModeChange('list')}
          className={cn(
            'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50 active:scale-95',
            viewMode === 'list'
              ? 'bg-card-bg text-[#6E60EE] shadow-xs border border-card-border/60'
              : 'text-text-secondary hover:text-foreground hover:bg-card-bg/50'
          )}
          aria-label='List view'
          aria-pressed={viewMode === 'list'}
        >
          <List
            className='w-4 h-4'
            strokeWidth={viewMode === 'list' ? 2.2 : 1.8}
          />
        </button>
      </Tooltip>
    </div>
  )
}
