'use client'

import { useState, useRef, useCallback } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { MobilePlusButton } from '@/components/layout/mobile-plus-button'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { AuthGuard } from '@/components/auth/auth-gaurd'
import { PAGE_HORIZONTAL_PADDING } from '@/lib/constants/layout'
import { useFiles } from '@/features/files/hooks/use-files'
import { useApp } from '@/providers/app-provider'
import { useToast } from '@/providers/toast-provider'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const { upload } = useFiles()
  const { activeFolderId } = useApp()
  const toast = useToast()

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
        for (const file of fileList) {
          await upload(
            { file, filename: file.name },
            activeFolderId ?? undefined
          )
        }
        toast.success(
          'Uploaded successfully',
          `${fileList.length} ${fileList.length === 1 ? 'file' : 'files'} uploaded to workspace.`
        )
      } catch (err) {
        console.error('Drag drop upload error:', err)
        toast.error('Upload failed', 'An error occurred while uploading files.')
      }
    },
    [upload, activeFolderId, toast]
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
          <Header onMenuToggle={() => setIsMobileNavOpen(true)} className='rounded-l-none' />

          {/* Dashboard Inner Scrollable Body */}
          <main 
            className={cn(
              'flex-1 overflow-y-auto py-5 pb-28 sm:py-6 md:py-6 flex flex-col rounded-l-none',
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
