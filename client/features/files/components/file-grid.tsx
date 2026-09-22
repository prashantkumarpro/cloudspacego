'use client'

import React from 'react'
import { FileCard } from './file-card'
import type { UnifiedFileItem } from './file-list'
import { cn } from '@/lib/utils/cn'

export interface FileGridProps {
  files: UnifiedFileItem[]
  onFileClick?: (file: UnifiedFileItem) => void
  onDownload?: (file: UnifiedFileItem) => void
  onShare?: (file: UnifiedFileItem) => void
  onRename?: (file: UnifiedFileItem) => void
  onMove?: (file: UnifiedFileItem) => void
  onDetails?: (file: UnifiedFileItem) => void
  onToggleStar?: (fileId: string) => void
  onDelete?: (file: UnifiedFileItem) => void
  onRestore?: (file: UnifiedFileItem) => void
  onDeletePermanently?: (file: UnifiedFileItem) => void
  isTrash?: boolean
  className?: string
}

export function FileGrid({
  files,
  onFileClick,
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
  className
}: FileGridProps) {
  if (files.length === 0) return null

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-3 sm:gap-4',
        className
      )}
    >
      {files.map((file, idx) => {
        const fileId = file.id || file._id || `file-${idx}`
        return (
          <FileCard
            key={fileId}
            file={file}
            isTrash={isTrash}
            onClick={onFileClick ? () => onFileClick(file) : undefined}
            onDownload={onDownload ? () => onDownload(file) : undefined}
            onShare={onShare ? () => onShare(file) : undefined}
            onRename={onRename ? () => onRename(file) : undefined}
            onMove={onMove ? () => onMove(file) : undefined}
            onDetails={onDetails ? () => onDetails(file) : undefined}
            onToggleStar={onToggleStar ? () => onToggleStar(fileId) : undefined}
            onDelete={onDelete ? () => onDelete(file) : undefined}
            onRestore={onRestore ? () => onRestore(file) : undefined}
            onDeletePermanently={onDeletePermanently ? () => onDeletePermanently(file) : undefined}
          />
        )
      })}
    </div>
  )
}
