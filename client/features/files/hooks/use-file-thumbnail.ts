'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getFileBlob } from '../api'
import { getFileTypeInfo, ensureTypedBlob } from '../utils/file-preview'

// In-memory cache for ObjectURLs keyed by fileId to prevent duplicate blob fetches
const blobUrlCache = new Map<string, string>()
const inFlightRequests = new Map<string, Promise<string | null>>()

// Global throttled queue for thumbnail blob downloads to prevent saturating browser connections
const MAX_CONCURRENT_THUMBNAIL_REQUESTS = 4
let activeRequestCount = 0
const requestQueue: Array<() => void> = []

function enqueueThumbnailRequest<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const execute = () => {
      activeRequestCount++
      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeRequestCount--
          if (requestQueue.length > 0) {
            const next = requestQueue.shift()
            next?.()
          }
        })
    }

    if (activeRequestCount < MAX_CONCURRENT_THUMBNAIL_REQUESTS) {
      execute()
    } else {
      requestQueue.push(execute)
    }
  })
}

// Shared IntersectionObserver for lazy thumbnail viewport detection
type VisibilityCallback = (isVisible: boolean) => void
const elementCallbacks = new WeakMap<Element, VisibilityCallback>()

let sharedObserver: IntersectionObserver | null = null

function getSharedThumbnailObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined') return null
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cb = elementCallbacks.get(entry.target)
            if (cb) {
              cb(true)
              sharedObserver?.unobserve(entry.target)
              elementCallbacks.delete(entry.target)
            }
          }
        }
      },
      {
        root: null,
        rootMargin: '350px 0px', // Pre-fetch 350px before entering viewport
        threshold: 0.01
      }
    )
  }
  return sharedObserver
}

const isValidObjectId = (id?: string | null): boolean => {
  return Boolean(id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id))
}

export interface UseFileThumbnailOptions {
  id?: string
  _id?: string
  name: string
  extension?: string
  url?: string
  thumbnailUrl?: string
  enabled?: boolean
  lazy?: boolean
}

export interface UseFileThumbnailResult {
  url: string | null
  isLoading: boolean
  hasError: boolean
  category: ReturnType<typeof getFileTypeInfo>['category']
  typeInfo: ReturnType<typeof getFileTypeInfo>
  targetRef: (node: HTMLElement | null) => void
}

export function useFileThumbnail({
  id,
  _id,
  name,
  extension,
  url: propUrl,
  thumbnailUrl: propThumbnailUrl,
  enabled = true,
  lazy = true
}: UseFileThumbnailOptions): UseFileThumbnailResult {
  const fileId = id || _id
  const typeInfo = getFileTypeInfo(name, extension)
  const isMountedRef = useRef(true)
  const elementRef = useRef<HTMLElement | null>(null)

  // Direct URL passed via props takes precedence
  const explicitUrl = propThumbnailUrl || propUrl
  const isCached = Boolean(fileId && blobUrlCache.has(fileId))

  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (!lazy || explicitUrl || isCached) return true
    return false
  })

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(() => {
    if (explicitUrl) return explicitUrl
    if (fileId && blobUrlCache.has(fileId)) {
      return blobUrlCache.get(fileId)!
    }
    return null
  })

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (explicitUrl) return false
    if (!enabled || !fileId || !isValidObjectId(fileId)) return false
    if (!typeInfo.canHaveVisualThumbnail) return false
    return !isCached
  })

  const [hasError, setHasError] = useState<boolean>(false)

  // Ref callback to hook into shared IntersectionObserver
  const targetRef = useCallback((node: HTMLElement | null) => {
    elementRef.current = node
    if (!node || !lazy || isCached || explicitUrl) return

    const observer = getSharedThumbnailObserver()
    if (observer) {
      elementCallbacks.set(node, (visible) => {
        if (visible && isMountedRef.current) {
          setIsVisible(true)
        }
      })
      observer.observe(node)
    } else {
      // Fallback if IntersectionObserver is unavailable
      setIsVisible(true)
    }
  }, [lazy, isCached, explicitUrl])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (elementRef.current) {
        sharedObserver?.unobserve(elementRef.current)
        elementCallbacks.delete(elementRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (explicitUrl) {
      setThumbnailUrl(explicitUrl)
      setIsLoading(false)
      setHasError(false)
      return
    }

    if (!enabled || !fileId || !isValidObjectId(fileId) || !typeInfo.canHaveVisualThumbnail) {
      setIsLoading(false)
      return
    }

    // Check in-memory cache immediately (0ms latency)
    if (blobUrlCache.has(fileId)) {
      setThumbnailUrl(blobUrlCache.get(fileId)!)
      setIsLoading(false)
      setHasError(false)
      return
    }

    // Defer network fetch until element is visible/near viewport
    if (lazy && !isVisible) {
      return
    }

    let isSubscribed = true

    const fetchThumbnail = async () => {
      setIsLoading(true)
      setHasError(false)

      try {
        let fetchPromise = inFlightRequests.get(fileId)

        if (!fetchPromise) {
          fetchPromise = enqueueThumbnailRequest(async () => {
            try {
              const rawBlob = await getFileBlob(fileId)
              const blob = ensureTypedBlob(rawBlob, name, extension)
              const objectUrl = URL.createObjectURL(blob)
              blobUrlCache.set(fileId, objectUrl)
              return objectUrl
            } catch (err) {
              console.warn(`[FilePreview] Could not load thumbnail for file ${fileId}:`, err)
              return null
            } finally {
              inFlightRequests.delete(fileId)
            }
          })

          inFlightRequests.set(fileId, fetchPromise)
        }

        const resolvedUrl = await fetchPromise

        if (isSubscribed && isMountedRef.current) {
          if (resolvedUrl) {
            setThumbnailUrl(resolvedUrl)
            setHasError(false)
          } else {
            setHasError(true)
          }
        }
      } catch {
        if (isSubscribed && isMountedRef.current) {
          setHasError(true)
        }
      } finally {
        if (isSubscribed && isMountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    fetchThumbnail()

    return () => {
      isSubscribed = false
    }
  }, [fileId, explicitUrl, enabled, typeInfo.canHaveVisualThumbnail, isVisible, lazy, name, extension])

  return {
    url: thumbnailUrl,
    isLoading: isLoading && !thumbnailUrl && !hasError,
    hasError,
    category: typeInfo.category,
    typeInfo,
    targetRef
  }
}
