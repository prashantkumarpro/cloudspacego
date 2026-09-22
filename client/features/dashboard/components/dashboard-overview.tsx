'use client'

import React, { useMemo, useState } from 'react'
import { useApp } from '@/providers/app-provider'
import { useToast } from '@/providers/toast-provider'
import { FolderCard } from '@/features/directory/components/folder-card'
import { FileList } from '@/features/files/components/file-list'
import { RenameModal } from '@/features/files/components/rename-modal'
import { SectionAction } from '@/components/ui/section-action'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Folder, ChevronRight, Eye, Edit3, Share2, Trash2, FolderPlus } from 'lucide-react'
import { useDirectory } from '@/features/directory/hooks/use-directory'
import { getDirectory } from '@/features/directory/api'
import type { DirectoryItem, FileItem } from '@/features/directory/types'
import { ActionMenuItem } from '@/components/ui/action-menu'

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
      Promise.all(
        folders.map(async folder => {
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
        setFolderContents(map)
      })
    } else {
      setFolderContents({})
    }
    return () => {
      isMounted = false
    }
  }, [folders])

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
    try {
      await renameDir(renameFolderTarget.id, { newDirName: newName })
      setRenameFolderTarget(null)
    } catch (err) {
      console.error('Failed to rename directory:', err)
      throw err
    }
  }

  const handlePerformDeleteFolder = async (folder: DirectoryItem) => {
    try {
      await removeDir(folder.id)
      toast.success(
        'Moved to Trash',
        `"${folder.name}" was moved to Trash.`
      )
    } catch (err) {
      console.error('Failed to delete directory:', err)
      toast.error('Failed to delete', `Could not delete "${folder.name}".`)
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
        size: typeof f.size === 'number' ? f.size : 0,
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
          Everything you need, right where you left it.
        </p>

        {/* Compact Continue where you left off row */}
        {recentFolder && (
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
        )}
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
        {isDirectoryLoading ? (
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
          <div className='w-full py-5 sm:py-6 px-4 sm:px-5 flex flex-col items-center justify-center text-center bg-card-bg border border-dashed border-card-border rounded-xl select-none'>
            <div className='w-8 h-8 rounded-lg bg-input-bg border border-card-border/60 flex items-center justify-center text-text-muted mb-2'>
              <Folder className='w-4 h-4 text-text-muted' />
            </div>
            <h4 className='text-xs sm:text-sm font-bold text-foreground leading-tight'>No folders yet</h4>
            <p className='text-[11px] sm:text-xs text-text-secondary mt-0.5 max-w-[260px] leading-normal font-normal'>
              Create a folder to organize your files.
            </p>
            <Button
              type='button'
              variant='primary'
              size='sm'
              onClick={() => setActiveModal('create-folder')}
              className='mt-2.5 h-8 px-3.5 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs flex items-center gap-1.5'
            >
              <FolderPlus className='w-3.5 h-3.5' />
              <span>Create folder</span>
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] xl:grid-cols-4 gap-3 sm:gap-4'>
            {displayedFolders.map(folder => {
              const dropdownItems = getFolderDropdownItems(folder)

              return (
                <FolderCard
                  key={folder.id}
                  id={folder.id}
                  name={folder.name}
                  itemsCountText={getFolderItemsCountText(folder.id)}
                  starred={false}
                  onClick={() => {
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
          title='Recently Opened'
          showViewToggle={true}
          showViewAll={allRecentFiles.length > 8}
          limit={8}
          emptyMessage='No files found'
          emptySubtitle='Upload your first file to get started.'
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
