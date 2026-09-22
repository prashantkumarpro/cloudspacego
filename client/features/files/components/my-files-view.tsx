'use client'

import React, { useMemo } from 'react'
import { useApp } from '@/providers/app-provider'
import { FolderGrid } from '@/features/directory/components/folder-grid'
import { FileList } from '@/features/files/components/file-list'
import { useDirectory } from '@/features/directory/hooks/use-directory'
import { cn } from '@/lib/utils/cn'

export default function MyFilesView () {
  const { activeFolderId, setActiveFolderId } = useApp()
  const { directory, isLoading, rename, remove } = useDirectory(activeFolderId ?? undefined)

  const breadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'My Files' }]
    if (activeFolderId && directory?.name) {
      crumbs.push({ id: activeFolderId, name: directory.name })
    }
    return crumbs
  }, [activeFolderId, directory?.name])

  return (
    <div className='flex flex-col gap-6'>
      {/* Header Breadcrumbs Row */}
      <div className='flex items-center justify-between border-b border-card-border pb-4 shrink-0 select-none'>
        <div className='flex items-center gap-2 flex-wrap'>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className='text-text-muted text-xs'>/</span>}
                <button
                  disabled={isLast}
                  onClick={() => setActiveFolderId(crumb.id)}
                  className={cn(
                    'text-xs font-bold transition-colors focus:outline-none',
                    isLast
                      ? 'text-[#6E60EE] cursor-default'
                      : 'text-text-secondary hover:text-foreground cursor-pointer'
                  )}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            )
          })}
        </div>

        <span className='text-[10px] font-bold uppercase tracking-[1px] text-text-muted'>
          Active Folder Workspace
        </span>
      </div>

      {/* Folders block */}
      <FolderGrid
        folders={directory?.directories}
        isLoading={isLoading}
        onRename={rename}
        onDelete={remove}
      />

      {/* Files block */}
      <FileList
        files={directory?.files}
        title='Files'
      />
    </div>
  )
}
