'use client'

import React from 'react'
import LoginForm from '@/features/auth/components/login-form'
import { Sun, Moon } from 'lucide-react'
import { useApp } from '@/providers/app-provider'

export default function LoginPage() {
  const { theme, toggleTheme } = useApp()

  return (
    <main className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-5 transition-colors duration-200 select-none overflow-y-auto">
      {/* Top Right Theme Toggle Button */}
      <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-card-bg border border-card-border text-text-secondary hover:text-foreground hover:bg-input-bg transition-colors shadow-xs cursor-pointer focus:outline-none"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Centered Login Card (fits standard desktop/laptop viewports without scrolling) */}
      <div className="w-full max-w-[430px] bg-card-bg border border-card-border rounded-2xl sm:rounded-3xl shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.25)] p-5 sm:p-6 md:p-7 flex flex-col transition-all duration-200 my-auto">
        <LoginForm />
      </div>
    </main>
  )
}
