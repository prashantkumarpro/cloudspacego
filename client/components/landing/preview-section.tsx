'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Image as ImageIcon,
  FileText,
  Code as CodeIcon,
  X,
  Home,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  Folder,
  Grid,
  List,
  MoreVertical,
  Sun,
  Moon
} from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { useInView } from '@/hooks/use-in-view'

interface PreviewSlideItem {
  id: string
  name: string
  index: number
  total: number
  size: string
  type: 'image' | 'pdf' | 'code'
}

const PREVIEW_SLIDES: PreviewSlideItem[] = [
  {
    id: '1',
    name: '2sept fre.jpg',
    index: 18,
    total: 20,
    size: '229.9 KB',
    type: 'image'
  },
  {
    id: '2',
    name: 'architecture.png',
    index: 19,
    total: 20,
    size: '1.4 MB',
    type: 'image'
  },
  {
    id: '3',
    name: 'product_spec.pdf',
    index: 20,
    total: 20,
    size: '4.2 MB',
    type: 'pdf'
  }
]

const BACKGROUND_FILES = [
  { name: 'b2.png', date: 'Oct 6, 2026', size: '1.4 MB' },
  { name: 'bnbg1.png', date: 'Oct 6, 2026', size: '1.2 MB' },
  { name: 'b3.png', date: 'Oct 6, 2026', size: '477.2 KB' },
  { name: 'b4.png', date: 'Oct 6, 2026', size: '1.4 MB' },
  { name: 'ChatGPT Image Oct 1, 2026, 03_03_45 PM.png', date: 'Oct 6, 2026', size: '1.3 MB' },
  { name: 'b5.png', date: 'Oct 6, 2026', size: '1.4 MB' }
]

