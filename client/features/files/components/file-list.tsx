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
  onFileClick,
  onFolderClick,
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

  // Infinite scroll observer using IntersectionObserver with early prefetching (600px margin)
  const observerTarget = React.useRef<HTMLDivElement>(null)
  const onLoadMoreRef = React.useRef(onLoadMore)
  const hasMoreRef = React.useRef(hasMore)
  const isLoadingMoreRef = React.useRef(isLoadingMore)
  const isLoadingRef = React.useRef(isLoading)

  onLoadMoreRef.current = onLoadMore
  hasMoreRef.current = hasMore
  isLoadingMoreRef.current = isLoadingMore
  isLoadingRef.current = isLoading

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

      {/* Empty State vs Loading vs Content */}
      {isLoading && displayList.length === 0 ? (
        activeViewMode === 'grid' ? (
          <div className='grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-3 sm:gap-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className='h-44 bg-card-bg/60 border border-card-border rounded-xl animate-pulse p-3'
              />
            ))}
          </div>
        ) : (
          <div className='w-full flex flex-col gap-2 py-2'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='h-12 w-full bg-card-bg/60 border border-card-border rounded-lg animate-pulse'
              />
            ))}
          </div>
        )
      ) : displayList.length === 0 ? (
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

          {/* Sentinel for Infinite Scrolling */}
          {hasMore && (
            <div ref={observerTarget} className='h-4 w-full shrink-0' />
          )}

          {/* Bottom Pagination Skeletons matching active view */}
          {isLoadingMore && (
            activeViewMode === 'grid' ? (
              <div className='grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-3 sm:gap-4 mt-1'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`pagination-grid-skeleton-${i}`}
                    className='h-44 bg-card-bg/60 border border-card-border/60 rounded-xl animate-pulse p-3 flex flex-col justify-between select-none'
                  >
                    <div className='w-full aspect-[16/10] bg-input-bg/70 rounded-lg' />
                    <div className='flex items-center gap-2 mt-2.5'>
                      <div className='h-3.5 bg-input-bg rounded w-3/4' />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col divide-y divide-card-border/30 border-b border-card-border/40 select-none'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`pagination-row-skeleton-${i}`}
                    className='flex items-center justify-between px-3 sm:px-4 h-[54px] animate-pulse bg-input-bg/20'
                  >
                    <div className='flex items-center gap-3.5 flex-1 pr-6'>
                      <div className='w-9 h-9 rounded-lg bg-input-bg/80 shrink-0' />
                      <div className='h-3.5 bg-input-bg/80 rounded w-48' />
                    </div>
                    <div className='hidden md:block w-24 h-3 bg-input-bg/60 rounded pr-4' />
                    <div className='hidden sm:block w-32 h-3 bg-input-bg/60 rounded pr-4' />
                    <div className='hidden sm:block w-20 h-3 bg-input-bg/60 rounded pr-4' />
                    <div className='w-8 h-8 rounded-lg bg-input-bg/40 shrink-0' />
                  </div>
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
