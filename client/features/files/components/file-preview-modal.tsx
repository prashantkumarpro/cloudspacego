'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useFiles } from '@/features/files/hooks/use-files'
import { formatBytes } from '@/lib/utils/format'
import { getFileTypeInfo, FileCategory } from '../utils/file-preview'
import { cn } from '@/lib/utils/cn'
import {
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Code,
  File as FileIcon,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileSpreadsheet,
  Presentation,
  Archive
} from 'lucide-react'

export interface PreviewableFile {
  id?: string
  _id?: string
  name: string
  extension?: string
  size?: number
  url?: string
  thumbnailUrl?: string
  mimeType?: string
  type?: string
  updatedAt?: string | Date
  createdAt?: string | Date
}

export interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  file: PreviewableFile | null
  files?: PreviewableFile[]
  onNavigate?: (file: PreviewableFile) => void
}

const isValidObjectId = (id?: string | null): boolean => {
  return Boolean(id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id))
}

interface PreviewSlideProps {
  file: PreviewableFile
  isActive: boolean
  isAdjacent: boolean
  getBlob: (fileId: string) => Promise<Blob>
  zoomLevel: number
  rotation: number
  onDownload: () => void
  onOpenInNewTab: (url: string) => void
  onCopyText: (text: string) => void
  isCopied: boolean
  onActiveBlobUrlChange?: (url: string | null) => void
}

