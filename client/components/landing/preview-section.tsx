'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  Moon,
  Sparkles,
  Camera,
  Server,
  Layers,
  CheckCircle2,
  Lock,
  Cpu
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
  type: 'image' | 'code' | 'pdf' | 'diagram'
}

const PREVIEW_SLIDES: PreviewSlideItem[] = [
  {
    id: 'quote-card',
    name: '2sept fre.jpg',
    index: 18,
    total: 20,
    size: '229.9 KB',
    type: 'image'
  },
  {
    id: 'aurora-photo',
    name: 'aurora_fjord.jpg',
    index: 19,
    total: 20,
    size: '3.8 MB',
    type: 'image'
  },
  {
    id: 'arch-diagram',
    name: 'cloudspace_arch.png',
    index: 20,
    total: 20,
    size: '1.4 MB',
    type: 'diagram'
  },
  {
    id: 'code-snippet',
    name: 'auth_service.ts',
    index: 1,
    total: 20,
    size: '14.2 KB',
    type: 'code'
  },
  {
    id: 'brand-pdf',
    name: 'brand_identity.pdf',
    index: 2,
    total: 20,
    size: '2.9 MB',
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
  const { ref: mockupRef, isInView } = useInView<HTMLDivElement>({ threshold: 0.15 })

  const currentSlide = PREVIEW_SLIDES[slideIndex]

  const handleNext = useCallback(() => {
    setSlideIndex((prev) => (prev + 1) % PREVIEW_SLIDES.length)
    setZoomLevel(100)
    setRotation(0)
  }, [])

  const handlePrev = useCallback(() => {
    setSlideIndex((prev) => (prev - 1 + PREVIEW_SLIDES.length) % PREVIEW_SLIDES.length)
    setZoomLevel(100)
    setRotation(0)
  }, [])

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInView) return
      if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isInView, handleNext, handlePrev])

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
          <div ref={mockupRef} className="mt-5 sm:mt-6 w-full rounded-2xl border border-[#24242B] bg-[#0B0B0D] overflow-hidden relative shadow-2xl min-h-[520px] sm:min-h-[590px] flex flex-col justify-between select-none">
          
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
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  currentSlide.type === 'image'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : currentSlide.type === 'code'
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                    : currentSlide.type === 'pdf'
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    : 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                }`}>
                  {currentSlide.type === 'image' ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : currentSlide.type === 'code' ? (
                    <CodeIcon className="w-4 h-4" />
                  ) : currentSlide.type === 'pdf' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Layers className="w-4 h-4" />
                  )}
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-[#F5F5F7] tracking-tight truncate max-w-[160px] sm:max-w-xs transition-all">
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

            {/* Central Stage Viewport with Smooth Sliding Track */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden min-h-[380px] sm:min-h-[430px]">
              
              {/* Previous Slide Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#141419]/90 border border-[#24242B] flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] hover:border-[#6E60EE]/60 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-md"
                aria-label="Previous file"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Slide Button */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#141419]/90 border border-[#24242B] flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] hover:border-[#6E60EE]/60 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl backdrop-blur-md"
                aria-label="Next file"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Outer Slider Window */}
              <div className="relative w-full max-w-[400px] sm:max-w-[440px] aspect-square rounded-2xl border border-[#2A2A35] bg-[#121217] shadow-2xl overflow-hidden">
                
                {/* ---------------------------------------------------- */}
                {/* SLIDE 0: The Original Quote Card (2sept fre.jpg)     */}
                {/* ---------------------------------------------------- */}
                <div
                  className="absolute inset-0 w-full h-full p-6 sm:p-8 flex flex-col justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none bg-[#121217]"
                  style={{
                    transform: `translateX(${(0 - slideIndex) * 100}%) ${
                      slideIndex === 0 ? `scale(${zoomLevel / 100}) rotate(${rotation}deg)` : 'scale(0.92)'
                    }`,
                    opacity: slideIndex === 0 ? 1 : 0,
                    pointerEvents: slideIndex === 0 ? 'auto' : 'none',
                    visibility: Math.abs(0 - slideIndex) > 1 ? 'hidden' : 'visible'
                  }}
                >
                  <div className="space-y-4 sm:space-y-5 text-left">
                    <div>
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
                        <svg className="w-full h-2 text-[#F59E0B] -mt-0.5" viewBox="0 0 190 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M2 5c35-3 110-3 186 1" />
                        </svg>
                      </div>
                    </div>

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
                            <svg className="w-full h-2 text-[#10B981] -mt-0.5" viewBox="0 0 160 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M2 5c30-3 90-3 156 1" />
                            </svg>
                          </div>
                        </div>

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

                    <div className="pt-2 text-xs sm:text-sm font-medium text-[#A1A1AA] leading-snug">
                      <p>Then make the technical</p>
                      <p>decision around it.</p>
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* SLIDE 1: Nordic Aurora Photography (aurora_fjord.jpg)*/}
                {/* ---------------------------------------------------- */}
                <div
                  className="absolute inset-0 w-full h-full p-0 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none bg-gradient-to-b from-[#060D1A] via-[#091526] to-[#040810] overflow-hidden"
                  style={{
                    transform: `translateX(${(1 - slideIndex) * 100}%) ${
                      slideIndex === 1 ? `scale(${zoomLevel / 100}) rotate(${rotation}deg)` : 'scale(0.92)'
                    }`,
                    opacity: slideIndex === 1 ? 1 : 0,
                    pointerEvents: slideIndex === 1 ? 'auto' : 'none',
                    visibility: Math.abs(1 - slideIndex) > 1 ? 'hidden' : 'visible'
                  }}
                >
                  {/* Sky Stars & Glowing Aurora Ribbons */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Aurora Glow Mesh */}
                    <div className="absolute -top-12 left-0 right-0 h-48 bg-gradient-to-r from-emerald-500/30 via-teal-400/40 to-purple-500/30 blur-2xl transform -rotate-12 scale-125" />
                    <div className="absolute top-8 -left-10 w-72 h-36 bg-gradient-to-tr from-emerald-400/40 via-cyan-400/30 to-transparent blur-xl transform rotate-6" />
                    <div className="absolute top-16 right-0 w-60 h-32 bg-gradient-to-bl from-purple-500/35 via-indigo-500/20 to-transparent blur-xl" />

                    {/* Star particles */}
                    <div className="absolute top-6 left-10 w-1 h-1 bg-white rounded-full opacity-80 shadow-[0_0_4px_#fff]" />
                    <div className="absolute top-14 left-24 w-1.5 h-1.5 bg-cyan-200 rounded-full opacity-90 shadow-[0_0_6px_#67e8f9]" />
                    <div className="absolute top-20 right-16 w-1 h-1 bg-white rounded-full opacity-70" />
                    <div className="absolute top-10 right-32 w-1.5 h-1.5 bg-emerald-200 rounded-full opacity-90 shadow-[0_0_6px_#a7f3d0]" />
                    <div className="absolute top-28 left-1/2 w-1 h-1 bg-white rounded-full opacity-60" />

                    {/* Mountain Silhouettes */}
                    <svg className="absolute bottom-12 left-0 right-0 w-full text-[#03060C]" viewBox="0 0 400 120" fill="currentColor">
                      <polygon points="0,120 0,60 45,30 90,65 140,20 195,70 260,15 320,55 370,35 400,60 400,120" />
                    </svg>

                    {/* Fjord Water Reflection */}
                    <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#020408] to-[#06101E]/90 border-t border-emerald-500/20">
                      <div className="h-full w-full opacity-30 bg-gradient-to-r from-emerald-400/20 via-cyan-400/30 to-purple-400/20 blur-sm" />
                    </div>
                  </div>

                  {/* Top Metadata Header */}
                  <div className="relative z-10 p-5 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10.5px] font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      4K RAW Photography
                    </span>
                    <span className="text-[11px] font-medium text-white/75 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                      Lofoten, Norway
                    </span>
                  </div>

                  {/* Bottom Camera Metadata Pill */}
                  <div className="relative z-10 p-5 mt-auto flex items-center justify-between text-[11px] text-white/80">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono text-[10.5px]">
                      <Camera className="w-3.5 h-3.5 text-cyan-400" />
                      <span>24mm · ƒ/1.8 · 8s · ISO 640</span>
                    </div>
                    <span className="text-[10px] text-white/60">Sony A7R V</span>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* SLIDE 2: CloudSpace Architecture (cloudspace_arch)   */}
                {/* ---------------------------------------------------- */}
                <div
                  className="absolute inset-0 w-full h-full p-5 sm:p-6 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none bg-[#0D0E12]"
                  style={{
                    transform: `translateX(${(2 - slideIndex) * 100}%) ${
                      slideIndex === 2 ? `scale(${zoomLevel / 100}) rotate(${rotation}deg)` : 'scale(0.92)'
                    }`,
                    opacity: slideIndex === 2 ? 1 : 0,
                    pointerEvents: slideIndex === 2 ? 'auto' : 'none',
                    visibility: Math.abs(2 - slideIndex) > 1 ? 'hidden' : 'visible'
                  }}
                >
                  <div className="flex items-center justify-between border-b border-[#24242B] pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#6E60EE]" />
                      <span className="text-xs font-bold text-[#F5F5F7]">CloudSpace Distributed Mesh</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      HEALTHY
                    </span>
                  </div>

                  {/* Visual Node Diagram */}
                  <div className="space-y-2.5 my-auto">
                    {/* Node 1: Edge Router */}
                    <div className="p-2.5 rounded-xl bg-[#141419] border border-[#6E60EE]/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#1D1935] text-[#6E60EE] flex items-center justify-center font-bold text-xs">
                          E1
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#F5F5F7]">Global Edge Gateway</p>
                          <p className="text-[10px] text-[#71717A]">TLS 1.3 · Anycast DNS</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#6E60EE] font-semibold">12ms p99</span>
                    </div>

                    {/* Connector Arrow */}
                    <div className="flex justify-center -my-1 text-[#6E60EE]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Node 2: Replicated NVMe Cluster */}
                    <div className="p-2.5 rounded-xl bg-[#141419] border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          <Server className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#F5F5F7]">Replicated NVMe Shards</p>
                          <p className="text-[10px] text-[#71717A]">3x Multi-Region Redundancy</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">4.2 GB/s</span>
                    </div>
                  </div>

                  {/* Architecture Metrics Footer */}
                  <div className="pt-3 border-t border-[#24242B] flex items-center justify-between text-[10.5px] text-[#71717A]">
                    <span className="flex items-center gap-1.5 text-[#A1A1AA]">
                      <Lock className="w-3 h-3 text-[#6E60EE]" />
                      AES-256 GCM
                    </span>
                    <span className="font-mono text-[#A1A1AA]">99.999% SLA</span>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* SLIDE 3: Code Snippet (auth_service.ts)              */}
                {/* ---------------------------------------------------- */}
                <div
                  className="absolute inset-0 w-full h-full p-5 sm:p-6 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none bg-[#0E1015]"
                  style={{
                    transform: `translateX(${(3 - slideIndex) * 100}%) ${
                      slideIndex === 3 ? `scale(${zoomLevel / 100}) rotate(${rotation}deg)` : 'scale(0.92)'
                    }`,
                    opacity: slideIndex === 3 ? 1 : 0,
                    pointerEvents: slideIndex === 3 ? 'auto' : 'none',
                    visibility: Math.abs(3 - slideIndex) > 1 ? 'hidden' : 'visible'
                  }}
                >
                  {/* Code Editor Window Header */}
                  <div className="flex items-center justify-between border-b border-[#24242B] pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-[#A1A1AA]">
                      auth_service.ts
                    </span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      TypeScript
                    </span>
                  </div>

                  {/* Formatted Code Block */}
                  <div className="font-mono text-[11px] sm:text-[11.5px] leading-relaxed my-auto text-left space-y-1 bg-[#090A0D] p-3.5 rounded-xl border border-[#1E2028]">
                    <p className="text-[#71717A] italic">// Zero-Knowledge Access Guard</p>
                    <p>
                      <span className="text-purple-400">export async function</span>{' '}
                      <span className="text-blue-400">verifyFileAccess</span>
                      <span className="text-[#F5F5F7]">(req: Request) &#123;</span>
                    </p>
                    <p className="pl-3">
                      <span className="text-purple-400">const</span> user ={' '}
                      <span className="text-purple-400">await</span> auth.
                      <span className="text-yellow-300">getSession</span>();
                    </p>
                    <p className="pl-3">
                      <span className="text-purple-400">if</span> (!user){' '}
                      <span className="text-purple-400">throw new</span>{' '}
                      <span className="text-rose-400">UnauthorizedError</span>();
                    </p>
                    <p className="pl-3">
                      <span className="text-purple-400">return</span> acl.
                      <span className="text-yellow-300">grantAccess</span>(user.id);
                    </p>
                    <p className="text-[#F5F5F7]">&#125;</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-[#71717A] font-mono">
                    <span>UTF-8 · LF</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Syntax Verified
                    </span>
                  </div>
                </div>

                {/* ---------------------------------------------------- */}
                {/* SLIDE 4: Brand Identity PDF Spec (brand_identity.pdf)*/}
                {/* ---------------------------------------------------- */}
                <div
                  className="absolute inset-0 w-full h-full p-6 sm:p-7 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none bg-[#111116]"
                  style={{
                    transform: `translateX(${(4 - slideIndex) * 100}%) ${
                      slideIndex === 4 ? `scale(${zoomLevel / 100}) rotate(${rotation}deg)` : 'scale(0.92)'
                    }`,
                    opacity: slideIndex === 4 ? 1 : 0,
                    pointerEvents: slideIndex === 4 ? 'auto' : 'none',
                    visibility: Math.abs(4 - slideIndex) > 1 ? 'hidden' : 'visible'
                  }}
                >
                  <div className="flex items-center justify-between border-b border-[#24242B] pb-3">
                    <div>
                      <h5 className="text-xs font-bold text-[#F5F5F7]">CloudSpaceGo Brand Spec</h5>
                      <p className="text-[10px] text-[#71717A]">Official Design System · 2026 Edition</p>
                    </div>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                      PDF · Page 1/12
                    </span>
                  </div>

                  {/* Brand Swatches & Typography specimen */}
                  <div className="space-y-3.5 my-auto text-left">
                    <div>
                      <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1.5">
                        Core Palette
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-2 rounded-lg bg-[#6E60EE] text-white text-center">
                          <p className="text-[10px] font-bold">Iris</p>
                          <p className="text-[8.5px] opacity-80 font-mono">#6E60EE</p>
                        </div>
                        <div className="p-2 rounded-lg bg-[#10B981] text-white text-center">
                          <p className="text-[10px] font-bold">Emerald</p>
                          <p className="text-[8.5px] opacity-80 font-mono">#10B981</p>
                        </div>
                        <div className="p-2 rounded-lg bg-[#F59E0B] text-white text-center">
                          <p className="text-[10px] font-bold">Amber</p>
                          <p className="text-[8.5px] opacity-80 font-mono">#F59E0B</p>
                        </div>
                        <div className="p-2 rounded-lg bg-[#1A1A24] border border-[#323240] text-[#F5F5F7] text-center">
                          <p className="text-[10px] font-bold">Dark</p>
                          <p className="text-[8.5px] text-[#71717A] font-mono">#0B0B0D</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#141419] border border-[#24242B]">
                      <p className="text-[10px] text-[#71717A] uppercase font-bold">Typography Hierarchy</p>
                      <p className="text-sm font-extrabold text-[#F5F5F7] mt-0.5">
                        Plus Jakarta Sans <span className="font-serif italic font-normal text-[#6E60EE]">& Instrument</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#24242B] flex items-center justify-between text-[10px] text-[#71717A]">
                    <span>CloudSpaceGo Design Team</span>
                    <span>Confidential</span>
                  </div>
                </div>

              </div>

              {/* Slide Navigation Indicator Dots */}
              <div className="flex items-center gap-2 mt-4 z-30">
                {PREVIEW_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => {
                      setSlideIndex(idx)
                      setZoomLevel(100)
                      setRotation(0)
                    }}
                    aria-label={`Go to slide ${idx + 1}: ${slide.name}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      slideIndex === idx
                        ? 'w-7 h-2 bg-[#6E60EE]'
                        : 'w-2 h-2 bg-[#24242B] hover:bg-[#71717A]'
                    }`}
                  />
                ))}
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

