'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { UploadTask, UploadFileData, FileApiResponse } from '@/features/files/types'
import { uploadFile } from '@/features/files/api'
import { notifyFilesChanged } from '@/features/files/hooks/use-files'
import { UploadManager } from '@/features/files/components/upload-manager'

interface UploadContextType {
  tasks: UploadTask[]
  isUploading: boolean
  isOpen: boolean
  isMinimized: boolean
  setIsOpen: (open: boolean) => void
  setIsMinimized: (minimized: boolean) => void
  toggleMinimized: () => void
  upload: (data: UploadFileData, parentDirId?: string) => Promise<FileApiResponse>
  uploadBatch: (
    files: (File | { file: File | Blob; filename?: string })[],
    parentDirId?: string
  ) => Promise<void>
  dismissTask: (id: string) => void
  clearCompleted: () => void
}

const UploadContext = createContext<UploadContextType | undefined>(undefined)

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<UploadTask[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const isUploading = useMemo(() => {
    return tasks.some(t => t.status === 'uploading')
  }, [tasks])

  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => !prev)
  }, [])

  const dismissTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(t => t.status === 'uploading'))
  }, [])

  const upload = useCallback(
    async (data: UploadFileData, parentDirId?: string): Promise<FileApiResponse> => {
      const taskId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const filename =
        data.filename || (data.file instanceof File ? data.file.name : 'untitled')
      const size = data.file instanceof File ? data.file.size : (data.file as Blob).size || 0

      const newTask: UploadTask = {
        id: taskId,
        name: filename,
        size,
        progress: 0,
        status: 'uploading',
        parentDirId,
        createdAt: Date.now()
      }

      setTasks(prev => [newTask, ...prev])
      setIsOpen(true)
      setIsMinimized(false)

      try {
        const response = await uploadFile(
          data,
          parentDirId,
          (progress: number) => {
            setTasks(prev =>
              prev.map(t =>
                t.id === taskId
                  ? { ...t, progress: Math.min(progress, 99) }
                  : t
              )
            )
          }
        )

        setTasks(prev =>
          prev.map(t =>
            t.id === taskId
              ? { ...t, progress: 100, status: 'completed' }
              : t
          )
        )

        notifyFilesChanged()
        return response
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Upload failed'

        setTasks(prev =>
          prev.map(t =>
            t.id === taskId
              ? { ...t, status: 'error', error: errorMessage }
              : t
          )
        )
        throw err
      }
    },
    []
  )

  const uploadBatch = useCallback(
    async (
      files: (File | { file: File | Blob; filename?: string })[],
      parentDirId?: string
    ): Promise<void> => {
      if (!files || files.length === 0) return

      await Promise.all(
        files.map(item => {
          const uploadData: UploadFileData =
            item instanceof File
              ? { file: item, filename: item.name }
              : item
          return upload(uploadData, parentDirId).catch(err => {
            console.error('Batch upload error for item:', uploadData.filename, err)
          })
        })
      )
    },
    [upload]
  )

  const value = useMemo(
    () => ({
      tasks,
      isUploading,
      isOpen,
      isMinimized,
      setIsOpen,
      setIsMinimized,
      toggleMinimized,
      upload,
      uploadBatch,
      dismissTask,
      clearCompleted
    }),
    [
      tasks,
      isUploading,
      isOpen,
      isMinimized,
      toggleMinimized,
      upload,
      uploadBatch,
      dismissTask,
      clearCompleted
    ]
  )

  return (
    <UploadContext.Provider value={value}>
      {children}
      <UploadManager />
    </UploadContext.Provider>
  )
}

export function useUpload() {
  const context = useContext(UploadContext)
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider')
  }
  return context
}
