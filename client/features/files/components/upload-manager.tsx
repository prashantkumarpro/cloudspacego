'use client'

import React from 'react'
import { useUpload } from '@/providers/upload-provider'
import { UploadItem } from './upload-item'
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Minus,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  Trash2
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
  const errorUploads = tasks.filter(t => t.status === 'error')

  const totalTasks = tasks.length
  const isAllComplete = activeUploads.length === 0 && completedUploads.length > 0
  const hasErrors = errorUploads.length > 0

  const headerTitle = activeUploads.length > 0
    ? `Uploading ${activeUploads.length} ${activeUploads.length === 1 ? 'file' : 'files'}`
    : isAllComplete
    ? `${completedUploads.length} ${completedUploads.length === 1 ? 'upload' : 'uploads'} complete`
    : `${totalTasks} ${totalTasks === 1 ? 'upload' : 'uploads'}`

  return (
    <div
      className={cn(
        'fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] xs:w-80 sm:w-96 bg-card-bg border border-card-border rounded-2xl shadow-xl overflow-hidden flex flex-col transition-all duration-300 select-none animate-in fade-in slide-in-from-bottom-4',
        isMinimized ? 'h-auto' : 'max-h-[420px]'
      )}
      role="region"
      aria-label="Upload manager"
    >
      {/* Header Bar */}
      <div
        className="flex items-center justify-between px-3.5 sm:px-4 py-3 bg-card-bg border-b border-card-border/60 cursor-pointer select-none"
        onClick={toggleMinimized}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
              activeUploads.length > 0
                ? 'bg-[#6E60EE]/10 text-[#6E60EE]'
                : isAllComplete
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-input-bg text-text-muted'
            )}
          >
            {activeUploads.length > 0 ? (
              <Upload className="w-3.5 h-3.5 animate-pulse" />
            ) : isAllComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : hasErrors ? (
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-[13px] font-bold text-foreground truncate leading-tight">
              {headerTitle}
            </span>
            {activeUploads.length > 0 && (
              <span className="text-[10.5px] text-text-muted mt-0.5 leading-none truncate">
                {completedUploads.length} of {totalTasks} completed
              </span>
            )}
          </div>
        </div>

        {/* Header Controls (Minimize & Close) */}
        <div
          className="flex items-center gap-1 shrink-0 ml-2"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={toggleMinimized}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-foreground hover:bg-input-bg transition-colors cursor-pointer"
            title={isMinimized ? 'Expand' : 'Minimize'}
            aria-label={isMinimized ? 'Expand upload manager' : 'Minimize upload manager'}
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-foreground hover:bg-input-bg transition-colors cursor-pointer"
            title="Close"
            aria-label="Close upload manager"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body List of Upload Items (Hidden when minimized) */}
      {!isMinimized && (
        <>
          <div className="p-2.5 sm:p-3 overflow-y-auto max-h-[280px] flex flex-col gap-2 divide-y divide-transparent">
            {tasks.map(task => (
              <UploadItem
                key={task.id}
                task={task}
                onDismiss={dismissTask}
              />
            ))}
          </div>

          {/* Footer with Clear Action if there are completed tasks */}
          {completedUploads.length > 0 && (
            <div className="flex items-center justify-between px-3.5 py-2 border-t border-card-border/60 bg-input-bg/30 text-[11px] text-text-secondary">
              <span>{completedUploads.length} completed</span>
              <button
                type="button"
                onClick={clearCompleted}
                className="text-xs font-semibold text-[#6E60EE] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear done</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
