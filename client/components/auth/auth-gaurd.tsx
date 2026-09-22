'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/features/auth/hooks/use-auth'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard ({ children }: AuthGuardProps) {
  const router = useRouter()

  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className='flex h-screen w-screen items-center justify-center bg-background text-foreground'>
        <span className='text-sm text-text-secondary'>Loading...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
