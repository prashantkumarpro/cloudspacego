'use client'

import React from 'react'
import { useUpload } from '@/providers/upload-provider'
import { UploadItem } from './upload-item'
import {
  Check,
  Minus,
  X,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function UploadManager() {
  const {
    tasks,
    isOpen,
    isMinimized,
    toggleMinimized,
    dismissTask,
    clearCompleted,
    setIsOpen
  } = useUpload()

  if (!isOpen || tasks.length === 0) {
    return null
  }

  const activeUploads = tasks.filter(t => t.status === 'uploading')
  const completedUploads = tasks.filter(t => t.status === 'completed')

  const totalTasks = tasks.length
  const isAllComplete = activeUploads.length === 0 && completedUploads.length > 0

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
              ? `Uploading ${activeUploads.length} ${activeUploads.length === 1 ? 'file' : 'files'}`
              : isAllComplete
              ? `${completedUploads.length} ${completedUploads.length === 1 ? 'upload' : 'uploads'} complete`
              : `${totalTasks} ${totalTasks === 1 ? 'upload' : 'uploads'}`}
          </span>
        </div>

        {/* Header Controls */}
        <div
          className="flex items-center gap-0.5 shrink-0 ml-2"
          onClick={e => e.stopPropagation()}
        >
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

      {/* Body List */}
      {!isMinimized && (
        <>
          <div className="overflow-y-auto max-h-[260px] divide-y divide-card-border/40 py-1">
            {tasks.map(task => (
              <UploadItem
                key={task.id}
                task={task}
                onDismiss={dismissTask}
              />
            ))}
          </div>

          {/* Footer - Subtle secondary action */}
          {completedUploads.length > 0 && (
            <div className="flex items-center justify-end px-4 py-2 border-t border-card-border/40 bg-card-bg">
              <button
                type="button"
                onClick={clearCompleted}
                className="text-xs text-text-muted hover:text-[#6E60EE] transition-colors cursor-pointer font-normal"
              >
                Clear completed
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
