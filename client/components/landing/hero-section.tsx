'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  ArrowUp
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
              <div className="font-serif italic font-normal text-[#F5F5F7] text-5xl sm:text-7xl md:text-[80px] lg:text-[86px] leading-[0.88] -my-1 sm:-my-2 animate-hero-fade-up animation-delay-160">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6E60EE] px-6 py-3 text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#5E50DE] hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0D]"
            >
              <span>Get started free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#organize"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#24242B] bg-[#101014] px-6 py-3 text-sm font-medium text-[#F5F5F7] transition-all duration-150 hover:bg-[#141419] hover:border-[#383842] hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0D]"
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
          <div className="rounded-2xl border border-[#24242B] bg-[#0B0B0D] overflow-hidden shadow-2xl select-none flex min-h-[580px]">
            
            {/* Left Sidebar (Full-height on left, containing Brand Logo at the top) */}
            <aside className="hidden md:flex md:w-60 lg:w-64 flex-col justify-between border-r border-[#24242B] bg-[#0B0B0D] p-4 shrink-0">
              <div className="space-y-6">
                {/* Brand Logo Header at very top of sidebar */}
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

                {/* Navigation Links (Home Active) */}
                <div className="space-y-1 text-xs font-semibold text-[#A1A1AA]">
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#6E60EE] bg-[#1D1935] font-bold cursor-pointer">
                    <Home className="w-4.5 h-4.5 text-[#6E60EE]" strokeWidth={2.2} />
                    <span>Home</span>
                  </div>

                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors cursor-pointer">
                    <HardDrive className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>My Files</span>
                  </div>

                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors cursor-pointer">
                    <Users className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Shared with me</span>
                  </div>

                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors cursor-pointer">
                    <Clock className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Recent</span>
                  </div>

                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors cursor-pointer">
                    <Star className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Starred</span>
                  </div>

                  {/* Divider before Trash */}
                  <div className="h-[1px] bg-[#24242B] my-1 mx-1 shrink-0" />

                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors cursor-pointer">
                    <Trash2 className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={1.8} />
                    <span>Trash</span>
                  </div>
                </div>
              </div>

              {/* Bottom Storage Meter & Theme Toggle */}
              <div className="space-y-3 pt-4 border-t border-[#24242B] text-xs mt-auto">
                {/* Storage Card */}
                <div className="w-full bg-[#101014] rounded-xl border border-[#24242B] p-3 shadow-xs flex flex-col gap-2.5 select-none">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F5F7]">Storage</span>
                    <span className="text-[10px] font-bold text-white bg-[#6E60EE] px-2 py-0.5 rounded-full">
                      100%
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="w-full h-1.5 rounded-full bg-[#141419] border border-[#24242B]/60 overflow-hidden">
                      <div className="h-full w-full bg-[#6E60EE] rounded-full" />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#71717A]">
                      <span>199.6 MB used</span>
                      <span>378.5 KB free</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#6E60EE] hover:text-[#5E50DE] transition-colors pt-0.5 cursor-pointer">
                    <span>Upgrade Storage</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#6E60EE]" />
                  </div>
                </div>

                {/* Theme Switcher Pill */}
                <div className="w-full p-1 bg-[#141419] rounded-xl flex items-center justify-between select-none relative border border-[#24242B] gap-1 text-xs">
                  <div className="w-1/2 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[#71717A] hover:text-[#F5F5F7] transition-colors cursor-pointer">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-medium">Light</span>
                  </div>
                  <div className="w-1/2 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-[#101014] text-[#6E60EE] font-bold shadow-xs border border-[#24242B]/60 cursor-pointer">
                    <Moon className="w-3.5 h-3.5 text-[#6E60EE]" />
                    <span className="text-[11px] font-bold text-white">Dark</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Main Viewport (Header on top, Main Content below) */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0B0B0D] overflow-hidden">
              {/* Top Application Bar Header (Over Main Content Area) */}
              <div className="h-16 border-b border-[#24242B] px-4 sm:px-6 bg-[#0B0B0D] flex items-center justify-between shrink-0">
                {/* Left Side: Mobile Menu + Pill Capsule */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile hamburger menu toggle */}
                  <div className="md:hidden flex w-8 h-8 items-center justify-center text-[#71717A] hover:text-[#F5F5F7] rounded-full cursor-pointer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 8h16M4 16h10" />
                    </svg>
                  </div>

                  {/* Left Action Buttons Pill Capsule (Matching Real Header SearchBar) */}
                  <div className="flex items-center bg-[#141419] border border-[#24242B] rounded-full p-1 gap-2 shadow-none shrink-0 h-10">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] transition-colors cursor-pointer">
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M9 3v18" />
                      </svg>
                    </div>

                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] transition-colors cursor-pointer">
                      <Search className="w-4.5 h-4.5 text-[#71717A]" strokeWidth={2.2} />
                    </div>

                    <div className="w-7 h-7 rounded-full bg-[#6E60EE] flex items-center justify-center text-white shadow-xs cursor-pointer hover:bg-[#5E50DE] transition-colors">
                      <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                {/* Right User Bar Cluster */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] transition-colors relative cursor-pointer">
                    <Bell className="w-5 h-5 text-[#71717A]" strokeWidth={2} />
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0B0B0D]">
                      3
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-transparent flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] transition-colors cursor-pointer">
                    <Settings className="w-5 h-5 text-[#71717A]" strokeWidth={2} />
                  </div>

                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#18181D] border border-[#24242B] flex items-center justify-center text-xs font-bold text-[#F5F5F7] shadow-xs cursor-pointer select-none">
                    P
                  </div>
                </div>
              </div>

              {/* Main Content Area: Home View */}
              <main className="p-6 sm:p-8 bg-[#0B0B0D] flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  
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
                  <div className="w-full max-w-2xl flex items-center justify-between p-3.5 rounded-xl border border-[#24242B] bg-[#101014] hover:border-[#383842] transition-colors cursor-pointer">
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

                  {/* Your folders */}
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

                  {/* Recently Opened */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-[#F5F5F7] tracking-tight">Recently Opened</h3>
                      <div className="flex items-center bg-[#101014] border border-[#24242B] rounded-lg p-0.5 gap-0.5">
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

                        {/* Table Rows matching screenshot */}
                        <div className="divide-y divide-[#24242B]/50">
                          {RECENTLY_OPENED_FILES.map((f) => (
                            <div
                              key={f.id}
                              className="grid grid-cols-12 items-center py-3 px-4 text-[#A1A1AA] hover:bg-[#141419] transition-colors cursor-pointer group"
                            >
                              <div className="col-span-5 flex items-center gap-3 text-[#F5F5F7] font-semibold truncate min-w-0 pr-2">
                                {renderFileIcon(f.type)}
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
                    ) : (
                      /* Grid View */
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                        {RECENTLY_OPENED_FILES.map((f) => (
                          <div
                            key={f.id}
                            className="p-3.5 rounded-xl border border-[#24242B] bg-[#101014] flex flex-col justify-between hover:bg-[#141419] hover:border-[#383842] transition-all cursor-pointer group"
                          >
                            <div className="w-full h-20 rounded-lg bg-[#0B0B0D] border border-[#24242B]/60 flex items-center justify-center mb-2.5">
                              {renderFileIcon(f.type)}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 pr-1">
                                <span className="text-xs font-bold text-[#F5F5F7] block truncate">
                                  {f.name}
                                </span>
                                <span className="text-[11px] text-[#71717A]">{f.size}</span>
                              </div>
                              <MoreVertical className="w-4 h-4 text-[#71717A] group-hover:text-white shrink-0 transition-colors" />
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
