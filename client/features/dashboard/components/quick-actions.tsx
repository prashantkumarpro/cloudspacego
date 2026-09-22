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
        className='inline-flex items-center gap-2 px-4.5 py-2.5 bg-blue-50 dark:bg-blue-950/40 text-[#0056f7] dark:text-blue-400 rounded-lg text-xs font-bold shadow-[0_2px_8px_-2px_rgba(0,86,247,0.12)] hover:shadow-[0_4px_12px_-2px_rgba(0,86,247,0.2)] hover:bg-blue-100/70 dark:hover:bg-blue-950/60 transition-all duration-200 cursor-pointer focus:outline-none border-none'
      >
        <CloudUpload className='w-4 h-4 shrink-0' />
        <span>Upload Files</span>
      </button>

      {/* Action 2: New Folder */}
      <button
        onClick={() => setActiveModal('create-folder')}
        className='inline-flex items-center gap-2 px-4.5 py-2.5 bg-slate-50 dark:bg-zinc-900/60 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold shadow-sm hover:shadow-md hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 transition-all duration-200 cursor-pointer focus:outline-none border-none'
      >
        <FolderPlus className='w-4 h-4 shrink-0' />
        <span>New Folder</span>
      </button>
    </div>
  )
}
