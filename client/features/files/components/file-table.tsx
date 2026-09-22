'use client'

import React from 'react'
import { FilePreview } from './file-preview'
import { ActionMenu, ActionMenuItem } from '../../../components/ui/action-menu'
import { Tooltip } from '../../../components/ui/tooltip'
import { formatBytes, formatDate } from '../../../lib/utils/format'
import { FileType } from '../../../types'
import { UnifiedFileItem } from './file-list'
import { cn } from '../../../lib/utils/cn'
import {
  Folder,
  Star,
  Users,
  ArrowUp
} from 'lucide-react'

export interface FileTableProps {
  files: UnifiedFileItem[]
  onFileClick?: (file: UnifiedFileItem) => void
  onFolderClick?: (folderId: string) => void
  onToggleStar?: (fileId: string) => void
  customActions?: (file: UnifiedFileItem) => ActionMenuItem[]
  showHeader?: boolean
  showLocation?: boolean
  showDate?: boolean
  showSize?: boolean
  dateLabel?: string
  allFiles?: UnifiedFileItem[]
}

function deriveFileType(file: UnifiedFileItem): FileType {
  if (file.type) return file.type
  const ext = (file.extension || file.name.split('.').pop() || '')
    .replace('.', '')
    .toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video'
  if (['doc', 'docx', 'txt', 'md', 'pptx', 'xlsx', 'csv'].includes(ext))
    return 'document'
  if (['js', 'ts', 'jsx', 'tsx', 'json', 'py', 'html', 'css'].includes(ext))
    return 'code'
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio'
  return 'other'
}

