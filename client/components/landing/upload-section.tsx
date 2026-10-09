'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Folder,
  Home,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  Bell,
  Settings,
  Plus,
  Search,
  Minus,
  X,
  ChevronRight,
  MoreVertical,
  Video,
  Check,
  ChevronUp,
  Sun,
  Moon,
  ArrowUp
} from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { useInView } from '@/hooks/use-in-view'

interface UploadFileItem {
  id: string
  name: string
  size: string
  type: 'pdf' | 'sheet' | 'img'
  progress: number
  status: 'uploading' | 'queued' | 'completed'
}

const INITIAL_UPLOADS: UploadFileItem[] = [
  {
    id: '1',
    name: 'Prashant_Resume.pdf',
    size: '31.3 KB',
    type: 'pdf',
    progress: 100,
    status: 'completed'
  },
  {
    id: '2',
    name: 'Professional_Job_Application_Tracker.xlsx',
    size: '11.9 KB',
    type: 'sheet',
    progress: 100,
    status: 'completed'
  },
  {
    id: '3',
    name: 'FasterQ - Full Stack Developer Internship A...',
    size: '145.7 KB',
    type: 'pdf',
    progress: 68,
    status: 'uploading'
  },
  {
    id: '4',
    name: 'poster1.jpeg',
    size: '529.6 KB',
    type: 'img',
    progress: 32,
    status: 'uploading'
  },
  {
    id: '5',
    name: 'poster1.1.png',
    size: '1.4 MB',
    type: 'img',
    progress: 0,
    status: 'queued'
  }
]

const RECENTLY_OPENED_FILES = [
  {
    id: '1',
    name: 'vs3.mp4',
    type: 'video',
    owner: 'Me',
    date: 'Today, 2:01 PM',
    size: '10.6 MB'
  },
  {
    id: '2',
    name: 'poster1.5.jpeg',
    type: 'img',
    owner: 'Me',
    date: 'Today, 2:01 PM',
    size: '2.1 MB'
  },
  {
    id: '3',
    name: 'Prashant_Resume.pdf',
    type: 'pdf',
    owner: 'Me',
    date: 'Today, 2:01 PM',
    size: '31.3 KB'
  },
  {
    id: '4',
    name: 'Professional_Job_Application_Tracker.xlsx',
    type: 'sheet',
    owner: 'Me',
    date: 'Today, 2:01 PM',
    size: '11.9 KB'
  }
]

