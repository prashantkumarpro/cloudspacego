'use client'

import React, { useState, useEffect } from 'react'
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
  Sparkles,
  Sun,
  Moon,
  ArrowUp
} from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'

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
    progress: 88,
    status: 'uploading'
  },
  {
    id: '2',
    name: 'Professional_Job_Application_Tracker.xlsx',
    size: '11.9 KB',
    type: 'sheet',
    progress: 54,
    status: 'uploading'
  },
  {
    id: '3',
    name: 'FasterQ - Full Stack Developer Internship A...',
    size: '145.7 KB',
    type: 'pdf',
    progress: 18,
    status: 'uploading'
  },
  {
    id: '4',
    name: 'poster1.jpeg',
    size: '529.6 KB',
    type: 'img',
    progress: 0,
    status: 'queued'
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

const RECENT_FILES = [
  { name: 'b2.png', owner: 'Me', date: 'Oct 6, 2026' },
  { name: 'bnbg1.png', owner: 'Me', date: 'Oct 6, 2026' },
  { name: 'b3.png', owner: 'Me', date: 'Oct 6, 2026' },
  { name: 'b4.png', owner: 'Me', date: 'Oct 6, 2026' }
]

export function UploadSection() {
  const [uploads, setUploads] = useState<UploadFileItem[]>(INITIAL_UPLOADS)
  const [isMinimized, setIsMinimized] = useState(false)

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
        {/* Section Header */}
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.15]">
            Your uploads, always within reach.
          </h2>

          <p className="mt-2 sm:mt-2.5 max-w-xl text-sm sm:text-base font-normal leading-relaxed text-[#A1A1AA]">
            Upload files and folders smoothly. CloudSpaceGo keeps you informed with real-time progress, pause and resume controls, and reliable background transfers.
          </p>
        </div>

        {/* CloudSpaceGo Dashboard + Floating Upload Widget Mockup */}
        <div className="mt-5 sm:mt-6 w-full rounded-2xl border border-[#24242B] bg-[#0B0B0D] overflow-hidden relative shadow-2xl min-h-[500px] sm:min-h-[540px] flex select-none">
          
          {/* ======================================================== */}
          {/* LEFT SIDEBAR MOCKUP                                      */}
          {/* ======================================================== */}
          <div className="w-52 sm:w-60 border-r border-[#24242B] bg-[#0D0D10] p-4 hidden md:flex flex-col justify-between shrink-0">
            <div className="space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-2 px-2">
                <div className="w-7 h-7 rounded-lg bg-[#6E60EE] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm tracking-tight text-[#F5F5F7]">
                  cloudspacego
                </span>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 text-xs font-medium text-[#71717A]">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E60EE] bg-[#1D1935] font-semibold">
                  <Home className="w-4 h-4 text-[#6E60EE]" />
                  <span>Home</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:text-[#F5F5F7]">
                  <HardDrive className="w-4 h-4" />
                  <span>My Files</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:text-[#F5F5F7]">
                  <Users className="w-4 h-4" />
                  <span>Shared with me</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:text-[#F5F5F7]">
                  <Clock className="w-4 h-4" />
                  <span>Recent</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:text-[#F5F5F7]">
                  <Star className="w-4 h-4" />
                  <span>Starred</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:text-[#F5F5F7]">
                  <Trash2 className="w-4 h-4" />
                  <span>Trash</span>
                </div>
              </div>
            </div>

            {/* Sidebar Bottom: Storage Meter & Theme Toggle */}
            <div className="space-y-3 pt-4 border-t border-[#24242B]/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#F5F5F7]">Storage</span>
                <span className="text-[10px] font-bold text-[#6E60EE] bg-[#1D1935] px-1.5 py-0.5 rounded">
                  12%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1A1A22] overflow-hidden">
                <div className="h-full w-[12%] bg-[#6E60EE] rounded-full" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#71717A]">
                <span>23.3 MB used</span>
                <span>176.7 MB free</span>
              </div>
              <div className="text-[11px] text-[#6E60EE] font-medium flex items-center justify-between cursor-pointer">
                <span>Upgrade Storage</span>
                <ChevronRight className="w-3 h-3" />
              </div>

              {/* Theme Pill */}
              <div className="pt-2 flex items-center justify-between p-1 bg-[#141419] border border-[#24242B] rounded-lg text-[10px]">
                <div className="flex items-center gap-1 text-[#71717A] px-2 py-0.5">
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Light</span>
                </div>
                <div className="flex items-center gap-1 text-[#F5F5F7] bg-[#1D1935] px-2 py-0.5 rounded font-semibold">
                  <Moon className="w-3 h-3 text-[#6E60EE]" />
                  <span>Dark</span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* MAIN DASHBOARD CONTENT AREA                              */}
          {/* ======================================================== */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0B0B0D] overflow-hidden">
            
            {/* Top Navigation Bar */}
            <div className="h-14 border-b border-[#24242B] px-4 sm:px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#141419] border border-[#24242B] flex items-center justify-center text-[#71717A]">
                  <Search className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#6E60EE] flex items-center justify-center text-white shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative p-1.5 text-[#71717A]">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    3
                  </span>
                </div>
                <div className="p-1.5 text-[#71717A]">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="w-7 h-7 rounded-full bg-[#24242B] border border-[#383842] flex items-center justify-center text-xs font-bold text-[#F5F5F7]">
                  P
                </div>
              </div>
            </div>

            {/* Dashboard Scrollable Area */}
            <div className="p-4 sm:p-6 space-y-6 overflow-hidden">
              
              {/* Greeting */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F7] tracking-tight">
                  Good afternoon, Prashant
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Everything you need, right where you left it.
                </p>
              </div>

              {/* Continue Card */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#24242B] bg-[#101014] max-w-xl">
                <div className="flex items-center gap-2.5 text-xs text-[#A1A1AA]">
                  <div className="w-6 h-6 rounded bg-[#1D1935] flex items-center justify-center text-[#6E60EE]">
                    <Folder className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[#71717A]">CONTINUE:</span>
                  <span className="font-semibold text-[#F5F5F7]">pkdev</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#71717A]">
                  <span>Recently</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              {/* Your Folders Section */}
              <div>
                <div className="flex items-center justify-between mb-3 max-w-xl">
                  <h4 className="text-xs font-bold text-[#F5F5F7]">Your folders</h4>
                  <span className="text-[11px] text-[#6E60EE] font-medium cursor-pointer">View all</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl">
                  {['pkdev', 'videos', 'documents', 'projects'].map((name, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-[#24242B] bg-[#101014] flex flex-col justify-between h-20"
                    >
                      <Folder className="w-5 h-5 text-[#6E60EE]" />
                      <div>
                        <span className="text-xs font-semibold text-[#F5F5F7] block truncate">{name}</span>
                        <span className="text-[10px] text-[#71717A]">0 files</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Opened Section */}
              <div className="max-w-xl">
                <h4 className="text-xs font-bold text-[#F5F5F7] mb-3">Recently Opened</h4>

                <div className="space-y-1 text-xs">
                  <div className="grid grid-cols-12 text-[10px] font-semibold text-[#71717A] pb-1.5 border-b border-[#24242B] px-1">
                    <div className="col-span-7 flex items-center gap-1">
                      <span>Name</span>
                      <ArrowUp className="w-3 h-3 text-[#6E60EE]" />
                    </div>
                    <div className="col-span-2">Owner</div>
                    <div className="col-span-3 text-right">Date modified</div>
                  </div>

                  {RECENT_FILES.map((f, i) => (
                    <div key={i} className="grid grid-cols-12 items-center py-2 px-1 text-[#A1A1AA] hover:bg-[#141419] rounded-lg">
                      <div className="col-span-7 flex items-center gap-2 text-[#F5F5F7] font-medium truncate">
                        <div className="w-5 h-5 rounded bg-[#18181E] border border-[#24242B] flex items-center justify-center shrink-0">
                          <ImageIcon className="w-3 h-3 text-[#71717A]" />
                        </div>
                        <span className="truncate">{f.name}</span>
                      </div>
                      <div className="col-span-2 text-[#71717A] text-[11px]">{f.owner}</div>
                      <div className="col-span-3 text-right text-[#71717A] text-[11px]">{f.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* FLOATING UPLOAD WIDGET (BOTTOM-RIGHT)                    */}
          {/* ======================================================== */}
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-30 w-[300px] sm:w-[360px] rounded-2xl border border-[#2D294A] bg-[#101014]/98 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Widget Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#24242B] bg-[#121217]">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#F5F5F7]">
                  Uploading 49 files
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] hover:bg-[#1A1A22] transition-colors cursor-pointer"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] hover:bg-[#1A1A22] transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Widget Body: File Upload Rows */}
            {!isMinimized && (
              <div className="p-2 space-y-1 max-h-[280px] overflow-y-auto divide-y divide-[#24242B]/30">
                {uploads.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#15151C] transition-colors gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-[#141419] border border-[#24242B] flex items-center justify-center shrink-0">
                        {renderFileIcon(item.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#F5F5F7] truncate leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[10.5px] text-[#71717A] leading-none mt-0.5">
                          {item.size}
                        </p>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <span className="text-xs font-mono font-medium text-[#6E60EE] shrink-0">
                      {item.progress}%
                    </span>
                  </div>
                ))}

                {/* Footer Action */}
                <div className="pt-2 px-2 pb-1 flex justify-end">
                  <button
                    type="button"
                    className="text-[11px] text-[#71717A] hover:text-[#F5F5F7] transition-colors cursor-pointer"
                  >
                    Clear completed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </LandingContainer>
    </section>
  )
}
