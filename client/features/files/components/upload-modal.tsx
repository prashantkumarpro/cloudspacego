'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../../../providers/app-provider'
import { useToast } from '../../../providers/toast-provider'
import { useUpload } from '../../../providers/upload-provider'
import { useDirectory } from '../../directory/hooks/use-directory'
import { Dialog } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { formatBytes } from '../../../lib/utils/format'

export function UploadModal() {
  const { activeModal, setActiveModal, activeFolderId, storageStats } = useApp()
  const toast = useToast()
  const { uploadBatch } = useUpload()
  const { create: createDir, isCreating: isCreatingDir } = useDirectory(activeFolderId ?? undefined)

  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isFolderOpen = activeModal === 'upload-folder'

  // When activeModal is 'upload-file', directly trigger native file picker without showing modal
  useEffect(() => {
    if (activeModal === 'upload-file') {
      setActiveModal(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
        fileInputRef.current.click()
      }
    }
  }, [activeModal, setActiveModal])

  const handleClose = () => {
    setFolderName('')
    setError('')
    setActiveModal(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    const files = Array.from(selectedFiles)
    const totalSize = files.reduce((acc, f) => acc + f.size, 0)
    const remainingStorage = Math.max(0, storageStats.totalCapacity - storageStats.totalUsed)
    if (totalSize > remainingStorage) {
      toast.error(
        'Storage limit exceeded',
        `Selected files (${formatBytes(totalSize)}) exceed remaining storage (${formatBytes(remainingStorage)}).`
      )
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    uploadBatch(files, activeFolderId ?? undefined).catch(err => {
      console.error('Failed to upload batch:', err)
      toast.error('Upload failed', 'Could not upload files. Please try again.')
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = folderName.trim()
    if (!trimmed) {
      setError('Folder name is required')
      return
    }

    handleClose()

    createDir({ dirname: trimmed }, activeFolderId ?? undefined)
      .then(() => {
        toast.success('Folder created', `Folder "${trimmed}" was created.`)
      })
      .catch((err) => {
        console.error('Failed to create folder:', err)
        toast.error('Failed to create folder', `Could not create folder "${trimmed}". Please try again.`)
      })
  }

  return (
    <>
      {/* Hidden native file input supporting multi-select for direct upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        aria-hidden="true"
      />

      {isFolderOpen && (
        <Dialog
          isOpen={isFolderOpen}
          onClose={handleClose}
          title="Create New Folder"
          size="sm"
        >
          <form onSubmit={handleUploadFolder} className="flex flex-col gap-4">
            <Input
              label="Folder Name"
              placeholder="e.g. Marketing, Projects, Invoices"
              value={folderName}
              onChange={e => {
                setFolderName(e.target.value)
                if (error) setError('')
              }}
              error={error}
              autoFocus
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-9 px-4 text-xs font-semibold text-text-secondary hover:text-foreground hover:bg-input-bg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isCreatingDir}
                className="h-9 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingDir ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  )
}
