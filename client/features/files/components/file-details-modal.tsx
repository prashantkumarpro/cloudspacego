'use client'

import React from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FilePreview } from './file-preview'
import { formatBytes, formatDate } from '@/lib/utils/format'
import { UnifiedFileItem } from './file-list'
import { useApp } from '@/providers/app-provider'
import {
  Folder,
  FileText,
  Info,
  Calendar,
  HardDrive,
  User,
  Users,
  MapPin,
  Download
} from 'lucide-react'

export interface FileDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  file: UnifiedFileItem | null
  onDownload?: (file: UnifiedFileItem) => void
}

export function FileDetailsModal({
  isOpen,
  onClose,
  file,
  onDownload
}: FileDetailsModalProps) {
  const { files } = useApp()

  if (!file) return null

  const isFolder = file.type === 'folder'
  const displaySize = typeof file.size === 'number' && file.size > 0
    ? formatBytes(file.size)
    : isFolder
    ? '—'
    : 'Unknown size'

  const displayCreated = file.createdAt ? formatDate(file.createdAt) : '—'
  const displayUpdated = file.updatedAt ? formatDate(file.updatedAt) : displayCreated

  // Resolve location path
  const parentId = file.parentFolderId || file.parentDirId
  let locationName = 'My Files'
  if (parentId) {
    const parent = (files as UnifiedFileItem[]).find(f => (f.id || f._id) === parentId)
    if (parent) locationName = `My Files / ${parent.name}`
  }

  const isShared = (file.sharedWith && file.sharedWith.length > 0) || (file.owner && file.owner !== 'Prashant')

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isFolder ? "Folder Details" : "File Details"}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Header Preview & Name */}
        <div className="flex items-center gap-3.5 p-3.5 bg-input-bg/60 border border-card-border rounded-xl">
          {isFolder ? (
            <div className="w-10 h-10 rounded-xl bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center shrink-0">
              <Folder className="w-5 h-5" />
            </div>
          ) : (
            <FilePreview file={file} variant="compact" />
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-semibold text-foreground break-words leading-tight" title={file.name}>
              {file.name}
            </span>
            <span className="text-[11px] text-text-secondary mt-0.5 uppercase tracking-wider font-semibold">
              {isFolder ? 'Folder' : `${file.extension || file.type || 'File'}`}
            </span>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="flex flex-col divide-y divide-card-border/50 border border-card-border rounded-xl bg-card-bg text-xs">
          {/* Type */}
          <div className="flex items-center justify-between p-3">
            <span className="text-text-secondary font-medium">Type</span>
            <span className="text-foreground font-semibold">
              {isFolder ? 'File Folder' : file.type ? file.type.toUpperCase() : 'Document'}
            </span>
          </div>

          {/* Size */}
          {!isFolder && (
            <div className="flex items-center justify-between p-3">
              <span className="text-text-secondary font-medium">Size</span>
              <span className="text-foreground font-semibold">{displaySize}</span>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center justify-between p-3">
            <span className="text-text-secondary font-medium">Location</span>
            <span className="text-foreground font-semibold truncate max-w-[200px]" title={locationName}>
              {locationName}
            </span>
          </div>

          {/* Owner */}
          <div className="flex items-center justify-between p-3">
            <span className="text-text-secondary font-medium">Owner</span>
            <span className="text-foreground font-semibold">
              {file.owner || 'You (Prashant)'}
            </span>
          </div>

          {/* Modified Date */}
          <div className="flex items-center justify-between p-3">
            <span className="text-text-secondary font-medium">Last modified</span>
            <span className="text-foreground font-semibold">{displayUpdated}</span>
          </div>

          {/* Created Date */}
          <div className="flex items-center justify-between p-3">
            <span className="text-text-secondary font-medium">Created</span>
            <span className="text-foreground font-semibold">{displayCreated}</span>
          </div>

          {/* Sharing Status */}
          <div className="flex items-center justify-between p-3">
            <span className="text-text-secondary font-medium">Sharing</span>
            <span className="text-foreground font-semibold">
              {isShared ? 'Shared' : 'Private to you'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-card-border/60">
          {onDownload && !isFolder && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDownload(file)}
              className="h-9 px-4 text-xs font-semibold text-text-secondary hover:text-[#6E60EE] hover:bg-[#6E60EE]/10 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
