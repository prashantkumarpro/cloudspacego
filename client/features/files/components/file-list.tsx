'use client'

import React, { useState, useMemo } from 'react'
import { useApp } from '../../../providers/app-provider'
import { useFiles } from '../hooks/use-files'
import { useToast } from '@/providers/toast-provider'
import { FilePreview } from './file-preview'
import { FilePreviewModal } from './file-preview-modal'
import { FileGrid } from './file-grid'
import { FileTable } from './file-table'
import { RenameModal } from './rename-modal'
import { MoveModal } from './move-modal'
import { FileDetailsModal } from './file-details-modal'
import { ActionMenu, ActionMenuItem } from '../../../components/ui/action-menu'
import { SectionAction } from '../../../components/ui/section-action'
import { ViewToggle } from '../../../components/ui/view-toggle'
import { Tooltip } from '../../../components/ui/tooltip'
import { formatBytes, formatDate } from '../../../lib/utils/format'
import { FileType } from '../../../types'
import type { FileItem as BackendFileItem } from '../types'
import { cn } from '../../../lib/utils/cn'
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Code,
  File,
  Eye,
  Download,
  Share2,
  Edit3,
  FolderInput,
  Star,
  Trash2,
  Users,
  Search,
  Inbox,
  ArrowUp,
  Info
} from 'lucide-react'

export type UnifiedFileItem = {
  id?: string
  _id?: string
  name: string
  extension?: string
  type?: FileType
  size?: number
  parentFolderId?: string | null
  parentDirId?: string | null
  starred?: boolean
  deleted?: boolean
  createdAt?: string
  updatedAt?: string
  owner?: string
  sharedWith?: string[]
}

export interface FileListProps {
  files?: UnifiedFileItem[] | BackendFileItem[]
  title?: string
  limit?: number
  showViewAll?: boolean
  showHeader?: boolean
  showCardContainer?: boolean
  showViewToggle?: boolean
  viewMode?: 'grid' | 'list'
  defaultViewMode?: 'grid' | 'list'
  emptyMessage?: string
  emptySubtitle?: string
  onFileClick?: (file: UnifiedFileItem) => void
  onFolderClick?: (folderId: string) => void
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

export function FileList({
  files: customFiles,
  title,
  limit,
  showViewAll,
  showHeader = true,
  showCardContainer = false,
  showViewToggle = true,
  viewMode: propViewMode,
  defaultViewMode,
  emptyMessage,
  emptySubtitle,
  onFileClick,
  onFolderClick
}: FileListProps) {
  const {
    files: globalFiles,
    currentSection,
    setCurrentSection,
    activeFolderId,
    setActiveFolderId,
    toggleStar,
    searchQuery,
    setSelectedFileId,
    setActiveModal,
    moveFile,
    deleteFile,
    restoreFile,
    viewMode: globalViewMode,
    setViewMode: setGlobalViewMode
  } = useApp()

  const toast = useToast()
  const { download, rename, remove } = useFiles()
  const [previewFile, setPreviewFile] = useState<UnifiedFileItem | null>(null)
  const [renameTarget, setRenameTarget] = useState<UnifiedFileItem | null>(null)
  const [moveTarget, setMoveTarget] = useState<UnifiedFileItem | null>(null)
  const [detailsTarget, setDetailsTarget] = useState<UnifiedFileItem | null>(null)

  // Local view mode override if defaultViewMode is passed, otherwise global
  const [localViewMode, setLocalViewMode] = useState<'grid' | 'list' | null>(
    defaultViewMode ?? null
  )

  const activeViewMode: 'grid' | 'list' =
    propViewMode ?? localViewMode ?? globalViewMode

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    if (defaultViewMode) {
      setLocalViewMode(mode)
    } else {
      setGlobalViewMode(mode)
    }
  }

  // Filter files if customFiles is explicitly passed
  const displayList = React.useMemo(() => {
    if (customFiles !== undefined) {
      const list = (customFiles as UnifiedFileItem[]) || []
      return limit ? list.slice(0, limit) : list
    }

    let result = (globalFiles as UnifiedFileItem[]).filter(f => !f.deleted)

    if (searchQuery) {
      result = result.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      return limit ? result.slice(0, limit) : result
    }

    if (currentSection === 'Dashboard' || currentSection === 'Recent') {
      result = result.sort(
        (a, b) =>
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime()
      )
    } else if (currentSection === 'My Files') {
      result = result.filter(
        f =>
          f.parentFolderId === activeFolderId ||
          f.parentDirId === activeFolderId
      )
    } else if (currentSection === 'Starred') {
      result = result.filter(f => f.starred)
    } else if (currentSection === 'Shared') {
      result = result.filter(
        f => f.owner !== 'Prashant' || (f.sharedWith && f.sharedWith.length > 0)
      )
    }

    if (limit) {
      result = result.slice(0, limit)
    }

    return result
  }, [customFiles, globalFiles, currentSection, activeFolderId, searchQuery, limit])