export function PreviewSection() {
  const [slideIndex, setSlideIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [rotation, setRotation] = useState(0)
  const { ref: mockupRef } = useInView<HTMLDivElement>({ threshold: 0.15 })

  const currentSlide = PREVIEW_SLIDES[slideIndex]

  const handleNext = () => {
    setSlideIndex((prev) => (prev + 1) % PREVIEW_SLIDES.length)
    setZoomLevel(100)
    setRotation(0)
  }

  const handlePrev = () => {
    setSlideIndex((prev) => (prev - 1 + PREVIEW_SLIDES.length) % PREVIEW_SLIDES.length)
    setZoomLevel(100)
    setRotation(0)
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  return (
    <section id="preview" className="relative py-10 sm:py-14 lg:py-16 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10">
        {/* Section Header with Scroll Reveal */}
        <ScrollReveal className="max-w-2xl text-left" duration={500} distance={16}>
          <h2 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.15]">
            Preview without losing context.
          </h2>

          <p className="mt-2 sm:mt-2.5 max-w-xl text-sm sm:text-base font-normal leading-relaxed text-[#A1A1AA]">
            Inspect PDFs, high-resolution imagery, and code directly inside your workspace.
            Navigate smoothly through files without having to download.
          </p>
        </ScrollReveal>

        {/* CloudSpaceGo In-App Modal Preview Mockup */}
        <ScrollReveal delay={120} duration={550} distance={18}>
          <div ref={mockupRef} className="mt-5 sm:mt-6 w-full rounded-2xl border border-[#24242B] bg-[#0B0B0D] overflow-hidden relative shadow-2xl min-h-[520px] sm:min-h-[580px] flex flex-col justify-between select-none">
          
          {/* ======================================================== */}
          {/* BACKGROUND LAYER: Dimmed CloudSpaceGo App Interface      */}
          {/* ======================================================== */}
          <div className="absolute inset-0 flex opacity-35 pointer-events-none select-none overflow-hidden">
            {/* Sidebar Mockup */}
            <div className="w-52 sm:w-60 border-r border-[#24242B] bg-[#0B0B0D] p-4 hidden md:flex flex-col justify-between shrink-0">
              <div className="space-y-6">
                <div className="h-16 flex items-center gap-2.5 px-2 shrink-0">
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <Image
                      src="/images/cloudeLogo.png"
                      width={32}
                      height={28}
                      alt="cloudspacego logo"
                      className="w-8 h-auto object-contain shrink-0"
                    />
                  </div>
                  <span className="text-xl font-bold tracking-tight font-sans truncate text-[#F5F5F7] flex items-center whitespace-nowrap">
                    cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
                  </span>
                </div>

                <div className="space-y-1 text-xs font-semibold text-[#A1A1AA]">
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7]">
                    <Home className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Home</span>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#6E60EE] bg-[#1D1935] font-bold">
                    <HardDrive className="w-4.5 h-4.5 text-[#6E60EE]" strokeWidth={2.2} />
                    <span>My Files</span>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] transition-colors">
                    <Users className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Shared with me</span>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] transition-colors">
                    <Clock className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Recent</span>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] transition-colors">
                    <Star className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Starred</span>
                  </div>

                  {/* Divider before Trash */}
                  <div className="h-[1px] bg-[#24242B] my-1 mx-1 shrink-0" />

                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] transition-colors">
                    <Trash2 className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Trash</span>
                  </div>
                </div>
              </div>

              {/* Sidebar Storage Meter */}
              <div className="space-y-3 pt-4 border-t border-[#24242B] text-xs mt-auto">
                <div className="w-full bg-[#101014] rounded-xl border border-[#24242B] p-3 shadow-xs flex flex-col gap-2.5 select-none">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F5F7]">Storage</span>
                    <span className="text-[10px] font-bold text-white bg-[#6E60EE] px-2 py-0.5 rounded-full">
                      12%
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="w-full h-1.5 rounded-full bg-[#141419] border border-[#24242B]/60 overflow-hidden">
                      <div className="h-full w-[12%] bg-[#6E60EE] rounded-full" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#71717A]">
                      <span>23.3 MB used</span>
                      <span>176.7 MB free</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#6E60EE] pt-0.5 cursor-pointer">
                    <span>Upgrade Storage</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#6E60EE]" />
                  </div>
                </div>

                {/* Theme Pill */}
                <div className="w-full p-1 bg-[#141419] rounded-xl flex items-center justify-between select-none relative border border-[#24242B] gap-1 text-xs">
                  <div className="w-1/2 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[#71717A]">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-medium">Light</span>
                  </div>
                  <div className="w-1/2 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-[#101014] text-[#6E60EE] font-bold shadow-xs border border-[#24242B]/60">
                    <Moon className="w-3.5 h-3.5 text-[#6E60EE]" />
                    <span className="text-[11px] font-bold text-white">Dark</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0B0B0D] p-6">
              <h3 className="text-base font-bold text-[#F5F5F7] mb-4">My Files</h3>

              {/* Folders Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { name: 'pkdev', files: '0 files' },
                  { name: 'images', files: '0 files' },
                  { name: 'docs', files: '0 files' },
                  { name: 'videos', files: '0 files' }
                ].map((folder) => (
                  <div key={folder.name} className="flex items-center gap-2.5 p-3 rounded-xl border border-[#24242B] bg-[#101014] min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#1D1935] border border-[#6E60EE]/20 flex items-center justify-center text-[#6E60EE] shrink-0">
                      <Folder className="w-4.5 h-4.5 text-[#6E60EE]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#F5F5F7] block truncate">{folder.name}</span>
                      <span className="text-[10px] text-[#71717A] block truncate">{folder.files}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Files Table Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#F5F5F7]">Files</span>
                <div className="flex items-center bg-[#141419] border border-[#24242B] rounded-lg p-0.5">
                  <div className="p-1 text-[#71717A] rounded"><Grid className="w-3.5 h-3.5" /></div>
                  <div className="p-1 text-[#6E60EE] bg-[#1D1935] rounded"><List className="w-3.5 h-3.5" /></div>
                </div>
              </div>

              {/* Files Table Rows */}
              <div className="divide-y divide-[#24242B]/40 text-xs">
                {BACKGROUND_FILES.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-[#71717A]">
                    <div className="flex items-center gap-2 text-[#F5F5F7] truncate">
                      <div className="w-5 h-5 rounded bg-[#18181E] flex items-center justify-center shrink-0">
                        <ImageIcon className="w-3 h-3 text-[#71717A]" />
                      </div>
                      <span className="truncate">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <span>{f.date}</span>
                      <span>{f.size}</span>
                      <MoreVertical className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BACKDROP DIMMER OVERLAY                                  */}
          {/* ======================================================== */}
          <div className="absolute inset-0 bg-[#0B0B0D]/75 backdrop-blur-[2px] z-10" />

          {/* ======================================================== */}
          {/* FOREGROUND: Real CloudSpaceGo Preview Modal              */}
          {/* ======================================================== */}
          <div className="relative z-20 flex flex-col justify-between flex-1 min-h-full">
            
            {/* Top Bar / Modal Header */}
            <div className="h-14 sm:h-16 px-4 sm:px-6 bg-[#0D0D10]/95 backdrop-blur-md border-b border-[#24242B]/80 flex items-center justify-between gap-3 shrink-0">
              {/* Left: Icon + File Name + Badges */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  {currentSlide.type === 'image' ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-[#F5F5F7] tracking-tight truncate max-w-[160px] sm:max-w-xs">
                    {currentSlide.name}
                  </h3>

                  <span className="text-[11px] font-medium text-[#71717A] bg-[#141419] px-2 py-0.5 rounded-full shrink-0">
                    {currentSlide.index} of {currentSlide.total}
                  </span>

                  <span className="text-[11px] font-medium text-[#71717A] bg-[#141419] px-2 py-0.5 rounded-full shrink-0 hidden sm:inline-block">
                    {currentSlide.size}
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#24242B] bg-[#141419] hover:bg-[#1A1A22] hover:border-[#383842] text-xs font-semibold text-[#F5F5F7] transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE] cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#71717A]" />
                  <span className="hidden sm:inline">Open in tab</span>
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#6E60EE] hover:bg-[#5F52DE] text-white text-xs font-semibold shadow-xs transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  className="p-1.5 text-[#71717A] hover:text-[#F5F5F7] rounded-lg transition-colors cursor-pointer ml-1"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Central Stage Viewport */}
            <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden min-h-[360px] sm:min-h-[420px]">
              
              {/* Previous Slide Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#141419]/90 border border-[#24242B] flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] hover:border-[#6E60EE]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl"
                aria-label="Previous file"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Slide Button */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#141419]/90 border border-[#24242B] flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] hover:border-[#6E60EE]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl"
                aria-label="Next file"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Main Artwork Preview Card (Exact Replica of Screenshot) */}
              <div
                key={currentSlide.id}
                className="w-full max-w-[400px] sm:max-w-[440px] aspect-square rounded-2xl border border-[#2A2A35] bg-[#121217] shadow-2xl p-6 sm:p-9 flex flex-col justify-center relative overflow-hidden transition-transform duration-200 ease-out select-none animate-hero-fade-in"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`
                }}
              >
                {/* Visual quote composition matching screenshot */}
                <div className="space-y-4 sm:space-y-5 text-left">
                  
                  {/* Top amber doodle rays + Heading */}
                  <div>
                    {/* Hand-drawn yellow ray accents */}
                    <div className="mb-1 ml-1">
                      <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 14L2 12M9 7L6 4M14 5L14 2" />
                      </svg>
                    </div>

                    <h4 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#F5F5F7] leading-tight">
                      Don&apos;t choose the
                    </h4>
                    
                    <div className="relative inline-block mt-0.5">
                      <span className="text-2xl sm:text-[28px] font-black tracking-tight text-[#F59E0B] leading-tight">
                        technology first.
                      </span>
                      {/* Hand-drawn amber underline */}
                      <svg className="w-full h-2 text-[#F59E0B] -mt-0.5" viewBox="0 0 190 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M2 5c35-3 110-3 186 1" />
                      </svg>
                    </div>
                  </div>

                  {/* Middle section: Understand the client's problem first + Lightbulb */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#F5F5F7] leading-tight">
                          Understand the client&apos;s
                        </h4>

                        <div className="relative inline-block mt-0.5">
                          <span className="text-2xl sm:text-[28px] font-black tracking-tight text-[#10B981] leading-tight">
                            problem first.
                          </span>
                          {/* Hand-drawn green underline */}
                          <svg className="w-full h-2 text-[#10B981] -mt-0.5" viewBox="0 0 160 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M2 5c30-3 90-3 156 1" />
                          </svg>
                        </div>
                      </div>

                      {/* Lightbulb graphic with glowing energy rays */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 text-[#10B981] relative">
                        <svg className="w-10 h-10 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18h6" />
                          <path d="M10 22h4" />
                          <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                          <path d="M12 2V0.5" strokeWidth="2" />
                          <path d="M20.5 4.5l1.2-1.2" strokeWidth="2" />
                          <path d="M3.5 4.5L2.3 3.3" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Bottom subtext in soft gray */}
                  <div className="pt-2 text-xs sm:text-sm font-medium text-[#A1A1AA] leading-snug">
                    <p>Then make the technical</p>
                    <p>decision around it.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Floating Viewer Control Toolbar */}
            <div className="flex items-center justify-center pb-5 sm:pb-6 z-20">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#141419]/95 border border-[#24242B] backdrop-blur-md shadow-2xl text-xs text-[#A1A1AA]">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 25, 50))}
                  className="p-1 text-[#71717A] hover:text-[#F5F5F7] transition-colors cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <span className="font-mono text-xs font-semibold text-[#F5F5F7] min-w-[36px] text-center">
                  {zoomLevel}%
                </span>

                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 25, 200))}
                  className="p-1 text-[#71717A] hover:text-[#F5F5F7] transition-colors cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-3.5 bg-[#24242B]" />

                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1 text-[#71717A] hover:text-[#F5F5F7] transition-colors cursor-pointer"
                  title="Rotate clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </LandingContainer>
    </section>
  )
}
