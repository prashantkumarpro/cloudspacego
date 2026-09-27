'use client'

import React from 'react'
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
  ShieldCheck,
  HardDrive
} from 'lucide-react'

export function ProductPreview() {
  return (
    <div className="relative mx-auto mt-12 w-full max-w-6xl animate-landing-fade-up animation-delay-300">
      {/* Soft background glow */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-[#6E60EE]/10 to-transparent blur-2xl opacity-60"
        aria-hidden="true"
      />

      {/* Main Preview Container */}
      <div className="relative overflow-hidden rounded-2xl border border-[#ECEAF0] bg-white shadow-[0_20px_60px_rgba(30,25,60,0.08)] transition-all duration-300 hover:shadow-[0_24px_70px_rgba(30,25,60,0.12)]">
        {/* Browser Top Chrome */}
        <div className="flex h-12 items-center justify-between border-b border-[#ECEAF0] bg-[#FAF9F7]/80 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#E5E2EA] transition-colors hover:bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-[#E5E2EA] transition-colors hover:bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-[#E5E2EA] transition-colors hover:bg-emerald-400" />
          </div>

          <div className="flex h-7 items-center gap-2 rounded-md border border-[#ECEAF0] bg-white px-3 text-xs text-[#8A8594] shadow-2xs">
            <Search className="h-3.5 w-3.5 text-[#8A8594]" />
            <span className="hidden sm:inline">Search files, folders, and shared items...</span>
            <span className="inline sm:hidden">Search files...</span>
            <kbd className="hidden rounded bg-[#FAF9F7] px-1.5 py-0.5 text-[10px] font-medium text-[#8A8594] sm:inline">
              ⌘K
            </kbd>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F2EFFF] px-2.5 py-0.5 text-[11px] font-medium text-[#6E60EE]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE] animate-pulse" />
              Live Workspace
            </span>
          </div>
        </div>

        {/* Dashboard Canvas */}
        <div className="flex min-h-[460px] flex-col md:flex-row bg-[#FAF9F7]">
          {/* Dashboard Sidebar */}
          <aside className="hidden w-56 flex-col justify-between border-r border-[#ECEAF0] bg-white p-4 md:flex">
            <div>
              {/* Sidebar Brand Header */}
              <div className="flex items-center gap-2 px-2 py-2 mb-4">
                <Image
                  src="/images/cloudeLogo.png"
                  width={24}
                  height={21}
                  alt="CloudSpaceGo"
                  className="w-6 h-auto object-contain"
                />
                <span className="text-base font-bold tracking-tight text-[#1E1B24]">
                  cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
                </span>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 rounded-xl bg-[#F2EFFF] px-3 py-2 text-xs font-semibold text-[#6E60EE]">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#585361] hover:bg-[#F8F7FB] transition-colors">
                  <FolderClosed className="h-4 w-4 text-[#8A8594]" />
                  My Files
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#585361] hover:bg-[#F8F7FB] transition-colors">
                  <Share2 className="h-4 w-4 text-[#8A8594]" />
                  Shared
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#585361] hover:bg-[#F8F7FB] transition-colors">
                  <Clock className="h-4 w-4 text-[#8A8594]" />
                  Recent
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#585361] hover:bg-[#F8F7FB] transition-colors">
                  <Star className="h-4 w-4 text-[#8A8594]" />
                  Starred
                </div>
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#585361] hover:bg-[#F8F7FB] transition-colors">
                  <Trash2 className="h-4 w-4 text-[#8A8594]" />
                  Trash
                </div>
              </div>
            </div>

            {/* Sidebar Storage Widget */}
            <div className="rounded-xl border border-[#ECEAF0] bg-[#FAF9F7] p-3">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#585361]">
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3 text-[#6E60EE]" />
                  Storage
                </span>
                <span className="text-[#6E60EE] font-semibold">24%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#ECEAF0]">
                <div className="h-full w-[24%] rounded-full bg-[#6E60EE]" />
              </div>
              <p className="mt-1.5 text-[10px] text-[#8A8594]">12.4 GB of 50 GB used</p>
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <div className="flex-1 p-5 sm:p-6 lg:p-7">
            {/* Top Overview Bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1E1B24]">
                  Welcome back, Alex
                </h3>
                <p className="text-xs text-[#8A8594] mt-0.5">
                  Here is what is happening with your workspace today.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#6E60EE] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#6052E6] transition-colors select-none"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </button>
              </div>
            </div>

            {/* Folders Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#585361] uppercase tracking-wider">
                  Folders
                </span>
                <span className="text-xs text-[#8A8594]">4 folders</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { name: 'Design Assets', count: '14 files', starred: true },
                  { name: 'Quarterly Reports', count: '8 files', starred: false },
                  { name: 'Brand Guidelines', count: '22 files', starred: true },
                  { name: 'Product Media', count: '46 files', starred: false }
                ].map(folder => (
                  <div
                    key={folder.name}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#ECEAF0] shadow-2xs hover:border-[#D6D1FF] hover:bg-[#FAF9F7] transition-all duration-200 cursor-pointer group select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Folder className="h-6 w-6 text-[#6E60EE] shrink-0 group-hover:scale-105 transition-transform" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-semibold text-[#1E1B24] truncate group-hover:text-[#6E60EE] transition-colors">
                          {folder.name}
                        </span>
                        <span className="text-[10px] text-[#8A8594] truncate">
                          {folder.count}
                        </span>
                      </div>
                    </div>
                    {folder.starred && (
                      <Star className="h-3.5 w-3.5 text-[#6E60EE] fill-[#6E60EE] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Files Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#585361] uppercase tracking-wider">
                  Recent Files
                </span>
                <span className="text-xs text-[#6E60EE] hover:underline cursor-pointer font-medium">
                  View all
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#ECEAF0] bg-white shadow-2xs">
                <div className="divide-y divide-[#ECEAF0]">
                  {[
                    {
                      name: 'Pitch Deck 2026.pdf',
                      size: '4.2 MB',
                      date: 'Just now',
                      icon: <FileText className="h-4 w-4 text-[#6E60EE]" />,
                      badge: 'PDF'
                    },
                    {
                      name: 'Product Mockup.png',
                      size: '2.8 MB',
                      date: '12 mins ago',
                      icon: <ImageIcon className="h-4 w-4 text-emerald-500" />,
                      badge: 'PNG'
                    },
                    {
                      name: 'Financial Overview.xlsx',
                      size: '1.1 MB',
                      date: '1 hour ago',
                      icon: <FileSpreadsheet className="h-4 w-4 text-blue-500" />,
                      badge: 'XLSX'
                    },
                    {
                      name: 'App Architecture.svg',
                      size: '840 KB',
                      date: 'Yesterday',
                      icon: <FileCode className="h-4 w-4 text-amber-500" />,
                      badge: 'SVG'
                    }
                  ].map(file => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-3 hover:bg-[#FAF9F7] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-lg bg-[#FAF9F7] flex items-center justify-center shrink-0 group-hover:bg-[#F2EFFF] transition-colors">
                          {file.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-[#1E1B24] truncate group-hover:text-[#6E60EE] transition-colors">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-[#8A8594] sm:hidden">
                            {file.size} • {file.date}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-6 text-xs text-[#8A8594]">
                        <span className="w-16 text-right">{file.size}</span>
                        <span className="w-24 text-right">{file.date}</span>
                        <span className="rounded bg-[#FAF9F7] px-2 py-0.5 text-[10px] font-medium text-[#585361]">
                          {file.badge}
                        </span>
                        <MoreVertical className="h-3.5 w-3.5 text-[#8A8594] hover:text-[#1E1B24]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Polish Badges */}
      <div className="hidden lg:flex items-center gap-2 absolute -bottom-5 right-8 rounded-full border border-[#ECEAF0] bg-white px-4 py-1.5 shadow-[0_8px_24px_rgba(30,25,60,0.08)]">
        <CheckCircle2 className="h-4 w-4 text-[#6E60EE]" />
        <span className="text-xs font-medium text-[#1E1B24]">
          Cloudflare R2 Direct Sync
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-2 absolute -top-4 -left-4 rounded-full border border-[#ECEAF0] bg-white px-4 py-1.5 shadow-[0_8px_24px_rgba(30,25,60,0.08)]">
        <ShieldCheck className="h-4 w-4 text-[#6E60EE]" />
        <span className="text-xs font-medium text-[#1E1B24]">
          Secure Session Storage
        </span>
      </div>
    </div>
  )
}
