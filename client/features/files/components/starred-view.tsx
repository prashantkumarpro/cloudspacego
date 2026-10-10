'use client'

import React from 'react'
import { FileList } from '@/features/files/components/file-list'
import { useInfiniteFiles } from '@/features/files/hooks/use-files'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function StarredView () {
  const {
    files: starredFiles,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    setFiles
  } = useInfiniteFiles({
    starred: true
  })

  const handleToggleStar = (fileId: string) => {
    // If a file is unstarred while viewing the Starred page, immediately remove it from view
    setFiles(prev =>
      prev.filter(f => (f.id || f._id || '').toString() !== fileId.toString())
    )
  }

  if (error && starredFiles.length === 0) {
    return (
      <div className='w-full flex flex-col items-center justify-center p-12 bg-card-bg border border-card-border rounded-xl text-center select-none shadow-xs'>
        <div className='w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3'>
          <AlertCircle className='w-6 h-6' />
        </div>
        <h4 className='text-sm sm:text-base font-bold text-foreground'>
          Failed to load starred files
        </h4>
        <p className='text-xs text-text-secondary mt-1 max-w-sm'>
          {error || 'An error occurred while retrieving your starred files.'}
        </p>
        <button
          onClick={() => refresh()}
          className='mt-4 px-4 py-2 bg-[#6E60EE] hover:bg-[#5D50DE] text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs'
        >
          <RefreshCw className='w-3.5 h-3.5' />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6 w-full min-w-0'>
      <FileList
        files={starredFiles}
        isLoading={isLoading && starredFiles.length === 0}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onToggleStar={handleToggleStar}
        title='Starred Assets'
        emptyMessage='No starred files'
        emptySubtitle='Star files you want to easily find later.'
      />
    </div>
  )
}
