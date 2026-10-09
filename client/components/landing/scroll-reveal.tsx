'use client'

import React from 'react'
import { useInView } from '@/hooks/use-in-view'
import { cn } from '@/lib/utils/cn'

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  delay?: number // in milliseconds
  duration?: number // in milliseconds
  distance?: number // in pixels (default 16)
  direction?: 'up' | 'none'
  className?: string
  once?: boolean
}

export function ScrollReveal({
  children,
  delay = 0,
  duration = 500,
  distance = 16,
  direction = 'up',
  className,
  once = true,
  style,
  ...props
}: ScrollRevealProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({ once })

  const transformValue = direction === 'up'
    ? (isInView ? 'translateY(0px)' : `translateY(${distance}px)`)
    : 'none'

  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: isInView ? 1 : 0,
        transform: transformValue,
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
        willChange: isInView ? 'auto' : 'opacity, transform'
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  )
}