function PreviewSlide({
  file,
  isActive,
  isAdjacent,
  getBlob,
  zoomLevel,
  rotation,
  onDownload,
  onOpenInNewTab,
  onCopyText,
  isCopied,
  onActiveBlobUrlChange
}: PreviewSlideProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [blobType, setBlobType] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false)

  const fileId = file.id || file._id
  const typeInfo = useMemo(() => {
    return getFileTypeInfo(file.name, file.extension, blobType || file.mimeType)
  }, [file, blobType])

  const category: FileCategory = typeInfo.category

  // Sync active blob URL up to parent for floating zoom pill or header actions
  useEffect(() => {
    if (isActive && onActiveBlobUrlChange) {
      onActiveBlobUrlChange(blobUrl)
    }
  }, [isActive, blobUrl, onActiveBlobUrlChange])

  // Load content when active or adjacent
  useEffect(() => {
    if (!isActive && !isAdjacent) return
    if (blobUrl || textContent || error) return

    let isSubscribed = true
    let createdUrl: string | null = null

    const resolvedTypeInfo = getFileTypeInfo(file.name, file.extension, file.mimeType)
    const explicitUrl = file.url || file.thumbnailUrl

    if (explicitUrl) {
      setBlobUrl(explicitUrl)
      setBlobType(file.mimeType || '')
      setIsLoading(false)
      setError(null)
      return
    }

    if (!fileId || !isValidObjectId(fileId)) {
      setIsLoading(false)
      setError('Unable to load file content for preview.')
      return
    }

    const loadContent = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const blob = await getBlob(fileId)
        if (!isSubscribed) return

        setBlobType(blob.type)
        createdUrl = URL.createObjectURL(blob)
        setBlobUrl(createdUrl)

        const cat = getFileTypeInfo(file.name, file.extension, blob.type).category
        if (cat === 'code' || blob.type.startsWith('text/') || blob.type === 'application/json') {
          const text = await blob.text()
          if (isSubscribed) {
            setTextContent(text)
          }
        }
      } catch (err) {
        if (isSubscribed) {
          console.error('[PreviewSlide] Failed to load content:', err)
          setError('Unable to load file content for preview.')
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false)
        }
      }
    }

    loadContent()

    return () => {
      isSubscribed = false
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl)
      }
    }
  }, [isActive, isAdjacent, file, fileId, blobUrl, textContent, error, getBlob])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-white/80 dark:text-white/80 animate-in fade-in duration-200">
        <Loader2 className="w-8 h-8 sm:w-9 sm:h-9 animate-spin text-[#6E60EE]" />
        <span className="text-xs sm:text-sm font-semibold tracking-wide text-white drop-shadow-sm">
          Loading preview...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center max-w-md bg-card-bg border border-card-border rounded-2xl shadow-xl animate-in fade-in zoom-in-[0.98] duration-250 ease-out">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground">Preview unavailable</h3>
          <p className="text-xs text-text-secondary mt-1">{error}</p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Download file to view
        </button>
      </div>
    )
  }

  switch (category) {
    case 'image':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
          <div className="relative max-h-[78vh] sm:max-h-[82vh] max-w-[88vw] flex items-center justify-center">
            {!isImageLoaded && blobUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-[#6E60EE]">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}
            {blobUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={blobUrl}
                alt={file.name}
                onLoad={() => setIsImageLoaded(true)}
                style={{
                  transform: `scale(${zoomLevel * (isImageLoaded ? 1 : 0.98)}) rotate(${rotation}deg)`,
                  opacity: isImageLoaded ? 1 : 0,
                  transition: 'opacity 250ms cubic-bezier(0.16, 1, 0.3, 1), transform 250ms cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                className="max-h-[76vh] sm:max-h-[80vh] max-w-[86vw] object-contain rounded-lg shadow-xl select-none will-change-transform"
              />
            )}
          </div>
        </div>
      )

    case 'pdf':
      return blobUrl ? (
        <div className="w-full h-full max-w-5xl flex items-center justify-center">
          <iframe
            src={blobUrl}
            title={file.name}
            className="w-full h-[76vh] sm:h-[80vh] border-0 rounded-xl shadow-xl bg-white"
          />
        </div>
      ) : null

    case 'video':
      return blobUrl ? (
        <div className="w-full h-full flex items-center justify-center p-2">
          <video
            src={blobUrl}
            controls={isActive}
            autoPlay={false}
            playsInline
            className="max-h-[76vh] sm:max-h-[80vh] max-w-[86vw] rounded-xl shadow-xl bg-black border border-card-border"
          >
            Your browser does not support HTML5 video.
          </video>
        </div>
      ) : null

    case 'audio':
      return (
        <div className="w-full max-w-md bg-card-bg border border-card-border rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xl text-foreground transition-colors">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#6E60EE]/10 border-2 border-[#6E60EE]/30 flex items-center justify-center text-[#6E60EE] shadow-[0_0_30px_rgba(110,96,238,0.2)] mb-4 relative group">
            <Music className="w-9 h-9 sm:w-10 sm:h-10" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-foreground truncate max-w-[280px]">
            {file.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-text-secondary">
            <span className="uppercase font-semibold tracking-wider text-[#6E60EE]">
              {typeInfo.extension || 'AUDIO'}
            </span>
            {typeof file.size === 'number' && (
              <>
                <span>•</span>
                <span>{formatBytes(file.size)}</span>
              </>
            )}
          </div>

          {blobUrl ? (
            <audio
              src={blobUrl}
              controls={isActive}
              className="w-full mt-6 accent-[#6E60EE] rounded-lg"
            />
          ) : (
            <button
              type="button"
              onClick={onDownload}
              className="mt-6 px-4 py-2 rounded-lg text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white flex items-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Download to play
            </button>
          )}
        </div>
      )

    case 'code':
      return (
        <div className="w-full max-w-4xl max-h-[76vh] sm:max-h-[80vh] bg-card-bg border border-card-border rounded-xl shadow-xl flex flex-col overflow-hidden text-left transition-colors">
          <div className="h-10 px-4 bg-input-bg border-b border-card-border flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-mono font-semibold text-foreground">
                {file.name}
              </span>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 px-1.5 py-0.5 rounded font-bold">
                {typeInfo.extension || 'TXT'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => textContent && onCopyText(textContent)}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-foreground px-2.5 py-1 rounded bg-card-bg hover:bg-card-border/60 border border-card-border transition-colors cursor-pointer"
              title="Copy code to clipboard"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-5 text-xs font-mono text-foreground leading-relaxed select-text bg-input-bg/30">
            <pre className="whitespace-pre-wrap break-words font-mono">
              <code>{textContent ?? 'Loading text contents...'}</code>
            </pre>
          </div>
        </div>
      )

    case 'document':
      return (
        <div className="w-full max-w-md bg-card-bg border border-card-border rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xl text-foreground transition-colors">
          <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center shadow-xs mb-4', typeInfo.bgClass, typeInfo.colorClass)}>
            {typeInfo.docType === 'sheet' ? (
              <FileSpreadsheet className="w-10 h-10" />
            ) : typeInfo.docType === 'slide' ? (
              <Presentation className="w-10 h-10" />
            ) : (
              <FileText className="w-10 h-10" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-foreground truncate max-w-[280px]">
            {file.name}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-text-secondary">
            <span className="uppercase font-semibold tracking-wider text-[#6E60EE]">
              {typeInfo.extension?.toUpperCase() || 'DOCUMENT'}
            </span>
            {typeof file.size === 'number' && (
              <>
                <span>•</span>
                <span>{formatBytes(file.size)}</span>
              </>
            )}
          </div>

          <p className="text-xs text-text-secondary mt-3 max-w-[280px] leading-relaxed font-normal">
            This document format is ready to download or open with your local application.
          </p>

          <div className="flex items-center gap-3 mt-6">
            {blobUrl && (
              <button
                type="button"
                onClick={() => onOpenInNewTab(blobUrl)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-foreground hover:bg-input-bg bg-card-bg border border-card-border transition-colors cursor-pointer"
              >
                Open in tab
              </button>
            )}
            <button
              type="button"
              onClick={onDownload}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download document
            </button>
          </div>
        </div>
      )

    default:
      return (
        <div className="w-full max-w-md bg-card-bg border border-card-border rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xl text-foreground transition-colors">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-input-bg border border-card-border flex items-center justify-center text-text-secondary shadow-xs mb-4">
            {category === 'archive' ? (
              <Archive className="w-9 h-9 text-amber-500" />
            ) : (
              <FileQuestion className="w-9 h-9 text-text-muted" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-foreground truncate max-w-[280px]">
            {file.name}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-text-secondary">
            <span className="uppercase font-semibold tracking-wider text-[#6E60EE]">
              {typeInfo.extension?.toUpperCase() || 'FILE'}
            </span>
            {typeof file.size === 'number' && (
              <>
                <span>•</span>
                <span>{formatBytes(file.size)}</span>
              </>
            )}
          </div>

          <p className="text-xs text-text-secondary mt-3 max-w-[300px] leading-relaxed font-normal">
            Preview is not available for this file type in the browser. You can download the file to open it with your local software.
          </p>

          <button
            type="button"
            onClick={onDownload}
            className="mt-6 px-4 py-2 rounded-lg text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download file ({typeInfo.extension?.toUpperCase() || 'FILE'})
          </button>
        </div>
      )
  }
}

export function FilePreviewModal({
  isOpen,
  onClose,
  file,
  files,
  onNavigate
}: FilePreviewModalProps) {
  const { getBlob, download } = useFiles()

  const [activeBlobUrl, setActiveBlobUrl] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState<boolean>(false)

  // Image viewer transform controls
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)

  // Collection navigation bounds
  const fileCollection = useMemo(() => {
    if (!files || files.length === 0) {
      return file ? [file] : []
    }
    const nonFolders = files.filter(f => f.type !== 'folder' && !f.name.endsWith('/'))
    return nonFolders.length > 0 ? nonFolders : (file ? [file] : [])
  }, [files, file])

  const initialIndex = useMemo(() => {
    if (!file || fileCollection.length === 0) return 0
    const idx = fileCollection.findIndex(
      f => (f.id || f._id) === (file.id || file._id) || f.name === file.name
    )
    return idx >= 0 ? idx : 0
  }, [file, fileCollection])

  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex)
  const hasMultipleFiles = fileCollection.length > 1

  // Embla Carousel hook
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: hasMultipleFiles,
    duration: 25,
    skipSnaps: false
  })

  // Handle slide select
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const newIdx = emblaApi.selectedScrollSnap()
    setSelectedIndex(newIdx)
    setZoomLevel(1)
    setRotation(0)
    const current = fileCollection[newIdx]
    if (current && onNavigate) {
      onNavigate(current)
    }
  }, [emblaApi, fileCollection, onNavigate])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  // Sync initial or changed file with Embla
  useEffect(() => {
    if (isOpen && emblaApi && file) {
      const idx = fileCollection.findIndex(
        f => (f.id || f._id) === (file.id || file._id) || f.name === file.name
      )
      if (idx >= 0) {
        emblaApi.scrollTo(idx, true)
        setSelectedIndex(idx)
        setZoomLevel(1)
        setRotation(0)
      }
    }
  }, [isOpen, emblaApi, file, fileCollection])

  const currentFile = fileCollection[selectedIndex] || file
  const currentTypeInfo = useMemo(() => {
    if (!currentFile) return getFileTypeInfo('')
    return getFileTypeInfo(currentFile.name, currentFile.extension, currentFile.mimeType)
  }, [currentFile])

  const currentCategory: FileCategory = currentTypeInfo.category

  const handlePrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const handleNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Global keyboard shortcuts (Left/Right arrows for nav, Escape for close)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, handlePrev, handleNext])

  const handleDownloadFile = (targetFile: PreviewableFile) => {
    const fId = targetFile.id || targetFile._id
    if (fId && isValidObjectId(fId)) {
      download(fId, targetFile.name)
    } else if (activeBlobUrl) {
      const link = document.createElement('a')
      link.href = activeBlobUrl
      link.download = targetFile.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  if (!isOpen || !currentFile) return null

  // Render Header Category Icon matching CloudSpaceGo's design language
  const renderHeaderIcon = () => {
    const iconClass = 'w-4 h-4 shrink-0'
    switch (currentCategory) {
      case 'image':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ImageIcon className={iconClass} />
          </div>
        )
      case 'pdf':
        return (
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <FileText className={iconClass} />
          </div>
        )
      case 'video':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <VideoIcon className={iconClass} />
          </div>
        )
      case 'audio':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Music className={iconClass} />
          </div>
        )
      case 'document':
        if (currentTypeInfo.docType === 'sheet') {
          return (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className={iconClass} />
            </div>
          )
        }
        if (currentTypeInfo.docType === 'slide') {
          return (
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Presentation className={iconClass} />
            </div>
          )
        }
        return (
          <div className="w-8 h-8 rounded-lg bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center shrink-0">
            <FileText className={iconClass} />
          </div>
        )
      case 'code':
        return (
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Code className={iconClass} />
          </div>
        )
      case 'archive':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Archive className={iconClass} />
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-input-bg text-text-secondary flex items-center justify-center shrink-0">
            <FileIcon className={iconClass} />
          </div>
        )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/35 dark:bg-black/60 backdrop-blur-[1px] transition-opacity duration-200 ease-out select-none overflow-hidden animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`File preview for ${currentFile.name}`}
    >
      {/* Top Preview Bar - Translucent Frosted Glass Header matching CloudSpaceGo visual system */}
      <header className="h-16 px-4 sm:px-6 w-full bg-card-bg/45 dark:bg-card-bg/40 backdrop-blur-md border-b border-card-border/40 flex items-center justify-between text-foreground shrink-0 select-none z-30 shadow-none gap-2 sm:gap-4 transition-colors">
        {/* Left: File Icon + Name + Indicator (e.g. 3 of 8) */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="transition-transform duration-200 ease-out">
            {renderHeaderIcon()}
          </div>

          <div className="flex items-center gap-2 min-w-0 transition-opacity duration-200">
            <h2
              className="text-sm sm:text-base font-semibold text-foreground tracking-tight truncate max-w-[160px] xs:max-w-[220px] sm:max-w-md md:max-w-lg lg:max-w-xl"
              title={currentFile.name}
            >
              {currentFile.name}
            </h2>

            {hasMultipleFiles && selectedIndex !== -1 && (
              <span className="text-xs font-semibold text-text-muted bg-input-bg/70 border border-card-border/40 px-2.5 py-0.5 rounded-full shrink-0 tracking-wide transition-all duration-200">
                {selectedIndex + 1} of {fileCollection.length}
              </span>
            )}

            {typeof currentFile.size === 'number' && currentFile.size > 0 && (
              <span className="hidden md:inline-flex text-[11px] text-text-muted bg-input-bg/70 border border-card-border/40 px-2 py-0.5 rounded-full font-medium shrink-0">
                {formatBytes(currentFile.size)}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions (Open in tab, Download, Close) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {activeBlobUrl && (
            <button
              type="button"
              onClick={() => window.open(activeBlobUrl, '_blank', 'noopener,noreferrer')}
              className="h-9 px-3 sm:px-3.5 rounded-lg text-xs font-semibold bg-input-bg/70 hover:bg-input-bg text-foreground border border-card-border/40 flex items-center gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50"
              title="Open in new tab"
              aria-label="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-text-secondary" />
              <span className="hidden sm:inline">Open in tab</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleDownloadFile(currentFile)}
            className="h-9 px-3.5 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white flex items-center gap-1.5 shadow-xs transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50"
            title="Download file"
            aria-label="Download file"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-semibold">Download</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-foreground hover:bg-input-bg/70 active:scale-95 transition-colors cursor-pointer border border-transparent hover:border-card-border/40 ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50"
            title="Close preview (Esc)"
            aria-label="Close preview"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Preview Canvas Area - Subtle light/neutral backdrop so CloudSpaceGo UI remains subtly recognizable */}
      <main
        className="flex-1 w-full h-[calc(100vh-4rem)] flex items-center justify-center p-2 sm:p-4 md:p-6 relative overflow-hidden select-none bg-black/25 dark:bg-black/45"
        onClick={e => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        {/* Subtle, Professional Circular Previous Navigation Button */}
        {hasMultipleFiles && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              handlePrev()
            }}
            className="fixed left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-card-bg/95 hover:bg-card-bg text-text-secondary hover:text-foreground border border-card-border shadow-sm hover:shadow-md hover:border-[#6E60EE]/40 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50"
            title="Previous file (Left Arrow)"
            aria-label="Previous file"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Subtle, Professional Circular Next Navigation Button */}
        {hasMultipleFiles && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation()
              handleNext()
            }}
            className="fixed right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-card-bg/95 hover:bg-card-bg text-text-secondary hover:text-foreground border border-card-border shadow-sm hover:shadow-md hover:border-[#6E60EE]/40 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50"
            title="Next file (Right Arrow)"
            aria-label="Next file"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Embla Carousel Viewport */}
        <div
          ref={emblaRef}
          className="w-full h-full overflow-hidden flex items-center justify-center"
          onClick={e => e.stopPropagation()}
        >
          {/* Embla Carousel Slides Container Track */}
          <div className="flex w-full h-full touch-pan-y">
            {fileCollection.map((itemFile, idx) => {
              const isActive = idx === selectedIndex
              const isAdjacent =
                Math.abs(idx - selectedIndex) <= 1 ||
                (hasMultipleFiles &&
                  ((selectedIndex === 0 && idx === fileCollection.length - 1) ||
                    (selectedIndex === fileCollection.length - 1 && idx === 0)))

              return (
                <div
                  key={itemFile.id || itemFile._id || `${itemFile.name}-${idx}`}
                  className="flex-[0_0_100%] min-w-0 w-full h-full flex items-center justify-center relative select-none"
                >
                  <PreviewSlide
                    file={itemFile}
                    isActive={isActive}
                    isAdjacent={isAdjacent}
                    getBlob={getBlob}
                    zoomLevel={isActive ? zoomLevel : 1}
                    rotation={isActive ? rotation : 0}
                    onDownload={() => handleDownloadFile(itemFile)}
                    onOpenInNewTab={url => window.open(url, '_blank', 'noopener,noreferrer')}
                    onCopyText={handleCopyText}
                    isCopied={isCopied}
                    onActiveBlobUrlChange={isActive ? setActiveBlobUrl : undefined}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Softened Integrated Floating Zoom Controls Pill for Active Image Preview */}
        {currentCategory === 'image' && activeBlobUrl && (
          <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-card-bg/85 dark:bg-card-bg/75 hover:bg-card-bg/95 dark:hover:bg-card-bg/90 backdrop-blur-md border border-card-border/60 dark:border-white/10 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md text-text-secondary select-none transition-all duration-200 animate-in fade-in zoom-in-[0.98]">
            <button
              type="button"
              onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))}
              disabled={zoomLevel <= 0.5}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:text-foreground hover:bg-input-bg/70 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary active:scale-95 transition-all cursor-pointer"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-medium text-foreground px-1 min-w-[38px] text-center select-none">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(z => Math.min(3, z + 0.25))}
              disabled={zoomLevel >= 3}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:text-foreground hover:bg-input-bg/70 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary active:scale-95 transition-all cursor-pointer"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3.5 bg-card-border/70 dark:bg-white/10 mx-0.5" />
            <button
              type="button"
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:text-foreground hover:bg-input-bg/70 active:scale-95 transition-all cursor-pointer"
              title="Rotate 90°"
              aria-label="Rotate"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            {(zoomLevel !== 1 || rotation !== 0) && (
              <button
                type="button"
                onClick={() => {
                  setZoomLevel(1)
                  setRotation(0)
                }}
                className="text-[11px] font-semibold text-[#6E60EE] dark:text-[#8E82F8] hover:bg-[#6E60EE]/10 active:scale-95 px-2 py-0.5 rounded-full transition-all cursor-pointer ml-0.5"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
