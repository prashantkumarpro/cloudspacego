'use client'

import React, { useState, useMemo } from 'react'
import { useApp } from '../../../providers/app-provider'
import { useFiles, notifyFilesChanged } from '../hooks/use-files'
import { useToast } from '@/providers/toast-provider'
import { FilePreview } from './file-preview'
import { FilePreviewModal } from './file-preview-modal'
import { FileGrid } from './file-grid'
import { FileTable } from './file-table'
import { FileCardSkeleton, FileTableSkeleton, FileTableRowSkeleton } from '@/components/ui/skeleton'
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
import { EmptyState } from '@/components/ui/empty-state'
import { useDirectUpload } from '@/features/files/hooks/use-direct-upload'
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
  Info,
  Upload,
  FolderPlus,
  FolderOpen,
  Clock
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
  isStarred?: boolean
  deleted?: boolean
  createdAt?: string
  updatedAt?: string
  lastAccessedAt?: string
  owner?: string | { id?: string; name?: string; email?: string }
  sharedWith?: string[]
  role?: 'viewer' | 'editor'
  sharedAt?: string
  shareId?: string
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
  emptyState?: React.ReactNode
  dateLabel?: string
  onFileClick?: (file: UnifiedFileItem) => void
  onFolderClick?: (folderId: string) => void
  onToggleStar?: (fileId: string) => void
  onDelete?: (file: UnifiedFileItem) => void | Promise<void>
  isLoading?: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
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
  emptyState,
  dateLabel,
  onFileClick,
  onFolderClick,
  onToggleStar: propOnToggleStar,
  onDelete: propOnDelete,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore
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
    setSelectedFileItem,
    setActiveModal,
    moveFile,
    deleteFile,
    restoreFile,
    viewMode: globalViewMode,
    setViewMode: setGlobalViewMode
  } = useApp()

  const toast = useToast()
  const { download, rename, remove } = useFiles()
  const { triggerUpload, hiddenFileInput } = useDirectUpload({ folderId: activeFolderId })
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

  // Infinite scroll observer using IntersectionObserver with early prefetching (600px margin)
  const observerTarget = React.useRef<HTMLDivElement>(null)
  const onLoadMoreRef = React.useRef(onLoadMore)
  const hasMoreRef = React.useRef(hasMore)
  const isLoadingMoreRef = React.useRef(isLoadingMore)
  const isLoadingRef = React.useRef(isLoading)

  React.useEffect(() => {
    onLoadMoreRef.current = onLoadMore
    hasMoreRef.current = hasMore
    isLoadingMoreRef.current = isLoadingMore
    isLoadingRef.current = isLoading
  }, [onLoadMore, hasMore, isLoadingMore, isLoading])

  const checkAndLoadMore = React.useCallback(() => {
    if (
      hasMoreRef.current &&
      !isLoadingMoreRef.current &&
      !isLoadingRef.current &&
      onLoadMoreRef.current
    ) {
      onLoadMoreRef.current()
    }
  }, [])

  React.useEffect(() => {
    if (!hasMore || !onLoadMore) return

    const target = observerTarget.current
    if (!target) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          checkAndLoadMore()
        }
      },
      {
        root: null,
        rootMargin: '600px 0px', // Early prefetch 600px before reaching the bottom
        threshold: 0
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, onLoadMore, checkAndLoadMore])

  // When isLoadingMore finishes, check if sentinel is still within prefetch viewport
  React.useEffect(() => {
    if (!isLoadingMore && hasMore) {
      const target = observerTarget.current
      if (target) {
        const rect = target.getBoundingClientRect()
        if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) + 600) {
          checkAndLoadMore()
        }
      }
    }
  }, [isLoadingMore, hasMore, checkAndLoadMore])

  // Filter files if customFiles is explicitly passed
  const displayList = React.useMemo(() => {
    if (customFiles !== undefined) {
      let list = (customFiles as UnifiedFileItem[]) || []
      if (currentSection === 'Starred') {
        list = list.filter(f => (f.starred ?? f.isStarred) !== false)
      }
      if (searchQuery) {
        list = list.filter(f =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      return limit ? list.slice(0, limit) : list
    }

    let result = (globalFiles as UnifiedFileItem[]).filter(f => !f.deleted)

    if (searchQuery) {
      result = result.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      return limit ? result.slice(0, limit) : result
    }


    if (currentSection === 'Recent') {
      result = result.sort(
        (a, b) =>
          new Date(b.lastAccessedAt || b.updatedAt || 0).getTime() -
          new Date(a.lastAccessedAt || a.updatedAt || 0).getTime()
      )
    } else if (currentSection === 'Dashboard') {
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
      result = result.filter(f => Boolean(f.starred ?? f.isStarred))
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
    const target = renameTarget
    const fileId = target.id || target._id
    setRenameTarget(null)
    if (fileId) {
      await rename(
        fileId,
        { newFilename: newName },
        {
          originalName: target.name,
          parentDirId: target.parentDirId,
        }
      )
    }
  }

  const handleDeleteItem = async (file: UnifiedFileItem) => {
    const fileId = file.id || file._id
    if (!fileId) return
    const fileIdStr = fileId.toString()

    // Support propOnDelete override if provided
    if (propOnDelete) {
      await propOnDelete(file)
      return
    }

    // For mock/demo files starting with 'file-'
    if (fileIdStr.startsWith('file-')) {
      deleteFile(fileIdStr)
      toast.success(
        'Moved to Trash',
        `"${file.name}" was moved to Trash.`,
        {
          label: 'Undo',
          onClick: () => {
            restoreFile(fileIdStr)
            toast.success('Restored', `"${file.name}" was restored from Trash.`)
          }
        }
      )
      return
    }

    const fileSnapshot: UnifiedFileItem = { ...file }
    const originalIndex = displayList.findIndex(
      f => (f.id || f._id || '').toString() === fileIdStr
    )
    const effectiveParentDirId =
      file.parentFolderId || file.parentDirId || activeFolderId || null

    await remove(fileIdStr, {
      file: fileSnapshot,
      originalIndex: originalIndex >= 0 ? originalIndex : undefined,
      parentDirId: effectiveParentDirId
    })
  }

  const handlePerformMove = async (targetFolderId: string | null) => {
    if (!moveTarget) return
    const fileId = moveTarget.id || moveTarget._id
    if (fileId) {
      moveFile(fileId, targetFolderId)
      setMoveTarget(null)
    }
  }

  const handleToggleStar = async (fileId: string) => {
    const file = displayList.find(f => (f.id || f._id || '').toString() === fileId.toString())
    const currentlyStarred = file ? Boolean(file.starred ?? file.isStarred) : undefined
    const targetState = currentlyStarred !== undefined ? !currentlyStarred : undefined

    try {
      const newStarred = await toggleStar(fileId, targetState)
      if (file) {
        toast.success(
          newStarred ? 'Starred' : 'Unstarred',
          newStarred
            ? `Added "${file.name}" to starred.`
            : `Removed "${file.name}" from starred.`
        )
      }
      if (propOnToggleStar) {
        propOnToggleStar(fileId)
      }
    } catch {
      toast.error(
        'Failed to update star',
        file ? `Could not update star status for "${file.name}".` : 'Could not update star status.'
      )
    }
  }

  const getDropdownItems = (file: UnifiedFileItem): ActionMenuItem[] => {
    const fileId = file.id || file._id || ''
    const isFolder = file.type === 'folder'
    const isStarred = Boolean(file.starred ?? file.isStarred)
    const isSharedFile = Boolean(file.role)
    const canEdit = !isSharedFile || file.role === 'editor'
    const canManage = !isSharedFile

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
      ...(canManage ? [{
        label: 'Share',
        onClick: () => {
          setSelectedFileId(fileId)
          setSelectedFileItem?.(file)
          setActiveModal('share')
        },
        icon: <Share2 className='w-4 h-4 text-text-secondary' />
      }] : []),
      ...(canEdit ? [{
        label: 'Rename',
        onClick: () => setRenameTarget(file),
        icon: <Edit3 className='w-4 h-4 text-text-secondary' />
      }] : []),
      ...(canManage ? [{
        label: 'Move',
        onClick: () => setMoveTarget(file),
        icon: <FolderInput className='w-4 h-4 text-text-secondary' />
      }] : []),
      ...(canManage ? [{
        label: isStarred ? 'Unstar' : 'Star',
        onClick: () => handleToggleStar(fileId),
        icon: <Star className='w-4 h-4 text-text-secondary' />
      }] : []),
      ...(canManage ? [{
        label: 'Delete',
        onClick: () => handleDeleteItem(file),
        icon: <Trash2 className='w-4 h-4 text-rose-500' />,
        danger: true
      }] : [])
    ]
  }

  const renderEmptyState = () => {
    if (emptyState && !searchQuery) {
      return emptyState
    }

    if (searchQuery) {
      return (
        <EmptyState
          icon={Search}
          title='No results found'
          description={`We couldn't find any matches for "${searchQuery}". Try checking your spelling.`}
        />
      )
    }

    if (currentSection === 'My Files') {
      return (
        <EmptyState
          icon={FolderOpen}
          title={activeFolderId ? 'This folder is empty' : 'No files yet'}
          description='Upload a file or create a folder to get started.'
          primaryAction={{
            label: 'Upload files',
            onClick: triggerUpload,
            icon: Upload,
            extraNode: hiddenFileInput
          }}
          secondaryAction={{
            label: 'Create folder',
            onClick: () => setActiveModal('create-folder'),
            icon: FolderPlus,
            variant: 'soft'
          }}
        />
      )
    }

    if (currentSection === 'Shared') {
      return (
        <EmptyState
          icon={Users}
          title={emptyMessage || 'No files shared with you'}
          description={emptySubtitle || 'Files shared with you by others will appear here.'}
        />
      )
    }

    if (currentSection === 'Recent') {
      return (
        <EmptyState
          icon={Clock}
          title={emptyMessage || 'No recent files'}
          description={emptySubtitle || 'Files you open, preview, or download will appear here.'}
        />
      )
    }

    if (currentSection === 'Starred') {
      return (
        <EmptyState
          icon={Star}
          title={emptyMessage || 'No starred files'}
          description={emptySubtitle || 'Star files you want to easily find later.'}
        />
      )
    }

    return (
      <EmptyState
        icon={Inbox}
        title={emptyMessage || 'No files found'}
        description={emptySubtitle || 'Upload a file or folder to get started.'}
        primaryAction={{
          label: 'Upload files',
          onClick: triggerUpload,
          icon: Upload,
          extraNode: hiddenFileInput
        }}
        secondaryAction={{
          label: 'Create folder',
          onClick: () => setActiveModal('create-folder'),
          icon: FolderPlus,
          variant: 'soft'
        }}
      />
    )
  }

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
            {showViewToggle && (displayList.length > 0 || isLoading) && (
              <ViewToggle
                viewMode={activeViewMode}
                onViewModeChange={handleViewModeChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Empty State vs Loading vs Content */}
      {isLoading && displayList.length === 0 ? (
        activeViewMode === 'grid' ? (
          <div className='grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-3 sm:gap-4'>
            {Array.from({ length: limit || 8 }).map((_, i) => (
              <FileCardSkeleton key={`file-grid-skeleton-${i}`} />
            ))}
          </div>
        ) : (
          <FileTableSkeleton
            showHeader={showHeader}
            count={limit || 6}
            dateLabel={dateLabel}
          />
        )
      ) : displayList.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {activeViewMode === 'grid' ? (
            /* GRID VIEW */
            <FileGrid
              files={displayList}
              onFileClick={handleOpenFile}
              onDownload={handleDownload}
              onShare={file => {
                const fId = file.id || file._id || ''
                setSelectedFileId(fId)
                setSelectedFileItem?.(file)
                setActiveModal('share')
              }}
              onRename={file => setRenameTarget(file)}
              onMove={file => setMoveTarget(file)}
              onDetails={file => setDetailsTarget(file)}
              onToggleStar={fileId => handleToggleStar(fileId)}
              onDelete={file => handleDeleteItem(file)}
            />
          ) : (
            /* REFINED LIST / TABLE VIEW (Clean, unboxed workspace table using reusable FileTable) */
            <FileTable
              files={displayList}
              onFileClick={handleOpenFile}
              onFolderClick={onFolderClick ? onFolderClick : setActiveFolderId}
              onToggleStar={fileId => handleToggleStar(fileId)}
              customActions={getDropdownItems}
              showHeader={showHeader}
              dateLabel={dateLabel}
              allFiles={globalFiles as UnifiedFileItem[]}
            />
          )}

          {/* Sentinel for Infinite Scrolling */}
          {hasMore && (
            <div ref={observerTarget} className='h-4 w-full shrink-0' />
          )}

          {/* Bottom Pagination Skeletons matching active view */}
          {isLoadingMore && (
            activeViewMode === 'grid' ? (
              <div className='grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <FileCardSkeleton key={`pagination-grid-skeleton-${i}`} />
                ))}
              </div>
            ) : (
              <div className='flex flex-col divide-y divide-card-border/40 border-b border-card-border/40 select-none'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <FileTableRowSkeleton key={`pagination-row-skeleton-${i}`} />
                ))}
              </div>
            )
          )}

          {/* Subtle Loading More Text Indicator */}
          {isLoadingMore && (
            <div className='w-full py-3 flex items-center justify-center gap-2 text-text-secondary text-xs select-none animate-in fade-in duration-150'>
              <div className='w-3.5 h-3.5 rounded-full border-2 border-[#6E60EE] border-t-transparent animate-spin' />
              <span className='font-medium'>Loading more files...</span>
            </div>
          )}
        </>
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
