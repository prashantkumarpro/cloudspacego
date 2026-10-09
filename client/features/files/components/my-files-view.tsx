'use client'

import React, { useMemo } from 'react'
import { useApp } from '@/providers/app-provider'
import { FolderGrid } from '@/features/directory/components/folder-grid'
import { FileList } from '@/features/files/components/file-list'
import { useDirectory } from '@/features/directory/hooks/use-directory'
import { useInfiniteFiles } from '@/features/files/hooks/use-files'
import { cn } from '@/lib/utils/cn'

export default function MyFilesView () {
  const { activeFolderId, setActiveFolderId } = useApp()
  const { directory, isLoading: isDirLoading, rename, remove } = useDirectory(activeFolderId ?? undefined)
  const {
    files: infiniteFiles,
    isLoading: isFilesLoading,
    isLoadingMore,
    hasMore,
    loadMore
  } = useInfiniteFiles({
    enabled: !activeFolderId
  })

  // Stateful breadcrumb trail to track full hierarchy (My Files › Images › Projects › 2026)
  const [folderTrail, setFolderTrail] = React.useState<{ id: string; name: string }[]>([])

  React.useEffect(() => {
    if (!activeFolderId) {
      setFolderTrail([])
      return
    }

    if (directory?.name) {
      setFolderTrail(prev => {
        // 1. If activeFolderId is already in trail, truncate back to it and update name (handles back navigation and rename)
        const existingIdx = prev.findIndex(item => item.id === activeFolderId)
        if (existingIdx !== -1) {
          const updated = prev.slice(0, existingIdx + 1)
          updated[existingIdx] = { id: activeFolderId, name: directory.name }
          return updated
        }

        // 2. If directory has parentDirId matching the previous folder in trail, append child
        const parentId = directory.parentDirId ? directory.parentDirId.toString() : null
        if (parentId && prev.length > 0 && prev[prev.length - 1].id === parentId) {
          return [...prev, { id: activeFolderId, name: directory.name }]
        }

        // 3. If parentDirId is found earlier in the trail, truncate to parent and append
        if (parentId) {
          const parentIdx = prev.findIndex(item => item.id === parentId)
          if (parentIdx !== -1) {
            return [...prev.slice(0, parentIdx + 1), { id: activeFolderId, name: directory.name }]
          }
        }

        // 4. Default: single folder depth
        return [{ id: activeFolderId, name: directory.name }]
      })
    }
  }, [activeFolderId, directory?.name, directory?.parentDirId])

  const breadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'My Files' }]
    if (folderTrail.length > 0) {
      crumbs.push(...folderTrail)
    } else if (activeFolderId && directory?.name) {
      crumbs.push({ id: activeFolderId, name: directory.name })
    }
    return crumbs
  }, [folderTrail, activeFolderId, directory?.name])

  const filesToDisplay = useMemo(() => {
    if (activeFolderId) {
      return directory?.files || []
    }
    const dirFiles = directory?.files || []
    const infFiles = infiniteFiles || []

    if (infFiles.length === 0) {
      return dirFiles
    }

    const dirMap = new Map(dirFiles.map(f => [f.id || f._id, f]))
    return infFiles.map(f => {
      const match = dirMap.get(f.id || f._id)
      const sizeVal = typeof f.size === 'number' && f.size > 0 ? f.size : (match?.size ?? f.size)
      return {
        ...f,
        size: sizeVal
      }
    })
  }, [activeFolderId, directory?.files, infiniteFiles])
  const isListLoading = activeFolderId
    ? isDirLoading
    : (isFilesLoading && filesToDisplay.length === 0)

  return (
    <div className='flex flex-col gap-6 w-full min-w-0'>
      {/* Current Location Header Breadcrumb */}
      <div className='flex items-center justify-between border-b border-card-border pb-3 shrink-0 select-none min-w-0'>
        <h1 className='text-lg sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0'>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1
            return (
              <React.Fragment key={crumb.id ?? 'root'}>
                {idx > 0 && (
                  <span className='text-text-muted text-base sm:text-xl font-normal select-none px-0.5'>
                    ›
                  </span>
                )}
                {isLast ? (
                  <span className='text-foreground truncate max-w-[130px] min-[360px]:max-w-[170px] xs:max-w-[220px] sm:max-w-[340px]'>
                    {crumb.name}
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveFolderId(crumb.id)}
                    className='text-text-secondary hover:text-foreground cursor-pointer transition-colors focus:outline-none truncate max-w-[110px] min-[360px]:max-w-[140px] xs:max-w-[200px] sm:max-w-[300px]'
                    title={crumb.name}
                  >
                    {crumb.name}
                  </button>
                )}
              </React.Fragment>
            )
          })}
        </h1>
      </div>



      {/* Folders block */}
      <FolderGrid
        folders={directory?.directories}
        isLoading={isDirLoading}
        onRename={rename}
        onDelete={remove}
      />

      {/* Files block with real cursor pagination & infinite scrolling */}
      <FileList
        files={filesToDisplay}
        isLoading={isListLoading}
        isLoadingMore={isLoadingMore}
        hasMore={!activeFolderId && hasMore}
        onLoadMore={loadMore}
        title='Files'
      />
    </div>
  )
}

