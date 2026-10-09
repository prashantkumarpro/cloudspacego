'use client'

import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useInView<T extends HTMLElement = HTMLDivElement>(options: UseInViewOptions = {}) {
  const { threshold = 0.12, rootMargin = '0px 0px -40px 0px', once = true } = options
  const ref = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    // If user prefers reduced motion, trigger immediately
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsInView(true)
      return
    }

    const element = ref.current
    if (!element) return

    // If IntersectionObserver is not supported, fallback to in-view
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (once) {
            observer.disconnect()
          }
        } else if (!once) {
          setIsInView(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, once])

  return { ref, isInView }
}
