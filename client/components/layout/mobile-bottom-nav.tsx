'use client'

import React from 'react'
import { useApp } from '@/providers/app-provider'
import { SidebarSection } from '@/types'
import { Home, Star, Users, Folder } from 'lucide-react'

import { PAGE_HORIZONTAL_PADDING } from '@/lib/constants/layout'
import { cn } from '@/lib/utils/cn'

interface BottomNavItem {
  name: SidebarSection
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

const navItems: BottomNavItem[] = [
  {
    name: 'Dashboard',
    label: 'Home',
    icon: Home,
  },
  {
    name: 'Starred',
    label: 'Starred',
    icon: Star,
  },
  {
    name: 'Shared',
    label: 'Shared',
    icon: Users,
  },
  {
    name: 'My Files',
    label: 'Files',
    icon: Folder,
  },
]

export function MobileBottomNav() {
  const { currentSection, setCurrentSection, setActiveFolderId } = useApp()

  const handleNavClick = (sectionName: SidebarSection) => {
    setCurrentSection(sectionName)
    if (sectionName !== 'My Files') {
      setActiveFolderId(null)
    }
  }

  return (
    <nav
      aria-label='Mobile bottom navigation'
      className={cn(
        'w-full shrink-0 md:hidden bg-card-bg border-t border-card-border select-none z-20',
        PAGE_HORIZONTAL_PADDING
      )}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className='flex items-center justify-between w-full h-16'>
        {navItems.map(item => {
          const isActive = currentSection === item.name
          const Icon = item.icon

          return (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.name)}
              className='flex flex-col items-center justify-center w-10 h-full py-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-card-bg rounded-xl group active:scale-95 transition-all duration-200'
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active pill background around icon */}
              <div
                className={`w-10 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-[#6E60EE]/15 dark:bg-[#6E60EE]/25 text-[#6E60EE]'
                    : 'text-text-muted group-hover:text-foreground group-hover:bg-input-bg/60 active:bg-[#6E60EE]/10 active:text-[#6E60EE]'
                }`}
              >
                <Icon
                  className='w-5 h-5'
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
              </div>

              {/* Text label */}
              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-colors duration-150 whitespace-nowrap ${
                  isActive
                    ? 'font-bold text-[#6E60EE]'
                    : 'font-medium text-text-muted group-hover:text-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
