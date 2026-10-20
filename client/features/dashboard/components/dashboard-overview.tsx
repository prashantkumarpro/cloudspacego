'use client'

import React, { useMemo, useState } from 'react'
import { useApp } from '@/providers/app-provider'
import { useToast } from '@/providers/toast-provider'
import { FolderCard } from '@/features/directory/components/folder-card'
import { FolderCardSkeleton, ContinueCardSkeleton } from '@/components/ui/skeleton'
import { FileList } from '@/features/files/components/file-list'
import { RenameModal } from '@/features/files/components/rename-modal'
import { SectionAction } from '@/components/ui/section-action'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { EmptyState } from '@/components/ui/empty-state'
import { Folder, ChevronRight, Eye, Edit3, Share2, Trash2, Clock } from 'lucide-react'
import {
  useDirectory,
  subscribeDirectoryChanged,
  isFolderDeleting
} from '@/features/directory/hooks/use-directory'
import { getDirectory } from '@/features/directory/api'
import type { DirectoryItem, FileItem } from '@/features/directory/types'
import { ActionMenuItem } from '@/components/ui/action-menu'
import { subscribeFilesChanged } from '@/features/files/hooks/use-files'
import type { FileMutationEvent } from '@/features/files/types'

function deriveFileType(filename: string, ext?: string): string {
  const extension = (ext || filename.split('.').pop() || '')
    .replace('.', '')
    .toLowerCase()
  if (extension === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension))
    return 'image'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension)) return 'video'
  if (
    ['doc', 'docx', 'txt', 'md', 'pptx', 'xlsx', 'csv'].includes(extension)
  )
    return 'document'
  return 'other'
}

