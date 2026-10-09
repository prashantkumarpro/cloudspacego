'use client'

import React, { useState } from 'react'
import {
  Folder,
  FileText,
  Image as ImageIcon,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Film,
  ChevronRight
} from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { useInView } from '@/hooks/use-in-view'

interface FolderData {
  id: string
  name: string
  count: number
  size: string
  files: {
    name: string
    size: string
    type: 'pdf' | 'img' | 'code' | 'sheet' | 'archive' | 'video'
    date: string
    tag: string
  }[]
}

const FOLDERS: FolderData[] = [
  {
    id: 'projects',
    name: 'Projects',
    count: 38,
    size: '1.2 GB',
    files: [
      { name: 'product.pdf', size: '4.2 MB', type: 'pdf', date: '2 hours ago', tag: 'Planning' },
      { name: 'app.ts', size: '28 KB', type: 'code', date: 'Yesterday', tag: 'Core' },
      { name: 'pitch.pdf', size: '12.8 MB', type: 'pdf', date: '3 days ago', tag: 'Investor' },
      { name: 'brand.zip', size: '142 MB', type: 'archive', date: 'May 12', tag: 'Release' }
    ]
  },
  {
    id: 'documents',
    name: 'Documents',
    count: 14,
    size: '48.5 MB',
    files: [
      { name: 'service.pdf', size: '1.8 MB', type: 'pdf', date: 'Just now', tag: 'Legal' },
      { name: 'q3.xlsx', size: '840 KB', type: 'sheet', date: 'Yesterday', tag: 'Finance' },
      { name: 'team.pdf', size: '3.4 MB', type: 'pdf', date: 'Apr 28', tag: 'Internal' }
    ]
  },
  {
    id: 'images',
    name: 'Images',
    count: 124,
    size: '640 MB',
    files: [
      { name: 'heroworkspace.png', size: '3.8 MB', type: 'img', date: '10 mins ago', tag: 'Production' },
      { name: 'cover.png', size: '5.2 MB', type: 'img', date: 'Yesterday', tag: 'Marketing' },
      { name: 'banner.png', size: '1.4 MB', type: 'img', date: 'May 04', tag: 'Design' }
    ]
  },
  {
    id: 'videos',
    name: 'Videos',
    count: 9,
    size: '3.4 GB',
    files: [
      { name: 'productvideo.mp4', size: '840 MB', type: 'video', date: '2 days ago', tag: 'Keynote' },
      { name: 'micro.mov', size: '320 MB', type: 'video', date: 'May 01', tag: 'UI Demo' }
    ]
  },
  {
    id: 'design',
    name: 'Design',
    count: 52,
    size: '890 MB',
    files: [
      { name: 'cloud.json', size: '44 KB', type: 'code', date: '3 hours ago', tag: 'Design System' },
      { name: 'component.fig', size: '48.2 MB', type: 'archive', date: 'Yesterday', tag: 'Figma' },
      { name: 'icon.zip', size: '12.4 MB', type: 'archive', date: 'Apr 19', tag: 'Icons' }
    ]
  },
  {
    id: 'work',
    name: 'Work',
    count: 22,
    size: '185 MB',
    files: [
      { name: 'sprint.pdf', size: '620 KB', type: 'pdf', date: '1 day ago', tag: 'Agile' },
      { name: 'feedback.xlsx', size: '1.1 MB', type: 'sheet', date: 'May 08', tag: 'Feedback' }
    ]
  }
]

