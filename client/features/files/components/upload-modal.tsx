'use client'

import React, { useState, useRef } from 'react'
import { useApp } from '../../../providers/app-provider'
import { useToast } from '../../../providers/toast-provider'
import { useFiles } from '../hooks/use-files'
import { useUpload } from '../../../providers/upload-provider'
import { useDirectory } from '../../directory/hooks/use-directory'
import { Dialog } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Upload, X, File as FileIcon } from 'lucide-react'
import { formatBytes } from '../../../lib/utils/format'
import { cn } from '../../../lib/utils/cn'

export function UploadModal() {
  const { activeModal, setActiveModal, activeFolderId, storageStats } = useApp()
  const toast = useToast()
  const { upload } = useFiles()
  const { uploadBatch } = useUpload()
  const { create: createDir, isCreating: isCreatingDir } = useDirectory(activeFolderId ?? undefined)

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [customFileName, setCustomFileName] = useState('')
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isFileOpen = activeModal === 'upload-file'
  const isFolderOpen = activeModal === 'upload-folder'

  const handleClose = () => {
    setSelectedFiles([])
    setCustomFileName('')
    setFolderName('')
    setError('')
    setIsDragging(false)
    setActiveModal(null)
  }

  const handleFilesSelected = (files: File[]) => {
    if (!files || files.length === 0) return

    setSelectedFiles(files)
    if (files.length === 1) {
      setCustomFileName(files[0].name)
    } else {
      setCustomFileName('')
    }

    const totalSize = files.reduce((acc, f) => acc + f.size, 0)
    const remainingStorage = Math.max(0, storageStats.totalCapacity - storageStats.totalUsed)
    if (totalSize > remainingStorage) {
      setError(
        `Selected files (${formatBytes(totalSize)}) exceed remaining storage (${formatBytes(remainingStorage)}).`
      )
    } else {
      setError('')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files))
    }
  }

  const removeSelectedFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(updated)
    if (updated.length === 1) {
      setCustomFileName(updated[0].name)
    }
    const totalSize = updated.reduce((acc, f) => acc + f.size, 0)
    const remainingStorage = Math.max(0, storageStats.totalCapacity - storageStats.totalUsed)
    if (totalSize > remainingStorage) {
      setError(
        `Selected files (${formatBytes(totalSize)}) exceed remaining storage (${formatBytes(remainingStorage)}).`
      )
    } else {
      setError('')
    }
  }

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length === 0 && !customFileName.trim()) {
      setError('Please choose at least one file')
      return
    }

    const parentId = activeFolderId ?? undefined
    handleClose()

    if (selectedFiles.length <= 1) {
      const fileToUpload = selectedFiles[0] || new Blob([' '], { type: 'text/plain' })
      const filename = customFileName.trim() || (selectedFiles[0] ? selectedFiles[0].name : 'untitled.txt')

      upload(
        { file: fileToUpload, filename },
        parentId
      ).catch(err => {
        console.error('Failed to upload file:', err)
      })
    } else {
      uploadBatch(selectedFiles, parentId).catch(err => {
        console.error('Failed to upload batch:', err)
      })
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

  const totalSelectedSize = selectedFiles.reduce((acc, f) => acc + f.size, 0)

  if (isFileOpen) {
    return (
      <Dialog
        isOpen={isFileOpen}
        onClose={handleClose}
        title="Upload Files"
        size="md"
      >
        <form onSubmit={handleUploadFile} className="flex flex-col gap-4">
          {/* Hidden native file input supporting multi-select */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />

          {/* File Drop / Selection Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center group",
              isDragging
                ? "border-[#6E60EE] bg-[#6E60EE]/10"
                : "border-card-border hover:border-[#6E60EE]/50 bg-input-bg/40 hover:bg-input-bg/70"
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-[#6E60EE]/10 text-[#6E60EE] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>

            {selectedFiles.length === 0 ? (
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-foreground">
                  Click to browse or drag & drop files here
                </span>
                <span className="text-[11px] text-text-secondary mt-0.5">
                  Select one or multiple files
                </span>
              </div>
            ) : selectedFiles.length === 1 ? (
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-foreground truncate max-w-[260px]">
                  {selectedFiles[0].name}
                </span>
                <span className="text-[11px] text-text-secondary mt-0.5">
                  {formatBytes(selectedFiles[0].size)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-foreground">
                  {selectedFiles.length} files selected
                </span>
                <span className="text-[11px] text-text-secondary mt-0.5">
                  {formatBytes(totalSelectedSize)} total
                </span>
              </div>
            )}
          </div>

          {/* File List for multi-file selection */}
          {selectedFiles.length > 1 && (
            <div className="max-h-36 overflow-y-auto divide-y divide-card-border/40 border border-card-border rounded-lg bg-input-bg/20 p-1">
              {selectedFiles.map((f, idx) => (
                <div
                  key={`${f.name}-${idx}`}
                  className="flex items-center justify-between py-1.5 px-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileIcon className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span className="truncate text-foreground font-medium" title={f.name}>
                      {f.name}
                    </span>
                    <span className="text-[11px] text-text-muted shrink-0">
                      {formatBytes(f.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSelectedFile(idx)
                    }}
                    className="p-1 text-text-muted hover:text-foreground rounded cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Custom File Name input (only for single file) */}
          {selectedFiles.length <= 1 && (
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
          )}

          {/* Multi-file quota error banner */}
          {selectedFiles.length > 1 && error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}

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
              disabled={Boolean(error) || (selectedFiles.length === 0 && !customFileName.trim())}
              className="h-9 px-4 text-xs font-semibold bg-[#6E60EE] hover:bg-[#6052E6] text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Files` : 'Upload'}
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
