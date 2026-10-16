'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect
} from 'react'
import axios from 'axios'
import type { UploadTask, UploadFileData, FileApiResponse } from '@/features/files/types'
import { uploadFile, deleteFilePermanently } from '@/features/files/api'
import { notifyFilesChanged } from '@/features/files/hooks/use-files'
import { UploadManager } from '@/features/files/components/upload-manager'

const MAX_CONCURRENT_UPLOADS = 3

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
  cancelTask: (id: string) => void
  cancelAll: () => void
  retryTask: (id: string) => void
  dismissTask: (id: string) => void
  clearCompleted: () => void
}

const UploadContext = createContext<UploadContextType | undefined>(undefined)

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<UploadTask[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const tasksRef = useRef<UploadTask[]>([])

  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  const resolversRef = useRef<
    Map<string, { resolve: (res: FileApiResponse) => void; reject: (err: unknown) => void }>
  >(new Map())

  const isCancellingAllRef = useRef(false)

  const isUploading = useMemo(() => {
    return tasks.some(t => t.status === 'uploading' || t.status === 'queued')
  }, [tasks])

  const toggleMinimized = useCallback(() => {
    setIsMinimized(prev => !prev)
  }, [])

  const startUpload = useCallback(async (task: UploadTask) => {
    const taskId = task.id
    const file = task.file
    if (!file) {
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, status: 'error', error: 'File data missing' } : t
        )
      )
      resolversRef.current.get(taskId)?.reject(new Error('File data missing'))
      resolversRef.current.delete(taskId)
      return
    }

    const controller = task.abortController || new AbortController()
    if (!task.abortController) {
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, abortController: controller } : t))
      )
    }

    try {
      const response = await uploadFile(
        {
          file,
          filename: task.name,
          signal: controller.signal
        },
        task.parentDirId,
        (progress: number) => {
          const current = tasksRef.current.find(t => t.id === taskId)
          if (current && current.status === 'uploading') {
            setTasks(prev =>
              prev.map(t =>
                t.id === taskId ? { ...t, progress: Math.min(progress, 99) } : t
              )
            )
          }
        },
        controller.signal
      )

      // Late response protection: Check if task was cancelled before applying success
      const current = tasksRef.current.find(t => t.id === taskId)
      if (current && current.status === 'cancelled') {
        resolversRef.current.get(taskId)?.reject(new Error('Upload cancelled by user'))
        resolversRef.current.delete(taskId)

        // Backend reconciliation (Requirement 8):
        // If the upload completed on the server despite client cancellation,
        // permanently delete the file to roll back quota and clean up storage.
        if (response?.file?.id) {
          deleteFilePermanently(response.file.id).catch(reconcileErr => {
            console.warn('Failed to delete cancelled file on server during reconciliation:', reconcileErr)
          })
        }
        return
      }

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, progress: 100, status: 'completed' } : t
        )
      )

      notifyFilesChanged({
        type: 'upload',
        file: response.file,
        parentDirId: task.parentDirId
      })

      resolversRef.current.get(taskId)?.resolve(response)
      resolversRef.current.delete(taskId)
    } catch (err: unknown) {
      const isCancelled =
        axios.isCancel(err) ||
        (err as { name?: string })?.name === 'CanceledError' ||
        (err as { code?: string })?.code === 'ERR_CANCELED' ||
        tasksRef.current.find(t => t.id === taskId)?.status === 'cancelled'

      if (isCancelled) {
        setTasks(prev =>
          prev.map(t => (t.id === taskId ? { ...t, status: 'cancelled' } : t))
        )
        resolversRef.current.get(taskId)?.reject(err)
        resolversRef.current.delete(taskId)
        return
      }

      let errorMessage = 'Upload failed'
      if (typeof err === 'object' && err !== null) {
        const axiosErr = err as {
          response?: { data?: { message?: string; error?: string } }
          message?: string
        }
        if (axiosErr.response?.data?.message) {
          errorMessage = axiosErr.response.data.message
        } else if (axiosErr.response?.data?.error) {
          errorMessage = axiosErr.response.data.error
        } else if (axiosErr.message) {
          errorMessage = axiosErr.message
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, status: 'error', error: errorMessage } : t
        )
      )
      resolversRef.current.get(taskId)?.reject(err)
      resolversRef.current.delete(taskId)
    }
  }, [])

  // Process queue effect: inspect queued tasks and start up to MAX_CONCURRENT_UPLOADS
  useEffect(() => {
    if (isCancellingAllRef.current) return

    const currentTasks = tasksRef.current
    const activeCount = currentTasks.filter(t => t.status === 'uploading').length
    if (activeCount >= MAX_CONCURRENT_UPLOADS) return

    const slotsAvailable = MAX_CONCURRENT_UPLOADS - activeCount
    const queuedTasks = currentTasks.filter(t => t.status === 'queued')
    const tasksToStart = queuedTasks.slice(0, slotsAvailable)

    if (tasksToStart.length === 0) return

    const startIds = new Set(tasksToStart.map(t => t.id))
    setTasks(prev =>
      prev.map(t => (startIds.has(t.id) ? { ...t, status: 'uploading' } : t))
    )

    tasksToStart.forEach(task => {
      startUpload(task)
    })
  }, [tasks, startUpload])

  const cancelTask = useCallback((id: string) => {
    const task = tasksRef.current.find(t => t.id === id)
    if (!task || task.status === 'completed' || task.status === 'cancelled') return

    if (task.status === 'uploading') {
      try {
        task.abortController?.abort()
      } catch (err) {
        console.warn('Error aborting upload task:', err)
      }
    }

    // Synchronously update tasksRef so in-flight async callbacks immediately see status 'cancelled'
    tasksRef.current = tasksRef.current.map(t =>
      t.id === id ? { ...t, status: 'cancelled' } : t
    )

    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'cancelled' } : t))
    )

    resolversRef.current.get(id)?.reject(new Error('Upload cancelled by user'))
    resolversRef.current.delete(id)
  }, [])

  const cancelAll = useCallback(() => {
    if (isCancellingAllRef.current) return

    const currentTasks = tasksRef.current
    const cancellableTasks = currentTasks.filter(
      t => t.status === 'uploading' || t.status === 'queued'
    )
    if (cancellableTasks.length === 0) return

    isCancellingAllRef.current = true

    try {
      const cancellableIds = new Set(cancellableTasks.map(t => t.id))

      // 1. Abort active upload controllers and reject pending resolvers
      cancellableTasks.forEach(task => {
        if (task.status === 'uploading') {
          try {
            task.abortController?.abort()
          } catch (abortErr) {
            console.warn('Error aborting active upload task:', task.id, abortErr)
          }
        }
        resolversRef.current.get(task.id)?.reject(new Error('Upload cancelled by user'))
        resolversRef.current.delete(task.id)
      })

      // 2. Synchronously update tasksRef so in-flight callbacks immediately see status 'cancelled'
      tasksRef.current = tasksRef.current.map(t =>
        cancellableIds.has(t.id) ? { ...t, status: 'cancelled' } : t
      )

      // 3. Promptly update UI state (completed uploads remain completely untouched)
      setTasks(prev =>
        prev.map(t =>
          cancellableIds.has(t.id) ? { ...t, status: 'cancelled' } : t
        )
      )
    } finally {
      isCancellingAllRef.current = false
    }
  }, [])

  const retryTask = useCallback((id: string) => {
    const task = tasksRef.current.find(t => t.id === id)
    if (!task || !task.file) return

    const newController = new AbortController()
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              status: 'queued',
              progress: 0,
              error: undefined,
              abortController: newController
            }
          : t
      )
    )
  }, [])

  const dismissTask = useCallback((id: string) => {
    const task = tasksRef.current.find(t => t.id === id)
    if (task?.status === 'uploading') {
      task.abortController?.abort()
    }
    resolversRef.current.delete(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setTasks(prev =>
      prev.filter(t => t.status === 'uploading' || t.status === 'queued')
    )
  }, [])

  const upload = useCallback(
    async (data: UploadFileData, parentDirId?: string): Promise<FileApiResponse> => {
      const taskId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const filename =
        data.filename || (data.file instanceof File ? data.file.name : 'untitled.txt')
      const size = data.file instanceof File ? data.file.size : (data.file as Blob).size || 0

      const controller = new AbortController()

      const newTask: UploadTask = {
        id: taskId,
        name: filename,
        size,
        progress: 0,
        status: 'queued',
        parentDirId,
        createdAt: Date.now(),
        file: data.file,
        abortController: controller
      }

      setTasks(prev => [newTask, ...prev])
      setIsOpen(true)
      setIsMinimized(false)

      return new Promise<FileApiResponse>((resolve, reject) => {
        resolversRef.current.set(taskId, { resolve, reject })
      })
    },
    []
  )

  const uploadBatch = useCallback(
    async (
      files: (File | { file: File | Blob; filename?: string })[],
      parentDirId?: string
    ): Promise<void> => {
      if (!files || files.length === 0) return

      const newTasks: UploadTask[] = files.map(item => {
        const taskId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const fileObj = item instanceof File ? item : item.file
        const filename =
          item instanceof File
            ? item.name
            : item.filename || (fileObj instanceof File ? fileObj.name : 'untitled.txt')
        const size = fileObj instanceof File ? fileObj.size : fileObj.size || 0

        return {
          id: taskId,
          name: filename,
          size,
          progress: 0,
          status: 'queued',
          parentDirId,
          createdAt: Date.now(),
          file: fileObj,
          abortController: new AbortController()
        }
      })

      setTasks(prev => [...newTasks, ...prev])
      setIsOpen(true)
      setIsMinimized(false)
    },
    []
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __uploadBatch?: typeof uploadBatch }).__uploadBatch = uploadBatch;
      (window as unknown as { __cancelAll?: typeof cancelAll }).__cancelAll = cancelAll;
    }
  }, [uploadBatch, cancelAll])

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
      cancelTask,
      cancelAll,
      retryTask,
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
      cancelTask,
      cancelAll,
      retryTask,
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