export function OrganizeSection() {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('projects')
  const { ref: mockupRef, isInView } = useInView<HTMLDivElement>({ threshold: 0.15 })

  const activeFolder = FOLDERS.find(f => f.id === selectedFolderId) || FOLDERS[0]

  const renderFileIcon = (type: FolderData['files'][0]['type']) => {
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
      default:
        return <FileText className="w-4 h-4 text-[#6E60EE]" />
    }
  }

  return (
    <section id="organize" className="relative py-10 sm:py-14 lg:py-16 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10">
        {/* Section Header with Scroll Reveal */}
        <ScrollReveal className="max-w-2xl text-left" duration={500} distance={16}>
          <h2 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.15]">
            Everything has a place.
          </h2>

          <p className="mt-2 sm:mt-2.5 max-w-xl text-sm sm:text-base font-normal leading-relaxed text-[#A1A1AA]">
            Keep your files organized with folders designed to stay simple as your workspace grows.
            Categorize, nest, and navigate through your entire digital library effortlessly.
          </p>
        </ScrollReveal>

        {/* CloudSpaceGo Folder Interface with Staggered Elements */}
        <ScrollReveal delay={120} duration={550} distance={18}>
          <div ref={mockupRef} className="mt-5 sm:mt-6 w-full rounded-2xl border border-[#24242B] bg-[#101014] overflow-hidden">
            {/* Top Interface Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-[#24242B] px-5 sm:px-6 py-3.5 bg-[#0D0D10] gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#A1A1AA]">
                <span className="font-semibold text-[#F5F5F7]">CloudSpace</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />
                <span className="text-[#A1A1AA]">Folders</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />
                <span className="font-semibold text-[#6E60EE] bg-[#1D1935] px-2 py-0.5 rounded transition-colors duration-150">
                  {activeFolder.name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#71717A] hidden sm:inline">
                  {activeFolder.count} items · {activeFolder.size} total
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Folders Grid */}
              <div className="p-4 sm:p-5 lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#24242B] bg-[#0A0A0C]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                    Directories ({FOLDERS.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {FOLDERS.map((folder, index) => {
                    const isSelected = folder.id === selectedFolderId
                    return (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => setSelectedFolderId(folder.id)}
                        style={{
                          opacity: isInView ? 1 : 0,
                          transform: isInView ? 'translateY(0px)' : 'translateY(8px)',
                          transitionProperty: 'opacity, transform, background-color, border-color',
                          transitionDuration: '350ms, 350ms, 150ms, 150ms',
                          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                          transitionDelay: `${index * 35}ms, ${index * 35}ms, 0ms, 0ms`
                        }}
                        className={`flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl border text-left cursor-pointer active:scale-[0.98] transition-all min-w-0 ${
                          isSelected
                            ? 'border-[#6E60EE] bg-[#1D1935] shadow-xs ring-1 ring-[#6E60EE]/50'
                            : 'border-[#24242B] bg-[#101014] hover:bg-[#141419] hover:border-[#383842]'
                        }`}
                      >
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#6E60EE]/20 border border-[#6E60EE]/40' : 'bg-[#1D1935] border border-[#6E60EE]/20'
                        }`}>
                          <Folder className="w-4 h-4 text-[#6E60EE]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className={`text-xs font-bold block truncate ${
                            isSelected ? 'text-[#6E60EE]' : 'text-[#F5F5F7]'
                          }`}>
                            {folder.name}
                          </span>
                          <span className="text-[10px] text-[#71717A] block truncate mt-0.5">
                            {folder.count} files • {folder.size}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: Folder Contents & Interactive File Table */}
              <div className="p-4 sm:p-5 lg:col-span-7 bg-[#101014] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-[#6E60EE]" />
                      <h3 className="text-xs font-semibold text-[#F5F5F7]">
                        {activeFolder.name}
                      </h3>
                    </div>
                    <span className="text-[11px] text-[#71717A]">
                      {activeFolder.files.length} files
                    </span>
                  </div>

                  {/* File list items - Sequential Reveal */}
                  <div key={activeFolder.id} className="space-y-1.5">
                    {activeFolder.files.map((file, idx) => {
                      return (
                        <div
                          key={file.name}
                          style={{
                            opacity: isInView ? 1 : 0,
                            transform: isInView ? 'translateY(0px)' : 'translateY(6px)',
                            transitionProperty: 'opacity, transform, background-color',
                            transitionDuration: '300ms, 300ms, 150ms',
                            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                            transitionDelay: `${idx * 40}ms, ${idx * 40}ms, 0ms`
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-[#24242B]/80 bg-[#141419] hover:bg-[#181822] hover:border-[#32323D] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#101014] flex items-center justify-center shrink-0">
                              {renderFileIcon(file.type)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-[#F5F5F7] truncate">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-[#71717A] mt-0.5">
                                {file.size} • {file.date}
                              </p>
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
        </ScrollReveal>
      </LandingContainer>
    </section>
  )
}

