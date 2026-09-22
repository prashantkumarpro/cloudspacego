'use client'

import React, { useState, useRef } from 'react'
import { useApp } from '../../../providers/app-provider'
import { useFiles } from '../hooks/use-files'
import { useDirectory } from '../../directory/hooks/use-directory'
import { Dialog } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Upload, FolderPlus } from 'lucide-react'
import { formatBytes } from '../../../lib/utils/format'

export function UploadModal() {
  const { activeModal, setActiveModal, activeFolderId } = useApp()
  const { upload, isUploading } = useFiles()
  const { create: createDir, isCreating: isCreatingDir } = useDirectory(activeFolderId ?? undefined)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [customFileName, setCustomFileName] = useState('')
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isFileOpen = activeModal === 'upload-file'
  const isFolderOpen = activeModal === 'upload-folder'

  const handleClose = () => {
    setSelectedFile(null)
    setCustomFileName('')
    setFolderName('')
    setError('')
    setActiveModal(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setCustomFileName(file.name)
      setError('')
    }
  }

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile && !customFileName.trim()) {
      setError('Please choose a file or enter a file name')
      return
    }

    try {
      const fileToUpload = selectedFile || new Blob([' '], { type: 'text/plain' })
      const filename = customFileName.trim() || (selectedFile ? selectedFile.name : 'untitled.txt')

      await upload(
        { file: fileToUpload, filename },
        activeFolderId ?? undefined
      )

      handleClose()
    } catch (err) {
      console.error('Failed to upload file:', err)
      setError('Failed to upload file. Please try again.')
    }
  }

  const handleUploadFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) {
      setError('Folder name is required')
      return
    }

    try {
      await createDir({ dirname: folderName.trim() }, activeFolderId ?? undefined)
      handleClose()
    } catch (err) {
      console.error('Failed to create folder:', err)
      setError('Failed to create folder. Please try again.')
    }
  }

  if (isFileOpen) {
    return (
      <Dialog
        isOpen={isFileOpen}
        onClose={handleClose}
        title="Upload File"
        size="md"
      >
        <form onSubmit={handleUploadFile} className="flex flex-col gap-4">
          {/* Hidden native file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* File Drop / Selection Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-card-border hover:border-[#6E60EE]/50 bg-input-bg/40 hover:bg-input-bg/70 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-foreground truncate max-w-[260px]">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-text-secondary mt-0.5">
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-foreground">
                  Click to browse from your device
                </span>
                <span className="text-[11px] text-text-secondary mt-0.5">
                  Any file type supported
                </span>
              </div>
            )}
          </div>

          <Input
            label="File Name"
            placeholder="e.g. document.pdf, photo.png"
            value={customFileName}
            onChange={e => {
              setCustomFileName(e.target.value)
              if (error) setError('')
            }}
            error={error}
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
              disabled={isUploading}
              className="h-9 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </Dialog>
    )
  }

  if (isFolderOpen) {
    return (
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
    )
  }

  return null
}
