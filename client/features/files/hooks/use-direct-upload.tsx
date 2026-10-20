'use client'

import React, { useRef, useCallback } from 'react'
import { useUpload } from '@/providers/upload-provider'
import { useApp } from '@/providers/app-provider'
import { useToast } from '@/providers/toast-provider'
import { formatBytes } from '@/lib/utils/format'

export interface UseDirectUploadOptions {
  folderId?: string | null
  onSuccess?: () => void
}

export function useDirectUpload(options?: UseDirectUploadOptions) {
  const { uploadBatch } = useUpload()
  const { activeFolderId, storageStats } = useApp()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isUploadingRef = useRef(false)

  const effectiveFolderId = options?.folderId !== undefined ? options.folderId : activeFolderId

  const triggerUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (!selectedFiles || selectedFiles.length === 0) return

      // Prevent duplicate triggers from rapid repeated events
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

        const parentDirId = effectiveFolderId ?? undefined
        await uploadBatch(files, parentDirId)
        options?.onSuccess?.()
      } catch (err) {
        console.error('Failed to start direct upload:', err)
        toast.error('Upload failed', 'Could not upload files. Please try again.')
      } finally {
        isUploadingRef.current = false
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [uploadBatch, effectiveFolderId, storageStats, toast, options]
  )

  const hiddenFileInput = (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      multiple
      className="hidden"
      aria-hidden="true"
    />
  )

  return {
    triggerUpload,
    hiddenFileInput,
    fileInputRef
  }
}