export function FileTable({
  files,
  onFileClick,
  onFolderClick,
  onToggleStar,
  customActions,
  showHeader = true,
  showLocation = true,
  showDate = true,
  showSize = false,
  dateLabel = 'Last modified',
  allFiles = []
}: FileTableProps) {
  const getLocationName = (file: UnifiedFileItem) => {
    const parentId = file.parentFolderId || file.parentDirId
    if (parentId) {
      const parent = allFiles.find(f => (f.id || f._id) === parentId)
      if (parent) return parent.name
    }
    return 'My Files'
  }

  const handleRowClick = (file: UnifiedFileItem) => {
    const fileType = deriveFileType(file)
    const fileId = file.id || file._id || ''

    if (fileType === 'folder') {
      if (onFolderClick) onFolderClick(fileId)
    } else {
      if (onFileClick) onFileClick(file)
    }
  }

  return (
    <div className='w-full flex flex-col select-none border-b border-card-border/50'>
      {/* Table Header: Clearly distinguishable column labels */}
      {showHeader && (
        <div className='flex items-center justify-between px-3 sm:px-4 py-2.5 text-xs font-semibold text-text-secondary border-b border-card-border select-none bg-background/50'>
          {/* Name Column Header (Largest) */}
          <div className='flex-1 min-w-0 pr-6 flex items-center gap-1.5'>
            <div className='inline-flex items-center gap-1.5 group cursor-pointer hover:text-foreground transition-colors'>
              <span className='font-semibold tracking-tight'>Name</span>
              <div className='w-4 h-4 rounded-full bg-[#6E60EE]/10 flex items-center justify-center'>
                <ArrowUp className='w-2.5 h-2.5 text-[#6E60EE]' />
              </div>
            </div>
          </div>

          {/* Last modified / Date Column Header (Medium) */}
          {showDate && (
            <div className='hidden md:flex w-44 lg:w-48 text-left pr-4 items-center shrink-0'>
              <span className='font-semibold tracking-tight'>{dateLabel}</span>
            </div>
          )}

          {/* Location Column Header (Medium) */}
          {showLocation && (
            <div className='hidden lg:flex w-36 lg:w-40 text-left pr-4 items-center shrink-0'>
              <span className='font-semibold tracking-tight'>Location</span>
            </div>
          )}

          {/* Size Column Header */}
          {showSize && (
            <div className='hidden sm:flex w-24 text-right pr-4 items-center justify-end shrink-0'>
              <span className='font-semibold tracking-tight'>Size</span>
            </div>
          )}

          {/* Actions Column Header (Compact / Right Aligned) */}
          <div className='w-20 text-right pr-1 sm:pr-2 flex items-center justify-end shrink-0'>
            <span className='sr-only sm:not-sr-only text-xs font-semibold text-text-secondary/70'>Actions</span>
          </div>
        </div>
      )}

      {/* Table Rows: Structured, 56-60px height with subtle horizontal separators */}
      <div className='flex flex-col divide-y divide-card-border/40'>
        {files.map((file, idx) => {
          const fileId = file.id || file._id || `row-${idx}`
          const fileType = deriveFileType(file)
          const dropdownItems = customActions ? customActions(file) : []
          const isShared =
            (file.sharedWith && file.sharedWith.length > 0) ||
            (file.owner && file.owner !== 'Prashant')
          const locationName = getLocationName(file)
          const displayDate =
            file.updatedAt || file.createdAt || new Date().toISOString()
          const displaySize =
            typeof file.size === 'number' && file.size > 0
              ? formatBytes(file.size)
              : '—'

          return (
            <div
              key={fileId}
              onClick={() => handleRowClick(file)}
              className='flex items-center justify-between px-3 sm:px-4 h-[58px] min-h-[56px] max-h-[60px] hover:bg-input-bg/70 active:bg-input-bg transition-colors duration-150 group cursor-pointer select-none min-w-0'
            >
              {/* Name Column: Icon/Thumbnail + Filename + Shared indicator (Largest, gracefully truncated) */}
              <div className='flex items-center gap-3.5 min-w-0 flex-1 pr-6'>
                {fileType === 'folder' ? (
                  <div className='w-9 h-9 rounded-lg bg-input-bg border border-card-border flex items-center justify-center shrink-0 text-[#6E60EE] group-hover:bg-[#6E60EE]/10 group-hover:border-[#6E60EE]/30 transition-all duration-200'>
                    <Folder className='w-4 h-4 text-[#6E60EE]' />
                  </div>
                ) : (
                  <FilePreview file={file} variant='list' />
                )}
                <div className='flex flex-col min-w-0 flex-1 justify-center'>
                  <div className='flex items-center gap-1.5 min-w-0'>
                    <span
                      className='text-xs sm:text-sm font-semibold text-foreground group-hover:text-[#6E60EE] truncate transition-colors duration-150'
                      title={file.name}
                    >
                      {file.name}
                    </span>
                    {isShared && (
                      <Tooltip content='Shared file' side='top'>
                        <span className='shrink-0 text-text-muted/80 group-hover:text-text-secondary'>
                          <Users className='w-3.5 h-3.5' />
                        </span>
                      </Tooltip>
                    )}
                  </div>

                  {/* Mobile compact details subline */}
                  <div className='flex items-center gap-1.5 text-[11px] sm:hidden text-text-secondary mt-0.5 truncate'>
                    <span>{displaySize}</span>
                    <span>&bull;</span>
                    <span>{formatDate(displayDate)}</span>
                  </div>
                </div>
              </div>

              {/* Last modified / Date Column (Medium) */}
              {showDate && (
                <div className='hidden md:flex w-44 lg:w-48 text-xs text-text-secondary truncate pr-4 text-left items-center shrink-0'>
                  {formatDate(displayDate)}
                </div>
              )}

              {/* Location Column (Medium) */}
              {showLocation && (
                <div className='hidden lg:flex items-center gap-1.5 w-36 lg:w-40 text-xs text-text-secondary truncate pr-4 text-left shrink-0'>
                  <Folder className='w-3.5 h-3.5 text-text-muted shrink-0' />
                  <span className='truncate'>{locationName}</span>
                </div>
              )}

              {/* Size Column */}
              {showSize && (
                <div className='hidden sm:flex w-24 text-xs font-semibold text-text-secondary text-right pr-4 items-center justify-end shrink-0'>
                  {displaySize}
                </div>
              )}

              {/* Actions Column: Star button + 3-dot ActionMenu (Compact, Right Aligned) */}
              <div
                className='flex items-center justify-end gap-1 w-20 shrink-0'
                onClick={e => e.stopPropagation()}
              >
                {onToggleStar && (
                  <Tooltip
                    content={file.starred ? 'Unstar' : 'Star'}
                    side='top'
                  >
                    <button
                      onClick={() => onToggleStar(fileId)}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50 active:scale-95',
                        file.starred
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100 hover:bg-input-bg'
                      )}
                      aria-label={file.starred ? 'Unstar file' : 'Star file'}
                    >
                      <Star
                        className={cn(
                          'w-4 h-4',
                          file.starred
                            ? 'fill-[#6E60EE] text-[#6E60EE]'
                            : 'text-text-muted'
                        )}
                      />
                    </button>
                  </Tooltip>
                )}

                {dropdownItems.length > 0 && (
                  <ActionMenu
                    placement='bottom-right'
                    items={dropdownItems}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
