'use client'

import React from 'react'
import type { UploadTask } from '../types'
import { formatFileSize } from '@/lib/utils/format'
import {
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Code,
  File as FileIcon,
  Check,
  AlertCircle,
  RotateCcw,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface UploadItemProps {
  task: UploadTask
  onDismiss?: (id: string) => void
  onCancel?: (id: string) => void
  onRetry?: (id: string) => void
}

function getFileIcon(filename: string) {
  const ext = (filename.split('.').pop() || '').toLowerCase()
  if (ext === 'pdf') return <FileText className="w-4 h-4 text-rose-500 shrink-0" />
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext))
    return <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext))
    return <VideoIcon className="w-4 h-4 text-purple-500 shrink-0" />
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext))
    return <Music className="w-4 h-4 text-emerald-500 shrink-0" />
  if (['js', 'ts', 'jsx', 'tsx', 'json', 'py', 'html', 'css'].includes(ext))
    return <Code className="w-4 h-4 text-amber-500 shrink-0" />
  if (['doc', 'docx', 'txt', 'md', 'pptx', 'xlsx', 'csv'].includes(ext))
    return <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
  return <FileIcon className="w-4 h-4 text-text-muted shrink-0" />
}

export function UploadItem({ task, onDismiss, onCancel, onRetry }: UploadItemProps) {
  const isQueued = task.status === 'queued'
  const isUploading = task.status === 'uploading'
  const isCompleted = task.status === 'completed'
  const isError = task.status === 'error'
  const isCancelled = task.status === 'cancelled'

  return (
    <div className="group relative flex flex-col py-2 px-4 hover:bg-input-bg/40 transition-colors select-none">
      <div className="flex items-center justify-between gap-3 min-w-0">
        {/* Left: Icon & File Meta */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="shrink-0 flex items-center justify-center">
            {getFileIcon(task.name)}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className={cn(
                "text-xs font-medium truncate leading-tight",
                isCompleted ? "text-text-secondary" : isCancelled ? "text-text-muted line-through" : "text-foreground"
              )}
              title={task.name}
            >
              {task.name}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 leading-none">
              <span className="text-[11px] text-text-muted">
                {task.size > 0 ? formatFileSize(task.size) : '0 B'}
              </span>
              {isQueued && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-input-bg text-text-muted">
                  Queued
                </span>
              )}
              {isCancelled && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-input-bg text-text-muted">
                  Cancelled
                </span>
              )}
              {isError && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 truncate max-w-[140px]" title={task.error || 'Failed'}>
                  {task.error || 'Failed'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions and Status Indicators */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Real progress percent */}
          {isUploading && (
            <span className="text-xs font-medium text-[#6E60EE] tabular-nums mr-1">
              {task.progress}%
            </span>
          )}

          {/* Cancel button for Queued or In-Flight uploads */}
          {(isUploading || isQueued) && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(task.id)}
              className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-foreground hover:bg-input-bg transition-colors cursor-pointer"
              title="Cancel upload"
              aria-label="Cancel upload"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Success Checkmark */}
          {isCompleted && (
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-emerald-500">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          )}

          {/* Retry button for Error or Cancelled items */}
          {(isError || isCancelled) && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(task.id)}
              className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-[#6E60EE] hover:bg-input-bg transition-colors cursor-pointer"
              title="Retry upload"
              aria-label="Retry upload"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Error icon */}
          {isError && (
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-rose-500"
              title={task.error || 'Upload failed'}
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Dismiss button for completed or stopped items */}
          {(isCompleted || isError || isCancelled) && onDismiss && (
            <button
              type="button"
              onClick={() => onDismiss(task.id)}
              className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-foreground hover:bg-input-bg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ml-0.5"
              title="Dismiss"
              aria-label="Dismiss item"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Thin subtle progress bar for actively uploading items */}
      {isUploading && (
        <div className="w-full h-1 bg-card-border/60 rounded-full overflow-hidden mt-1.5">
          <div
            className="h-full bg-[#6E60EE] rounded-full transition-all duration-200 ease-out"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
