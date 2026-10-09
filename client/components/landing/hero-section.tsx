'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Play,
  Database,
  Lock,
  ShieldCheck,
  Search,
  Bell,
  Settings,
  Home,
  HardDrive,
  Users,
  Clock,
  Star,
  Trash2,
  Grid,
  List,
  Plus,
  ChevronRight,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Folder,
  Video,
  FileSpreadsheet,
  Sun,
  Moon,
  Sparkles,
  ArrowUp,
  PanelLeft
} from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'

interface FileItem {
  id: string
  name: string
  type: 'video' | 'img' | 'pdf' | 'sheet'
  owner: string
  date: string
  size: string
}

const RECENTLY_OPENED_FILES: FileItem[] = [
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

export function HeroSection() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const renderFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'video':
        return (
          <div className="w-6 h-6 rounded bg-[#18181E] flex items-center justify-center shrink-0">
            <Video className="w-3.5 h-3.5 text-purple-400" />
          </div>
        )
      case 'img':
        return (
          <div className="w-6 h-6 rounded bg-[#18181E] flex items-center justify-center shrink-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            </div>
          </div>
        )
      case 'pdf':
        return (
          <div className="w-6 h-6 rounded bg-[#201318] flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5 text-red-400" />
          </div>
        )
      case 'sheet':
        return (
          <div className="w-6 h-6 rounded bg-[#101D18] flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        )
    }
  }

  return (
    <section className="relative w-full pt-6 pb-10 sm:pt-8 sm:pb-14 lg:pt-10 lg:pb-16 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden flex flex-col items-center justify-center">
      <LandingContainer className="relative z-10 flex flex-col items-center">
        {/* Hero Header Content - Centered in Max-W Container */}
        <div className="w-full max-w-3xl text-center flex flex-col items-center">
          
          {/* Eyebrow: CLOUD STORAGE */}
          <div className="mb-3 sm:mb-4 flex justify-center animate-hero-fade-in animation-delay-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#24242B] bg-[#101014] px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#A1A1AA] uppercase select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
              <span>CLOUD STORAGE</span>
            </div>
          </div>

          {/* Centered Editorial Headline */}
          <div className="relative w-full max-w-3xl select-none">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-black tracking-tight text-[#F5F5F7] text-center flex flex-col items-center">
              {/* Line 1: YOUR FILES */}
              <div className="font-extrabold uppercase tracking-tight leading-[0.95] animate-hero-fade-up animation-delay-80">
                YOUR <span className="text-[#6E60EE]">FILES</span>
              </div>

              {/* Line 2: in one simple */}
              <div className="font-serif italic font-normal text-[#F5F5F7] text-5xl sm:text-7xl md:text-[80px] lg:text-[86px] leading-[0.88] -my-1 sm:-my-2 font-[var(--font-instrument-serif)] animate-hero-fade-up animation-delay-160">
                in one simple
              </div>

              {/* Line 3: SPACE. */}
              <div className="font-black uppercase tracking-tight text-[#6E60EE] leading-[0.95] animate-hero-fade-up animation-delay-240">
                SPACE.
              </div>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-3.5 sm:mt-4 max-w-md mx-auto text-sm sm:text-base font-normal leading-relaxed text-[#A1A1AA] text-center animate-hero-fade-up animation-delay-320">
            Store, organize, search, preview, and share your files<br className="hidden sm:inline" /> from one simple workspace.
          </p>

          {/* Hero CTAs */}
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 animate-hero-fade-up animation-delay-400">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6E60EE] px-6 py-2.5 sm:py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#5E50DE] hover:scale-[1.01] active:scale-[0.98]"
            >
              <span>Get started free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#organize"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#24242B] bg-[#101014] px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-[#F5F5F7] transition-all duration-150 hover:bg-[#141419] hover:border-[#383842] hover:scale-[1.01] active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 text-[#6E60EE] fill-[#6E60EE]/20" />
              <span>See how it works</span>
            </a>
          </div>

          {/* Benefit Row */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 sm:gap-x-6 text-[11px] sm:text-xs animate-hero-fade-up animation-delay-480">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#6E60EE]" />
              <span className="text-[#A1A1AA]">1 GB free storage</span>
            </div>

            <span className="text-[#24242B] hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#6E60EE]" />
              <span className="text-[#A1A1AA]">No credit card required</span>
            </div>

            <span className="text-[#24242B] hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6E60EE]" />
              <span className="text-[#A1A1AA]">End-to-end encrypted</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EXACT CLOUDSPACEGO DASHBOARD PRODUCT FRAME (MATCHING SCREENSHOT)           */}
        {/* ========================================================================= */}
        <div className="relative mt-8 sm:mt-10 lg:mt-12 w-full z-20 animate-hero-fade-up animation-delay-560">
          <div className="rounded-2xl border border-[#24242B] bg-[#0B0B0D] overflow-hidden shadow-2xl select-none">
            
            {/* Top Application Bar */}
            <div className="h-14 border-b border-[#24242B]/80 px-4 sm:px-6 bg-[#0D0D10] flex items-center justify-between">
              {/* Left Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#141419] flex items-center justify-center text-[#71717A]">
                  <PanelLeft className="w-4 h-4" />
                </div>

                <div className="w-8 h-8 rounded-lg bg-[#141419] flex items-center justify-center text-[#71717A]">
                  <Search className="w-4 h-4" />
                </div>

                <div className="w-8 h-8 rounded-lg bg-[#6E60EE] flex items-center justify-center text-white shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
              </div>

              {/* Right User Bar */}
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

                <div className="w-7 h-7 rounded-full bg-[#24242B] flex items-center justify-center text-xs font-bold text-[#F5F5F7]">
                  P
                </div>
              </div>
            </div>

            {/* Main Application Body Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
              
              {/* Left Sidebar */}
              <aside className="hidden md:flex md:col-span-3 lg:col-span-2 flex-col justify-between border-r border-[#24242B] bg-[#0A0A0C] p-3.5 shrink-0">
                <div className="space-y-6">
                  {/* Logo Brand */}
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-7 h-7 rounded-lg bg-[#6E60EE] flex items-center justify-center text-white shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-[#F5F5F7]">
                      cloudspacego
                    </span>
                  </div>

                  {/* Navigation Links (Home Active) */}
                  <div className="space-y-1 text-xs font-medium text-[#71717A]">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#6E60EE] bg-[#1D1935] font-semibold cursor-pointer">
                      <Home className="w-4 h-4 text-[#6E60EE]" />
                      <span>Home</span>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:text-[#F5F5F7] cursor-pointer">
                      <HardDrive className="w-4 h-4" />
                      <span>My Files</span>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:text-[#F5F5F7] cursor-pointer">
                      <Users className="w-4 h-4" />
                      <span>Shared with me</span>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:text-[#F5F5F7] cursor-pointer">
                      <Clock className="w-4 h-4" />
                      <span>Recent</span>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:text-[#F5F5F7] cursor-pointer">
                      <Star className="w-4 h-4" />
                      <span>Starred</span>
                    </div>

                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:text-[#F5F5F7] cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                      <span>Trash</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Storage Meter & Theme Toggle */}
                <div className="space-y-3 pt-4 border-t border-[#24242B]/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F5F5F7]">Storage</span>
                    <span className="text-[10px] font-bold text-[#6E60EE] bg-[#1D1935] px-1.5 py-0.5 rounded">
                      100%
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#1A1A22] overflow-hidden">
                    <div className="h-full w-full bg-[#6E60EE] rounded-full" />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#71717A]">
                    <span>199.6 MB used</span>
                    <span>378.5 KB free</span>
                  </div>

                  <div className="text-[11px] text-[#6E60EE] font-medium flex items-center justify-between cursor-pointer">
                    <span>Upgrade Storage</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>

                  {/* Theme Switcher Pill */}
                  <div className="pt-2 flex items-center justify-between p-1 bg-[#141419] rounded-lg text-[10px]">
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
              </aside>

              {/* Main Content Area: Home View */}
              <main className="md:col-span-9 lg:col-span-10 p-5 sm:p-6 bg-[#0B0B0D] flex flex-col justify-between">
                <div className="space-y-5">
                  
                  {/* Greeting */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F7] tracking-tight">
                      Good afternoon, Prashant
                    </h2>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      Everything you need, right where you left it.
                    </p>
                  </div>

                  {/* CONTINUE: pkdev */}
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

                  {/* Your folders */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-xs font-bold text-[#F5F5F7]">Your folders</h3>
                      <span className="text-[11px] text-[#6E60EE] font-medium cursor-pointer">View all</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['pkdev', 'images', 'docs', 'videos'].map((folder) => (
                        <div
                          key={folder}
                          className="p-3 rounded-xl border border-[#24242B] bg-[#101014] flex items-center justify-between hover:bg-[#141419] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Folder className="w-5 h-5 text-[#6E60EE] shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-[#F5F5F7] block truncate">{folder}</span>
                              <span className="text-[10px] text-[#71717A]">0 files</span>
                            </div>
                          </div>
                          <MoreVertical className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recently Opened */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#F5F5F7]">Recently Opened</span>
                      <div className="flex items-center bg-[#101014] border border-[#24242B] rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setViewMode('grid')}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            viewMode === 'grid' ? 'bg-[#1D1935] text-[#6E60EE]' : 'text-[#71717A] hover:text-[#F5F5F7]'
                          }`}
                        >
                          <Grid className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('list')}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            viewMode === 'list' ? 'bg-[#1D1935] text-[#6E60EE]' : 'text-[#71717A] hover:text-[#F5F5F7]'
                          }`}
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Recently Opened Table / List */}
                    {viewMode === 'list' ? (
                      <div className="rounded-xl border border-[#24242B]/80 bg-[#101014] overflow-hidden text-xs">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 text-[11px] font-semibold text-[#71717A] py-2 px-3 border-b border-[#24242B]/80 bg-[#0D0D10]">
                          <div className="col-span-5 flex items-center gap-1">
                            <span>Name</span>
                            <ArrowUp className="w-3 h-3 text-[#6E60EE]" />
                          </div>
                          <div className="col-span-2">Owner</div>
                          <div className="col-span-3">Date modified</div>
                          <div className="col-span-1 text-right">File size</div>
                          <div className="col-span-1 text-right">Actions</div>
                        </div>

                        {/* Table Rows matching screenshot */}
                        <div className="divide-y divide-[#24242B]/30">
                          {RECENTLY_OPENED_FILES.map((f) => (
                            <div
                              key={f.id}
                              className="grid grid-cols-12 items-center py-2.5 px-3 text-[#A1A1AA] hover:bg-[#141419] transition-colors"
                            >
                              <div className="col-span-5 flex items-center gap-2.5 text-[#F5F5F7] font-medium truncate">
                                {renderFileIcon(f.type)}
                                <span className="truncate">{f.name}</span>
                              </div>
                              <div className="col-span-2 text-[#71717A]">{f.owner}</div>
                              <div className="col-span-3 text-[#71717A]">{f.date}</div>
                              <div className="col-span-1 text-right text-[#71717A]">{f.size}</div>
                              <div className="col-span-1 flex justify-end text-[#71717A]">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Grid View */
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {RECENTLY_OPENED_FILES.map((f) => (
                          <div
                            key={f.id}
                            className="p-3 rounded-xl border border-[#24242B] bg-[#101014] flex flex-col justify-between hover:bg-[#141419] transition-colors cursor-pointer"
                          >
                            <div className="w-full h-20 rounded-lg bg-[#0B0B0D] border border-[#24242B]/60 flex items-center justify-center mb-2">
                              {renderFileIcon(f.type)}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 pr-1">
                                <span className="text-xs font-semibold text-[#F5F5F7] block truncate">
                                  {f.name}
                                </span>
                                <span className="text-[10px] text-[#71717A]">{f.size}</span>
                              </div>
                              <MoreVertical className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </LandingContainer>
    </section>
  )
}
