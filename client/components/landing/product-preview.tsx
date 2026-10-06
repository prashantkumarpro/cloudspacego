'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  LayoutDashboard,
  FolderClosed,
  Share2,
  Clock,
  Star,
  Trash2,
  Folder,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  Search,
  Upload,
  MoreVertical,
  CheckCircle2,
  HardDrive,
  Users,
  ArrowUpRight,
  FolderPlus,
  Grid,
  List,
  SlidersHorizontal,
  CloudUpload,
  Download,
  Eye,
  Check,
  Sparkles,
  Link2,
  FileArchive
} from 'lucide-react'

type FeatureTab = 'overview' | 'uploading' | 'search' | 'sharing' | 'storage'

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState<FeatureTab>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(78)
  const [isUploaded, setIsUploaded] = useState(false)
  const [activeFolderHover, setActiveFolderHover] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'docs' | 'media' | 'sheets'>('all')

  // Auto-play upload animation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          setIsUploaded(true)
          setTimeout(() => {
            setIsUploaded(false)
            setUploadProgress(15)
          }, 3500)
          return 100
        }
        return prev + 12
      })
    }, 800)
    return () => clearInterval(timer)
  }, [])

  // Auto-typing search simulation when search tab is active
  useEffect(() => {
    if (activeTab === 'search') {
      setIsSearching(true)
      const query = 'Pitch Deck 2026'
      let currentIdx = 0
      setSearchQuery('')

      const typeInterval = setInterval(() => {
        if (currentIdx <= query.length) {
          setSearchQuery(query.slice(0, currentIdx))
          currentIdx++
        } else {
          clearInterval(typeInterval)
        }
      }, 90)

      return () => clearInterval(typeInterval)
    } else {
      setSearchQuery('')
      setIsSearching(false)
    }
  }, [activeTab])

  const folders = [
    {
      id: 'brand',
      name: 'Brand & Identity',
      count: '24 files',
      size: '142 MB',
      starred: true,
      color: 'text-[#6E60EE]'
    },
    {
      id: 'marketing',
      name: 'Marketing Q3 Assets',
      count: '18 files',
      size: '380 MB',
      starred: false,
      color: 'text-blue-500'
    },
    {
      id: 'product',
      name: 'Product Specs & UI',
      count: '32 files',
      size: '512 MB',
      starred: true,
      color: 'text-purple-600'
    },
    {
      id: 'finance',
      name: 'Financial Reports',
      count: '8 files',
      size: '28 MB',
      starred: false,
      color: 'text-emerald-500'
    }
  ]

  const files = [
    {
      id: '1',
      name: 'Pitch Deck 2026 Final.pdf',
      size: '4.2 MB',
      updated: 'Just now',
      owner: 'Alex Mercer',
      icon: FileText,
      iconColor: 'text-[#6E60EE]',
      iconBg: 'bg-[#F2EFFF]',
      badge: 'PDF',
      type: 'docs',
      shared: true
    },
    {
      id: '2',
      name: 'CloudSpaceGo-Hero-Artwork.png',
      size: '3.8 MB',
      updated: '14 mins ago',
      owner: 'Elena Ross',
      icon: ImageIcon,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      badge: 'PNG',
      type: 'media',
      shared: false
    },
    {
      id: '3',
      name: 'Q3 Financial Forecast.xlsx',
      size: '1.4 MB',
      updated: '1 hour ago',
      owner: 'David Kim',
      icon: FileSpreadsheet,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50',
      badge: 'XLSX',
      type: 'sheets',
      shared: true
    },
    {
      id: '4',
      name: 'App-Architecture-System.svg',
      size: '840 KB',
      updated: 'Yesterday',
      owner: 'Alex Mercer',
      icon: FileCode,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50',
      badge: 'SVG',
      type: 'media',
      shared: false
    }
  ]

  const filteredFiles = files.filter(file => {
    if (selectedFilter === 'all') return true
    return file.type === selectedFilter
  })

  return (
    <div id="product-demo" className="relative mx-auto mt-14 w-full max-w-6xl animate-landing-fade-up animation-delay-300">
      {/* Soft background ambient glow */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-[36px] bg-gradient-to-b from-[#6E60EE]/12 via-[#E8E4FF]/20 to-transparent blur-3xl opacity-70"
        aria-hidden="true"
      />

      {/* Interactive Feature Pills Switcher */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 px-2">
        {[
          { id: 'overview', label: 'Workspace Overview', icon: LayoutDashboard },
          { id: 'uploading', label: 'Live Upload & Sync', icon: CloudUpload },
          { id: 'search', label: 'Instant ⌘K Search', icon: Search },
          { id: 'sharing', label: 'Team Sharing & Links', icon: Share2 },
          { id: 'storage', label: 'Storage Analytics', icon: HardDrive }
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FeatureTab)}
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${isActive
                  ? 'bg-[#6E60EE] text-white shadow-xs scale-102'
                  : 'bg-white/90 text-[#585361] border border-[#ECEAF0] hover:border-[#D6D1FF] hover:bg-[#FAF9F7]'
                }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-[#6E60EE]'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* 5 FLOATING MICRO-UI CARDS (Uploading, Organization, Search, Sharing, Storage) */}
      {/* ========================================================================= */}

      {/* 1. FLOATING CARD: Uploading */}
      <div className="hidden xl:flex items-center gap-3.5 absolute -top-8 -left-10 z-30 rounded-2xl border border-[#ECEAF0] bg-white/95 backdrop-blur-md p-3.5 shadow-[0_12px_32px_rgba(30,25,60,0.09)] animate-float-slow transition-transform hover:scale-105">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F2EFFF] text-[#6E60EE]">
          <CloudUpload className="h-5 w-5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1E1B24]">Direct R2 Upload</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              14.8 MB/s
            </span>
          </div>
          <span className="text-[11px] text-[#8A8594]">Pitch-Deck-2026.pdf • 100% Synced</span>
        </div>
      </div>

      {/* 2. FLOATING CARD: File Organization */}
      <div className="hidden lg:flex items-center gap-3 absolute top-36 -left-8 z-30 rounded-2xl border border-[#ECEAF0] bg-white/95 backdrop-blur-md p-3.5 shadow-[0_12px_32px_rgba(30,25,60,0.08)] animate-float-delayed transition-transform hover:scale-105">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
          <FolderClosed className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#1E1B24]">File Organization</span>
          <span className="text-[11px] text-[#585361]">Moved 4 files to &ldquo;Brand Assets&rdquo;</span>
        </div>
      </div>

      {/* 3. FLOATING CARD: Search */}
      <div className="hidden xl:flex items-center gap-3 absolute -top-8 -right-8 z-30 rounded-2xl border border-[#ECEAF0] bg-white/95 backdrop-blur-md p-3.5 shadow-[0_12px_32px_rgba(30,25,60,0.09)] animate-float-reverse transition-transform hover:scale-105">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F2EFFF] text-[#6E60EE]">
          <Search className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1E1B24]">Instant Search</span>
            <kbd className="rounded bg-[#FAF9F7] border border-[#ECEAF0] px-1.5 py-0.5 text-[10px] font-medium text-[#6E60EE]">
              12ms
            </kbd>
          </div>
          <span className="text-[11px] text-[#8A8594]">Found 3 items for &ldquo;Pitch Deck&rdquo;</span>
        </div>
      </div>

      {/* 4. FLOATING CARD: Sharing */}
      <div className="hidden lg:flex items-center gap-3.5 absolute top-48 -right-8 z-30 rounded-2xl border border-[#ECEAF0] bg-white/95 backdrop-blur-md p-3.5 shadow-[0_12px_32px_rgba(30,25,60,0.08)] animate-float-slow transition-transform hover:scale-105">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Share2 className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#1E1B24]">Team Sharing</span>
            <span className="text-[10px] rounded-full bg-blue-100/60 px-1.5 py-0.2 text-blue-700 font-medium">Link active</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#8A8594]">
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6E60EE] text-[9px] font-bold text-white">A</span>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">S</span>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white">D</span>
            </div>
            <span className="ml-1">3 team collaborators</span>
          </div>
        </div>
      </div>

      {/* 5. FLOATING CARD: Storage */}
      <div className="hidden lg:flex items-center gap-3 absolute -bottom-6 -left-6 z-30 rounded-2xl border border-[#ECEAF0] bg-white/95 backdrop-blur-md p-3.5 shadow-[0_12px_32px_rgba(30,25,60,0.09)] animate-float-delayed transition-transform hover:scale-105">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <HardDrive className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#1E1B24]">Storage Meter</span>
            <span className="text-[11px] font-semibold text-[#6E60EE]">24.8 / 50 GB</span>
          </div>
          <div className="mt-1.5 h-1.5 w-36 overflow-hidden rounded-full bg-[#ECEAF0]">
            <div className="h-full w-[49%] rounded-full bg-gradient-to-r from-[#6E60EE] to-emerald-500" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN REALISTIC CLOUDSPACEGO WORKSPACE CONTAINER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-[#ECEAF0] bg-white shadow-[0_24px_70px_rgba(30,25,60,0.09)] transition-all duration-300 hover:shadow-[0_28px_80px_rgba(30,25,60,0.13)]">

        {/* Workspace Real App Header Bar */}
        <div className="flex h-14 items-center justify-between border-b border-[#ECEAF0] bg-[#FAF9F7] px-4 sm:px-6">
          {/* Left: Window Dots & Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#E5E2EA] transition-colors hover:bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-[#E5E2EA] transition-colors hover:bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-[#E5E2EA] transition-colors hover:bg-emerald-400" />
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#ECEAF0]">
              <div className="w-5 h-5 flex items-center justify-center">
                <Image
                  src="/images/cloudeLogo.png"
                  width={20}
                  height={18}
                  alt="cloudspacego"
                  className="w-5 h-auto object-contain"
                />
              </div>
              <span className="text-xs font-bold tracking-tight text-[#1E1B24]">
                cloud<span className="text-[#6E60EE]">spacego</span>
              </span>
              <span className="rounded bg-[#F2EFFF] px-1.5 py-0.2 text-[9px] font-bold text-[#6E60EE]">
                v2.4
              </span>
            </div>
          </div>

          {/* Center: Search Bar with dynamic typing simulation */}
          <div className="relative flex-1 max-w-md mx-4">
            <div
              className={`flex h-8 items-center gap-2 rounded-lg border bg-white px-3 text-xs shadow-2xs transition-all ${activeTab === 'search' || isSearching
                  ? 'border-[#6E60EE] ring-2 ring-[#6E60EE]/15'
                  : 'border-[#ECEAF0] text-[#8A8594]'
                }`}
            >
              <Search className="h-3.5 w-3.5 text-[#8A8594] shrink-0" />
              <input
                type="text"
                readOnly
                value={searchQuery || (activeTab === 'search' ? '' : 'Search files, folders, and shared items...')}
                className="w-full bg-transparent text-xs text-[#1E1B24] placeholder-[#8A8594] focus:outline-none"
              />
              <kbd className="hidden rounded bg-[#FAF9F7] px-1.5 py-0.5 text-[10px] font-medium text-[#8A8594] sm:inline border border-[#ECEAF0]">
                ⌘K
              </kbd>
            </div>

            {/* Instant Search Results Dropdown Preview */}
            {(activeTab === 'search' || searchQuery.length > 3) && (
              <div className="absolute top-10 left-0 right-0 z-40 rounded-xl border border-[#ECEAF0] bg-white p-2 shadow-xl animate-landing-fade-in">
                <div className="px-2 py-1 text-[10px] font-semibold text-[#8A8594] uppercase tracking-wider">
                  Instant Matches (3)
                </div>
                <div className="space-y-1 mt-1">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#F2EFFF] text-xs font-medium text-[#1E1B24] cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#6E60EE]" />
                      <span className="font-semibold text-[#6E60EE]">Pitch Deck 2026 Final.pdf</span>
                    </div>
                    <span className="text-[10px] text-[#8A8594]">4.2 MB • Marketing</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#FAF9F7] text-xs font-medium text-[#585361] cursor-pointer">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                      <span>Pitch-Deck-Visuals.zip</span>
                    </div>
                    <span className="text-[10px] text-[#8A8594]">18.4 MB • Assets</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Workspace Profile & Status */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#F2EFFF] px-2.5 py-1 text-[11px] font-semibold text-[#6E60EE]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE] animate-pulse" />
              Live Workspace
            </span>

            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#6E60EE] to-[#8B5CF6] flex items-center justify-center text-white text-[11px] font-bold shadow-2xs">
                AM
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Main Workspace Layout */}
        <div className="flex min-h-[500px] flex-col md:flex-row bg-[#FAF9F7]">

          {/* Dashboard Left Sidebar */}
          <aside className="hidden w-60 flex-col justify-between border-r border-[#ECEAF0] bg-white p-4 md:flex">
            <div>
              {/* Navigation Menu */}
              <div className="space-y-1">
                <div className="flex items-center justify-between rounded-xl bg-[#F2EFFF] px-3 py-2 text-xs font-semibold text-[#6E60EE]">
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4 text-[#6E60EE]" />
                    <span>Dashboard</span>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
                </div>

                <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[#585361] hover:bg-[#FAF9F7] transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <FolderClosed className="h-4 w-4 text-[#8A8594]" />
                    <span>My Files</span>
                  </div>
                  <span className="text-[10px] text-[#8A8594] font-semibold">124</span>
                </div>

                <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[#585361] hover:bg-[#FAF9F7] transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Share2 className="h-4 w-4 text-[#8A8594]" />
                    <span>Shared</span>
                  </div>
                  <span className="rounded bg-[#FAF9F7] px-1.5 py-0.2 text-[10px] text-[#6E60EE] font-bold border border-[#ECEAF0]">
                    3 new
                  </span>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#585361] hover:bg-[#FAF9F7] transition-colors cursor-pointer">
                  <Clock className="h-4 w-4 text-[#8A8594]" />
                  <span>Recent</span>
                </div>

                <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[#585361] hover:bg-[#FAF9F7] transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Star className="h-4 w-4 text-[#8A8594]" />
                    <span>Starred</span>
                  </div>
                  <span className="text-[10px] text-[#8A8594]">8</span>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#585361] hover:bg-[#FAF9F7] transition-colors cursor-pointer">
                  <Trash2 className="h-4 w-4 text-[#8A8594]" />
                  <span>Trash</span>
                </div>
              </div>

              {/* Quick Tags Section */}
              <div className="mt-6 pt-4 border-t border-[#ECEAF0]">
                <span className="px-2 text-[10px] font-bold text-[#8A8594] uppercase tracking-wider">
                  Pinned Tags
                </span>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#585361] hover:bg-[#FAF9F7] cursor-pointer">
                    <span className="h-2 w-2 rounded-full bg-[#6E60EE]" />
                    <span>#Design-System</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#585361] hover:bg-[#FAF9F7] cursor-pointer">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>#Q3-Deliverables</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Storage Widget */}
            <div className="rounded-xl border border-[#ECEAF0] bg-[#FAF9F7] p-3.5 transition-all">
              <div className="flex items-center justify-between text-xs font-medium text-[#1E1B24]">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-[#6E60EE]" />
                  Storage Pool
                </span>
                <span className="text-[#6E60EE] font-bold text-[11px]">49%</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#ECEAF0]">
                <div className="h-full w-[49%] rounded-full bg-gradient-to-r from-[#6E60EE] to-[#8B5CF6]" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-[#8A8594]">
                <span>24.8 GB used</span>
                <span className="font-semibold text-[#585361]">50 GB Pro</span>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Canvas Viewport */}
          <div className="flex-1 p-5 sm:p-6 lg:p-7 overflow-hidden">

            {/* Action Bar / Breadcrumb */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#8A8594]">
                  <span>My Workspace</span>
                  <span>/</span>
                  <span className="font-semibold text-[#1E1B24]">Marketing & Assets</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1E1B24] mt-0.5">
                  Files & Folders
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECEAF0] bg-white px-3 py-1.5 text-xs font-semibold text-[#1E1B24] shadow-2xs hover:border-[#D6D1FF] hover:bg-[#FAF9F7] transition-all cursor-pointer"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-[#6E60EE]" />
                  <span>New Folder</span>
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#6E60EE] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#6052E6] transition-all cursor-pointer active:scale-95"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {/* Folders Row */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#585361] uppercase tracking-wider">
                  Folders (4)
                </span>
                <span className="text-xs text-[#8A8594]">Drag files to organize</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {folders.map(folder => {
                  const isHovered = activeFolderHover === folder.id
                  return (
                    <div
                      key={folder.id}
                      onMouseEnter={() => setActiveFolderHover(folder.id)}
                      onMouseLeave={() => setActiveFolderHover(null)}
                      className={`group relative flex items-center justify-between p-3.5 rounded-xl border bg-white shadow-2xs transition-all duration-200 cursor-pointer ${isHovered || activeTab === 'uploading'
                          ? 'border-[#6E60EE] ring-2 ring-[#6E60EE]/10 bg-[#FAF9F7]'
                          : 'border-[#ECEAF0] hover:border-[#D6D1FF]'
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F2EFFF] group-hover:scale-105 transition-transform">
                          <Folder className={`h-5 w-5 ${folder.color}`} />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-[#1E1B24] truncate group-hover:text-[#6E60EE] transition-colors">
                            {folder.name}
                          </span>
                          <span className="text-[10px] text-[#8A8594] truncate">
                            {folder.count} • {folder.size}
                          </span>
                        </div>
                      </div>

                      {folder.starred && (
                        <Star className="h-3.5 w-3.5 text-[#6E60EE] fill-[#6E60EE] shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Files Filter & List */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  {(['all', 'docs', 'media', 'sheets'] as const).map(filter => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSelectedFilter(filter)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${selectedFilter === filter
                          ? 'bg-[#1E1B24] text-white shadow-2xs'
                          : 'text-[#8A8594] hover:text-[#1E1B24] hover:bg-white'
                        }`}
                    >
                      {filter === 'all' ? 'All Files' : filter}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-[#8A8594]">
                  <span className="font-medium text-[#6E60EE] hover:underline cursor-pointer">
                    Sort by Recent
                  </span>
                </div>
              </div>

              {/* Files Table / List */}
              <div className="overflow-hidden rounded-xl border border-[#ECEAF0] bg-white shadow-2xs">
                <div className="divide-y divide-[#ECEAF0]">
                  {filteredFiles.map((file, idx) => {
                    const Icon = file.icon
                    const isNewUpload = idx === 0 && isUploaded

                    return (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between p-3.5 transition-all cursor-pointer group ${isNewUpload ? 'bg-[#F2EFFF]/60' : 'hover:bg-[#FAF9F7]'
                          }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div
                            className={`h-9 w-9 rounded-xl ${file.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                          >
                            <Icon className={`h-4 w-4 ${file.iconColor}`} />
                          </div>

                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#1E1B24] truncate group-hover:text-[#6E60EE] transition-colors">
                                {file.name}
                              </span>
                              {isNewUpload && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.2 text-[9px] font-bold text-emerald-700 animate-pulse">
                                  Just Added
                                </span>
                              )}
                              {file.shared && (
                                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-[#FAF9F7] px-1.5 py-0.2 text-[9px] font-medium text-[#8A8594] border border-[#ECEAF0]">
                                  <Users className="h-2.5 w-2.5 text-[#6E60EE]" />
                                  Shared
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8A8594] sm:hidden">
                              {file.size} • {file.updated}
                            </span>
                          </div>
                        </div>

                        {/* File Metadata Columns */}
                        <div className="hidden sm:flex items-center gap-6 text-xs text-[#8A8594]">
                          <span className="w-16 text-right font-medium">{file.size}</span>
                          <span className="w-24 text-right">{file.updated}</span>
                          <span className="rounded bg-[#FAF9F7] px-2 py-0.5 text-[10px] font-semibold text-[#585361] border border-[#ECEAF0]">
                            {file.badge}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="p-1 rounded-md hover:bg-white text-[#585361] hover:text-[#6E60EE]"
                              title="Preview"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className="p-1 rounded-md hover:bg-white text-[#585361] hover:text-[#6E60EE]"
                              title="Share"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Upload Progress Docked Toast (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-40 max-w-xs rounded-xl border border-[#ECEAF0] bg-white/95 backdrop-blur-md p-3.5 shadow-xl transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-[#1E1B24]">
            <div className="flex items-center gap-2">
              {uploadProgress >= 100 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <CloudUpload className="h-4 w-4 text-[#6E60EE] animate-pulse shrink-0" />
              )}
              <span className="truncate">
                {uploadProgress >= 100 ? 'Upload Complete' : 'Uploading 1 item...'}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#6E60EE]">
              {uploadProgress >= 100 ? 'Done' : `${uploadProgress}%`}
            </span>
          </div>

          <p className="mt-1 text-[10px] text-[#8A8594] truncate">
            Brand-Assets-Archive-v2.zip (24.4 MB)
          </p>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#ECEAF0]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${uploadProgress >= 100 ? 'bg-emerald-500' : 'bg-[#6E60EE]'
                }`}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Badges below Mockup */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-[#8A8594]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#6E60EE]" />
          <span>Cloudflare R2 Storage</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#6E60EE]" />
          <span>Instant Previews (PDF, Media, Code)</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#6E60EE]" />
          <span>Granular Sharing Links</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#6E60EE]" />
          <span>Zero Egress Fees</span>
        </div>
      </div>
    </div>
  )
}
