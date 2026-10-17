'use client'

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useApp } from '../../../providers/app-provider'
import { useToast } from '@/providers/toast-provider'
import { useInfiniteFiles, useFiles } from '@/features/files/hooks/use-files'
import { FileGrid } from '@/features/files/components/file-grid'
import { FileTable } from '@/features/files/components/file-table'
import { DeleteConfirmModal } from '@/features/files/components/delete-confirm-modal'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileCardSkeleton, FileTableSkeleton, FileTableRowSkeleton } from '@/components/ui/skeleton'
import { ViewToggle } from '@/components/ui/view-toggle'
import { ActionMenuItem } from '@/components/ui/action-menu'
import { UnifiedFileItem } from '@/features/files/components/file-list'
import { RotateCcw, Trash, Trash2, Search, AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react'

export function TrashView() {
  const { searchQuery } = useApp()
  const toast = useToast()
  const {
    files: trashFiles,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh
  } = useInfiniteFiles({
    trash: true
  })

  const { restore, deletePermanently, emptyTrash } = useFiles()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<UnifiedFileItem | null>(null)
  const [isEmptyTrashConfirmOpen, setIsEmptyTrashConfirmOpen] = useState(false)
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false)

  // Infinite scroll observer sentinel
  const observerTarget = useRef<HTMLDivElement>(null)

  const checkAndLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && loadMore) {
      loadMore()
    }
  }, [isLoadingMore, hasMore, loadMore])

  useEffect(() => {
    const target = observerTarget.current
    if (!target || !hasMore || !loadMore) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          checkAndLoadMore()
        }
      },
      {
        root: null,
        rootMargin: '400px 0px',
        threshold: 0
      }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, loadMore, checkAndLoadMore])

  const deletedFiles = useMemo(() => {
    const raw = trashFiles as UnifiedFileItem[]
    if (!searchQuery) return raw
    return raw.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [trashFiles, searchQuery])

  const handleRestore = async (fileId: string, fileName?: string) => {
    try {
      await restore(fileId)
      toast.success(
        'Restored',
        fileName ? `"${fileName}" was restored from Trash.` : 'Item restored from Trash.'
      )
    } catch (err) {
      console.error('Failed to restore file:', err)
      toast.error('Failed to restore', `Could not restore "${fileName || 'file'}".`)
    }
  }

  const handlePerformPermanentDelete = async () => {
    if (!permanentDeleteTarget) return
    const fileId = permanentDeleteTarget.id || permanentDeleteTarget._id || ''
    const fileName = permanentDeleteTarget.name
    if (!fileId) return

    try {
      await deletePermanently(fileId)
      setPermanentDeleteTarget(null)
      toast.info('Permanently deleted', `"${fileName}" was permanently deleted.`)
    } catch (err) {
      console.error('Failed to permanently delete file:', err)
      toast.error('Failed to delete', `Could not permanently delete "${fileName}".`)
    }
  }

  const handlePerformEmptyTrash = async () => {
    try {
      setIsEmptyingTrash(true)
      await emptyTrash()
      setIsEmptyTrashConfirmOpen(false)
      toast.info('Trash emptied', 'All items in Trash were permanently deleted.')
    } catch (err) {
      console.error('Failed to empty trash:', err)
      toast.error('Failed to empty trash', 'Could not delete all items from Trash. Please try again.')
    } finally {
      setIsEmptyingTrash(false)
    }
  }

  const handleBlockedFileClick = (file: UnifiedFileItem) => {
    toast.info('Trashed file', `"${file.name}" is in Trash. Restore it to view or open it.`)
  }

  const getTrashDropdownItems = (file: UnifiedFileItem): ActionMenuItem[] => {
    const fileId = file.id || file._id || ''
    return [
      {
        label: 'Restore',
        onClick: () => handleRestore(fileId, file.name),
        icon: <RotateCcw className='w-4 h-4 text-text-secondary' />
      },
      {
        label: 'Delete Forever',
        onClick: () => setPermanentDeleteTarget(file),
        icon: <Trash className='w-4 h-4 text-rose-500' />,
        danger: true
      }
    ]
  }

  // Error state
  if (error && trashFiles.length === 0) {
    return (
      <div className='w-full flex flex-col items-center justify-center p-12 bg-card-bg border border-card-border rounded-xl text-center select-none shadow-xs'>
        <div className='w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3'>
          <AlertCircle className='w-6 h-6' />
        </div>
        <h4 className='text-sm sm:text-base font-bold text-foreground'>
          Failed to load trash
        </h4>
        <p className='text-xs text-text-secondary mt-1 max-w-sm'>
          {error || 'An error occurred while retrieving your trash items.'}
        </p>
        <button
          onClick={() => refresh()}
          className='mt-4 px-4 py-2 bg-[#6E60EE] hover:bg-[#5D50DE] text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs'
        >
          <RefreshCw className='w-3.5 h-3.5' />
          Try Again
        </button>
      </div>
    )
  }

  // Initial loading skeleton
  if (isLoading && trashFiles.length === 0) {
    return (
      <div className='w-full flex flex-col gap-3.5 min-w-0 select-none'>
        <div className='flex items-center justify-between gap-3 select-none flex-wrap'>
          <div className='flex items-center gap-2.5'>
            <div className='h-5 sm:h-6 w-24 bg-input-bg rounded animate-pulse' />
            <div className='h-5 w-16 bg-input-bg rounded-full animate-pulse' />
          </div>
          <div className='flex items-center gap-2'>
            <ViewToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className='grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-3 sm:gap-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <FileCardSkeleton key={`trash-grid-skeleton-${i}`} />
            ))}
          </div>
        ) : (
          <FileTableSkeleton
            showHeader={true}
            count={6}
            dateLabel='Date deleted'
          />
        )}
      </div>
    )
  }

  // Empty state
  if (deletedFiles.length === 0) {
    if (searchQuery) {
      return (
        <div className='bg-card-bg border border-card-border rounded-xl p-16 flex flex-col items-center justify-center text-center select-none shadow-xs'>
          <div className='w-10 h-10 rounded-full bg-input-bg flex items-center justify-center text-text-muted mb-2.5'>
            <Search className='w-5 h-5' />
          </div>
          <h4 className='text-xs sm:text-sm font-bold text-foreground'>
            No results found
          </h4>
          <p className='text-xs text-text-secondary mt-1 max-w-[240px] leading-normal font-normal'>
            We couldn&apos;t find any matches in trash for &ldquo;{searchQuery}&rdquo;.
          </p>
        </div>
      )
    }
    return (
      <div className='bg-card-bg border border-card-border rounded-xl p-16 flex flex-col items-center justify-center text-center select-none shadow-xs'>
        <div className='w-12 h-12 rounded-full bg-input-bg flex items-center justify-center text-text-muted mb-3'>
          <Trash2 className='w-6 h-6 text-text-secondary' />
        </div>
        <h4 className='text-xs sm:text-sm font-bold text-foreground'>
          Trash is empty
        </h4>
        <p className='text-xs text-text-secondary mt-1 max-w-[260px] leading-normal font-normal'>
          Deleted files will appear here until they are permanently removed or you empty your trash.
        </p>
      </div>
    )
  }

  return (
    <div className='w-full flex flex-col gap-3.5 min-w-0'>
      {/* Header Row with Title + Count + Empty Trash + ViewToggle */}
      <div className='flex items-center justify-between gap-3 select-none flex-wrap'>
        <div className='flex items-center gap-2.5'>
          <h3 className='text-sm sm:text-base font-bold text-foreground tracking-tight'>
            Trash Bin
          </h3>
          <span className='text-xs font-semibold text-text-muted bg-input-bg border border-card-border px-2 py-0.5 rounded-full'>
            {deletedFiles.length} {deletedFiles.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          {/* Empty Trash Button */}
          {trashFiles.length > 0 && (
            <button
              type='button'
              onClick={() => setIsEmptyTrashConfirmOpen(true)}
              className='px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors border border-rose-500/20'
            >
              <Trash2 className='w-3.5 h-3.5' />
              <span>Empty Trash</span>
            </button>
          )}

          <ViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* View Content (Grid vs List) */}
      {viewMode === 'grid' ? (
        <FileGrid
          files={deletedFiles}
          isTrash
          onFileClick={handleBlockedFileClick}
          onRestore={file => handleRestore(file.id || file._id || '', file.name)}
          onDeletePermanently={file => setPermanentDeleteTarget(file)}
        />
      ) : (
        <FileTable
          files={deletedFiles}
          onFileClick={handleBlockedFileClick}
          customActions={getTrashDropdownItems}
          showOwner={false}
          showDate={true}
          showSize={true}
          dateLabel='Deleted Date'
          allFiles={trashFiles as UnifiedFileItem[]}
        />
      )}

      {/* Sentinel for Infinite Scrolling */}
      {hasMore && (
        <div ref={observerTarget} className='h-4 w-full shrink-0' />
      )}

      {/* Bottom Pagination Skeletons matching active view */}
      {isLoadingMore && (
        viewMode === 'grid' ? (
          <div className='grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <FileCardSkeleton key={`trash-pagination-grid-skeleton-${i}`} />
            ))}
          </div>
        ) : (
          <div className='flex flex-col divide-y divide-card-border/40 border-b border-card-border/40 select-none'>
            {Array.from({ length: 3 }).map((_, i) => (
              <FileTableRowSkeleton key={`trash-pagination-row-skeleton-${i}`} />
            ))}
          </div>
        )
      )}

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className='w-full py-3 flex items-center justify-center gap-2 text-text-secondary text-xs select-none animate-in fade-in duration-150'>
          <div className='w-3.5 h-3.5 rounded-full border-2 border-[#6E60EE] border-t-transparent animate-spin' />
          <span className='font-medium'>Loading more trashed files...</span>
        </div>
      )}

      {/* Single Item Permanent Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(permanentDeleteTarget)}
        onClose={() => setPermanentDeleteTarget(null)}
        itemName={permanentDeleteTarget?.name || ''}
        itemType="file"
        isPermanent={true}
        onConfirm={handlePerformPermanentDelete}
      />

      {/* Empty Trash Confirmation Modal */}
      <Dialog
        isOpen={isEmptyTrashConfirmOpen}
        onClose={() => !isEmptyingTrash && setIsEmptyTrashConfirmOpen(false)}
        size="sm"
      >
        <div className="flex flex-col gap-3.5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight leading-snug">
                Empty Trash?
              </h3>
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                Are you sure you want to permanently delete all items in Trash? This action cannot be undone and will release their storage quota.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-card-border/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEmptyTrashConfirmOpen(false)}
              disabled={isEmptyingTrash}
              className="h-8.5 px-3.5 text-xs font-semibold text-text-secondary hover:text-foreground hover:bg-input-bg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handlePerformEmptyTrash}
              disabled={isEmptyingTrash}
              className="h-8.5 px-3.5 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-xs"
            >
              {isEmptyingTrash ? 'Emptying...' : 'Empty Trash'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
