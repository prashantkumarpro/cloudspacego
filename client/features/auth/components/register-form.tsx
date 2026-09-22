'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  KeyRound,
  Check,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import type { RegisterCredentials } from '../types'
import { register as registerApi, sendOtp, verifyOtp } from '../api'
import { AuthError, getAuthError } from '../auth-error'
import { cn } from '@/lib/utils/cn'

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)

  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState('')

  // OTP state
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')

  const router = useRouter()

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<RegisterCredentials>({
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })

  // -----------------------------
  // Registration Submission
  // -----------------------------
  const onSubmit = async (data: RegisterCredentials) => {
    setRegisterError('')
    setRegisterSuccess('')
    clearErrors()

    if (!otpVerified) {
      setOtpError('Please verify your email')
      return
    }

    try {
      await registerApi({ ...data, otp })

      setRegisterSuccess('Registration successful! Redirecting to login...')

      setTimeout(() => {
        router.replace('/login')
      }, 1500)
    } catch (error) {
      if (error instanceof AuthError) {
        if (error.fieldErrors) {
          Object.entries(error.fieldErrors).forEach(([field, message]) => {
            if (message) {
              setError(field as keyof RegisterCredentials, {
                type: 'server',
                message
              })
            }
          })
          return
        }

        setRegisterError(error.message)
        return
      }

      setRegisterError('Something went wrong. Please try again.')
    }
  }

  // -----------------------------
  // Send OTP
  // -----------------------------
  const handleSendOtp = async () => {
    const email = getValues('email')?.trim()

    if (!email) {
      setError('email', {
        type: 'manual',
        message: 'Email is required'
      })
      return
    }

    setOtpError('')
    setOtpLoading(true)

    try {
      await sendOtp({ email })
      setOtpSent(true)
      setOtpVerified(false)
      setOtp('')
    } catch (error) {
      const authError = getAuthError(error)
      setOtpError(authError.message)
    } finally {
      setOtpLoading(false)
    }
  }

  // -----------------------------
  // Verify OTP
  // -----------------------------
  const handleVerifyOtp = async () => {
    const email = getValues('email')?.trim()

    if (!email) {
      setOtpError('Please enter your email first')
      return
    }

    if (!otp.trim()) {
      setOtpError('Please enter the OTP')
      return
    }

    setOtpError('')
    setOtpLoading(true)

    try {
      await verifyOtp({
        email,
        otp: otp.trim()
      })
      setOtpVerified(true)
      setOtpError('')
    } catch (error) {
      const authError = getAuthError(error)
      setOtpError(authError.message)
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col">
      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div className="w-7 h-7 flex items-center justify-center shrink-0">
          <Image
            src="/images/cloudeLogo.png"
            width={28}
            height={24}
            alt="CloudSpaceGo"
            className="w-7 h-auto object-contain shrink-0"
            priority
          />
        </div>
        <span className="text-lg font-bold tracking-tight font-sans text-foreground flex items-center whitespace-nowrap">
          cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
        </span>
      </div>

      {/* Heading & Subtitle */}
      <div className="mb-4 sm:mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
          Create account
        </h1>
        <p className="mt-0.5 text-xs text-text-muted font-normal">
          Sign up to get started with secure cloud storage.
        </p>
      </div>

      {/* Inline Registration Error Banner */}
      {registerError && (
        <div className="mb-3.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2 text-xs animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{registerError}</span>
        </div>
      )}

      {/* Inline Registration Success Banner */}
      {registerSuccess && (
        <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-xs animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{registerSuccess}</span>
        </div>
      )}

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-3">
        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-text-secondary select-none">
            Full Name
          </label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
            <input
              type="text"
              placeholder="Enter your full name"
              className={cn(
                "w-full h-10 bg-input-bg text-foreground rounded-xl pl-9.5 pr-3.5 py-2 text-xs sm:text-sm font-normal placeholder:text-text-muted border border-card-border transition-all duration-200 focus:bg-card-bg focus:border-[#6E60EE]/60 focus:outline-none focus:ring-2 focus:ring-[#6E60EE]/20",
                errors.name && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              )}
              autoComplete="name"
              {...register('name', {
                required: 'Full name is required',
                validate: value => {
                  const name = value.trim()
                  if (name.length < 3) return 'Name must be at least 3 characters long'
                  if (name.length > 50) return 'Name must not exceed 50 characters'
                  if (!/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(name)) return 'Please enter a valid name'
                  return true
                }
              })}
            />
          </div>
          {errors.name && (
            <span className="text-[11px] font-medium text-rose-500">{errors.name.message}</span>
          )}
        </div>

        {/* Email Address + Send OTP Action */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-text-secondary select-none">
            Email address
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
            <input
              type="email"
              placeholder="name@example.com"
              disabled={otpVerified}
              className={cn(
                "w-full h-10 bg-input-bg text-foreground rounded-xl pl-9.5 pr-24 py-2 text-xs sm:text-sm font-normal placeholder:text-text-muted border border-card-border transition-all duration-200 focus:bg-card-bg focus:border-[#6E60EE]/60 focus:outline-none focus:ring-2 focus:ring-[#6E60EE]/20 disabled:opacity-80 disabled:cursor-not-allowed",
                errors.email && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
                otpVerified && "border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
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
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              {otpVerified ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  <Check className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="text-xs font-semibold text-[#6E60EE] hover:text-[#6052E6] hover:bg-[#6E60EE]/10 px-2 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>{otpSent ? 'Resend' : 'Send OTP'}</span>
                  )}
                </button>
              )}
            </div>
          </div>
          {errors.email && (
            <span className="text-[11px] font-medium text-rose-500">{errors.email.message}</span>
          )}

          {/* OTP Input & Verification Row */}
          {otpSent && !otpVerified && (
            <div className="mt-1 flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#6E60EE]/5 border border-[#6E60EE]/20 animate-in fade-in duration-150">
              <label className="text-[11px] font-semibold text-text-secondary select-none">
                Enter verification code
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 flex items-center">
                  <KeyRound className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full h-9 bg-card-bg text-foreground rounded-lg pl-8 pr-2.5 text-xs sm:text-sm font-semibold placeholder:text-text-muted placeholder:font-normal border border-card-border focus:border-[#6E60EE] focus:outline-none focus:ring-2 focus:ring-[#6E60EE]/20"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || !otp.trim()}
                  className="h-9 px-3.5 rounded-lg bg-[#6E60EE] hover:bg-[#6052E6] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  {otpLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <span>Verify</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {otpError && (
            <span className="text-[11px] font-medium text-rose-500">{otpError}</span>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-text-secondary select-none">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              className={cn(
                "w-full h-10 bg-input-bg text-foreground rounded-xl pl-9.5 pr-9 py-2 text-xs sm:text-sm font-normal placeholder:text-text-muted border border-card-border transition-all duration-200 focus:bg-card-bg focus:border-[#6E60EE]/60 focus:outline-none focus:ring-2 focus:ring-[#6E60EE]/20",
                errors.password && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              )}
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                validate: value => {
                  if (value.length < 6) {
                    return 'Password must be at least 6 characters long'
                  }
                  return true
                }
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-foreground transition-colors absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg hover:bg-input-bg/80"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-[11px] font-medium text-rose-500">{errors.password.message}</span>
          )}
        </div>

        {/* Primary Sign Up Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1.5 w-full h-10 rounded-xl bg-[#6E60EE] hover:bg-[#6052E6] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Redirect to Sign In */}
      <div className="mt-4 text-center">
        <p className="text-xs text-text-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#6E60EE] hover:underline ml-0.5"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
