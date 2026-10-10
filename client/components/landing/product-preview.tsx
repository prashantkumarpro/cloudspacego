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
  CheckCircle2,
  HardDrive,
  Users,
  FolderPlus,
  CloudUpload,
  Eye
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
    <div id="product-demo" className="relative mx-auto mt-12 w-full max-w-6xl animate-landing-fade-up animation-delay-300 select-none">
      {/* Tight Segmented Feature Tabs Switcher */}
      <div className="mb-6 flex items-center justify-center px-2">
        <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-xl border border-card-border bg-input-bg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'uploading', label: 'Upload & Sync', icon: CloudUpload },
            { id: 'search', label: '⌘K Search', icon: Search },
            { id: 'sharing', label: 'Team Sharing', icon: Share2 },
            { id: 'storage', label: 'Storage', icon: HardDrive }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FeatureTab)}
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-card-bg text-foreground font-semibold shadow-xs border border-card-border/80'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#6E60EE]' : 'text-text-muted'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 COMPACT FLOATING MICRO-UI CARDS (Refined visual weight, subtle borders) */}
      {/* ========================================================================= */}

      {/* 1. FLOATING CARD: Uploading */}
      <div className="hidden xl:flex items-center gap-2.5 absolute -top-5 -left-6 z-30 rounded-xl border border-card-border/80 bg-card-bg/95 p-2.5 shadow-md dark:shadow-lg dark:shadow-black/50 animate-float-slow">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-input-bg text-[#6E60EE] border border-card-border/60">
          <CloudUpload className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-foreground">R2 Direct Sync</span>
            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
              14.8 MB/s
            </span>
          </div>
          <span className="text-[10px] text-text-muted">Pitch-Deck-2026.pdf • 100%</span>
        </div>
      </div>

      {/* 2. FLOATING CARD: File Organization */}
      <div className="hidden lg:flex items-center gap-2.5 absolute top-32 -left-6 z-30 rounded-xl border border-card-border/80 bg-card-bg/95 p-2.5 shadow-md dark:shadow-lg dark:shadow-black/50 animate-float-delayed">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-input-bg text-text-secondary border border-card-border/60">
          <FolderClosed className="h-3.5 w-3.5 text-[#6E60EE]" />
        </div>
        <div className="flex flex-col pr-1">
          <span className="text-[11px] font-semibold text-foreground">Organized Workspace</span>
          <span className="text-[10px] text-text-muted">4 files moved to Brand Assets</span>
        </div>
      </div>

      {/* 3. FLOATING CARD: Search */}
      <div className="hidden xl:flex items-center gap-2.5 absolute -top-5 -right-6 z-30 rounded-xl border border-card-border/80 bg-card-bg/95 p-2.5 shadow-md dark:shadow-lg dark:shadow-black/50 animate-float-reverse">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-input-bg text-text-secondary border border-card-border/60">
          <Search className="h-3.5 w-3.5 text-[#6E60EE]" />
        </div>
        <div className="flex flex-col pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-foreground">Instant Search</span>
            <span className="rounded bg-input-bg border border-card-border/60 px-1 py-0.2 text-[9px] font-medium text-text-muted">
              12ms
            </span>
          </div>
          <span className="text-[10px] text-text-muted">3 matches for &ldquo;Pitch Deck&rdquo;</span>
        </div>
      </div>

      {/* 4. FLOATING CARD: Sharing */}
      <div className="hidden lg:flex items-center gap-2.5 absolute top-44 -right-6 z-30 rounded-xl border border-card-border/80 bg-card-bg/95 p-2.5 shadow-md dark:shadow-lg dark:shadow-black/50 animate-float-slow">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-input-bg text-text-secondary border border-card-border/60">
          <Share2 className="h-3.5 w-3.5 text-[#6E60EE]" />
        </div>
        <div className="flex flex-col pr-1">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-foreground">Active Share Link</span>
            <span className="text-[9px] text-[#6E60EE] font-medium">• 3 members</span>
          </div>
          <span className="text-[10px] text-text-muted">Expires in 7 days</span>
        </div>
      </div>

      {/* 5. FLOATING CARD: Storage */}
      <div className="hidden lg:flex items-center gap-2.5 absolute -bottom-4 -left-4 z-30 rounded-xl border border-card-border/80 bg-card-bg/95 p-2.5 shadow-md dark:shadow-lg dark:shadow-black/50 animate-float-delayed">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-input-bg text-text-secondary border border-card-border/60">
          <HardDrive className="h-3.5 w-3.5 text-[#6E60EE]" />
        </div>
        <div className="flex flex-col pr-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold text-foreground">Storage Pool</span>
            <span className="text-[10px] font-semibold text-text-secondary">24.8 / 50 GB</span>
          </div>
          <div className="mt-1 h-1 w-28 overflow-hidden rounded-full bg-input-bg border border-card-border/50">
            <div className="h-full w-[49%] rounded-full bg-[#6E60EE]" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN REALISTIC CLOUDSPACEGO WORKSPACE CONTAINER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-card-border bg-card-bg shadow-2xl dark:shadow-black/70 transition-all duration-300">

        {/* Workspace Real App Header Bar */}
        <div className="flex h-14 items-center justify-between border-b border-card-border bg-card-bg px-4 sm:px-6">
          {/* Left: Window Dots & Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-divider transition-colors hover:bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-divider transition-colors hover:bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-divider transition-colors hover:bg-emerald-400" />
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-card-border">
              <div className="w-5 h-5 flex items-center justify-center">
                <Image
                  src="/images/cloudeLogo.png"
                  width={20}
                  height={18}
                  alt="cloudspacego"
                  className="w-5 h-auto object-contain"
                />
              </div>
              <span className="text-xs font-bold tracking-tight text-foreground">
                cloud<span className="text-[#6E60EE]">spacego</span>
              </span>
              <span className="rounded bg-[#6E60EE]/10 px-1.5 py-0.2 text-[9px] font-bold text-[#6E60EE]">
                v2.4
              </span>
            </div>
          </div>

          {/* Center: Search Bar with dynamic typing simulation */}
          <div className="relative flex-1 max-w-md mx-4">
            <div
              className={`flex h-8 items-center gap-2 rounded-lg border bg-input-bg px-3 text-xs shadow-2xs transition-all ${activeTab === 'search' || isSearching
                  ? 'border-[#6E60EE] ring-2 ring-[#6E60EE]/15'
                  : 'border-card-border text-text-muted'
                }`}
            >
              <Search className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <input
                type="text"
                readOnly
                value={searchQuery || (activeTab === 'search' ? '' : 'Search files, folders, and shared items...')}
                className="w-full bg-transparent text-xs text-foreground placeholder:text-text-muted focus:outline-none"
              />
              <kbd className="hidden rounded bg-card-bg px-1.5 py-0.5 text-[10px] font-medium text-text-muted sm:inline border border-card-border">
                ⌘K
              </kbd>
            </div>

            {/* Instant Search Results Dropdown Preview */}
            {(activeTab === 'search' || searchQuery.length > 3) && (
              <div className="absolute top-10 left-0 right-0 z-40 rounded-xl border border-card-border bg-card-bg p-2 shadow-2xl animate-landing-fade-in divide-y divide-card-border/40">
                <div className="px-2 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Instant Matches (3)
                </div>
                <div className="space-y-1 mt-1 pt-1">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-input-bg text-xs font-medium text-foreground cursor-pointer border border-card-border/60">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#6E60EE]" />
                      <span className="font-semibold text-[#6E60EE]">Pitch Deck 2026 Final.pdf</span>
                    </div>
                    <span className="text-[10px] text-text-muted">4.2 MB • Marketing</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-input-bg text-xs font-medium text-text-secondary cursor-pointer">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                      <span>Pitch-Deck-Visuals.zip</span>
                    </div>
                    <span className="text-[10px] text-text-muted">18.4 MB • Assets</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Workspace Profile & Status */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#6E60EE]/10 px-2.5 py-1 text-[11px] font-semibold text-[#6E60EE] dark:text-[#8E82F8]">
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
        <div className="flex min-h-[500px] flex-col md:flex-row bg-background">

          {/* Dashboard Left Sidebar */}
          <aside className="hidden w-60 flex-col justify-between border-r border-sidebar-border bg-sidebar-bg p-4 md:flex">
            <div>
              {/* Navigation Menu */}
              <div className="space-y-1">
                <div className="flex items-center justify-between rounded-xl bg-sidebar-active-bg px-3 py-2 text-xs font-semibold text-[#6E60EE] dark:text-[#8E82F8]">
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4 text-[#6E60EE] dark:text-[#8E82F8]" />
                    <span>Dashboard</span>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
                </div>

                <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-text-secondary hover:bg-input-bg hover:text-foreground transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <FolderClosed className="h-4 w-4 text-text-muted" />
                    <span>My Files</span>
                  </div>
                  <span className="text-[10px] text-text-muted font-semibold">124</span>
                </div>

                <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-text-secondary hover:bg-input-bg hover:text-foreground transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Share2 className="h-4 w-4 text-text-muted" />
                    <span>Shared</span>
                  </div>
                  <span className="rounded bg-input-bg px-1.5 py-0.2 text-[10px] text-[#6E60EE] font-bold border border-card-border">
                    3 new
                  </span>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-secondary hover:bg-input-bg hover:text-foreground transition-colors cursor-pointer">
                  <Clock className="h-4 w-4 text-text-muted" />
                  <span>Recent</span>
                </div>

                <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-text-secondary hover:bg-input-bg hover:text-foreground transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Star className="h-4 w-4 text-text-muted" />
                    <span>Starred</span>
                  </div>
                  <span className="text-[10px] text-text-muted">8</span>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-secondary hover:bg-input-bg hover:text-foreground transition-colors cursor-pointer">
                  <Trash2 className="h-4 w-4 text-text-muted" />
                  <span>Trash</span>
                </div>
              </div>

              {/* Quick Tags Section */}
              <div className="mt-6 pt-4 border-t border-card-border">
                <span className="px-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Pinned Tags
                </span>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:bg-input-bg hover:text-foreground cursor-pointer">
                    <span className="h-2 w-2 rounded-full bg-[#6E60EE]" />
                    <span>#Design-System</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:bg-input-bg hover:text-foreground cursor-pointer">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>#Q3-Deliverables</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Storage Widget */}
            <div className="rounded-xl border border-card-border bg-card-bg p-3.5 transition-all">
              <div className="flex items-center justify-between text-xs font-medium text-foreground">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-[#6E60EE]" />
                  Storage Pool
                </span>
                <span className="text-[#6E60EE] font-bold text-[11px]">49%</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-input-bg border border-card-border/50">
                <div className="h-full w-[49%] rounded-full bg-gradient-to-r from-[#6E60EE] to-[#8B5CF6]" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-text-muted">
                <span>24.8 GB used</span>
                <span className="font-semibold text-text-secondary">50 GB Pro</span>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Canvas Viewport */}
          <div className="flex-1 p-5 sm:p-6 lg:p-7 overflow-hidden">

            {/* Action Bar / Breadcrumb */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>My Workspace</span>
                  <span>/</span>
                  <span className="font-semibold text-foreground">Marketing & Assets</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
                  Files & Folders
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-card-bg px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-2xs hover:border-card-border/80 hover:bg-input-bg transition-all cursor-pointer"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-[#6E60EE]" />
                  <span>New Folder</span>
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#6E60EE] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#6052E6] transition-all cursor-pointer active:scale-95"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>

            {/* Folders Row */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Folders (4)
                </span>
                <span className="text-xs text-text-muted">Drag files to organize</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {folders.map(folder => {
                  const isHovered = activeFolderHover === folder.id
                  return (
                    <div
                      key={folder.id}
                      onMouseEnter={() => setActiveFolderHover(folder.id)}
                      onMouseLeave={() => setActiveFolderHover(null)}
                      className={`group relative flex items-center justify-between p-3.5 rounded-xl border bg-card-bg shadow-2xs transition-all duration-200 cursor-pointer ${isHovered || activeTab === 'uploading'
                          ? 'border-[#6E60EE] ring-2 ring-[#6E60EE]/10 bg-input-bg/70'
                          : 'border-card-border hover:border-card-border/80 hover:bg-input-bg/40'
                        }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-input-bg border border-card-border group-hover:scale-105 transition-transform">
                          <Folder className={`h-5 w-5 ${folder.color}`} />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-foreground truncate group-hover:text-[#6E60EE] transition-colors">
                            {folder.name}
                          </span>
                          <span className="text-[10px] text-text-muted truncate">
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
                          ? 'bg-card-bg text-[#6E60EE] border border-card-border shadow-2xs'
                          : 'text-text-muted hover:text-foreground hover:bg-card-bg/60'
                        }`}
                    >
                      {filter === 'all' ? 'All Files' : filter}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="font-medium text-[#6E60EE] hover:underline cursor-pointer">
                    Sort by Recent
                  </span>
                </div>
              </div>

              {/* Files Table / List */}
              <div className="overflow-hidden rounded-xl border border-card-border bg-card-bg shadow-2xs">
                <div className="divide-y divide-card-border/50">
                  {filteredFiles.map((file, idx) => {
                    const Icon = file.icon
                    const isNewUpload = idx === 0 && isUploaded

                    return (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between p-3.5 transition-all cursor-pointer group ${isNewUpload ? 'bg-[#6E60EE]/8' : 'hover:bg-input-bg/70'
                          }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div
                            className="h-9 w-9 rounded-xl bg-input-bg border border-card-border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                          >
                            <Icon className={`h-4 w-4 ${file.iconColor}`} />
                          </div>

                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground truncate group-hover:text-[#6E60EE] transition-colors">
                                {file.name}
                              </span>
                              {isNewUpload && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                                  Just Added
                                </span>
                              )}
                              {file.shared && (
                                <span className="hidden sm:inline-flex items-center gap-1 rounded bg-input-bg px-1.5 py-0.2 text-[9px] font-medium text-text-muted border border-card-border">
                                  <Users className="h-2.5 w-2.5 text-[#6E60EE]" />
                                  Shared
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-text-muted sm:hidden">
                              {file.size} • {file.updated}
                            </span>
                          </div>
                        </div>

                        {/* File Metadata Columns */}
                        <div className="hidden sm:flex items-center gap-6 text-xs text-text-muted">
                          <span className="w-16 text-right font-medium text-text-secondary">{file.size}</span>
                          <span className="w-24 text-right">{file.updated}</span>
                          <span className="rounded bg-input-bg px-2 py-0.5 text-[10px] font-semibold text-text-secondary border border-card-border">
                            {file.badge}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="p-1 rounded-md hover:bg-input-bg text-text-secondary hover:text-[#6E60EE]"
                              title="Preview"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className="p-1 rounded-md hover:bg-input-bg text-text-secondary hover:text-[#6E60EE]"
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
        <div className="absolute bottom-4 right-4 z-40 max-w-xs rounded-xl border border-card-border bg-card-bg/95 backdrop-blur-md p-3.5 shadow-xl transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
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

          <p className="mt-1 text-[10px] text-text-muted truncate">
            Brand-Assets-Archive-v2.zip (24.4 MB)
          </p>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-input-bg border border-card-border/50">
            <div
              className={`h-full rounded-full transition-all duration-300 ${uploadProgress >= 100 ? 'bg-emerald-500' : 'bg-[#6E60EE]'
                }`}
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Badges below Mockup */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-text-muted">
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
