'use client'

import React, { useState, useCallback } from 'react'
import { useUpload } from '@/providers/upload-provider'
import { UploadItem } from './upload-item'
import {
  Check,
  Minus,
  X,
  ChevronUp,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function UploadManager() {
  const {
    tasks,
    isOpen,
    isMinimized,
    setIsMinimized,
    toggleMinimized,
    cancelTask,
    cancelAll,
    retryTask,
    dismissTask,
    clearCompleted,
    setIsOpen
  } = useUpload()

  const [showConfirm, setShowConfirm] = useState(false)

  const activeUploads = tasks.filter(t => t.status === 'uploading')
  const queuedUploads = tasks.filter(t => t.status === 'queued')
  const completedUploads = tasks.filter(t => t.status === 'completed')
  const stoppedUploads = tasks.filter(t => t.status === 'cancelled' || t.status === 'error')

  const totalTasks = tasks.length
  const cancellableCount = activeUploads.length + queuedUploads.length
  const hasCancellableTasks = cancellableCount > 0
  const isAllComplete = activeUploads.length === 0 && queuedUploads.length === 0 && completedUploads.length > 0
  const isConfirmVisible = showConfirm && hasCancellableTasks

  const handleCancelAll = useCallback(() => {
    if (!hasCancellableTasks) return

    // Requirement 11: Decide whether confirmation is needed based on the number of active/queued uploads.
    // When >= 3 tasks are active/queued, require confirmation to prevent accidental mass aborts.
    // When fewer than 3, execute promptly without blocking the user.
    if (cancellableCount >= 3 && !showConfirm) {
      setIsMinimized(false)
      setShowConfirm(true)
      return
    }

    setShowConfirm(false)
    cancelAll()
  }, [hasCancellableTasks, cancellableCount, showConfirm, setIsMinimized, cancelAll])

  if (!isOpen || tasks.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-5 right-4 sm:right-5 z-50 w-[calc(100vw-32px)] xs:w-[360px] sm:w-[380px] bg-card-bg border border-card-border rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-200 select-none animate-in fade-in slide-in-from-bottom-2',
        isMinimized ? 'h-auto' : 'max-h-[380px]'
      )}
      role="region"
      aria-label="Upload manager"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-card-bg border-b border-card-border/60 cursor-pointer select-none"
        onClick={toggleMinimized}
      >
        <div className="flex items-center gap-2 min-w-0">
          {isAllComplete && (
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-emerald-500 shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          )}
          <span className="text-[13px] font-medium text-foreground truncate">
            {activeUploads.length > 0
              ? `Uploading ${activeUploads.length} of ${totalTasks} ${totalTasks === 1 ? 'file' : 'files'}`
              : queuedUploads.length > 0
              ? `Queued (${queuedUploads.length})`
              : isAllComplete
              ? `${completedUploads.length} ${completedUploads.length === 1 ? 'upload' : 'uploads'} complete`
              : `${totalTasks} ${totalTasks === 1 ? 'upload' : 'uploads'}`}
          </span>
        </div>

        {/* Header Controls */}
        <div
          className="flex items-center gap-1 shrink-0 ml-2"
          onClick={e => e.stopPropagation()}
        >
          {hasCancellableTasks && (
            <button
              type="button"
              id="upload-manager-cancel-all-btn"
              onClick={handleCancelAll}
              className="text-[11px] font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 px-2 py-0.5 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Cancel all active and queued uploads"
              aria-label="Cancel all uploads"
            >
              Cancel all
            </button>
          )}

          <button
            type="button"
            onClick={toggleMinimized}
            className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-foreground hover:bg-input-bg transition-colors cursor-pointer"
            title={isMinimized ? 'Expand' : 'Minimize'}
            aria-label={isMinimized ? 'Expand upload manager' : 'Minimize upload manager'}
          >
            {isMinimized ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-foreground hover:bg-input-bg transition-colors cursor-pointer"
            title="Close"
            aria-label="Close upload manager"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Confirmation prompt (Requirement 11) */}
      {isConfirmVisible && !isMinimized && (
        <div
          className="px-4 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-xs flex flex-col gap-2 animate-in fade-in select-none"
          role="alertdialog"
          aria-labelledby="cancel-all-confirm-title"
          aria-describedby="cancel-all-confirm-desc"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex flex-col min-w-0 flex-1">
              <span id="cancel-all-confirm-title" className="font-semibold text-foreground leading-tight">
                Cancel all {cancellableCount} {cancellableCount === 1 ? 'upload' : 'uploads'}?
              </span>
              <span id="cancel-all-confirm-desc" className="text-text-secondary mt-0.5 text-[11px] leading-relaxed">
                Completed uploads will remain untouched.
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-500/15">
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="px-2.5 py-1 text-xs font-medium rounded-md text-text-secondary hover:text-foreground hover:bg-input-bg transition-colors cursor-pointer"
            >
              Keep uploading
            </button>
            <button
              type="button"
              id="confirm-cancel-all-btn"
              onClick={() => {
                setShowConfirm(false)
                cancelAll()
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
            >
              Cancel all
            </button>
          </div>
        </div>
      )}

      {/* Body List */}
      {!isMinimized && (
        <>
          <div className="overflow-y-auto max-h-[260px] divide-y divide-card-border/40 py-1">
            {tasks.map(task => (
              <UploadItem
                key={task.id}
                task={task}
                onCancel={cancelTask}
                onRetry={retryTask}
                onDismiss={dismissTask}
              />
            ))}
          </div>

          {/* Footer - Cancel all & Clear completed */}
          {(hasCancellableTasks || completedUploads.length > 0 || stoppedUploads.length > 0) && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-card-border/40 bg-card-bg text-xs">
              <div>
                {hasCancellableTasks && (
                  <button
                    type="button"
                    id="upload-manager-footer-cancel-all-btn"
                    onClick={handleCancelAll}
                    className="text-text-muted hover:text-rose-500 transition-colors cursor-pointer font-normal"
                  >
                    Cancel all
                  </button>
                )}
              </div>
              <div>
                {(completedUploads.length > 0 || stoppedUploads.length > 0) && (
                  <button
                    type="button"
                    onClick={clearCompleted}
                    className="text-text-muted hover:text-[#6E60EE] transition-colors cursor-pointer font-normal"
                  >
                    Clear completed
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