export function UploadSection() {
  const [uploads, setUploads] = useState<UploadFileItem[]>(INITIAL_UPLOADS)
  const [isMinimized, setIsMinimized] = useState(false)
  const { ref: mockupRef, isInView } = useInView<HTMLDivElement>({ threshold: 0.15 })

  // Smooth live progress simulation for real-time feel
  useEffect(() => {
    const interval = setInterval(() => {
      setUploads((prev) =>
        prev.map((item) => {
          if (item.status === 'completed') return item
          if (item.progress >= 100) {
            return { ...item, progress: 100, status: 'completed' }
          }
          if (item.progress === 0 && Math.random() > 0.6) {
            return { ...item, progress: 8, status: 'uploading' }
          }
          if (item.progress > 0) {
            const next = Math.min(item.progress + 2, 100)
            return {
              ...item,
              progress: next,
              status: next === 100 ? 'completed' : 'uploading'
            }
          }
          return item
        })
      )
    }, 600)

    return () => clearInterval(interval)
  }, [])

  const renderRecentFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <div className="w-6 h-6 rounded bg-[#2A1835] border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
            <Video className="w-3.5 h-3.5" />
          </div>
        )
      case 'img':
        return (
          <div className="w-6 h-6 rounded bg-[#122338] border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
        )
      case 'pdf':
        return (
          <div className="w-6 h-6 rounded bg-[#301618] border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
        )
      case 'sheet':
        return (
          <div className="w-6 h-6 rounded bg-[#122A1E] border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
        )
      default:
        return (
          <div className="w-6 h-6 rounded bg-[#18181E] flex items-center justify-center shrink-0 text-[#71717A]">
            <FileText className="w-3.5 h-3.5" />
          </div>
        )
    }
  }

  const renderFileIcon = (type: UploadFileItem['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-400 shrink-0" />
      case 'sheet':
        return <FileSpreadsheet className="w-4 h-4 text-blue-400 shrink-0" />
      case 'img':
      default:
        return <ImageIcon className="w-4 h-4 text-sky-400 shrink-0" />
    }
  }

  return (
    <section id="uploads" className="relative py-10 sm:py-14 lg:py-16 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10">
        {/* Section Header with Scroll Reveal */}
        <ScrollReveal className="max-w-2xl text-left" duration={500} distance={16}>
          <h2 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.15]">
            Your uploads, always within reach.
          </h2>

          <p className="mt-2 sm:mt-2.5 max-w-xl text-sm sm:text-base font-normal leading-relaxed text-[#A1A1AA]">
            Upload files and folders smoothly. CloudSpaceGo keeps you informed with real-time progress, pause and resume controls, and reliable background transfers.
          </p>
        </ScrollReveal>

        {/* CloudSpaceGo Dashboard + Floating Upload Widget Mockup */}
        <ScrollReveal delay={120} duration={550} distance={18}>
          <div ref={mockupRef} className="mt-5 sm:mt-6 w-full rounded-2xl border border-[#24242B] bg-[#0B0B0D] overflow-hidden relative shadow-2xl min-h-[500px] sm:min-h-[540px] flex select-none">
            
            {/* ======================================================== */}
            {/* LEFT SIDEBAR MOCKUP                                      */}
            {/* ======================================================== */}
            <div className="w-52 sm:w-60 border-r border-[#24242B] bg-[#0B0B0D] p-4 hidden md:flex flex-col justify-between shrink-0">
              <div className="space-y-6">
                {/* Brand Logo */}
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

                {/* Navigation Links */}
                <div className="space-y-1 text-xs font-semibold text-[#A1A1AA]">
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#6E60EE] bg-[#1D1935] font-bold">
                    <Home className="w-4.5 h-4.5 text-[#6E60EE]" strokeWidth={2.2} />
                    <span>Home</span>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors">
                    <HardDrive className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>My Files</span>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors">
                    <Users className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Shared with me</span>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors">
                    <Clock className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Recent</span>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors">
                    <Star className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Starred</span>
                  </div>

                  {/* Divider before Trash */}
                  <div className="h-[1px] bg-[#24242B] my-1 mx-1 shrink-0" />

                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors">
                    <Trash2 className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Trash</span>
                  </div>
                </div>
              </div>

              {/* Sidebar Bottom: Storage Meter & Theme Toggle */}
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
                      <div className="h-full w-[12%] bg-[#6E60EE] rounded-full transition-all duration-700 ease-out" />
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

            {/* ======================================================== */}
            {/* MAIN DASHBOARD CONTENT AREA                              */}
            {/* ======================================================== */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0B0B0D] overflow-hidden">
              
              {/* Top Navigation Bar */}
              <div className="h-16 border-b border-[#24242B] px-4 sm:px-6 bg-[#0B0B0D] flex items-center justify-between shrink-0">
                {/* Left Side: Mobile Menu + Pill Capsule */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile hamburger menu toggle */}
                  <div className="md:hidden flex w-8 h-8 items-center justify-center text-[#71717A] hover:text-[#F5F5F7] rounded-full">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 8h16M4 16h10" />
                    </svg>
                  </div>

                  {/* Left Action Buttons Pill Capsule (Matching Real Header SearchBar) */}
                  <div className="flex items-center bg-[#141419] border border-[#24242B] rounded-full p-1 gap-2 shadow-none shrink-0 h-10">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#71717A]">
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M9 3v18" />
                      </svg>
                    </div>

                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#71717A]">
                      <Search className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={2.2} />
                    </div>

                    <div className="w-7 h-7 rounded-full bg-[#6E60EE] flex items-center justify-center text-white shadow-xs">
                      <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                {/* Right User Bar Cluster */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-[#71717A] relative">
                    <Bell className="w-5 h-5 text-[#71717A]" strokeWidth={2} />
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0B0B0D]">
                      3
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-[#71717A]">
                    <Settings className="w-5 h-5 text-[#71717A]" strokeWidth={2} />
                  </div>

                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#18181D] border border-[#24242B] flex items-center justify-center text-xs font-bold text-[#F5F5F7] shadow-xs select-none">
                    P
                  </div>
                </div>
              </div>

              {/* Dashboard Scrollable Area */}
              <div className="p-6 sm:p-8 space-y-6 overflow-hidden">
                
                {/* Greeting */}
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#F5F5F7] tracking-tight font-sans">
                    Good afternoon, Prashant
                  </h2>
                  <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-normal">
                    Everything you need, right where you left it.
                  </p>
                </div>

                {/* CONTINUE: pkdev Banner */}
                <div className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[#24242B] bg-[#101014] hover:border-[#383842] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1D1935] border border-[#6E60EE]/20 flex items-center justify-center text-[#6E60EE] shrink-0">
                      <Folder className="w-4.5 h-4.5 text-[#6E60EE]" />
                    </div>
                    <span className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider">CONTINUE:</span>
                    <span className="text-sm font-bold text-[#F5F5F7]">pkdev</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#71717A]">
                    <span>Recently</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Your Folders Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#F5F5F7] tracking-tight">Your folders</h3>
                    <span className="text-xs font-semibold text-[#6E60EE] hover:underline cursor-pointer">View all</span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {[
                      { name: 'pkdev', files: '0 files' },
                      { name: 'images', files: '0 files' },
                      { name: 'docs', files: '0 files' },
                      { name: 'videos', files: '0 files' }
                    ].map((folder) => (
                      <div
                        key={folder.name}
                        className="p-3.5 rounded-xl border border-[#24242B] bg-[#101014] flex items-center justify-between hover:bg-[#141419] hover:border-[#383842] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#1D1935] border border-[#6E60EE]/20 flex items-center justify-center text-[#6E60EE] shrink-0">
                            <Folder className="w-4.5 h-4.5 text-[#6E60EE]" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#F5F5F7] block truncate">{folder.name}</span>
                            <span className="text-[11px] text-[#71717A]">{folder.files}</span>
                          </div>
                        </div>
                        <MoreVertical className="w-4 h-4 text-[#71717A] group-hover:text-white shrink-0 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recently Opened Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#F5F5F7] tracking-tight">Recently Opened</h3>
                  </div>

                  <div className="rounded-xl border border-[#24242B] bg-[#101014] overflow-hidden text-xs">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 text-[11px] font-semibold text-[#71717A] py-2.5 px-4 border-b border-[#24242B] bg-[#0D0D10]/90 select-none">
                      <div className="col-span-5 flex items-center gap-1.5">
                        <span>Name</span>
                        <ArrowUp className="w-3 h-3 text-[#6E60EE]" />
                      </div>
                      <div className="col-span-2">Owner</div>
                      <div className="col-span-3">Date modified</div>
                      <div className="col-span-1 text-right">File size</div>
                      <div className="col-span-1 text-right pr-1">Actions</div>
                    </div>

                    {/* Table Rows matching real dashboard */}
                    <div className="divide-y divide-[#24242B]/50">
                      {RECENTLY_OPENED_FILES.map((f) => (
                        <div
                          key={f.id}
                          className="grid grid-cols-12 items-center py-3 px-4 text-[#A1A1AA] hover:bg-[#141419] transition-colors cursor-pointer group"
                        >
                          <div className="col-span-5 flex items-center gap-3 text-[#F5F5F7] font-semibold truncate min-w-0 pr-2">
                            {renderRecentFileIcon(f.type)}
                            <span className="truncate">{f.name}</span>
                          </div>
                          <div className="col-span-2 text-xs text-[#71717A]">{f.owner}</div>
                          <div className="col-span-3 text-xs text-[#71717A]">{f.date}</div>
                          <div className="col-span-1 text-xs text-[#71717A] text-right font-medium">{f.size}</div>
                          <div className="col-span-1 flex justify-end text-[#71717A] group-hover:text-white transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* FLOATING UPLOAD WIDGET (BOTTOM-RIGHT)                    */}
            {/* ======================================================== */}
            {/* ======================================================== */}
            {/* FLOATING UPLOAD WIDGET (BOTTOM-RIGHT)                    */}
            {/* ======================================================== */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-[calc(100%-2rem)] xs:w-[340px] sm:w-[380px] rounded-xl border border-[#24242B] bg-[#101014]/98 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col transition-all duration-300 select-none">
              {/* Widget Header */}
              <div
                className="flex items-center justify-between px-4 py-3 bg-[#101014] border-b border-[#24242B] cursor-pointer select-none"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] font-semibold text-[#F5F5F7] truncate">
                    Uploading 2 of 49 files
                  </span>
                </div>

                <div
                  className="flex items-center gap-1 shrink-0 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] hover:bg-[#1A1A22] transition-colors cursor-pointer"
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
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] hover:bg-[#1A1A22] transition-colors cursor-pointer"
                    title="Close"
                    aria-label="Close upload manager"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Widget Body: File Upload Rows with Smooth Animated Progress */}
              {!isMinimized && (
                <>
                  <div className="overflow-y-auto max-h-[260px] divide-y divide-[#24242B]/40 py-1">
                    {uploads.map((item, idx) => (
                      <div
                        key={item.id}
                        style={{
                          opacity: isInView ? 1 : 0,
                          transform: isInView ? 'translateY(0px)' : 'translateY(4px)',
                          transitionProperty: 'opacity, transform, background-color',
                          transitionDuration: '250ms, 250ms, 150ms',
                          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                          transitionDelay: `${idx * 30}ms, ${idx * 30}ms, 0ms`
                        }}
                        className="group flex flex-col py-2.5 px-4 hover:bg-[#141419]/60 transition-colors select-none"
                      >
                        <div className="flex items-center justify-between gap-3 min-w-0">
                          {/* Left: Icon & File Meta */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="shrink-0 flex items-center justify-center">
                              {renderFileIcon(item.type)}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span
                                className={`text-xs font-semibold truncate leading-tight ${
                                  item.status === 'completed' ? 'text-[#A1A1AA]' : 'text-[#F5F5F7]'
                                }`}
                              >
                                {item.name}
                              </span>
                              <span className="text-[11px] text-[#71717A] mt-0.5 leading-none">
                                {item.size}
                              </span>
                            </div>
                          </div>

                          {/* Right: Progress % / Completed Check / Queued */}
                          <div className="flex items-center gap-2 shrink-0">
                            {item.status === 'uploading' && (
                              <span className="text-xs font-semibold text-[#6E60EE] tabular-nums">
                                {item.progress}%
                              </span>
                            )}

                            {item.status === 'completed' && (
                              <div className="w-4 h-4 rounded-full flex items-center justify-center text-emerald-400">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            )}

                            {item.status === 'queued' && (
                              <span className="text-[11px] text-[#71717A]">
                                Queued
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Thin subtle progress bar for actively uploading items only */}
                        {item.status === 'uploading' && (
                          <div className="w-full h-1 bg-[#24242B] rounded-full overflow-hidden mt-1.5">
                            <div
                              className="h-full bg-[#6E60EE] rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-4 py-2 border-t border-[#24242B]/60 bg-[#101014] text-xs">
                    <span className="text-[#71717A] text-[11px]">
                      47 of 49 files complete
                    </span>
                    <button
                      type="button"
                      className="text-xs text-[#71717A] hover:text-[#6E60EE] transition-colors cursor-pointer font-medium"
                    >
                      Clear completed
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </ScrollReveal>
      </LandingContainer>
    </section>
  )
}