export default function DashboardOverview() {
  const {
    setCurrentSection,
    setActiveModal,
    setSelectedFileId,
    setActiveFolderId,
  } = useApp()
  const { user } = useAuth()
  const toast = useToast()

  const {
    directory,
    isLoading: isDirectoryLoading,
    error: directoryError,
    rename: renameDir,
    remove: removeDir,
    refresh
  } = useDirectory()

  const [renameFolderTarget, setRenameFolderTarget] = useState<DirectoryItem | null>(null)
  const [folderContents, setFolderContents] = useState<Record<string, { filesCount: number; files: FileItem[] }>>({})

  const folders: DirectoryItem[] = useMemo(() => {
    return directory?.directories ?? []
  }, [directory])

  // Fetch file counts and contents for top-level folders using existing getDirectory API
  React.useEffect(() => {
    let isMounted = true
    if (folders.length > 0) {
      const foldersToFetch = folders.filter(
        folder =>
          !folder.id?.startsWith('temp-') &&
          !folder.isOptimistic &&
          !isFolderDeleting(folder.id) &&
          !folderContents[folder.id]
      )
      if (foldersToFetch.length === 0) return

      Promise.all(
        foldersToFetch.map(async folder => {
          try {
            const subDir = await getDirectory(folder.id)
            return {
              id: folder.id,
              filesCount: subDir.files ? subDir.files.length : 0,
              files: subDir.files || []
            }
          } catch {
            return { id: folder.id, filesCount: 0, files: [] }
          }
        })
      ).then(results => {
        if (!isMounted) return
        const map: Record<string, { filesCount: number; files: FileItem[] }> = {}
        results.forEach(r => {
          map[r.id] = { filesCount: r.filesCount, files: r.files }
        })
        setFolderContents(prev => ({ ...prev, ...map }))
      })
    } else {
      setFolderContents({})
    }
    return () => {
      isMounted = false
    }
  }, [folders, folderContents])

  // Synchronize folder contents with targeted directory creation / settlement / deletion events
  React.useEffect(() => {
    const unsubscribe = subscribeDirectoryChanged((event) => {
      if (!event || !event.type) return

      if (event.type === 'create-folder-optimistic' && event.folder?.id) {
        const folderId = event.folder.id
        setFolderContents((prev) => ({
          ...prev,
          [folderId]: { filesCount: 0, files: [] },
        }))
      } else if (event.type === 'create-folder-success' && event.tempId && event.folder?.id) {
        const tempId = event.tempId
        const folderId = event.folder.id
        setFolderContents((prev) => {
          const next = { ...prev }
          delete next[tempId]
          next[folderId] = { filesCount: 0, files: [] }
          return next
        })
      } else if (event.type === 'create-folder-error' && event.tempId) {
        const tempId = event.tempId
        setFolderContents((prev) => {
          if (!(tempId in prev)) return prev
          const next = { ...prev }
          delete next[tempId]
          return next
        })
      } else if (
        (event.type === 'delete-folder' || event.type === 'delete-folder-optimistic') &&
        (event.folderId || event.folder?.id)
      ) {
        const folderId = (event.folderId || event.folder?.id || '').toString()
        setFolderContents((prev) => {
          if (!(folderId in prev)) return prev
          const next = { ...prev }
          delete next[folderId]
          return next
        })
      } else if (
        (event.type === 'rollback-delete-folder' || event.type === 'restore-folder') &&
        event.folder
      ) {
        const folder = event.folder as DirectoryItem
        const folderId = (folder.id || folder._id || '').toString()
        setFolderContents((prev) => {
          if (folderId in prev) return prev
          return {
            ...prev,
            [folderId]: { filesCount: 0, files: [] }
          }
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Synchronize folder contents with targeted file deletion / rollback events
  React.useEffect(() => {
    const unsubscribe = subscribeFilesChanged((event) => {
      if (!event || !event.type) return

      if (event.type === 'delete' && event.fileId) {
        setFolderContents((prev) => {
          let hasChange = false
          const next = { ...prev }
          for (const [folderId, content] of Object.entries(next)) {
            if (content.files.some((f) => (f.id || f._id || '').toString() === event.fileId)) {
              hasChange = true
              next[folderId] = {
                ...content,
                filesCount: Math.max(0, content.filesCount - 1),
                files: content.files.filter(
                  (f) => (f.id || f._id || '').toString() !== event.fileId
                ),
              }
            }
          }
          return hasChange ? next : prev
        })
      } else if ((event.type === 'upload' || event.type === 'rollback-delete' || event.type === 'restore') && event.file) {
        const file = event.file
        const fileId = (file.id || file._id || '').toString()
        const parentId = (event.parentDirId || file.parentDirId || file.parentFolderId || '').toString()
        const dirId = (directory?.id || directory?._id || '').toString()
        const isRoot = !parentId || parentId === 'root' || (dirId && parentId === dirId)
        if (parentId && !isRoot) {
          setFolderContents((prev) => {
            const content = prev[parentId]
            if (content && content.files.some((f) => (f.id || f._id || '').toString() === fileId)) {
              return prev
            }
            return {
              ...prev,
              [parentId]: {
                filesCount: (content?.filesCount ?? 0) + 1,
                files: [file, ...(content?.files || [])],
              },
            }
          })
        }
      } else if (
        (event.type === 'rename-file-optimistic' ||
          event.type === 'rename-file-success' ||
          event.type === 'rollback-rename-file' ||
          event.type === 'rename') &&
        'fileId' in event &&
        event.fileId
      ) {
        const fileEvt = event as FileMutationEvent
        const fileId = (fileEvt.fileId || '').toString()
        const targetName =
          fileEvt.type === 'rollback-rename-file'
            ? (fileEvt.originalName || fileEvt.newName || fileEvt.newFilename || fileEvt.file?.name)
            : (fileEvt.newFilename || fileEvt.newName || fileEvt.file?.name)

        if (targetName) {
          setFolderContents((prev) => {
            let hasChange = false
            const next = { ...prev }
            for (const [folderId, content] of Object.entries(next)) {
              if (content.files.some((f) => (f.id || f._id || '').toString() === fileId)) {
                hasChange = true
                next[folderId] = {
                  ...content,
                  files: content.files.map((f) => {
                    if ((f.id || f._id || '').toString() === fileId) {
                      return { ...f, name: targetName }
                    }
                    return f
                  }),
                }
              }
            }
            return hasChange ? next : prev
          })
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const getFolderItemsCountText = (folderId: string) => {
    const count = folderContents[folderId]?.filesCount ?? 0
    return `${count} ${count === 1 ? 'file' : 'files'}`
  }

  // Show a maximum of 4 folder cards on the Home page
  const displayedFolders = useMemo(() => {
    return folders.slice(0, 4)
  }, [folders])

  const handlePerformRenameFolder = async (newName: string) => {
    if (!renameFolderTarget) return
    const target = renameFolderTarget
    setRenameFolderTarget(null)
    try {
      await renameDir(
        target.id,
        { newDirName: newName },
        {
          originalName: target.name,
          parentDirId: null,
        }
      )
    } catch (err) {
      console.error('Failed to rename directory:', err)
      throw err
    }
  }

  const handlePerformDeleteFolder = async (folder: DirectoryItem) => {
    try {
      const originalIndex = folders.findIndex(f => f.id === folder.id)
      await removeDir(folder.id, {
        folder,
        originalIndex: originalIndex >= 0 ? originalIndex : undefined,
        parentDirId: null
      })
    } catch (err) {
      console.error('Failed to delete directory:', err)
    }
  }

  // Get active time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = user?.name || 'Prashant'
    if (hour < 12) return `Good morning, ${name}`
    if (hour < 17) return `Good afternoon, ${name}`
    return `Good evening, ${name}`
  }

  // Use real directory files from root and subfolders, sorted by most recently updated/created
  const allRecentFiles = useMemo(() => {
    const rootFiles = directory?.files || []
    const nestedFiles = Object.values(folderContents).flatMap(fc => fc.files)
    const combined = [...rootFiles, ...nestedFiles]

    if (combined.length === 0) return []

    // Deduplicate by file ID
    const uniqueMap = new Map<string, FileItem>()
    combined.forEach(f => {
      const key = f.id || f._id
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, f)
      }
    })

    const list = Array.from(uniqueMap.values())
    return list
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime()
        return timeB - timeA
      })
      .map(f => ({
        id: f.id || f._id || '',
        _id: f._id || f.id,
        name: f.name,
        type: deriveFileType(f.name, f.extension) as any,
        extension: f.extension,
        size: typeof f.size === 'number' ? f.size : (typeof f.size === 'string' && !isNaN(Number(f.size)) ? Number(f.size) : f.size),
        parentDirId: f.parentDirId,
        starred: false,
        updatedAt: f.updatedAt || f.createdAt || new Date().toISOString(),
        raw: f
      }))
  }, [directory?.files, folderContents])

  // Show a maximum of 8 recent files on the Home page
  const displayedFiles = useMemo(() => {
    return allRecentFiles.slice(0, 8)
  }, [allRecentFiles])

  const recentFolder = folders[0]

  const isNewUser =
    !isDirectoryLoading && folders.length === 0 && allRecentFiles.length === 0

  const getFolderDropdownItems = (folder: DirectoryItem): ActionMenuItem[] => [
    {
      label: 'Open',
      onClick: () => {
        setCurrentSection('My Files')
        setActiveFolderId(folder.id)
      },
      icon: <Eye className='w-4 h-4 text-text-secondary' />
    },
    {
      label: 'Rename',
      onClick: () => setRenameFolderTarget(folder),
      icon: <Edit3 className='w-4 h-4 text-text-secondary' />
    },
    {
      label: 'Share',
      onClick: () => {
        setSelectedFileId(folder.id)
        setActiveModal('share')
      },
      icon: <Share2 className='w-4 h-4 text-text-secondary' />
    },
    {
      label: 'Delete',
      onClick: () => handlePerformDeleteFolder(folder),
      icon: <Trash2 className='w-4 h-4 text-rose-500' />,
      danger: true
    }
  ]

  return (
    <div className='flex flex-col w-full select-none'>
      {/* Top Greeting, Actions & Continue Section */}
      <div className='flex flex-col items-start w-full select-none'>
        {/* Greeting headline */}
        <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2'>
          {getGreeting()}
        </h1>

        {/* Subtitle */}
        <p className='text-xs text-text-muted mt-1'>
          {isNewUser
            ? 'Your space is ready. Upload a file or create a folder to get started.'
            : 'Everything you need, right where you left it.'}
        </p>

        {/* Compact Continue where you left off row OR New user Upload files action */}
        {isDirectoryLoading && folders.length === 0 ? (
          <ContinueCardSkeleton />
        ) : recentFolder ? (
          <div
            onClick={() => {
              setCurrentSection('My Files')
              setActiveFolderId(recentFolder.id)
            }}
            className='w-full md:w-[560px] md:max-w-[600px] mt-3.5 bg-card-bg hover:bg-input-bg/50 border border-card-border rounded-xl px-3.5 sm:px-4 py-2.5 flex items-center justify-between transition-all duration-200 cursor-pointer group focus:outline-none select-none text-xs shadow-xs'
          >
            <div className='flex items-center gap-2.5 sm:gap-3 min-w-0'>
              <div className='w-7 h-7 rounded-lg bg-input-bg border border-card-border flex items-center justify-center text-[#6E60EE] shrink-0'>
                <Folder className='w-4 h-4' />
              </div>
              <span className='font-bold uppercase tracking-wider text-[10px] text-text-muted shrink-0'>
                CONTINUE:
              </span>
              <span className='font-semibold text-foreground truncate text-xs group-hover:text-[#6E60EE] transition-colors'>
                {recentFolder.name}
              </span>
            </div>
            <div className='flex items-center gap-1.5 text-text-muted shrink-0 ml-2'>
              <span className='text-xs text-text-secondary hidden xs:inline'>
                Last opened recently
              </span>
              <span className='text-xs text-text-secondary xs:hidden'>
                Recently
              </span>
              <ChevronRight className='w-3.5 h-3.5' />
            </div>
          </div>
        ) : null}
      </div>

      {/* Your folders Section */}
      <div className='flex flex-col gap-3 mt-7 sm:mt-8'>
        <div className='flex items-center justify-between w-full'>
          <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
            Your folders
          </h3>
          <SectionAction
            onClick={() => {
              setCurrentSection('My Files')
              setActiveFolderId(null) // Go to files root folder
            }}
          >
            View all
          </SectionAction>
        </div>

        {/* Folders Presentation: Loading / Error / Content */}
        {isDirectoryLoading && folders.length === 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-2.5 sm:gap-4'>
            {[1, 2, 3, 4].map(idx => (
              <FolderCardSkeleton key={`folder-skeleton-${idx}`} />
            ))}
          </div>
        ) : directoryError ? (
          <div className='w-full py-6 flex flex-col items-center justify-center text-center bg-card-bg border border-card-border rounded-xl p-4 gap-2'>
            <p className='text-xs text-rose-500 font-medium'>{directoryError}</p>
            <button
              onClick={() => refresh()}
              className='text-xs font-semibold text-[#6E60EE] hover:underline flex items-center gap-1 cursor-pointer'
            >
              Retry
            </button>
          </div>
        ) : folders.length === 0 ? (
          <div className='w-full flex items-center gap-3 p-3.5 sm:px-4 sm:py-3 bg-card-bg border border-card-border rounded-xl select-none shadow-2xs'>
            <div className='w-8 h-8 rounded-lg bg-input-bg border border-card-border/60 flex items-center justify-center text-text-muted shrink-0'>
              <Folder className='w-4 h-4 text-text-muted' />
            </div>
            <div className='flex flex-col min-w-0 text-left'>
              <h4 className='text-xs sm:text-sm font-semibold text-foreground leading-tight'>
                No folders yet
              </h4>
              <p className='text-[11px] sm:text-xs text-text-secondary mt-0.5 leading-normal font-normal'>
                Create a folder to keep your files organized.
              </p>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-2.5 sm:gap-4'>
            {displayedFolders.map(folder => {
              const dropdownItems = getFolderDropdownItems(folder)

              return (
                <FolderCard
                  key={folder.id}
                  id={folder.id}
                  name={folder.name}
                  itemsCountText={getFolderItemsCountText(folder.id)}
                  starred={false}
                  isOptimistic={folder.isOptimistic || folder.id.startsWith('temp-')}
                  onClick={() => {
                    if (folder.isOptimistic || folder.id.startsWith('temp-')) return
                    setCurrentSection('My Files')
                    setActiveFolderId(folder.id)
                  }}
                  customActions={dropdownItems}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Recently Opened Section - Standardized with FileList (supporting Grid & List views) */}
      <div className='mt-7 sm:mt-8'>
        <FileList
          files={displayedFiles}
          isLoading={isDirectoryLoading && displayedFiles.length === 0}
          title='Recently Opened'
          showViewToggle={true}
          showViewAll={allRecentFiles.length > 8}
          limit={8}
          emptyState={
            <EmptyState
              icon={Clock}
              title='Nothing here yet'
              description='Files you open, preview, or upload will appear here.'
              className='py-8 sm:py-10'
            />
          }
        />
      </div>

      {/* Custom Rename Modal for Folders */}
      <RenameModal
        isOpen={Boolean(renameFolderTarget)}
        onClose={() => setRenameFolderTarget(null)}
        initialName={renameFolderTarget?.name || ''}
        itemType="folder"
        onRename={handlePerformRenameFolder}
      />
    </div>
  )
}
