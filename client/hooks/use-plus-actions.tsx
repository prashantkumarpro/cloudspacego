'use client'

import React, { useRef, useCallback } from 'react'
import { useApp } from '@/providers/app-provider'
import { useFiles } from '@/features/files/hooks/use-files'
import { useUpload } from '@/providers/upload-provider'
import { useToast } from '@/providers/toast-provider'
import { formatBytes } from '@/lib/utils/format'
import { useDirectory } from '@/features/directory/hooks/use-directory'
import { FolderPlus, FileUp, FolderUp, LucideIcon } from 'lucide-react'

export interface PlusActionItem {
  id: 'create-folder' | 'upload-file' | 'upload-folder'
  label: string
  icon: LucideIcon
  onClick: () => void
}

export function usePlusActions(onActionExecuted?: () => void) {
  const { setActiveModal, activeFolderId, storageStats } = useApp()
  const { upload } = useFiles()
  const { uploadBatch } = useUpload()
  const toast = useToast()
  const { create: createDir } = useDirectory(activeFolderId ?? undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const isUploadingRef = useRef(false)

  const handleNewFolder = useCallback(() => {
    setActiveModal('create-folder')
    onActionExecuted?.()
  }, [setActiveModal, onActionExecuted])

  const handleUploadFiles = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    } else {
      setActiveModal('upload-file')
    }
    onActionExecuted?.()
  }, [setActiveModal, onActionExecuted])

  const handleUploadFolder = useCallback(() => {
    if (folderInputRef.current) {
      folderInputRef.current.value = ''
      folderInputRef.current.click()
    } else {
      setActiveModal('upload-folder')
    }
    onActionExecuted?.()
  }, [setActiveModal, onActionExecuted])

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (!selectedFiles || selectedFiles.length === 0) return

      if (isUploadingRef.current) return
      isUploadingRef.current = true

      try {
        const files = Array.from(selectedFiles)
        const totalSize = files.reduce((acc, f) => acc + f.size, 0)
        const remainingStorage = Math.max(
          0,
          storageStats.totalCapacity - storageStats.totalUsed
        )

        if (totalSize > remainingStorage) {
          toast.error(
            'Storage limit exceeded',
            `Selected files (${formatBytes(totalSize)}) exceed remaining storage (${formatBytes(remainingStorage)}).`
          )
          return
        }

        await uploadBatch(files, activeFolderId ?? undefined)
      } catch (err) {
        console.error('Failed to upload batch:', err)
        toast.error('Upload failed', 'Could not upload files. Please try again.')
      } finally {
        isUploadingRef.current = false
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [uploadBatch, activeFolderId, storageStats, toast]
  )

  const handleFolderInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (!selectedFiles || selectedFiles.length === 0) return

      // Derive folder name from first file's webkitRelativePath
      const firstFile = selectedFiles[0]
      const relativePath = (firstFile as unknown as { webkitRelativePath?: string })
        .webkitRelativePath || ''
      const folderName = relativePath ? relativePath.split('/')[0] : 'New Folder'

      try {
        await createDir({ dirname: folderName }, activeFolderId ?? undefined)

        for (const file of Array.from(selectedFiles)) {
          await upload(
            { file, filename: file.name },
            activeFolderId ?? undefined
          )
        }
      } catch (err) {
        console.error('Failed to create folder / upload contents:', err)
      }
    },
    [createDir, upload, activeFolderId]
  )

  const actions: PlusActionItem[] = [
    {
      id: 'create-folder',
      label: 'New folder',
      icon: FolderPlus,
      onClick: handleNewFolder,
    },
    {
      id: 'upload-file',
      label: 'Upload files',
      icon: FileUp,
      onClick: handleUploadFiles,
    },
    {
      id: 'upload-folder',
      label: 'Upload folder',
      icon: FolderUp,
      onClick: handleUploadFolder,
    },
  ]

  const hiddenInputs = (
    <React.Fragment key='plus-hidden-inputs'>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        className='hidden'
        aria-hidden='true'
      />
      <input
        type='file'
        ref={folderInputRef}
        onChange={handleFolderInputChange}
        // @ts-expect-error webkitdirectory is standard in browser engines
        webkitdirectory=''
        directory=''
        multiple
        className='hidden'
        aria-hidden='true'
      />
    </React.Fragment>
  )

  return {
    actions,
    hiddenInputs,
    handleNewFolder,
    handleUploadFiles,
    handleUploadFolder,
  }
}
