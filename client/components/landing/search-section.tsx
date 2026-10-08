'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  FileText,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  Film,
  Command,
  Eye,
  Share2
} from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'

interface SearchItem {
  id: string
  title: string
  folder: string
  size: string
  modified: string
  type: 'pdf' | 'img' | 'code' | 'archive' | 'sheet' | 'video'
  tags: string[]
  matchSnippet?: string
}

const SEARCH_DATABASE: SearchItem[] = [
  {
    id: '1',
    title: 'Project Presentation.pdf',
    folder: 'Projects / Q3 Strategy',
    size: '4.8 MB',
    modified: '2 hours ago',
    type: 'pdf',
    tags: ['presentation', 'strategy', 'q3'],
    matchSnippet: 'Slide 4: Cloud architecture overview & R2 storage scaling'
  },
  {
    id: '2',
    title: 'Project Assets.zip',
    folder: 'Projects / Brand 2026',
    size: '142 MB',
    modified: 'Yesterday',
    type: 'archive',
    tags: ['assets', 'brand', 'vector'],
    matchSnippet: 'Contains 48 vector icons, logo lockups, and font weights'
  },
  {
    id: '3',
    title: 'Project Notes.md',
    folder: 'Documents / Notes',
    size: '18 KB',
    modified: '3 hours ago',
    type: 'code',
    tags: ['markdown', 'notes', 'roadmap'],
    matchSnippet: '# Project Roadmap 2026 - Milestone 1 release checklist'
  },
  {
    id: '4',
    title: 'Project Images / Hero_Mockup.png',
    folder: 'Images / Showcase',
    size: '3.2 MB',
    modified: 'May 14',
    type: 'img',
    tags: ['hero', 'mockup', 'darkmode'],
    matchSnippet: 'Dimensions 3840 × 2160 · 24-bit PNG with alpha'
  },
  {
    id: '5',
    title: 'Financial Projections.xlsx',
    folder: 'Documents / Finance',
    size: '920 KB',
    modified: 'Apr 29',
    type: 'sheet',
    tags: ['finance', 'budget', 'q3'],
    matchSnippet: 'Sheet 1: Storage cost analysis vs AWS S3 & egress savings'
  },
  {
    id: '6',
    title: 'Product Demo Reel 4K.mp4',
    folder: 'Videos / Marketing',
    size: '1.4 GB',
    modified: 'May 02',
    type: 'video',
    tags: ['video', 'demo', 'marketing'],
    matchSnippet: 'Video master render 3840x2160 @ 60fps'
  }
]

export function SearchSection() {
  const [searchTerm, setSearchTerm] = useState('Project')
  const [activeFilter, setActiveFilter] = useState<'all' | 'pdf' | 'img' | 'code' | 'archive'>('all')

  const filteredResults = useMemo(() => {
    return SEARCH_DATABASE.filter(item => {
      const matchesText =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.folder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory =
        activeFilter === 'all' || item.type === activeFilter

      return matchesText && matchesCategory
    })
  }, [searchTerm, activeFilter])

  const renderItemIcon = (type: SearchItem['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-400" />
      case 'img':
        return <ImageIcon className="w-4 h-4 text-blue-400" />
      case 'code':
        return <FileCode className="w-4 h-4 text-emerald-400" />
      case 'sheet':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
      case 'archive':
        return <FileArchive className="w-4 h-4 text-amber-400" />
      case 'video':
        return <Film className="w-4 h-4 text-purple-400" />
    }
  }

  // Highlight search matching text in titles
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="text-[#6E60EE] bg-[#1D1935] rounded px-1 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  return (
    <section id="search" className="relative py-10 sm:py-14 lg:py-16 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.12]">
            Find it when you need it.
          </h2>

          <p className="mt-3.5 sm:mt-4 text-base sm:text-lg font-normal leading-relaxed text-[#A1A1AA]">
            Stop digging through nested directories. Search across file names, folders,
            and document contents instantly.
          </p>
        </div>

        {/* Search UI Box */}
        <div className="mt-8 sm:mt-10 lg:mt-12 w-full rounded-2xl border border-[#24242B] bg-[#101014] overflow-hidden">
          {/* Big Command Bar Header */}
          <div className="p-4 sm:p-6 border-b border-[#24242B] bg-[#0D0D10]">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#6E60EE]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search files, folders, and shared items..."
                className="w-full rounded-xl border border-[#24242B] bg-[#141419] py-3.5 pl-12 pr-28 text-sm sm:text-base font-medium text-[#F5F5F7] placeholder-[#71717A] focus:border-[#6E60EE] focus:outline-none transition-colors"
              />
              <div className="absolute right-3 flex items-center gap-1.5">
                <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-[#101014] border border-[#24242B] px-2 py-1 text-[11px] font-mono text-[#A1A1AA]">
                  <Command className="w-3 h-3" /> K
                </kbd>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="text-xs text-[#71717A] hover:text-[#F5F5F7] px-2 py-1 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Results' },
                { id: 'pdf', label: 'PDFs' },
                { id: 'img', label: 'Images' },
                { id: 'code', label: 'Code & Notes' },
                { id: 'archive', label: 'Archives' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-[#6E60EE] text-white'
                      : 'bg-[#141419] border border-[#24242B] text-[#A1A1AA] hover:text-[#F5F5F7] hover:bg-[#101014]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="p-4 sm:p-6 bg-[#101014] space-y-2.5">
            {filteredResults.length === 0 ? (
              <div className="text-center py-12 text-[#71717A]">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#6E60EE]" />
                <p className="text-sm">No files found matching &quot;{searchTerm}&quot;</p>
                <p className="text-xs text-[#71717A] mt-1">Try searching for &quot;Project&quot;, &quot;Deck&quot;, or &quot;Notes&quot;</p>
              </div>
            ) : (
              filteredResults.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-[#24242B] bg-[#141419] hover:bg-[#101014] transition-colors duration-150 gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#101014] border border-[#24242B] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      {renderItemIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#F5F5F7] truncate">
                          {highlightMatch(item.title, searchTerm)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#71717A] mt-0.5">
                        <span className="text-[#A1A1AA]">{item.folder}</span>
                        <span>•</span>
                        <span>{item.size}</span>
                        <span>•</span>
                        <span>{item.modified}</span>
                      </div>
                      {item.matchSnippet && (
                        <p className="text-[11px] text-[#A1A1AA] mt-1 line-clamp-1 italic bg-[#101014] px-2 py-0.5 rounded border border-[#24242B] font-mono">
                          {item.matchSnippet}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-[#24242B] bg-[#101014] px-2.5 py-1 text-xs font-medium text-[#F5F5F7] hover:bg-[#141419] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#6E60EE]" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg border border-[#24242B] bg-[#101014] text-[#71717A] hover:text-[#F5F5F7] hover:bg-[#141419] transition-colors"
                      title="Share link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Search Footer */}
          <div className="px-5 py-3 border-t border-[#24242B] bg-[#0D0D10] flex flex-wrap items-center justify-between text-xs text-[#71717A] gap-2">
            <span>Showing {filteredResults.length} indexed files</span>
            <span className="hidden sm:inline">Use ↑ ↓ arrows to navigate results</span>
          </div>
        </div>
      </LandingContainer>
    </section>
  )
}

