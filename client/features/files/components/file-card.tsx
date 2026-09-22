'use client'

import React from 'react'
import { FileThumbnail } from './file-thumbnail'
import { ActionMenu, ActionMenuItem } from '@/components/ui/action-menu'
import { formatBytes, formatDate } from '@/lib/utils/format'
import { Eye, Download, Share2, Edit3, Star, Trash2, RotateCcw, Trash, FolderInput, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { UnifiedFileItem } from './file-list'

export interface FileCardProps {
  file: UnifiedFileItem
  onClick?: () => void
  onDownload?: () => void
  onShare?: () => void
  onRename?: () => void
  onMove?: () => void
  onDetails?: () => void
  onToggleStar?: () => void
  onDelete?: () => void
  onRestore?: () => void
  onDeletePermanently?: () => void
  isTrash?: boolean
  customActions?: ActionMenuItem[]
  className?: string
}

// Helper to format clean, useful metadata string (e.g. "PNG • 2.4 MB" or "PDF • 1.2 MB")
function getFileMetadata(file: UnifiedFileItem): string {
  const ext = (file.extension || file.name.split('.').pop() || file.type || 'FILE')
    .replace('.', '')
    .toUpperCase()

  const hasSize = typeof file.size === 'number' && file.size > 0
  const sizeFormatted = hasSize ? formatBytes(file.size!) : null
  const dateFormatted = file.updatedAt || file.createdAt ? formatDate(file.updatedAt || file.createdAt!) : null

  if (sizeFormatted) {
    return `${ext} • ${sizeFormatted}`
  }

  if (dateFormatted) {
    return `${ext} • ${dateFormatted}`
  }

  return ext
}

export function FileCard({
  file,
  onClick,
  onDownload,
  onShare,
  onRename,
  onMove,
  onDetails,
  onToggleStar,
  onDelete,
  onRestore,
  onDeletePermanently,
  isTrash = false,
  customActions,
  className
}: FileCardProps) {
  const metadataText = getFileMetadata(file)

  // Default actions for standard file vs trash file
  const defaultActions: ActionMenuItem[] = isTrash
    ? [
        ...(onRestore
          ? [
              {
                label: 'Restore',
                onClick: onRestore,
                icon: <RotateCcw className='w-4 h-4 text-text-secondary' />
              }
            ]
          : []),
        ...(onDeletePermanently
          ? [
              {
                label: 'Delete Forever',
                onClick: onDeletePermanently,
                icon: <Trash className='w-4 h-4 text-rose-500' />,
                danger: true
              }
            ]
          : [])
      ]
    : [
        ...(onClick
          ? [
              {
                label: 'Open',
                onClick,
                icon: <Eye className='w-4 h-4 text-text-secondary' />
              }
            ]
          : []),
        ...(onDownload
          ? [
              {
                label: 'Download',
                onClick: onDownload,
                icon: <Download className='w-4 h-4 text-text-secondary' />
              }
            ]
          : []),
        ...(onDetails
          ? [
              {
                label: 'Details',
                onClick: onDetails,
                icon: <Info className='w-4 h-4 text-text-secondary' />
              }
            ]
          : []),
        ...(onShare
          ? [
              {
                label: 'Share',
                onClick: onShare,
                icon: <Share2 className='w-4 h-4 text-text-secondary' />
              }
            ]
          : []),
        ...(onRename
          ? [
              {
                label: 'Rename',
                onClick: onRename,
                icon: <Edit3 className='w-4 h-4 text-text-secondary' />
              }
            ]
          : []),
        ...(onMove
          ? [
              {
                label: 'Move',
                onClick: onMove,
                icon: <FolderInput className='w-4 h-4 text-text-secondary' />
              }
            ]
          : []),
        ...(onToggleStar
          ? [
              {
                label: file.starred ? 'Unstar' : 'Star',
                onClick: onToggleStar,
                icon: <Star className='w-4 h-4 text-text-secondary' />
              }
            ]
          : []),
        ...(onDelete
          ? [
              {
                label: 'Delete',
                onClick: onDelete,
                icon: <Trash2 className='w-4 h-4 text-rose-500' />,
                danger: true
              }
            ]
          : [])
      ]

  const actions = customActions || defaultActions

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card-bg rounded-xl border border-card-border hover:border-card-border/80 hover:bg-input-bg/40 shadow-xs p-2.5 sm:p-3 flex flex-col gap-2.5 group relative select-none cursor-pointer transition-all duration-200 min-w-0',
        className
      )}
    >
      {/* Main Focus: Consistent, uncluttered file thumbnail */}
      <FileThumbnail file={file} variant='card' />

      {/* File Info + Actions Row: Filename -> Metadata -> 3-dot menu */}
      <div className='flex items-center justify-between gap-1.5 w-full min-w-0 pt-0.5'>
        <div className='flex flex-col min-w-0 flex-1 text-left'>
          <span
            className='text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-[#6E60EE] transition-colors duration-150'
            title={file.name}
          >
            {file.name}
          </span>
          <span className='text-[11px] font-medium text-text-secondary truncate mt-0.5'>
            {metadataText}
          </span>
        </div>

        {/* Action Buttons: Star + 3-dot Menu */}
        <div
          className='flex items-center gap-1 shrink-0 -mr-1'
          onClick={e => e.stopPropagation()}
        >
          {file.starred && !isTrash && (
            <Star className='w-4 h-4 text-[#6E60EE] fill-[#6E60EE] shrink-0' />
          )}

          {actions.length > 0 && (
            <ActionMenu
              placement='bottom-right'
              items={actions}
            />
          )}
        </div>
      </div>
    </div>
  )
}
