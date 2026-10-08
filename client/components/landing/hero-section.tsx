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
  Command,
  Bell,
  Settings,
  Home,
  FolderClosed,
  Users,
  Clock,
  Star,
  Trash2,
  HardDrive,
  LayoutGrid,
  List,
  Plus,
  ChevronDown,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Folder
} from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'

export function HeroSection() {
  const [activeView, setActiveView] = useState<'list' | 'grid'>('list')
  const [checkedFiles, setCheckedFiles] = useState<{ [key: string]: boolean }>({})

  const toggleCheck = (id: string) => {
    setCheckedFiles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section className="relative w-full pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden flex flex-col items-center justify-center">
      <LandingContainer className="relative z-10 flex flex-col items-center">
        {/* Hero Header Content - Centered in Max-W Container */}
        <div className="w-full max-w-3xl text-center flex flex-col items-center">
          
          {/* Eyebrow: CLOUD STORAGE */}
          <div className="mb-4 sm:mb-5 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#24242B] bg-[#101014] px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#A1A1AA] uppercase select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
              <span>CLOUD STORAGE</span>
            </div>
          </div>

          {/* Centered Editorial Headline */}
          <div className="relative w-full max-w-3xl select-none">
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[88px] font-black tracking-tight text-[#F5F5F7] text-center">
              {/* Line 1: YOUR FILES */}
              <div className="font-extrabold uppercase tracking-tight leading-[0.96]">
                YOUR <span className="text-[#6E60EE]">FILES</span>
              </div>

              {/* Line 2: in one simple */}
              <div className="font-serif italic font-normal text-[#F5F5F7] text-6xl sm:text-8xl md:text-9xl lg:text-[98px] leading-[0.88] my-0.5 sm:my-1 font-[var(--font-instrument-serif)]">
                in one simple
              </div>

              {/* Line 3: SPACE. */}
              <div className="font-black uppercase tracking-tight text-[#6E60EE] leading-[0.96]">
                SPACE.
              </div>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-5 sm:mt-6 max-w-xl mx-auto text-base sm:text-lg font-normal leading-relaxed text-[#A1A1AA] text-center">
            Store, organize, search, preview, and share your files<br className="hidden sm:inline" /> from one simple workspace.
          </p>

          {/* Hero CTAs */}
          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6E60EE] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#6E60EE]/20 transition-all duration-150 hover:bg-[#5E50DE] active:scale-[0.98]"
            >
              <span>Get started free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#organize"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#24242B] bg-[#101014] px-6 py-3.5 text-sm font-medium text-[#F5F5F7] transition-all duration-150 hover:bg-[#141419] hover:border-[#383842] active:scale-[0.98]"
            >
              <Play className="h-4 w-4 text-[#7C6CFF] stroke-[2]" />
              <span>See how it works</span>
            </a>
          </div>

          {/* Proof Strip */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-y-3 gap-x-6 sm:gap-x-8 text-xs font-medium text-[#A1A1AA]">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#7C6CFF]" />
              <span>Free 15 GB storage</span>
            </div>

            <div className="h-4 w-[1px] bg-[#24242B] hidden sm:block" />

            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#7C6CFF]" />
              <span>No credit card required</span>
            </div>

            <div className="h-4 w-[1px] bg-[#24242B] hidden sm:block" />

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#7C6CFF]" />
              <span>End-to-end encrypted</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* REAL CLOUDSPACEGO PRODUCT INTERFACE PREVIEW */}
        {/* ========================================================================= */}
        <div className="relative mt-12 sm:mt-16 w-full z-20">
          <div className="rounded-2xl border border-[#24242B] bg-[#101014] overflow-hidden">
          
          {/* Top App Header Bar */}
          <div className="flex h-14 items-center justify-between border-b border-[#24242B] px-4 sm:px-6 bg-[#0D0D10]">
            {/* Left Brand Mark */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <Image
                  src="/images/cloudeLogo.png"
                  width={28}
                  height={24}
                  alt="cloudspacego logo"
                  className="w-7 h-auto object-contain shrink-0"
                />
              </div>
              <span className="text-base font-bold tracking-tight text-[#F5F5F7] font-sans">
                cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
              </span>
            </div>

            {/* Center Search Bar */}
            <div className="relative flex-1 max-w-md mx-4">
              <div className="flex h-9 items-center gap-2.5 rounded-xl border border-[#24242B] bg-[#141419] px-3 text-xs text-[#71717A]">
                <Search className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                <input
                  type="text"
                  readOnly
                  placeholder="Search files, folders, and shared items..."
                  className="w-full bg-transparent text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-[#101014] border border-[#24242B] px-1.5 py-0.5 text-[10px] font-mono text-[#71717A]">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              </div>
            </div>

            {/* Right Status / Actions */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 text-[#71717A] hover:text-[#F5F5F7] cursor-pointer">
                <Bell className="w-4 h-4" />
              </div>

              <div className="p-1.5 text-[#71717A] hover:text-[#F5F5F7] cursor-pointer">
                <Settings className="w-4 h-4" />
              </div>

              <div className="w-7 h-7 rounded-full bg-[#6E60EE] flex items-center justify-center text-white text-[11px] font-semibold">
                AM
              </div>
            </div>
          </div>

          {/* Main App Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
            
            {/* Left App Sidebar matching real app */}
            <aside className="hidden md:flex md:col-span-3 lg:col-span-2 flex-col justify-between border-r border-[#24242B] bg-[#0A0A0C] p-3">
              <div className="space-y-1">
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors"
                >
                  <Home className="w-4 h-4 text-[#71717A]" />
                  <span>Home</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 rounded-xl bg-[#1D1935] px-3 py-2 text-xs font-bold text-[#6E60EE]"
                >
                  <FolderClosed className="w-4 h-4 text-[#6E60EE]" />
                  <span>My Files</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors"
                >
                  <Users className="w-4 h-4 text-[#71717A]" />
                  <span>Shared with me</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors"
                >
                  <Clock className="w-4 h-4 text-[#71717A]" />
                  <span>Recent</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors"
                >
                  <Star className="w-4 h-4 text-[#71717A]" />
                  <span>Starred</span>
                </button>

                <div className="h-[1px] bg-[#24242B] my-1" />

                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-[#71717A]" />
                  <span>Trash</span>
                </button>
              </div>

              {/* Bottom Storage Widget matching real app */}
              <div className="rounded-xl border border-[#24242B] bg-[#101014] p-3 mt-6">
                <div className="flex items-center justify-between text-xs font-semibold text-[#F5F5F7]">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#6E60EE]" />
                    <span>Storage</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#6E60EE]">
                    16%
                  </span>
                </div>

                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#141419]">
                  <div className="h-full w-[16%] rounded-full bg-[#6E60EE]" />
                </div>

                <p className="mt-2 text-[10px] text-[#71717A]">
                  2.4 GB used • 12.6 GB free
                </p>
              </div>
            </aside>

            {/* Right Content Area */}
            <main className="md:col-span-9 lg:col-span-10 p-5 sm:p-6 bg-[#0B0B0D]">
              {/* Header Title & Controls */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F7]">
                  My Files
                </h2>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-xl bg-[#101014] border border-[#24242B] p-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveView('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        activeView === 'grid' ? 'bg-[#141419] text-[#F5F5F7]' : 'text-[#71717A] hover:text-[#F5F5F7]'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('list')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        activeView === 'list' ? 'bg-[#141419] text-[#F5F5F7]' : 'text-[#71717A] hover:text-[#F5F5F7]'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#6E60EE] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#5F52DE] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                    <ChevronDown className="w-3 h-3 text-white/70" />
                  </button>
                </div>
              </div>

              {/* Folders Section matching real FolderCard */}
              <div className="mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A] block mb-2.5">
                  Folders
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'Documents', count: '12 files' },
                    { name: 'Images', count: '28 files' },
                    { name: 'Videos', count: '6 files' },
                    { name: 'Design', count: '14 files' }
                  ].map((folder) => (
                    <div
                      key={folder.name}
                      className="group flex items-center justify-between p-3 rounded-xl border border-[#24242B] bg-[#101014] hover:bg-[#141419] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-2">
                        <Folder className="w-6 h-6 text-[#6E60EE] shrink-0" />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[13px] sm:text-sm font-semibold text-[#F5F5F7] truncate group-hover:text-[#6E60EE] transition-colors">
                            {folder.name}
                          </span>
                          <span className="text-[11px] sm:text-xs font-normal text-[#A1A1AA] truncate mt-0.5">
                            {folder.count}
                          </span>
                        </div>
                      </div>

                      <MoreVertical className="w-4 h-4 text-[#71717A] hover:text-[#F5F5F7] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Files Section matching real FileList / FileCard */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A] block mb-2.5">
                  Files
                </span>

                {activeView === 'list' ? (
                  <div className="rounded-xl border border-[#24242B] bg-[#101014] overflow-hidden">
                    {/* Table Headers */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#24242B] text-[11px] font-semibold text-[#71717A] bg-[#0D0D10]">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          aria-label="Select all files"
                          className="rounded border-[#24242B] bg-[#141419] text-[#6E60EE] focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[#A1A1AA]">Name ˅</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-12 text-right">
                        <span className="w-16">Size</span>
                        <span className="w-24">Modified ⇣</span>
                        <span className="w-4" />
                      </div>
                    </div>

                    {/* File Rows */}
                    <div className="divide-y divide-[#24242B]">
                      {/* Row 1: Project Plan.pdf */}
                      <div className="flex items-center justify-between px-4 py-3 hover:bg-[#141419] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={!!checkedFiles['1']}
                            onChange={() => toggleCheck('1')}
                            aria-label="Select Project Plan.pdf"
                            className="rounded border-[#24242B] bg-[#141419] text-[#6E60EE] focus:ring-0 cursor-pointer"
                          />
                          <div className="w-7 h-7 rounded-lg bg-[#141419] border border-[#24242B] flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-bold text-red-400 font-mono">PDF</span>
                          </div>
                          <span className="text-xs font-semibold text-[#F5F5F7] truncate group-hover:text-[#6E60EE] transition-colors">
                            Project Plan.pdf
                          </span>
                        </div>

                        <div className="flex items-center gap-6 sm:gap-12 text-xs text-[#A1A1AA] shrink-0">
                          <span className="w-16 text-right font-mono">842 KB</span>
                          <span className="w-24 text-right hidden sm:inline text-[#71717A]">2 hours ago</span>
                          <button type="button" className="text-[#71717A] hover:text-[#F5F5F7] p-1">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Row 2: Cover Image.jpg */}
                      <div className="flex items-center justify-between px-4 py-3 hover:bg-[#141419] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={!!checkedFiles['2']}
                            onChange={() => toggleCheck('2')}
                            aria-label="Select Cover Image.jpg"
                            className="rounded border-[#24242B] bg-[#141419] text-[#6E60EE] focus:ring-0 cursor-pointer"
                          />
                          <div className="w-7 h-7 rounded-lg bg-[#141419] border border-[#24242B] flex items-center justify-center shrink-0">
                            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                          </div>
                          <span className="text-xs font-semibold text-[#F5F5F7] truncate group-hover:text-[#6E60EE] transition-colors">
                            Cover Image.jpg
                          </span>
                        </div>

                        <div className="flex items-center gap-6 sm:gap-12 text-xs text-[#A1A1AA] shrink-0">
                          <span className="w-16 text-right font-mono">2.8 MB</span>
                          <span className="w-24 text-right hidden sm:inline text-[#71717A]">5 hours ago</span>
                          <button type="button" className="text-[#71717A] hover:text-[#F5F5F7] p-1">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Row 3: Design System.fig */}
                      <div className="flex items-center justify-between px-4 py-3 hover:bg-[#141419] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={!!checkedFiles['3']}
                            onChange={() => toggleCheck('3')}
                            aria-label="Select Design System.fig"
                            className="rounded border-[#24242B] bg-[#141419] text-[#6E60EE] focus:ring-0 cursor-pointer"
                          />
                          <div className="w-7 h-7 rounded-lg bg-[#141419] border border-[#24242B] flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5 text-[#6E60EE]" />
                          </div>
                          <span className="text-xs font-semibold text-[#F5F5F7] truncate group-hover:text-[#6E60EE] transition-colors">
                            Design System.fig
                          </span>
                        </div>

                        <div className="flex items-center gap-6 sm:gap-12 text-xs text-[#A1A1AA] shrink-0">
                          <span className="w-16 text-right font-mono">4.1 MB</span>
                          <span className="w-24 text-right hidden sm:inline text-[#71717A]">1 day ago</span>
                          <button type="button" className="text-[#71717A] hover:text-[#F5F5F7] p-1">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Grid view matching real FileCard */
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { name: 'Project Plan.pdf', size: 'PDF • 842 KB', icon: 'pdf' },
                      { name: 'Cover Image.jpg', size: 'JPG • 2.8 MB', icon: 'img' },
                      { name: 'Design System.fig', size: 'FIG • 4.1 MB', icon: 'fig' }
                    ].map((file) => (
                      <div
                        key={file.name}
                        className="bg-[#101014] rounded-xl border border-[#24242B] hover:bg-[#141419] p-2.5 sm:p-3 flex flex-col gap-2.5 group cursor-pointer transition-colors"
                      >
                        <div className="bg-[#0B0B0D] rounded-lg h-24 flex items-center justify-center border border-[#24242B]/60">
                          {file.icon === 'pdf' ? (
                            <span className="text-xs font-bold text-red-400 font-mono">PDF</span>
                          ) : file.icon === 'img' ? (
                            <ImageIcon className="w-6 h-6 text-blue-400" />
                          ) : (
                            <FileText className="w-6 h-6 text-[#6E60EE]" />
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
                          <div className="flex flex-col min-w-0 flex-1 text-left">
                            <span className="text-xs sm:text-sm font-semibold text-[#F5F5F7] truncate group-hover:text-[#6E60EE] transition-colors">
                              {file.name}
                            </span>
                            <span className="text-[11px] font-medium text-[#A1A1AA] truncate mt-0.5">
                              {file.size}
                            </span>
                          </div>
                          <MoreVertical className="w-4 h-4 text-[#71717A] shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </LandingContainer>
  </section>
)
}

