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
  X
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface UploadItemProps {
  task: UploadTask
  onDismiss?: (id: string) => void
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

export function UploadItem({ task, onDismiss }: UploadItemProps) {
  const isCompleted = task.status === 'completed'
  const isError = task.status === 'error'
  const isUploading = task.status === 'uploading'

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
                isCompleted ? "text-text-secondary" : "text-foreground"
              )}
              title={task.name}
            >
              {task.name}
            </span>
            <span className="text-[11px] text-text-muted mt-0.5 leading-none">
              {task.size > 0 ? formatFileSize(task.size) : '0 B'}
            </span>
          </div>
        </div>

        {/* Right: Progress % / Completed Check / Error */}
        <div className="flex items-center gap-2 shrink-0">
          {isUploading && (
            <span className="text-xs font-medium text-[#6E60EE] tabular-nums">
              {task.progress}%
            </span>
          )}

          {isCompleted && (
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-emerald-500">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          )}

          {isError && (
            <div
              className="flex items-center gap-1 text-rose-500"
              title={task.error || 'Upload failed'}
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={() => onDismiss(task.id)}
              className="w-4 h-4 rounded flex items-center justify-center text-text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Dismiss"
              aria-label="Dismiss item"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Thin subtle progress bar for actively uploading items only */}
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