  const getLocationName = (file: UnifiedFileItem) => {
    const parentId = file.parentFolderId || file.parentDirId
    if (parentId) {
      const parent = (globalFiles as UnifiedFileItem[]).find(
        f => (f.id || f._id) === parentId
      )
      if (parent) return parent.name
    }
    return 'My Files'
  }

  const handleOpenFile = (file: UnifiedFileItem) => {
    const fileType = deriveFileType(file)
    const fileId = file.id || file._id || ''

    if (fileType === 'folder') {
      if (onFolderClick) onFolderClick(fileId)
      else setActiveFolderId(fileId)
    } else {
      if (onFileClick) {
        onFileClick(file)
      } else {
        setPreviewFile(file)
      }
    }
  }

  const handleDownload = async (file: UnifiedFileItem) => {
    const fileId = file.id || file._id
    if (fileId) {
      try {
        await download(fileId, file.name)
      } catch (err) {
        console.error('Download error:', err)
      }
    }
  }

  const handlePerformRename = async (newName: string) => {
    if (!renameTarget) return
    const fileId = renameTarget.id || renameTarget._id
    if (fileId) {
      await rename(fileId, { newFilename: newName })
      setRenameTarget(null)
    }
  }

  const handleDeleteItem = async (file: UnifiedFileItem) => {
    const fileId = file.id || file._id
    if (!fileId) return

    try {
      if (typeof fileId === 'string' && fileId.startsWith('file-')) {
        deleteFile(fileId)
      } else {
        await remove(fileId)
      }

      toast.success(
        'Moved to Trash',
        `"${file.name}" was moved to Trash.`,
        {
          label: 'Undo',
          onClick: () => {
            if (typeof fileId === 'string' && fileId.startsWith('file-')) {
              restoreFile(fileId)
            }
          }
        }
      )
    } catch (err) {
      console.error('Failed to delete item:', err)
      toast.error('Failed to delete', `Could not move "${file.name}" to Trash.`)
    }
  }

  const handlePerformMove = async (targetFolderId: string | null) => {
    if (!moveTarget) return
    const fileId = moveTarget.id || moveTarget._id
    if (fileId) {
      moveFile(fileId, targetFolderId)
      setMoveTarget(null)
    }
  }

  const getDropdownItems = (file: UnifiedFileItem): ActionMenuItem[] => {
    const fileId = file.id || file._id || ''
    const isFolder = file.type === 'folder'

    return [
      {
        label: 'Open',
        onClick: () => handleOpenFile(file),
        icon: <Eye className='w-4 h-4 text-text-secondary' />
      },
      ...(!isFolder ? [{
        label: 'Download',
        onClick: () => handleDownload(file),
        icon: <Download className='w-4 h-4 text-text-secondary' />
      }] : []),
      {
        label: 'Details',
        onClick: () => setDetailsTarget(file),
        icon: <Info className='w-4 h-4 text-text-secondary' />
      },
      {
        label: 'Share',
        onClick: () => {
          setSelectedFileId(fileId)
          setActiveModal('share')
        },
        icon: <Share2 className='w-4 h-4 text-text-secondary' />
      },
      {
        label: 'Rename',
        onClick: () => setRenameTarget(file),
        icon: <Edit3 className='w-4 h-4 text-text-secondary' />
      },
      {
        label: 'Move',
        onClick: () => setMoveTarget(file),
        icon: <FolderInput className='w-4 h-4 text-text-secondary' />
      },
      {
        label: file.starred ? 'Unstar' : 'Star',
        onClick: () => toggleStar(fileId),
        icon: <Star className='w-4 h-4 text-text-secondary' />
      },
      {
        label: 'Delete',
        onClick: () => handleDeleteItem(file),
        icon: <Trash2 className='w-4 h-4 text-rose-500' />,
        danger: true
      }
    ]
  }

  const defaultEmptyTitle =
    emptyMessage ||
    (searchQuery
      ? 'No results found'
      : currentSection === 'Shared'
      ? 'No files shared'
      : currentSection === 'Starred'
      ? 'No starred files'
      : 'No files found')

