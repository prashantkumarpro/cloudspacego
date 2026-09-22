'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/use-auth'
import { AuthError } from '../auth-error'
import type { LoginCredentials } from '../types'
import { cn } from '@/lib/utils/cn'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loginError, setLoginError] = useState('')
  const router = useRouter()
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<LoginCredentials>()

  const { login } = useAuth()

  const onSubmit = async (data: LoginCredentials) => {
    setLoginError('')
    clearErrors()

    try {
      await login(data)
      router.replace('/dashboard')
    } catch (error) {
      if (error instanceof AuthError) {
        setLoginError(error.message)
        return
      }

      setLoginError('Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="w-full flex flex-col">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-7 sm:mb-8">
        <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
          <Image
            src="/images/cloudeLogo.png"
            width={32}
            height={28}
            alt="CloudSpaceGo"
            className="w-8 sm:w-8.5 h-auto object-contain shrink-0"
            priority
          />
        </div>
        <span className="text-xl sm:text-2xl font-bold tracking-tight font-sans text-foreground flex items-center whitespace-nowrap">
          cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
        </span>
      </div>

      {/* Heading & Subtitle */}
      <div className="mb-6 sm:mb-7">
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground font-sans">
          Welcome back
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-text-muted font-normal">
          Sign in to continue to your files.
        </p>
      </div>

      {/* Inline Login Error Alert */}
      {loginError && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{loginError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 sm:gap-4.5">
        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-[13px] font-semibold text-text-secondary select-none">
            Email address
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4.5 h-4.5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
            <input
              type="email"
              placeholder="name@example.com"
              className={cn(
                "w-full h-11 sm:h-12 bg-input-bg text-foreground rounded-xl pl-10.5 pr-4 py-2.5 text-sm font-normal placeholder:text-text-muted border border-card-border transition-all duration-200 focus:bg-card-bg focus:border-[#6E60EE]/60 focus:outline-none focus:ring-2 focus:ring-[#6E60EE]/20",
                errors.email && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              )}
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Invalid email format'
                }
              })}
            />
          </div>
          {errors.email && (
            <span className="text-[11px] sm:text-xs font-medium text-rose-500">{errors.email.message}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs sm:text-[13px] font-semibold text-text-secondary select-none">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4.5 h-4.5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={cn(
                "w-full h-11 sm:h-12 bg-input-bg text-foreground rounded-xl pl-10.5 pr-11 py-2.5 text-sm font-normal placeholder:text-text-muted border border-card-border transition-all duration-200 focus:bg-card-bg focus:border-[#6E60EE]/60 focus:outline-none focus:ring-2 focus:ring-[#6E60EE]/20",
                errors.password && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              )}
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required'
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-foreground transition-colors absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg hover:bg-input-bg/80"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-[11px] sm:text-xs font-medium text-rose-500">{errors.password.message}</span>
          )}
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs sm:text-sm text-text-secondary hover:text-foreground transition-colors leading-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-card-border text-[#6E60EE] accent-[#6E60EE] cursor-pointer focus:ring-[#6E60EE]/20"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            className="text-xs sm:text-sm font-semibold text-[#6E60EE] hover:underline transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        {/* Primary Submit Button (44-48px height) */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full h-11 sm:h-12 rounded-xl bg-[#6E60EE] hover:bg-[#6052E6] text-white text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </>
          )}
        </button>
      </form>

      {/* Register Footer Link */}
      <div className="mt-6 sm:mt-7 text-center">
        <p className="text-xs sm:text-sm text-text-muted">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-[#6E60EE] hover:underline ml-0.5"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
