'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { MobilePlusButton } from '@/components/layout/mobile-plus-button'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { AuthGuard } from '@/components/auth/auth-gaurd'
import { PAGE_HORIZONTAL_PADDING } from '@/lib/constants/layout'
import { useFiles } from '@/features/files/hooks/use-files'
import { useApp } from '@/providers/app-provider'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const dragCounter = useRef(0)
  const mainRef = useRef<HTMLElement>(null)
  const lastScrollTopRef = useRef(0)
  const scrollStopTimerRef = useRef<NodeJS.Timeout | null>(null)
  const rafIdRef = useRef<number | null>(null)

  const { upload } = useFiles()
  const { activeFolderId, currentSection, activeModal } = useApp()

  const [prevNavigationKey, setPrevNavigationKey] = useState(`${currentSection}-${activeFolderId}`)
  const navigationKey = `${currentSection}-${activeFolderId}`
  if (navigationKey !== prevNavigationKey) {
    setPrevNavigationKey(navigationKey)
    setIsHeaderVisible(true)
  }

  // Reset scroll container position when switching sections or navigating folders
  useEffect(() => {
    if (scrollStopTimerRef.current) {
      clearTimeout(scrollStopTimerRef.current)
    }
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
    lastScrollTopRef.current = 0
  }, [currentSection, activeFolderId])

  // Always keep header visible when drawer or modal is open
  const shouldShowHeader = isHeaderVisible || isMobileNavOpen || Boolean(activeModal)

  // Scroll-aware mobile header: hide on scroll down, show on scroll stop / scroll up
  useEffect(() => {
    const mainEl = mainRef.current

    const handleScroll = () => {
      // Apply only on mobile (< 768px). On desktop and tablet (>= 768px), keep header visible.
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        setIsHeaderVisible(true)
        return
      }

      if (rafIdRef.current !== null) {
        return
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null

        const currentScrollTop = mainEl
          ? mainEl.scrollTop
          : (window.scrollY || document.documentElement.scrollTop || 0)

        // Ignore negative scroll values (iOS rubber-band effect at the top)
        const safeScrollTop = Math.max(0, currentScrollTop)
        const delta = safeScrollTop - lastScrollTopRef.current

        // Always show header when at or near top of the page (within 20px)
        if (safeScrollTop <= 20) {
          setIsHeaderVisible(true)
        } else if (delta > 6 && safeScrollTop > 64) {
          // Scrolling down: smoothly hide header
          setIsHeaderVisible(false)
        } else if (delta < -6) {
          // Scrolling up: show header promptly
          setIsHeaderVisible(true)
        }

        lastScrollTopRef.current = safeScrollTop

        // When scrolling stops, show the header again after a short, reasonable delay (~850ms)
        if (scrollStopTimerRef.current) {
          clearTimeout(scrollStopTimerRef.current)
        }
        scrollStopTimerRef.current = setTimeout(() => {
          setIsHeaderVisible(true)
        }, 850)
      })
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsHeaderVisible(true)
      }
    }

    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      if (mainEl) {
        mainEl.removeEventListener('scroll', handleScroll)
      }
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (scrollStopTimerRef.current) {
        clearTimeout(scrollStopTimerRef.current)
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      dragCounter.current = 0

      const droppedFiles = e.dataTransfer.files
      if (!droppedFiles || droppedFiles.length === 0) return

      const fileList = Array.from(droppedFiles)
      try {
        await Promise.all(
          fileList.map(file =>
            upload(
              { file, filename: file.name },
              activeFolderId ?? undefined
            )
          )
        )
      } catch (err) {
        console.error('Drag drop upload error:', err)
      }
    },
    [upload, activeFolderId]
  )

  return (
    <AuthGuard>
      <div 
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className='relative flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans antialiased transition-colors duration-200'
      >
        {/* Sidebar Navigation */}
        <Sidebar className='hidden md:flex' />

        {/* Main content viewport - flush against the vertical divider */}
        <div 
          className='flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background rounded-l-none'
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        >
          {/* Top Header */}
          <Header
            onMenuToggle={() => setIsMobileNavOpen(true)}
            className='rounded-l-none'
            isVisible={shouldShowHeader}
          />

          {/* Dashboard Inner Scrollable Body */}
          <main 
            ref={mainRef}
            className={cn(
              'flex-1 overflow-y-auto pt-[5.25rem] sm:pt-[5.5rem] pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pt-6 md:pb-6 flex flex-col rounded-l-none',
              PAGE_HORIZONTAL_PADDING
            )}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            {children}
          </main>

          {/* Mobile Bottom Navigation (Shares exact same parent container & width as Header) */}
          <MobileBottomNav />
        </div>

        {/* Mobile Floating Action Button (Global Plus) */}
        <MobilePlusButton />

        {/* Mobile Drawer menu */}
        <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

        {/* Transient Drag & Drop Upload Overlay (Only active while dragging files over the window) */}
        {isDragging && (
          <div className='fixed inset-0 z-50 bg-[#6E60EE]/10 dark:bg-[#6E60EE]/15 backdrop-blur-[2px] border-2 border-dashed border-[#6E60EE] m-3 rounded-2xl flex flex-col items-center justify-center pointer-events-none select-none animate-in fade-in zoom-in-95 duration-150'>
            <div className='w-14 h-14 rounded-2xl bg-card-bg shadow-lg border border-card-border flex items-center justify-center text-[#6E60EE] mb-3'>
              <Upload className='w-7 h-7' />
            </div>
            <h3 className='text-base font-bold text-foreground'>Drop files to upload</h3>
            <p className='text-xs text-text-secondary mt-1'>Files will be uploaded directly to your workspace</p>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