  const defaultEmptySubtitle =
    emptySubtitle ||
    (searchQuery
      ? `We couldn't find any matches for "${searchQuery}". Try checking your spelling.`
      : currentSection === 'Shared'
      ? 'Files shared with you will appear here.'
      : currentSection === 'Starred'
      ? 'Files and folders you star will appear here for quick access.'
      : 'Upload a file or folder to get started.')

  const isDashboardOrRecent =
    currentSection === 'Dashboard' || currentSection === 'Recent'

  const content = (
    <div className='w-full flex flex-col gap-3'>
      {/* Section Header Row with Title + ViewToggle */}
      {(title || showViewToggle) && (
        <div className='flex items-center justify-between gap-3 select-none'>
          {title ? (
            <h3 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
              {title}
            </h3>
          ) : (
            <div />
          )}

          <div className='flex items-center gap-2 shrink-0'>
            {showViewToggle && displayList.length > 0 && (
              <ViewToggle
                viewMode={activeViewMode}
                onViewModeChange={handleViewModeChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {displayList.length === 0 ? (
        <div className='w-full py-12 flex flex-col items-center justify-center text-center select-none bg-card-bg border border-dashed border-card-border p-6 rounded-xl'>
          <div className='w-10 h-10 rounded-full bg-input-bg flex items-center justify-center text-text-muted mb-2.5'>
            {searchQuery ? (
              <Search className='w-5 h-5' />
            ) : (
              <Inbox className='w-5 h-5' />
            )}
          </div>
          <h4 className='text-xs sm:text-sm font-bold text-foreground'>
            {defaultEmptyTitle}
          </h4>
          <p className='text-xs text-text-secondary mt-1 max-w-[260px] leading-normal font-normal'>
            {defaultEmptySubtitle}
          </p>
        </div>
      ) : activeViewMode === 'grid' ? (
        /* GRID VIEW */
        <FileGrid
          files={displayList}
          onFileClick={handleOpenFile}
          onDownload={handleDownload}
          onShare={file => {
            const fId = file.id || file._id || ''
            setSelectedFileId(fId)
            setActiveModal('share')
          }}
          onRename={file => setRenameTarget(file)}
          onMove={file => setMoveTarget(file)}
          onDetails={file => setDetailsTarget(file)}
          onToggleStar={fileId => toggleStar(fileId)}
          onDelete={file => handleDeleteItem(file)}
        />
      ) : (
        /* REFINED LIST / TABLE VIEW (Clean, unboxed workspace table using reusable FileTable) */
        <FileTable
          files={displayList}
          onFileClick={handleOpenFile}
          onFolderClick={onFolderClick ? onFolderClick : setActiveFolderId}
          onToggleStar={fileId => toggleStar(fileId)}
          customActions={getDropdownItems}
          showHeader={showHeader}
          allFiles={globalFiles as UnifiedFileItem[]}
        />
      )}

      {/* Bottom View all action reusing SectionAction */}
      {showViewAll && currentSection === 'Dashboard' && displayList.length > 0 && (
        <div className='flex justify-start pt-1'>
          <SectionAction onClick={() => setCurrentSection('My Files')}>
            View all
          </SectionAction>
        </div>
      )}

      {/* In-App File Preview Modal */}
      <FilePreviewModal
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
        files={displayList.filter(f => deriveFileType(f) !== 'folder')}
        onNavigate={file => setPreviewFile(file as UnifiedFileItem)}
      />

      {/* Custom Rename Modal */}
      <RenameModal
        isOpen={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        initialName={renameTarget?.name || ''}
        itemType={renameTarget && deriveFileType(renameTarget) === 'folder' ? 'folder' : 'file'}
        onRename={handlePerformRename}
      />

      {/* Custom Move Modal */}
      <MoveModal
        isOpen={Boolean(moveTarget)}
        onClose={() => setMoveTarget(null)}
        itemName={moveTarget?.name || ''}
        itemId={moveTarget?.id || moveTarget?._id}
        itemType={moveTarget && deriveFileType(moveTarget) === 'folder' ? 'folder' : 'file'}
        currentFolderId={moveTarget?.parentFolderId || moveTarget?.parentDirId || null}
        onMove={handlePerformMove}
      />

      {/* Custom Details Modal */}
      <FileDetailsModal
        isOpen={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
        file={detailsTarget}
        onDownload={handleDownload}
      />
    </div>
  )

  if (showCardContainer) {
    return (
      <div className='bg-card-bg border border-card-border rounded-xl p-4 sm:p-5 text-foreground shadow-xs transition-colors duration-200 flex-1 min-h-0'>
        {content}
      </div>
    )
  }

  return content
}
