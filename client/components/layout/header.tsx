'use client'

import { useApp } from '../../providers/app-provider'
import { SearchBar } from '../../features/search/components/search-bar'
import { Dropdown, DropdownItemType } from '../ui/dropdown'
import { cn } from '../../lib/utils/cn'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useState } from 'react'
import AccountDetails from '@/features/auth/components/account-details'
import { NotificationsModal } from './notifications-modal'
import { Tooltip } from '../ui/tooltip'
import { PAGE_HORIZONTAL_PADDING } from '@/lib/constants/layout'

interface HeaderProps {
  onMenuToggle?: () => void
  className?: string
}

export function Header({ onMenuToggle, className }: HeaderProps) {
  const { currentSection, setCurrentSection, setActiveModal } = useApp()
  const { user, logout } = useAuth()
  const [isAccountDetailsOpen, setIsAccountDetailsOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const profileDropdownItems: DropdownItemType[] = [
    {
      label: 'Account Details',
      onClick: () => setIsAccountDetailsOpen(true)
    },
    {
      label: 'Storage Settings',
      onClick: () => setActiveModal('storage-upgrade')
    },
    {
      label: 'Sign Out',
      onClick: logout,
      className: 'text-red-500 hover:bg-red-500/10'
    }
  ]

  return (
    <>
      <header
        className={cn(
          'h-16 w-full bg-card-bg border-b border-card-border flex items-center text-foreground select-none relative transition-all duration-200 shrink-0 z-20 rounded-l-none shadow-none',
          className
        )}
        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
      >
        <div className={cn('w-full flex items-center justify-between', PAGE_HORIZONTAL_PADDING)}>
          {/* Left Side: Hamburger & Search Bar */}
          <div className='flex items-center gap-3 z-10 min-w-0'>
            {/* Hamburger Menu Toggle Button (visible on mobile only) */}
            <div className='md:hidden shrink-0'>
              <Tooltip content="Open sidebar" side="bottom">
                <button
                  onClick={onMenuToggle}
                  className='flex w-10 h-10 bg-transparent text-text-secondary hover:text-foreground hover:bg-input-bg active:bg-[#6E60EE]/10 active:text-[#6E60EE] rounded-full items-center justify-center cursor-pointer transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-card-bg'
                  aria-label='Open navigation menu'
                >
                  <svg
                    className='w-5.5 h-5.5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2.2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M4 8h16M4 16h10' />
                  </svg>
                </button>
              </Tooltip>
            </div>

            {/* Search Bar - responsive, fluid */}
            <div className='flex items-center shrink-0'>
              <SearchBar />
            </div>
          </div>

        {/* Header Actions cluster */}
        <div className='flex items-center gap-2 md:gap-3 ml-auto shrink-0 z-10'>
          {/* Notifications Icon Button */}
          <div className='relative shrink-0 flex items-center justify-center'>
            <Tooltip content="Notifications" side="bottom">
              <button
                className='w-10 h-10 rounded-full bg-transparent text-text-secondary hover:text-foreground hover:bg-input-bg flex items-center justify-center cursor-pointer transition-all duration-200 relative'
                onClick={() => setIsNotificationsOpen(true)}
                aria-label='View notifications'
              >
                <svg
                  className='w-5.5 h-5.5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2.2}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                </svg>
                {/* Red urgency badge with ring breathing room */}
                <span className='absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm pointer-events-none ring-2 ring-card-bg'>
                  3
                </span>
              </button>
            </Tooltip>
          </div>

          {/* Settings Icon Button (grouped closely with bell, no isolating divider) */}
          <Tooltip content="Settings" side="bottom">
            <button
              className='hidden md:flex w-10 h-10 rounded-full bg-transparent text-text-secondary hover:text-foreground hover:bg-input-bg items-center justify-center cursor-pointer transition-all duration-200 shrink-0'
              onClick={() => setCurrentSection('Settings')}
              aria-label='Open settings'
            >
              <svg
                className='w-5.5 h-5.5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2.2}
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                <path d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
              </svg>
            </button>
          </Tooltip>

          {/* User profile dropdown - Pill style matching left-side pill visual weight */}
          <Dropdown
            align='right'
            items={profileDropdownItems}
            trigger={
              <button
                className='flex items-center gap-1.5 p-1 pl-1 pr-2.5 rounded-full bg-input-bg hover:bg-input-bg/80 active:bg-input-bg/60 border border-card-border hover:border-[#6E60EE]/40 active:scale-95 cursor-pointer select-none transition-all duration-200 group relative shrink-0 h-10 shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-card-bg'
                aria-label='User account menu'
              >
                <div className='w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden relative shrink-0 ring-1 ring-card-border'>
                  <img
                    src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop'
                    alt='User Profile'
                    className='w-full h-full object-cover'
                  />
                  <span className='absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-card-bg shadow-xs pointer-events-none' />
                </div>
                <svg
                  className='w-3.5 h-3.5 text-text-secondary group-hover:text-foreground transition-all duration-200 group-hover:translate-y-0.5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  strokeWidth={2.2}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M19 9l-7 7-7-7' />
                </svg>
              </button>
            }
          />
        </div>
        </div>
      </header>
      <AccountDetails
        open={isAccountDetailsOpen}
        onClose={() => setIsAccountDetailsOpen(false)}
      />
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  )
}
