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
  File,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface UploadItemProps {
  task: UploadTask
  onDismiss?: (id: string) => void
}

function getFileIcon(filename: string) {
  const ext = (filename.split('.').pop() || '').toLowerCase()
  if (ext === 'pdf') return <FileText className="w-4 h-4 text-rose-500" />
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext))
    return <ImageIcon className="w-4 h-4 text-blue-500" />
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext))
    return <VideoIcon className="w-4 h-4 text-purple-500" />
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext))
    return <Music className="w-4 h-4 text-emerald-500" />
  if (['js', 'ts', 'jsx', 'tsx', 'json', 'py', 'html', 'css'].includes(ext))
    return <Code className="w-4 h-4 text-amber-500" />
  if (['doc', 'docx', 'txt', 'md', 'pptx', 'xlsx', 'csv'].includes(ext))
    return <FileText className="w-4 h-4 text-indigo-500" />
  return <File className="w-4 h-4 text-text-muted" />
}

export function UploadItem({ task, onDismiss }: UploadItemProps) {
  const isCompleted = task.status === 'completed'
  const isError = task.status === 'error'
  const isUploading = task.status === 'uploading'

  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-input-bg/50 hover:bg-input-bg transition-colors border border-card-border/60 group relative select-none">
      <div className="flex items-center justify-between gap-2.5 min-w-0">
        {/* Left: Icon + Name & Size */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-card-bg border border-card-border/70 flex items-center justify-center shrink-0 shadow-2xs">
            {getFileIcon(task.name)}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className="text-xs font-semibold text-foreground truncate leading-tight"
              title={task.name}
            >
              {task.name}
            </span>
            <span className="text-[10.5px] text-text-muted mt-0.5 leading-none">
              {task.size > 0 ? formatFileSize(task.size) : 'File'}
            </span>
          </div>
        </div>

        {/* Right: Status / Progress / Action */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isUploading && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6E60EE]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{task.progress}%</span>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Done</span>
            </div>
          )}

          {isError && (
            <div
              className="flex items-center gap-1 text-[11px] font-semibold text-rose-500"
              title={task.error || 'Upload failed'}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Failed</span>
            </div>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={() => onDismiss(task.id)}
              className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-foreground hover:bg-card-bg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-card-border/50 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-200 ease-out',
            isCompleted
              ? 'bg-emerald-500 w-full'
              : isError
              ? 'bg-rose-500 w-full'
              : 'bg-[#6E60EE]'
          )}
          style={{ width: isCompleted || isError ? '100%' : `${task.progress}%` }}
        />
      </div>
    </div>
  )
}
