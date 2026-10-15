'use client'

import React from 'react'
import { Folder, Star, Eye, Edit3, Share2, FolderInput, Trash2, Info } from 'lucide-react'
import { ActionMenu, ActionMenuItem } from '@/components/ui/action-menu'
import { cn } from '@/lib/utils/cn'

export interface FolderCardProps {
  id: string
  name: string
  itemsCountText?: string
  starred?: boolean
  isOptimistic?: boolean
  onClick?: () => void
  onRename?: () => void
  onShare?: () => void
  onToggleStar?: () => void
  onMove?: () => void
  onDetails?: () => void
  onDelete?: () => void
  customActions?: ActionMenuItem[]
  className?: string
}

export function FolderCard({
  id: _id,
  name,
  itemsCountText,
  starred = false,
  isOptimistic = false,
  onClick,
  onRename,
  onShare,
  onToggleStar,
  onMove,
  onDetails,
  onDelete,
  customActions,
  className,
}: FolderCardProps) {
  const defaultActions: ActionMenuItem[] = [
    ...(onClick ? [{
      label: 'Open',
      onClick,
      icon: <Eye className='w-4 h-4 text-text-secondary' />
    }] : []),
    ...(onDetails ? [{
      label: 'Details',
      onClick: onDetails,
      icon: <Info className='w-4 h-4 text-text-secondary' />
    }] : []),
    ...(onRename ? [{
      label: 'Rename',
      onClick: onRename,
      icon: <Edit3 className='w-4 h-4 text-text-secondary' />
    }] : []),
    ...(onShare ? [{
      label: 'Share',
      onClick: onShare,
      icon: <Share2 className='w-4 h-4 text-text-secondary' />
    }] : []),
    ...(onToggleStar ? [{
      label: starred ? 'Unstar' : 'Star',
      onClick: onToggleStar,
      icon: <Star className='w-4 h-4 text-text-secondary' />
    }] : []),
    ...(onMove ? [{
      label: 'Move',
      onClick: onMove,
      icon: <FolderInput className='w-4 h-4 text-text-secondary' />
    }] : []),
    ...(onDelete ? [{
      label: 'Delete',
      onClick: onDelete,
      icon: <Trash2 className='w-4 h-4 text-rose-500' />,
      danger: true
    }] : [])
  ]

  const actions = customActions || defaultActions

  const handleCardClick = (e: React.MouseEvent) => {
    if (isOptimistic) {
      e.stopPropagation()
      return
    }
    onClick?.()
  }

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'flex items-center justify-between p-3 sm:p-3.5 bg-card-bg rounded-xl border border-card-border hover:bg-input-bg/40 shadow-xs transition-all duration-200 cursor-pointer group relative min-w-0 select-none',
        isOptimistic && 'opacity-80 cursor-wait bg-input-bg/20 border-dashed border-[#6E60EE]/40',
        className
      )}
    >
      <div className='flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-2'>
        <Folder
          className={cn(
            'w-6 h-6 sm:w-7 sm:h-7 text-[#6E60EE] shrink-0',
            isOptimistic && 'animate-pulse text-[#6E60EE]/70'
          )}
        />
        <div className='flex flex-col min-w-0 flex-1'>
          <div className='flex items-center gap-1.5 min-w-0'>
            <span
              className='text-[13px] sm:text-sm font-semibold text-foreground truncate group-hover:text-[#6E60EE] transition-colors duration-200'
              title={name}
            >
              {name}
            </span>
            {isOptimistic && (
              <span className='inline-flex items-center text-[10px] font-medium text-text-secondary bg-input-bg px-1.5 py-0.5 rounded-md shrink-0 border border-card-border/60'>
                Creating...
              </span>
            )}
          </div>
          {itemsCountText && (
            <span className='text-[11px] sm:text-xs font-normal text-text-secondary truncate mt-0.5'>
              {itemsCountText}
            </span>
          )}
        </div>
      </div>
      <div className='flex items-center gap-1.5 shrink-0 -mr-1' onClick={e => e.stopPropagation()}>
        {starred && (
          <Star className='w-4 h-4 text-[#6E60EE] fill-[#6E60EE]' />
        )}
        {!isOptimistic && (
          <ActionMenu
            placement='bottom-right'
            items={actions}
          />
        )}
      </div>
    </div>
  )
}
