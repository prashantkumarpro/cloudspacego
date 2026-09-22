'use client'

import { useEffect, useState, useRef } from 'react'
import { getFileBlob } from '../api'
import { getFileTypeInfo } from '../utils/file-preview'

// In-memory cache for ObjectURLs keyed by fileId to prevent duplicate blob fetches
const blobUrlCache = new Map<string, string>()
const inFlightRequests = new Map<string, Promise<string | null>>()

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
}

export interface UseFileThumbnailResult {
  url: string | null
  isLoading: boolean
  hasError: boolean
  category: ReturnType<typeof getFileTypeInfo>['category']
  typeInfo: ReturnType<typeof getFileTypeInfo>
}

export function useFileThumbnail({
  id,
  _id,
  name,
  extension,
  url: propUrl,
  thumbnailUrl: propThumbnailUrl,
  enabled = true
}: UseFileThumbnailOptions): UseFileThumbnailResult {
  const fileId = id || _id
  const typeInfo = getFileTypeInfo(name, extension)
  const isMountedRef = useRef(true)

  // Direct URL passed via props takes precedence
  const explicitUrl = propThumbnailUrl || propUrl

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
    return !blobUrlCache.has(fileId)
  })

  const [hasError, setHasError] = useState<boolean>(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
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

    // Check in-memory cache
    if (blobUrlCache.has(fileId)) {
      setThumbnailUrl(blobUrlCache.get(fileId)!)
      setIsLoading(false)
      setHasError(false)
      return
    }

    let isSubscribed = true

    const fetchThumbnail = async () => {
      setIsLoading(true)
      setHasError(false)

      try {
        let fetchPromise = inFlightRequests.get(fileId)

        if (!fetchPromise) {
          fetchPromise = (async () => {
            try {
              const blob = await getFileBlob(fileId)
              const objectUrl = URL.createObjectURL(blob)
              blobUrlCache.set(fileId, objectUrl)
              return objectUrl
            } catch (err) {
              console.warn(`[FilePreview] Could not load thumbnail for file ${fileId}:`, err)
              return null
            } finally {
              inFlightRequests.delete(fileId)
            }
          })()

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
      } catch (err) {
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
  }, [fileId, explicitUrl, enabled, typeInfo.canHaveVisualThumbnail])

  return {
    url: thumbnailUrl,
    isLoading,
    hasError,
    category: typeInfo.category,
    typeInfo
  }
}
