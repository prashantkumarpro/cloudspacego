'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  X,
  FileText,
  Image as ImageIcon,
  Folder,
  Home,
  Users,
  Clock,
  Star,
  Trash2,
  MoreVertical,
  Grid,
  List,
  ArrowUp,
  Bell,
  HardDrive,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { useInView } from '@/hooks/use-in-view'

interface SearchResultItem {
  id: string
  name: string
  ext: string
  size: string
  location: string
  date: string
  type: 'img' | 'pdf' | 'code' | 'archive'
  previewType?: 'dark-img' | 'white-card' | 'pdf' | 'yellow-dark'
}

const SEARCH_ITEMS: SearchResultItem[] = [
  {
    id: '1',
    name: 'postbg3.png',
    ext: '.PNG',
    size: '1.1 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '2',
    name: 'cloudspacegov1_thumbnail.png',
    ext: '.PNG',
    size: '107.9 KB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'white-card'
  },
  {
    id: '3',
    name: 'file.pdf',
    ext: '.PDF',
    size: '222.4 KB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'pdf',
    previewType: 'pdf'
  },
  {
    id: '4',
    name: 'postbg2.png',
    ext: '.PNG',
    size: '1.1 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '5',
    name: 'b10.png',
    ext: '.PNG',
    size: '1.1 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'yellow-dark'
  },
  {
    id: '6',
    name: 'b11.png',
    ext: '.PNG',
    size: '1.1 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '7',
    name: 'bnbg4.png',
    ext: '.PNG',
    size: '1 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '8',
    name: 'b2.png',
    ext: '.PNG',
    size: '1.4 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '9',
    name: 'bnbg1.png',
    ext: '.PNG',
    size: '1.2 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '10',
    name: 'b3.png',
    ext: '.PNG',
    size: '477.2 KB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '11',
    name: 'b4.png',
    ext: '.PNG',
    size: '1.4 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '12',
    name: 'ChatGPT Image Oct 1, 2026, 03_03_45 PM.png',
    ext: '.PNG',
    size: '1.3 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '13',
    name: 'b5.png',
    ext: '.PNG',
    size: '1.4 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '14',
    name: 'b7.png',
    ext: '.PNG',
    size: '1.3 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '15',
    name: 'b9.png',
    ext: '.PNG',
    size: '1.1 MB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  },
  {
    id: '16',
    name: 'bnbg2.png',
    ext: '.PNG',
    size: '1001.4 KB',
    location: 'in My Files',
    date: 'Oct 6, 2026',
    type: 'img',
    previewType: 'dark-img'
  }
]

const BACKGROUND_FILES = [
  { name: 'b2.png', owner: 'Me', date: 'Oct 6, 2026', size: '1.4 MB' },
  { name: 'bnbg1.png', owner: 'Me', date: 'Oct 6, 2026', size: '1.2 MB' },
  { name: 'b3.png', owner: 'Me', date: 'Oct 6, 2026', size: '477.2 KB' },
  { name: 'b4.png', owner: 'Me', date: 'Oct 6, 2026', size: '1.4 MB' },
  { name: 'ChatGPT Image Oct 1, 2026, 03_03_45 PM.png', owner: 'Me', date: 'Oct 6, 2026', size: '1.3 MB' },
  { name: 'b5.png', owner: 'Me', date: 'Oct 6, 2026', size: '1.4 MB' },
  { name: 'b7.png', owner: 'Me', date: 'Oct 6, 2026', size: '1.3 MB' },
  { name: 'b9.png', owner: 'Me', date: 'Oct 6, 2026', size: '1.1 MB' },
  { name: 'bnbg2.png', owner: 'Me', date: 'Oct 6, 2026', size: '1001.4 KB' }
]

// Helper to highlight matching letters in purple
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-[#6E60EE] font-bold">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  )
}

export function SearchSection() {
  const [searchTerm, setSearchTerm] = useState('b')
  const [selectedIndex, setSelectedIndex] = useState(6) // Default selected: bnbg4.png like screenshot
  const { ref: mockupRef, isInView } = useInView<HTMLDivElement>({ threshold: 0.15 })

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return SEARCH_ITEMS.slice(0, 7)
    return SEARCH_ITEMS.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ext.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 7)
  }, [searchTerm])

  const renderThumbnail = (item: SearchResultItem) => {
    switch (item.previewType) {
      case 'white-card':
        return (
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-xs">
            <div className="w-full h-full rounded-[2px] bg-[#F4F4F5] flex flex-col justify-between p-0.5">
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1 rounded-[1px] bg-blue-500" />
                <div className="w-2 h-1 rounded-[1px] bg-slate-300" />
              </div>
              <div className="w-full h-1 rounded-[1px] bg-slate-300/80" />
            </div>
          </div>
        )
      case 'pdf':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#201318] flex items-center justify-center shrink-0 text-red-400">
            <FileText className="w-4 h-4" />
          </div>
        )
      case 'yellow-dark':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#181820] flex items-center justify-center shrink-0 overflow-hidden relative">
            <div className="w-5 h-4 rounded-[2px] bg-[#1C1814] flex items-center justify-center gap-0.5 px-0.5">
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              <span className="w-1.5 h-0.5 bg-amber-400/70 rounded-full" />
            </div>
          </div>
        )
      case 'dark-img':
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-[#181820] flex items-center justify-center shrink-0 overflow-hidden relative">
            <div className="w-5 h-4 rounded-[2px] bg-[#1E1E28] flex items-center justify-center">
              <ImageIcon className="w-2.5 h-2.5 text-[#71717A]" />
            </div>
          </div>
        )
    }
  }

  return (
    <section id="search" className="relative py-10 sm:py-14 lg:py-16 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10">
        {/* Section Header with Scroll Reveal */}
        <ScrollReveal className="max-w-2xl text-left" duration={500} distance={16}>
          <h2 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.15]">
            Find it when you need it.
          </h2>

          <p className="mt-2 sm:mt-2.5 max-w-xl text-sm sm:text-base font-normal leading-relaxed text-[#A1A1AA]">
            Stop digging through nested directories. Search across file names, folders,
            and document contents instantly.
          </p>
        </ScrollReveal>

        {/* CloudSpaceGo App Showcase Mockup with Search Overlay */}
        <ScrollReveal delay={120} duration={550} distance={18}>
          <div ref={mockupRef} className="mt-5 sm:mt-6 w-full rounded-2xl border border-[#24242B] bg-[#0B0B0D] overflow-hidden relative shadow-2xl min-h-[480px] sm:min-h-[520px] flex items-center justify-center p-3 sm:p-6 lg:p-8 select-none">

            {/* ======================================================== */}
            {/* BACKGROUND LAYER: Full CloudSpaceGo Application Mockup   */}
            {/* ======================================================== */}
            <div className="absolute inset-0 flex opacity-40 pointer-events-none select-none overflow-hidden">

              {/* Left Sidebar Mockup */}
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

                  {/* Nav Links */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#71717A]">
                      <Home className="w-4 h-4" />
                      <span>Home</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#6E60EE] bg-[#1D1935]">
                      <HardDrive className="w-4 h-4 text-[#6E60EE]" />
                      <span>My Files</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#71717A]">
                      <Users className="w-4 h-4" />
                      <span>Shared with me</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#71717A]">
                      <Clock className="w-4 h-4" />
                      <span>Recent</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#71717A]">
                      <Star className="w-4 h-4" />
                      <span>Starred</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#71717A]">
                      <Trash2 className="w-4 h-4" />
                      <span>Trash</span>
                    </div>
                  </div>
                </div>

                {/* Sidebar Storage Widget */}
                <div className="space-y-3 pt-4 border-t border-[#24242B]/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#F5F5F7]">Storage</span>
                    <span className="text-[10px] font-bold text-[#6E60EE] bg-[#1D1935] px-1.5 py-0.5 rounded">
                      FREE
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1A1A22] overflow-hidden">
                    <div className="h-full w-1/4 bg-[#6E60EE] rounded-full transition-all duration-700 ease-out" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#71717A]">
                    <span>21.6 MB used</span>
                    <span>15.0 GB free</span>
                  </div>
                  <div className="text-[11px] text-[#6E60EE] font-medium flex items-center justify-between cursor-pointer">
                    <span>Upgrade Storage</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Main Content Pane (Table + Topbar) */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#0B0B0D]">
                {/* Top Navigation Bar */}
                <div className="h-14 border-b border-[#24242B] px-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#71717A] bg-[#141419] px-3 py-1.5 rounded-xl border border-[#24242B] w-64">
                    <Search className="w-3.5 h-3.5 text-[#71717A]" />
                    <span>Search files, folders...</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative p-2 text-[#71717A]">
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#24242B] border border-[#383842] flex items-center justify-center text-xs font-bold text-[#F5F5F7]">
                      U
                    </div>
                  </div>
                </div>

                {/* Main Files Table View */}
                <div className="p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-[#F5F5F7]">Files</h3>
                    <div className="flex items-center bg-[#141419] border border-[#24242B] rounded-lg p-0.5">
                      <div className="p-1 text-[#71717A] rounded">
                        <Grid className="w-3.5 h-3.5" />
                      </div>
                      <div className="p-1 text-[#6E60EE] bg-[#1D1935] rounded">
                        <List className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-12 text-[11px] font-semibold text-[#71717A] pb-2 border-b border-[#24242B] px-2">
                    <div className="col-span-5 flex items-center gap-1">
                      <span>Name</span>
                      <ArrowUp className="w-3 h-3 text-[#6E60EE]" />
                    </div>
                    <div className="col-span-2">Owner</div>
                    <div className="col-span-3">Date modified</div>
                    <div className="col-span-1 text-right">File size</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-[#24242B]/40 text-xs">
                    {BACKGROUND_FILES.map((f, i) => (
                      <div key={i} className="grid grid-cols-12 items-center py-2.5 px-2 text-[#A1A1AA]">
                        <div className="col-span-5 flex items-center gap-2 text-[#F5F5F7] font-medium truncate">
                          <div className="w-6 h-6 rounded bg-[#18181E] flex items-center justify-center shrink-0">
                            <ImageIcon className="w-3 h-3 text-[#71717A]" />
                          </div>
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
              </div>
            </div>

            {/* ======================================================== */}
            {/* BACKDROP DIMMER OVERLAY                                  */}
            {/* ======================================================== */}
            <div className="absolute inset-0 bg-[#0B0B0D]/70 backdrop-blur-[2px] z-10 transition-opacity duration-300" />

            {/* ======================================================== */}
            {/* FOREGROUND: Live Interactive Search Modal                */}
            {/* ======================================================== */}
            <div className="relative z-20 w-full max-w-[500px] rounded-2xl border border-[#2D294A] bg-[#101014]/95 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300">
              {/* Top Search Input Bar */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#24242B] bg-[#121217]">
                <Search className="w-4.5 h-4.5 text-[#6E60EE] shrink-0" strokeWidth={2.2} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSelectedIndex(0)
                  }}
                  placeholder="Search files and folders..."
                  className="flex-1 bg-transparent text-sm font-semibold text-[#F5F5F7] placeholder-[#71717A] placeholder:font-normal focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[#71717A] hover:text-[#F5F5F7] hover:bg-[#1A1A22] transition-colors cursor-pointer shrink-0"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Results List with Sequential Stagger */}
              <div key={searchTerm} className="p-2 sm:p-2.5 space-y-1 max-h-[350px] overflow-y-auto divide-y divide-[#24242B]/20">
                {filteredResults.length === 0 ? (
                  <div className="py-8 text-center text-[#71717A] text-xs animate-hero-fade-in">
                    No files found matching &quot;{searchTerm}&quot;
                  </div>
                ) : (
                  filteredResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedIndex(idx)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                          opacity: isInView ? 1 : 0,
                          transform: isInView ? 'translateY(0px)' : 'translateY(5px)',
                          transitionProperty: 'opacity, transform, background-color, border-color',
                          transitionDuration: '250ms, 250ms, 150ms, 150ms',
                          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                          transitionDelay: `${idx * 28}ms, ${idx * 28}ms, 0ms, 0ms`
                        }}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer group ${isSelected
                            ? 'bg-[#1D1935] border border-[#6E60EE]/40 text-[#F5F5F7]'
                            : 'hover:bg-[#16161D] border border-transparent text-[#A1A1AA]'
                          }`}
                      >
                        {/* Left: Thumbnail Preview + Details */}
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                          {renderThumbnail(item)}

                          <div className="flex flex-col min-w-0 flex-1 justify-center">
                            <span className="text-xs sm:text-[13px] font-semibold text-[#F5F5F7] truncate leading-tight group-hover:text-[#6E60EE] transition-colors">
                              {highlightMatch(item.name, searchTerm)}
                            </span>
                            <span className="text-[11px] text-[#71717A] font-normal truncate mt-0.5 leading-none">
                              {item.ext} • {item.size} • {item.location}
                            </span>
                          </div>
                        </div>

                        {/* Right: Date Modified */}
                        <span className="text-[11px] text-[#71717A] font-normal shrink-0">
                          {item.date}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </LandingContainer>
    </section>
  )
}
