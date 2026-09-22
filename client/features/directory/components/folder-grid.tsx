'use client'

import React, { useMemo, useState } from 'react'
import { useApp } from '@/providers/app-provider'
import { useToast } from '@/providers/toast-provider'
import { FolderCard } from './folder-card'
import { useDirectory } from '../hooks/use-directory'
import { getDirectory } from '../api'
import { RenameModal } from '@/features/files/components/rename-modal'
import { MoveModal } from '@/features/files/components/move-modal'
import { FileDetailsModal } from '@/features/files/components/file-details-modal'
import type { DirectoryItem, RenameDirectoryData } from '../types'
import type { UnifiedFileItem } from '@/features/files/components/file-list'

interface FolderGridProps {
  folders?: DirectoryItem[]
  isLoading?: boolean
  onRename?: (id: string, data: RenameDirectoryData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function FolderGrid ({
  folders: propFolders,
  isLoading: propIsLoading,
  onRename: propOnRename,
  onDelete: propOnDelete
}: FolderGridProps) {
  const {
    activeFolderId,
    setActiveFolderId,
    searchQuery,
    setSelectedFileId,
    setActiveModal,
    toggleStar,
    moveFile
  } = useApp()

  const toast = useToast()
  const hookResult = useDirectory(activeFolderId ?? undefined)

  const [renameTarget, setRenameTarget] = useState<DirectoryItem | null>(null)
  const [moveTarget, setMoveTarget] = useState<DirectoryItem | null>(null)
  const [detailsTarget, setDetailsTarget] = useState<DirectoryItem | null>(null)
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({})

  const folders = useMemo(() => {
    const list = propFolders ?? hookResult.directory?.directories ?? []
    if (!searchQuery) return list
    return list.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [propFolders, hookResult.directory?.directories, searchQuery])

  // Fetch real file counts for folders using existing getDirectory API
  React.useEffect(() => {
    let isMounted = true
    if (folders.length > 0) {
      Promise.all(
        folders.map(async f => {
          try {
            const subDir = await getDirectory(f.id)
            return { id: f.id, count: subDir.files ? subDir.files.length : 0 }
          } catch {
            return { id: f.id, count: 0 }
          }
        })
      ).then(results => {
        if (!isMounted) return
        const map: Record<string, number> = {}
        results.forEach(r => {
          map[r.id] = r.count
        })
        setFolderCounts(map)
      })
    } else {
      setFolderCounts({})
    }
    return () => {
      isMounted = false
    }
  }, [folders])

  const isLoading = propIsLoading ?? hookResult.isLoading

  const handlePerformRename = async (newName: string) => {
    if (!renameTarget) return
    if (propOnRename) {
      await propOnRename(renameTarget.id, { newDirName: newName })
    } else {
      await hookResult.rename(renameTarget.id, { newDirName: newName })
    }
    setRenameTarget(null)
  }

  const handleDeleteFolder = async (folder: DirectoryItem) => {
    try {
      if (propOnDelete) {
        await propOnDelete(folder.id)
      } else {
        await hookResult.remove(folder.id)
      }

      toast.success(
        'Moved to Trash',
        `"${folder.name}" was moved to Trash.`
      )
    } catch (err) {
      console.error('Failed to delete folder:', err)
      toast.error('Failed to delete', `Could not delete "${folder.name}".`)
    }
  }

  const handlePerformMove = async (targetFolderId: string | null) => {
    if (!moveTarget) return
    moveFile(moveTarget.id, targetFolderId)
    setMoveTarget(null)
  }

  if (isLoading) {
    return (
      <div className='flex flex-col gap-3 select-none'>
        <h4 className='text-[10px] font-bold uppercase tracking-[1px] text-text-muted'>
          Folders
        </h4>
        <div className='grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-3 sm:gap-4'>
          {[1, 2, 3, 4].map(idx => (
            <div
              key={idx}
              className='h-16 bg-card-bg/60 border border-card-border rounded-xl animate-pulse p-3 flex items-center gap-3'
            >
              <div className='w-7 h-7 bg-input-bg rounded-lg shrink-0' />
              <div className='flex-1 flex flex-col gap-1.5'>
                <div className='h-3 bg-input-bg rounded w-3/4' />
                <div className='h-2 bg-input-bg rounded w-1/2' />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (folders.length === 0) return null

  return (
    <div className='flex flex-col gap-3 select-none'>
      <h4 className='text-[10px] font-bold uppercase tracking-[1px] text-text-muted'>
        Folders
      </h4>
      <div className='grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-3 sm:gap-4'>
        {folders.map(folder => {
          const count = folderCounts[folder.id] ?? 0
          const itemsCountText = `${count} ${count === 1 ? 'file' : 'files'}`

          return (
            <FolderCard
              key={folder.id}
              id={folder.id}
              name={folder.name}
              itemsCountText={itemsCountText}
              starred={false}
              onClick={() => setActiveFolderId(folder.id)}
              onDetails={() => setDetailsTarget(folder)}
              onRename={() => setRenameTarget(folder)}
              onShare={() => {
                setSelectedFileId(folder.id)
                setActiveModal('share')
              }}
              onMove={() => setMoveTarget(folder)}
              onToggleStar={() => toggleStar(folder.id)}
              onDelete={() => handleDeleteFolder(folder)}
            />
          )
        })}
      </div>

      {/* Custom Rename Modal for Folders */}
      <RenameModal
        isOpen={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        initialName={renameTarget?.name || ''}
        itemType="folder"
        onRename={handlePerformRename}
      />

      {/* Custom Move Modal for Folders */}
      <MoveModal
        isOpen={Boolean(moveTarget)}
        onClose={() => setMoveTarget(null)}
        itemName={moveTarget?.name || ''}
        itemId={moveTarget?.id}
        itemType="folder"
        currentFolderId={activeFolderId}
        onMove={handlePerformMove}
      />

      {/* Custom Details Modal for Folders */}
      <FileDetailsModal
        isOpen={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
        file={detailsTarget ? {
          id: detailsTarget.id,
          name: detailsTarget.name,
          type: 'folder',
          createdAt: detailsTarget.createdAt,
          updatedAt: detailsTarget.updatedAt,
          parentFolderId: activeFolderId
        } as UnifiedFileItem : null}
      />
    </div>
  )
}
