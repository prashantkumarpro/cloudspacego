'use client'

import React, { useState } from 'react'
import { useFileThumbnail } from '../hooks/use-file-thumbnail'
import { getFileTypeInfo, FileCategory } from '../utils/file-preview'
import { cn } from '@/lib/utils/cn'
import {
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Code,
  File as FileIcon,
  Archive,
  Play
} from 'lucide-react'

export interface PreviewFileData {
  id?: string
  _id?: string
  name: string
  extension?: string
  type?: string
  size?: number
  url?: string
  thumbnailUrl?: string
}

export interface FilePreviewProps {
  file: PreviewFileData
  variant?: 'grid' | 'list' | 'compact' | 'large'
  className?: string
  imageClassName?: string
  fallbackClassName?: string
  showPlayBadge?: boolean
  showBadge?: boolean
  alt?: string
}

export function FilePreview({
  file,
  variant = 'grid',
  className,
  imageClassName,
  fallbackClassName,
  showPlayBadge = true,
  showBadge = false,
  alt
}: FilePreviewProps) {
  const { url, isLoading, hasError, category, typeInfo } = useFileThumbnail({
    id: file.id,
    _id: file._id,
    name: file.name,
    extension: file.extension,
    url: file.url,
    thumbnailUrl: file.thumbnailUrl
  })

  const [imgLoadError, setImgLoadError] = useState(false)

  const hasDirectVisual = Boolean(url && !hasError && !imgLoadError)

  // Render Category Fallback Icon
  const renderFallbackIcon = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const iconClass = cn(
      size === 'sm' && 'w-4 h-4',
      size === 'md' && 'w-5 h-5',
      size === 'lg' && 'w-8 h-8',
      'shrink-0 transition-transform duration-200'
    )

    switch (category) {
      case 'image':
        return <ImageIcon className={cn(iconClass, 'text-emerald-500 dark:text-emerald-400')} />
      case 'pdf':
        return <FileText className={cn(iconClass, 'text-rose-500 dark:text-rose-400')} />
      case 'video':
        return <VideoIcon className={cn(iconClass, 'text-purple-500 dark:text-purple-400')} />
      case 'audio':
        return <Music className={cn(iconClass, 'text-amber-500 dark:text-amber-400')} />
      case 'document':
        return <FileText className={cn(iconClass, typeInfo.colorClass)} />
      case 'code':
        return <Code className={cn(iconClass, 'text-cyan-600 dark:text-cyan-400')} />
      case 'archive':
        return <Archive className={cn(iconClass, 'text-amber-600 dark:text-amber-400')} />
      default:
        return <FileIcon className={cn(iconClass, 'text-text-secondary')} />
    }
  }

  // VARIANT: LIST (Compact row item ~36x36px)
  if (variant === 'list') {
    return (
      <div
        className={cn(
          'w-9 h-9 rounded-lg bg-input-bg border border-card-border flex items-center justify-center shrink-0 relative overflow-hidden transition-all duration-200 select-none group-hover:border-[#6E60EE]/30',
          className
        )}
      >
        {isLoading ? (
          <div className='w-full h-full bg-input-bg animate-pulse' />
        ) : hasDirectVisual && category === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url!}
            alt={alt || file.name}
            onError={() => setImgLoadError(true)}
            className={cn('w-full h-full object-cover select-none', imageClassName)}
            loading='lazy'
          />
        ) : hasDirectVisual && category === 'video' ? (
          <div className='w-full h-full relative flex items-center justify-center bg-black/5'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url!}
              alt={alt || file.name}
              onError={() => setImgLoadError(true)}
              className='w-full h-full object-cover'
              loading='lazy'
            />
            {showPlayBadge && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/25'>
                <Play className='w-3 h-3 text-white fill-white' />
              </div>
            )}
          </div>
        ) : (
          <div className={cn('flex items-center justify-center', fallbackClassName)}>
            {renderFallbackIcon('sm')}
          </div>
        )}
      </div>
    )
  }

  // VARIANT: COMPACT (Extra small ~28-32px for search/dropdowns)
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'w-8 h-8 rounded-lg bg-input-bg border border-card-border flex items-center justify-center shrink-0 relative overflow-hidden transition-all duration-200 select-none',
          className
        )}
      >
        {isLoading ? (
          <div className='w-full h-full bg-input-bg animate-pulse' />
        ) : hasDirectVisual && category === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url!}
            alt={alt || file.name}
            onError={() => setImgLoadError(true)}
            className={cn('w-full h-full object-cover select-none', imageClassName)}
            loading='lazy'
          />
        ) : (
          <div className={cn('flex items-center justify-center', fallbackClassName)}>
            {renderFallbackIcon('sm')}
          </div>
        )}
      </div>
    )
  }

  // VARIANT: LARGE (Modal/details viewer)
  if (variant === 'large') {
    return (
      <div
        className={cn(
          'w-full min-h-[220px] bg-input-bg/40 border border-card-border rounded-xl flex items-center justify-center relative overflow-hidden select-none',
          className
        )}
      >
        {isLoading ? (
          <div className='w-full h-56 bg-input-bg animate-pulse' />
        ) : hasDirectVisual && category === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url!}
            alt={alt || file.name}
            onError={() => setImgLoadError(true)}
            className={cn('max-h-[60vh] max-w-full object-contain rounded-lg', imageClassName)}
          />
        ) : hasDirectVisual && category === 'video' ? (
          <video
            src={url!}
            controls
            className='max-h-[60vh] max-w-full rounded-lg'
          />
        ) : (
          <div className='flex flex-col items-center justify-center gap-2 p-8 text-center'>
            <div className='w-16 h-16 rounded-2xl bg-input-bg border border-card-border flex items-center justify-center shadow-xs'>
              {renderFallbackIcon('lg')}
            </div>
            <span className='text-xs font-semibold text-text-secondary mt-1'>
              {file.name}
            </span>
          </div>
        )}
      </div>
    )
  }

  // DEFAULT VARIANT: GRID (Card preview box aspect-[16/10])
  return (
    <div
      className={cn(
        'w-full aspect-[16/10] bg-input-bg/70 rounded-lg flex items-center justify-center border border-card-border/60 relative overflow-hidden shrink-0 group-hover:border-card-border transition-all duration-200 select-none',
        className
      )}
    >
      {isLoading ? (
        <div className='w-full h-full bg-input-bg animate-pulse' />
      ) : hasDirectVisual && category === 'image' ? (
        <div className='w-full h-full relative overflow-hidden bg-input-bg flex items-center justify-center'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url!}
            alt={alt || file.name}
            onError={() => setImgLoadError(true)}
            className={cn(
              'w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-[1.02]',
              imageClassName
            )}
            loading='lazy'
          />
        </div>
      ) : hasDirectVisual && category === 'video' ? (
        <div className='w-full h-full relative overflow-hidden bg-black/10 flex items-center justify-center'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url!}
            alt={alt || file.name}
            onError={() => setImgLoadError(true)}
            className={cn(
              'w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-[1.02]',
              imageClassName
            )}
            loading='lazy'
          />
          {showPlayBadge && (
            <div className='absolute w-8 h-8 rounded-full bg-black/50 text-white backdrop-blur-xs flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-[#6E60EE] transition-all duration-200'>
              <Play className='w-3.5 h-3.5 ml-0.5 fill-white' />
            </div>
          )}
        </div>
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center bg-input-bg/40 group-hover:bg-input-bg/60 transition-colors', fallbackClassName)}>
          <div className='w-12 h-12 rounded-xl bg-card-bg border border-card-border/80 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200'>
            {renderFallbackIcon('md')}
          </div>
        </div>
      )}
    </div>
  )
}
