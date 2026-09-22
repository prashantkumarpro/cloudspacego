'use client';

import React, { useEffect } from 'react';
import { useApp } from '../../providers/app-provider';
import { SidebarSection } from '../../types';

import { cn } from '../../lib/utils/cn';
import Image from 'next/image';
import { getNavItems } from './nav-config';
import { Tooltip } from '../ui/tooltip';
import { Sun, Moon } from 'lucide-react';

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
  } = useApp();

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
          "fixed inset-0 bg-slate-900/30 dark:bg-black/60 transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Navigation panel */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-64 bg-card-bg border-r border-card-border flex flex-col justify-between pt-2.5 pb-3 px-4 shadow-2xl transition-transform duration-300 ease-in-out",
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
                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
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
                  <div className='h-[1px] bg-slate-100 dark:bg-zinc-800/80 my-1 mx-3' />
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
        <div className='flex flex-col gap-3 pt-2 border-t border-card-border mt-auto shrink-0'>
          {/* Storage Information Card */}
          <div className='w-full bg-white dark:bg-zinc-900/60 rounded-2xl p-3 shadow-[inset_0_0_0_1px_var(--color-card-border)] flex flex-col gap-2.5 select-none'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='w-7 h-7 rounded-full bg-input-bg flex items-center justify-center text-[#6E60EE] shrink-0 border border-card-border'>
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' />
                  </svg>
                </div>
                <span className='text-[11px] font-bold text-foreground'>
                  Storage
                </span>
              </div>
              <span className='text-[9px] font-bold text-white bg-[#6E60EE] px-2 py-0.5 rounded-full'>
                72%
              </span>
            </div>

            <div className='flex flex-col gap-1'>
              <span className='text-[10px] font-bold text-text-secondary'>
                72% used &bull; 2.8 GB free
              </span>
              <div className='w-full bg-[#F3F4F6] h-2.5 overflow-hidden relative border border-[#E5E7EB] rounded-full'>
                <div
                  className='h-full bg-[#6E60EE]'
                  style={{ width: '72%' }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                setActiveModal('storage-upgrade');
              }}
              className='w-full flex items-center justify-between text-[10px] font-bold text-[#6E60EE] hover:text-[#6E60EE]/80 transition-colors pt-0.5 cursor-pointer group'
            >
              <span>Upgrade Storage</span>
              <svg className='w-3 h-3 transform group-hover:translate-x-0.5 transition-transform' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </div>

          {/* Theme Switcher Toggle */}
          <div className='w-full p-0.5 bg-slate-50/50 dark:bg-zinc-950/40 rounded-xl flex items-center justify-between select-none shadow-[inset_0_0_0_1px_var(--color-card-border)] relative border border-card-border'>
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={cn(
                'w-1/2 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer focus:outline-none border border-transparent',
                theme === 'light'
                  ? 'bg-card-bg border-card-border text-[#6E60EE] font-bold shadow-sm'
                  : 'text-text-secondary hover:text-foreground'
              )}
            >
              <Sun className='w-4 h-4 text-amber-500' />
              <span>Light</span>
            </button>

            <div className='h-4 w-[1px] bg-sidebar-border shrink-0 self-center' />

            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={cn(
                'w-1/2 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer focus:outline-none border border-transparent',
                theme === 'dark'
                  ? 'bg-card-bg border-card-border text-white font-bold shadow-sm'
                  : 'text-text-secondary hover:text-foreground'
              )}
            >
              <Moon className='w-4 h-4 text-slate-400' />
              <span>Dark</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
