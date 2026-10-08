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
      { name: 'Product_Roadmap_2026.pdf', size: '4.2 MB', type: 'pdf', date: '2 hours ago', tag: 'Planning' },
      { name: 'App_Architecture_v3.ts', size: '28 KB', type: 'code', date: 'Yesterday', tag: 'Core' },
      { name: 'Pitch_Deck_Master.pdf', size: '12.8 MB', type: 'pdf', date: '3 days ago', tag: 'Investor' },
      { name: 'Brand_Assets_Master.zip', size: '142 MB', type: 'archive', date: 'May 12', tag: 'Release' }
    ]
  },
  {
    id: 'documents',
    name: 'Documents',
    count: 14,
    size: '48.5 MB',
    files: [
      { name: 'Master_Services_Agreement.pdf', size: '1.8 MB', type: 'pdf', date: 'Just now', tag: 'Legal' },
      { name: 'Q3_Financial_Forecast.xlsx', size: '840 KB', type: 'sheet', date: 'Yesterday', tag: 'Finance' },
      { name: 'Team_Operating_Manual.pdf', size: '3.4 MB', type: 'pdf', date: 'Apr 28', tag: 'Internal' }
    ]
  },
  {
    id: 'images',
    name: 'Images',
    count: 124,
    size: '640 MB',
    files: [
      { name: 'Hero_Workspace_Dark.png', size: '3.8 MB', type: 'img', date: '10 mins ago', tag: 'Production' },
      { name: 'Editorial_Cover_Mockup.png', size: '5.2 MB', type: 'img', date: 'Yesterday', tag: 'Marketing' },
      { name: 'Social_Banner_1200x630.png', size: '1.4 MB', type: 'img', date: 'May 04', tag: 'Design' }
    ]
  },
  {
    id: 'videos',
    name: 'Videos',
    count: 9,
    size: '3.4 GB',
    files: [
      { name: 'Product_Walkthrough_4k.mp4', size: '840 MB', type: 'video', date: '2 days ago', tag: 'Keynote' },
      { name: 'Micro_Interaction_Demos.mov', size: '320 MB', type: 'video', date: 'May 01', tag: 'UI Demo' }
    ]
  },
  {
    id: 'design',
    name: 'Design',
    count: 52,
    size: '890 MB',
    files: [
      { name: 'CloudSpace_Design_Tokens.json', size: '44 KB', type: 'code', date: '3 hours ago', tag: 'Design System' },
      { name: 'Component_Library_V4.fig', size: '48.2 MB', type: 'archive', date: 'Yesterday', tag: 'Figma' },
      { name: 'Iconography_Set_SVG.zip', size: '12.4 MB', type: 'archive', date: 'Apr 19', tag: 'Icons' }
    ]
  },
  {
    id: 'work',
    name: 'Work',
    count: 22,
    size: '185 MB',
    files: [
      { name: 'Sprint_Retrospective_Notes.pdf', size: '620 KB', type: 'pdf', date: '1 day ago', tag: 'Agile' },
      { name: 'Client_Feedback_Consolidated.xlsx', size: '1.1 MB', type: 'sheet', date: 'May 08', tag: 'Feedback' }
    ]
  }
]

export function OrganizeSection() {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('projects')

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
        {/* Section Header */}
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.12]">
            Everything has a place.
          </h2>

          <p className="mt-3.5 sm:mt-4 text-base sm:text-lg font-normal leading-relaxed text-[#A1A1AA]">
            Keep your files organized with folders designed to stay simple as your workspace grows.
            Categorize, nest, and navigate through your entire digital library effortlessly.
          </p>
        </div>

        {/* CloudSpaceGo Folder Interface */}
        <div className="mt-8 sm:mt-10 lg:mt-12 w-full rounded-2xl border border-[#24242B] bg-[#101014] overflow-hidden">
          {/* Top Interface Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#24242B] px-5 sm:px-6 py-3.5 bg-[#0D0D10] gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#A1A1AA]">
              <span className="font-semibold text-[#F5F5F7]">CloudSpace</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />
              <span className="text-[#A1A1AA]">Folders</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />
              <span className="font-semibold text-[#6E60EE] bg-[#1D1935] px-2 py-0.5 rounded">
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
            <div className="p-5 sm:p-6 lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#24242B] bg-[#0A0A0C]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                  Directories ({FOLDERS.length})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                {FOLDERS.map((folder) => {
                  const isSelected = folder.id === selectedFolderId
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => setSelectedFolderId(folder.id)}
                      className={`group relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-colors duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-[#6E60EE] bg-[#1D1935]'
                          : 'border-[#24242B] bg-[#101014] hover:bg-[#141419]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <Folder className="w-5 h-5 text-[#6E60EE]" />
                        <span className="text-[11px] font-medium text-[#71717A]">
                          {folder.count} files
                        </span>
                      </div>

                      <span className={`text-sm font-semibold truncate w-full transition-colors ${
                        isSelected ? 'text-[#6E60EE]' : 'text-[#F5F5F7] group-hover:text-[#6E60EE]'
                      }`}>
                        {folder.name}
                      </span>
                      <span className="text-[11px] text-[#71717A] mt-0.5">
                        {folder.size}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Folder Contents & Interactive File Table */}
            <div className="p-5 sm:p-6 lg:col-span-7 bg-[#101014] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#6E60EE]" />
                    <h3 className="text-sm font-semibold text-[#F5F5F7]">
                      {activeFolder.name} Contents
                    </h3>
                  </div>
                  <span className="text-xs text-[#71717A]">
                    Showing {activeFolder.files.length} files
                  </span>
                </div>

                {/* File list items */}
                <div className="space-y-2">
                  {activeFolder.files.map((file) => {
                    return (
                      <div
                        key={file.name}
                        className="flex items-center justify-between p-3 rounded-xl border border-[#24242B] bg-[#141419] hover:bg-[#101014] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#101014] border border-[#24242B] flex items-center justify-center shrink-0">
                            {renderFileIcon(file.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-[#F5F5F7] truncate">
                              {file.name}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-[#71717A] mt-0.5">
                              <span>{file.size}</span>
                              <span>•</span>
                              <span>{file.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded border border-[#24242B] bg-[#101014] text-[#A1A1AA]">
                            {file.tag}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </LandingContainer>
    </section>
  )
}

