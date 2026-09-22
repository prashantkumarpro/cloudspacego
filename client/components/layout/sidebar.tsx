'use client'

import React from 'react'
import { useApp } from '../../providers/app-provider'
import { SidebarSection } from '../../types'
import { cn } from '../../lib/utils/cn'
import { Tooltip } from '../ui/tooltip'
import Image from 'next/image'
import { formatBytes } from '../../lib/utils/format'
import { getNavItems } from './nav-config'
import { Sun, Moon } from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const {
    currentSection,
    setCurrentSection,
    isSidebarCollapsed,
    toggleSidebar,
    theme,
    toggleTheme,
    setActiveModal,
    storageStats,
  } = useApp()

  const percentageUsed = storageStats.totalCapacity > 0
    ? Math.min(100, Math.round((storageStats.totalUsed / storageStats.totalCapacity) * 100))
    : 0
  const freeSpaceFormatted = formatBytes(Math.max(0, storageStats.totalCapacity - storageStats.totalUsed), 1)
  const usedSpaceFormatted = formatBytes(storageStats.totalUsed, 1)

  const mainNavItems = getNavItems()
  const isLight = theme === 'light'

  return (
    <aside
      style={{
        width: isSidebarCollapsed ? '64px' : '240px',
        transition: 'width 250ms ease-out',
      }}
      className={cn(
        'h-full pb-2 md:pb-3 select-none shrink-0 relative border-r bg-sidebar-bg border-sidebar-border overflow-hidden flex flex-col justify-between',
        isSidebarCollapsed ? 'items-center' : '',
        className
      )}
    >
      {/* Top Section: Brand Header & Nav List */}
      <div className="flex flex-col w-full">
        {/* Brand Header */}
        <div
          className={cn(
            'h-16 flex items-center shrink-0 w-full',
            isSidebarCollapsed ? 'justify-center px-2' : 'px-4'
          )}
        >
          {isSidebarCollapsed ? (
            <button
              onClick={() => setCurrentSection('Dashboard')}
              className="w-10 h-10 flex items-center justify-center cursor-pointer hover:opacity-85 select-none shrink-0 rounded-xl focus:outline-none"
              aria-label="Home"
            >
              <Image
                src="/images/cloudeLogo.png"
                width={32}
                height={28}
                alt="cloudspacego logo"
                className="w-8 h-auto object-contain shrink-0"
                priority
              />
            </button>
          ) : (
            <div
              onClick={() => setCurrentSection('Dashboard')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 min-w-0 select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentSection('Dashboard')
                }
              }}
              aria-label="Home"
            >
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <Image
                  src="/images/cloudeLogo.png"
                  width={32}
                  height={28}
                  alt="cloudspacego logo"
                  className="w-8 h-auto object-contain shrink-0"
                  priority
                />
              </div>
              <span className="text-xl font-bold tracking-tight font-sans truncate text-foreground flex items-center whitespace-nowrap">
                cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
              </span>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav
          className={cn(
            'flex flex-col gap-1 select-none w-full',
            isSidebarCollapsed ? 'px-2 mt-2 items-center' : 'px-3 mt-3'
          )}
        >
          {mainNavItems.map(item => {
            const isActive = currentSection === item.name
            const isTrash = item.name === 'Trash'

            return (
              <div key={item.name} className="w-full flex flex-col items-center gap-1">
                {isTrash && (
                  <div
                    className={cn(
                      'h-[1px] bg-sidebar-border shrink-0',
                      isSidebarCollapsed ? 'w-8 my-0.5' : 'w-full my-1 mx-3'
                    )}
                  />
                )}
                {isSidebarCollapsed ? (
                  <Tooltip content={item.label} side="right">
                    <button
                      onClick={() => setCurrentSection(item.name as SidebarSection)}
                      className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer border border-transparent transition-colors',
                        isActive
                          ? 'bg-sidebar-active-bg border-l-2 border-[#6E60EE] text-[#6E60EE]'
                          : 'text-text-secondary hover:bg-sidebar-active-bg/50 hover:text-foreground'
                      )}
                      aria-label={item.label}
                    >
                      <span
                        className={cn(
                          'w-5 h-5 flex items-center justify-center shrink-0 transition-colors',
                          isActive ? 'text-[#6E60EE]' : 'text-text-muted'
                        )}
                      >
                        {item.icon}
                      </span>
                    </button>
                  </Tooltip>
                ) : (
                  <button
                    onClick={() => setCurrentSection(item.name as SidebarSection)}
                    className={cn(
                      'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-sans cursor-pointer border border-transparent select-none group transition-colors',
                      isActive
                        ? 'bg-sidebar-active-bg text-[#6E60EE] font-bold'
                        : 'text-text-secondary hover:bg-sidebar-active-bg/50 hover:text-foreground font-semibold'
                    )}
                    aria-label={item.label}
                  >
                    <span className="flex items-center gap-3 text-[13px] min-w-0">
                      <span
                        className={cn(
                          'shrink-0 flex items-center justify-center w-5 h-5 transition-colors',
                          isActive ? 'text-[#6E60EE]' : 'text-text-muted group-hover:text-foreground'
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="whitespace-nowrap truncate">
                        {item.label}
                      </span>
                    </span>
                  </button>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section: Storage & Theme Toggle */}
      <div className="flex flex-col w-full">
        {/* Separator above Storage */}
        <div
          className={cn(
            'h-[1px] bg-sidebar-border shrink-0',
            isSidebarCollapsed ? 'w-8 my-1 mx-auto' : 'my-0.5 mx-6'
          )}
        />

        {/* Storage details panel */}
        {isSidebarCollapsed ? (
          <div className="w-full px-2 flex justify-center py-1 shrink-0">
            <Tooltip content="72% used  •  2.8 GB free" side="right">
              <div
                onClick={() => setCurrentSection('My Files')}
                className="w-12 rounded-xl py-2 px-1 flex flex-col items-center gap-1.5 select-none cursor-pointer border bg-card-bg border-card-border hover:bg-input-bg transition-colors shadow-xs"
              >
                <svg
                  className="w-5 h-5 text-[#6E60EE]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  />
                </svg>
                <span className="text-[10px] font-bold text-foreground">{percentageUsed}%</span>
                <div className="w-8 h-1.5 overflow-hidden relative border rounded-full bg-input-bg border-card-border">
                  <div className="h-full bg-[#6E60EE] rounded-full" style={{ width: `${Math.max(percentageUsed, percentageUsed > 0 ? 3 : 0)}%` }} />
                </div>
              </div>
            </Tooltip>
          </div>
        ) : (
          <div className="px-3 py-1.5 shrink-0">
            <div className="w-full border rounded-xl p-3 flex flex-col gap-2.5 select-none bg-card-bg border-card-border shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-input-bg text-[#6E60EE] border border-card-border">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                    Storage
                  </span>
                </div>
                <span className="text-[10px] font-bold text-white bg-[#6E60EE] px-2 py-0.5 rounded-full whitespace-nowrap">
                  {percentageUsed}%
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-normal text-text-secondary whitespace-nowrap">
                  {usedSpaceFormatted} used &bull; {freeSpaceFormatted} free
                </span>
                <div className="w-full h-1.5 overflow-hidden relative border rounded-full bg-input-bg border-card-border">
                  <div
                    className="h-full bg-[#6E60EE] rounded-full"
                    style={{ width: `${Math.max(percentageUsed, percentageUsed > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setActiveModal('storage-upgrade')}
                className="w-full flex items-center justify-between text-xs font-semibold text-[#6E60EE] hover:text-[#6E60EE]/80 transition-colors pt-0.5 cursor-pointer group"
              >
                <span className="whitespace-nowrap">Upgrade Storage</span>
                <svg
                  className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Separator above Switcher */}
        <div
          className={cn(
            'h-[1px] bg-sidebar-border shrink-0',
            isSidebarCollapsed ? 'w-8 my-1 mx-auto' : 'my-0.5 mx-6'
          )}
        />

        {/* Theme Toggle switcher */}
        {isSidebarCollapsed ? (
          <div className="w-full px-2 flex justify-center py-1 shrink-0">
            <Tooltip
              content={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              side="right"
            >
              <div className="w-12 p-0.5 border rounded-xl flex items-center justify-center select-none bg-input-bg border-card-border">
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer focus:outline-none border bg-card-bg border-card-border text-text-secondary hover:text-foreground"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                </button>
              </div>
            </Tooltip>
          </div>
        ) : (
          <div className="px-3 py-1.5 shrink-0">
            <div className="w-full p-1 border rounded-xl flex items-center justify-between select-none relative bg-input-bg border-card-border gap-1">
              <button
                onClick={() => theme === 'dark' && toggleTheme()}
                className={cn(
                  'w-1/2 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none border transition-all duration-200 active:scale-95',
                  isLight
                    ? 'bg-card-bg border-card-border/60 text-[#6E60EE] font-bold shadow-xs'
                    : 'border-transparent text-text-secondary hover:text-foreground'
                )}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="whitespace-nowrap">Light</span>
              </button>

              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={cn(
                  'w-1/2 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none border transition-all duration-200 active:scale-95',
                  !isLight
                    ? 'bg-card-bg border-card-border/60 text-white font-bold shadow-xs'
                    : 'border-transparent text-text-secondary hover:text-foreground'
                )}
              >
                <Moon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="whitespace-nowrap">Dark</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
