'use client'

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'

import {
  getUser,
  login as loginApi,
  logout as logoutApi
} from '@/features/auth/api'

import type { LoginCredentials, User } from '@/features/auth/types'
import { useRouter } from 'next/navigation'


interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider ({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getUser()

      setUser(currentUser)
    } catch {
      setUser(null)
    }
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await loginApi(credentials)

      // Login endpoint sets the authentication cookie.
      // Fetch the authenticated user after login.
      await refreshUser()
    },
    [refreshUser]
  )

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } finally {
      // Clear frontend auth state even if the request fails.
      setUser(null)
      router.replace('/login')
    }
  }, [])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshUser()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [refreshUser])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      refreshUser
    }),
    [user, isLoading, login, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
