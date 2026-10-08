'use client'

import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  FileText,
  Image as ImageIcon,
  FileCode,
  Check,
  Info
} from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'

interface PreviewItem {
  id: string
  title: string
  type: 'pdf' | 'img' | 'code'
  size: string
  dimensions?: string
  modified: string
  mime: string
  previewText?: string
  previewSubtitle?: string
}

const PREVIEWS: PreviewItem[] = [
  {
    id: 'deck',
    title: 'Brand_Strategy_Presentation_2026.pdf',
    type: 'pdf',
    size: '8.4 MB',
    dimensions: '1920 × 1080 (16:9)',
    modified: 'Today at 2:45 PM',
    mime: 'application/pdf',
    previewText: 'CloudSpaceGo 2026 Strategy',
    previewSubtitle: 'Unified Cloud Storage & Seamless Asset Streaming Architecture'
  },
  {
    id: 'hero',
    title: 'Editorial_Workspace_Hero.png',
    type: 'img',
    size: '4.2 MB',
    dimensions: '3840 × 2160 (4K UHD)',
    modified: 'Yesterday at 6:12 PM',
    mime: 'image/png',
    previewText: 'High Fidelity Dark Studio',
    previewSubtitle: 'Rendered with P3 Wide Color Profile & Alpha Channel Transparency'
  },
  {
    id: 'config',
    title: 'r2_storage_config.ts',
    type: 'code',
    size: '14 KB',
    modified: 'May 12, 2026',
    mime: 'application/typescript',
    previewText: 'Cloudflare R2 Engine Configuration',
    previewSubtitle: 'Parallel Multipart S3 Client with Presigned Streaming URLs'
  }
]

export function PreviewSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isCopied, setIsCopied] = useState(false)

  const activeItem = PREVIEWS[currentIndex]

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PREVIEWS.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PREVIEWS.length) % PREVIEWS.length)
  }

  const handleCopyLink = () => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <section id="preview" className="relative py-20 sm:py-24 lg:py-28 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.12]">
            Preview without losing context.
          </h2>

          <p className="mt-3.5 sm:mt-4 text-base sm:text-lg font-normal leading-relaxed text-[#A1A1AA]">
            Inspect PDFs, high-resolution imagery, and code directly inside your workspace.
            Navigate smoothly through files without having to download them first.
          </p>
        </div>

        {/* CloudSpaceGo Preview Showcase UI */}
        <div className="mt-10 sm:mt-12 lg:mt-14 w-full rounded-2xl border border-[#24242B] bg-[#101014] overflow-hidden">
          {/* Preview Modal Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#24242B] px-5 sm:px-6 py-3.5 bg-[#0D0D10] gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#141419] border border-[#24242B] flex items-center justify-center shrink-0">
                {activeItem.type === 'pdf' && <FileText className="w-4 h-4 text-red-400" />}
                {activeItem.type === 'img' && <ImageIcon className="w-4 h-4 text-blue-400" />}
                {activeItem.type === 'code' && <FileCode className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-[#F5F5F7] truncate">
                  {activeItem.title}
                </p>
                <p className="text-[11px] text-[#71717A]">
                  File {currentIndex + 1} of {PREVIEWS.length} · {activeItem.size}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-[#141419] border border-[#24242B] rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 25, 50))}
                  className="p-1.5 text-[#71717A] hover:text-[#F5F5F7] hover:bg-[#101014] rounded-md transition-colors cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-mono text-[#A1A1AA]">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 25, 200))}
                  className="p-1.5 text-[#71717A] hover:text-[#F5F5F7] hover:bg-[#101014] rounded-md transition-colors cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#24242B] bg-[#141419] px-3 py-1.5 text-xs font-medium text-[#F5F5F7] hover:bg-[#101014] transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#6E60EE]" />}
                <span>{isCopied ? 'Copied' : 'Share'}</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#6E60EE] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#5F52DE] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>

          {/* Center Stage Preview Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px] sm:min-h-[480px]">
            {/* Main Stage */}
            <div className="relative lg:col-span-8 bg-[#0B0B0D] flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#24242B]">
              {/* Previous / Next Arrow Overlays */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#141419] border border-[#24242B] flex items-center justify-center text-[#F5F5F7] hover:bg-[#101014] transition-colors z-20 cursor-pointer"
                aria-label="Previous file"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#141419] border border-[#24242B] flex items-center justify-center text-[#F5F5F7] hover:bg-[#101014] transition-colors z-20 cursor-pointer"
                aria-label="Next file"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Central Preview Mockup Presentation */}
              <div
                className="relative w-full max-w-lg aspect-video rounded-xl border border-[#24242B] bg-[#101014] p-6 sm:p-8 flex flex-col justify-between transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA] bg-[#141419] border border-[#24242B] px-2 py-0.5 rounded">
                    SLIDE {currentIndex + 1} OF {PREVIEWS.length}
                  </span>
                </div>

                <div className="my-auto relative z-10 py-4">
                  <h4 className="text-lg sm:text-2xl font-bold tracking-tight text-[#F5F5F7]">
                    {activeItem.previewText}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                    {activeItem.previewSubtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#24242B] relative z-10 text-[11px] text-[#71717A]">
                  <span>{activeItem.title}</span>
                  <span>{activeItem.size}</span>
                </div>
              </div>

              {/* Bottom Carousel Indicator dots */}
              <div className="flex items-center gap-2 mt-6 z-10">
                {PREVIEWS.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex ? 'w-8 bg-[#6E60EE]' : 'w-2 bg-[#24242B] hover:bg-[#383842]'
                    }`}
                    aria-label={`View slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar Metadata Pane */}
            <div className="lg:col-span-4 p-5 sm:p-6 bg-[#101014] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-[#6E60EE]" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                    File Details
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#141419] border border-[#24242B]">
                    <span className="text-[11px] text-[#71717A] block">File Name</span>
                    <span className="font-semibold text-[#F5F5F7] break-all">{activeItem.title}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#141419] border border-[#24242B]">
                      <span className="text-[11px] text-[#71717A] block">File Size</span>
                      <span className="font-semibold text-[#F5F5F7]">{activeItem.size}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#141419] border border-[#24242B]">
                      <span className="text-[11px] text-[#71717A] block">Format</span>
                      <span className="font-semibold text-[#6E60EE] uppercase">{activeItem.type}</span>
                    </div>
                  </div>

                  {activeItem.dimensions && (
                    <div className="p-3 rounded-xl bg-[#141419] border border-[#24242B]">
                      <span className="text-[11px] text-[#71717A] block">Dimensions</span>
                      <span className="font-semibold text-[#F5F5F7]">{activeItem.dimensions}</span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-[#141419] border border-[#24242B]">
                    <span className="text-[11px] text-[#71717A] block">Modified</span>
                    <span className="font-medium text-[#F5F5F7]">{activeItem.modified}</span>
                  </div>
                </div>
              </div>

              {/* Quick Carousel Selector */}
              <div className="mt-6 pt-4 border-t border-[#24242B]">
                <span className="text-[11px] text-[#71717A] block mb-2 font-medium">
                  Switch file preview:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {PREVIEWS.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                        idx === currentIndex
                          ? 'border-[#6E60EE] bg-[#1D1935] text-[#6E60EE]'
                          : 'border-[#24242B] bg-[#141419] text-[#71717A] hover:border-[#383842]'
                      }`}
                    >
                      <span className="text-[10px] font-semibold block uppercase truncate">
                        {item.type}
                      </span>
                      <span className="text-[9px] text-[#71717A] block truncate">
                        {item.size}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </LandingContainer>
    </section>
  )
}

