'use client'

import React from 'react'
import { useApp } from '@/providers/app-provider'
import { CloudUpload, FolderPlus } from 'lucide-react'

export default function QuickActions () {
  const { setActiveModal } = useApp()

  return (
    <div className='flex flex-wrap items-center gap-3 select-none w-full shrink-0 mt-1.5'>
      {/* Action 1: Upload Files */}
      <button
        onClick={() => setActiveModal('upload-file')}
        className='inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#6E60EE]/10 text-[#6E60EE] hover:bg-[#6E60EE]/15 border border-[#6E60EE]/20 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none shadow-xs active:scale-95'
      >
        <CloudUpload className='w-4 h-4 shrink-0' />
        <span>Upload Files</span>
      </button>

      {/* Action 2: New Folder */}
      <button
        onClick={() => setActiveModal('create-folder')}
        className='inline-flex items-center gap-2 px-4.5 py-2.5 bg-card-bg text-foreground hover:bg-input-bg border border-card-border rounded-lg text-xs font-bold shadow-xs hover:border-card-border/80 transition-all duration-200 cursor-pointer focus:outline-none active:scale-95'
      >
        <FolderPlus className='w-4 h-4 shrink-0 text-[#6E60EE]' />
        <span>New Folder</span>
      </button>
    </div>
  )
}
