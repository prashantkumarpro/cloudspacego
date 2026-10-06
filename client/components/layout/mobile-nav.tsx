'use client';

import React, { useEffect } from 'react';
import { useApp } from '../../providers/app-provider';
import { SidebarSection } from '../../types';

import { cn } from '../../lib/utils/cn';
import Image from 'next/image';
import { getNavItems } from './nav-config';
import { Tooltip } from '../ui/tooltip';
import { Sun, Moon } from 'lucide-react';
import { formatBytes } from '../../lib/utils/format';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const {
    currentSection,
    setCurrentSection,
    theme,
    toggleTheme,
    setActiveModal,
    storageStats,
  } = useApp();

  const percentageUsed = storageStats.totalCapacity > 0
    ? Math.min(100, Math.round((storageStats.totalUsed / storageStats.totalCapacity) * 100))
    : 0;
  const freeSpaceFormatted = formatBytes(Math.max(0, storageStats.totalCapacity - storageStats.totalUsed), 1);
  const usedSpaceFormatted = formatBytes(storageStats.totalUsed, 1);

  const menuItems = getNavItems();

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className={cn(
      "fixed inset-0 z-50 lg:hidden transition-all duration-300",
      isOpen ? "visible" : "invisible pointer-events-none"
    )}>
      {/* Backdrop overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 dark:bg-black/70 transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Navigation panel */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col justify-between pt-2.5 pb-3 px-4 shadow-2xl transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div className='flex shrink-0 w-full mt-1.5'>
          <div className='flex w-full items-center justify-between min-w-0'>
            <div
              onClick={() => {
                setCurrentSection('Dashboard');
                onClose();
              }}
              className='flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-85 select-none'
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentSection('Dashboard');
                  onClose();
                }
              }}
              aria-label="Home"
            >
              <Image
                src="/images/cloudeLogo.png"
                width={32}
                height={28}
                alt="Logo"
                className="w-8 h-auto object-contain shrink-0"
                priority
              />
              <span className='text-lg font-bold text-foreground tracking-tight font-sans truncate select-none flex items-center'>
                cloud<span className='font-extrabold text-[#6E60EE]'>spacego</span>
              </span>
            </div>
            {/* Close Drawer Button */}
            <Tooltip content="Close sidebar" side="bottom">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-foreground rounded-lg hover:bg-input-bg cursor-pointer transition-colors"
                aria-label="Close menu"
              >
                <svg
                  className="w-5.5 h-5.5 text-[#6E60EE] font-extrabold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 3v18" />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Navigation List */}
        <nav className='flex-1 mt-4 flex flex-col gap-1 select-none overflow-y-auto min-h-0'>
          {menuItems.map(item => {
            const isActive = currentSection === item.name;
            const isTrash = item.name === 'Trash';

            return (
              <div key={item.name} className='w-full flex flex-col gap-1'>
                {isTrash && (
                  <div className='h-[1px] bg-sidebar-border my-1 mx-3' />
                )}
                <button
                  onClick={() => {
                    setCurrentSection(item.name as SidebarSection);
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 cursor-pointer border border-transparent font-sans',
                    isActive
                      ? 'bg-sidebar-active-bg text-[#6E60EE] font-bold'
                      : 'text-text-secondary hover:bg-input-bg hover:text-foreground font-semibold'
                  )}
                  aria-label={item.label}
                >
                  <span className='flex items-center gap-3 text-[13px]'>
                    <span
                      className={cn(
                        'transition-colors shrink-0',
                        isActive
                          ? 'text-[#6E60EE]'
                          : 'text-text-muted hover:text-foreground'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="flex items-center gap-1.5 justify-between flex-1 min-w-0">
                      <span className="truncate">{item.label}</span>
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </nav>

        {/* Bottom Section: Storage & Theme Toggle */}
        <div className='flex flex-col gap-3 pt-2 border-t border-sidebar-border mt-auto shrink-0'>
          {/* Storage Information Card */}
          <div className='w-full bg-card-bg rounded-xl border border-card-border p-3 shadow-xs flex flex-col gap-2.5 select-none'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='w-7 h-7 rounded-lg bg-input-bg flex items-center justify-center text-[#6E60EE] shrink-0 border border-card-border'>
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' />
                  </svg>
                </div>
                <span className='text-xs font-semibold text-foreground'>
                  Storage
                </span>
              </div>
              <span className='text-[10px] font-bold text-white bg-[#6E60EE] px-2 py-0.5 rounded-full'>
                {percentageUsed}%
              </span>
            </div>

            <div className='flex flex-col gap-1.5'>
              <span className='text-[11px] font-normal text-text-secondary'>
                {usedSpaceFormatted} used &bull; {freeSpaceFormatted} free
              </span>
              <div className='w-full h-1.5 overflow-hidden relative border rounded-full bg-input-bg border-card-border'>
                <div
                  className='h-full bg-[#6E60EE] rounded-full'
                  style={{ width: `${Math.max(percentageUsed, percentageUsed > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                setActiveModal('storage-upgrade');
              }}
              className='w-full flex items-center justify-between text-xs font-semibold text-[#6E60EE] hover:text-[#6E60EE]/80 transition-colors pt-0.5 cursor-pointer group'
            >
              <span>Upgrade Storage</span>
              <svg className='w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.2}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </div>

          {/* Theme Switcher Toggle */}
          <div className='w-full p-1 bg-input-bg rounded-xl flex items-center justify-between select-none relative border border-card-border gap-1'>
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={cn(
                'w-1/2 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none border transition-all duration-200 active:scale-95',
                theme === 'light'
                  ? 'bg-card-bg border-card-border/60 text-[#6E60EE] font-bold shadow-xs'
                  : 'border-transparent text-text-secondary hover:text-foreground'
              )}
            >
              <Sun className='w-3.5 h-3.5 text-amber-500 shrink-0' />
              <span>Light</span>
            </button>

            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={cn(
                'w-1/2 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none border transition-all duration-200 active:scale-95',
                theme === 'dark'
                  ? 'bg-card-bg border-card-border/60 text-foreground font-bold shadow-xs'
                  : 'border-transparent text-text-secondary hover:text-foreground'
              )}
            >
              <Moon className='w-3.5 h-3.5 text-slate-400 shrink-0' />
              <span>Dark</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
