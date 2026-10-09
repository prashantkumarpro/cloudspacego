'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'

export function CtaSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-[#0B0B0D] text-[#F5F5F7] overflow-hidden">
      <LandingContainer className="relative z-10 flex flex-col items-center">
        <div className="mx-auto w-full max-w-3xl text-center">
          {/* Eyebrow Label */}
          <div className="mb-4 sm:mb-5 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#24242B] bg-[#101014] px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#A1A1AA] uppercase select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
              <span>START ORGANIZING TODAY</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#F5F5F7] leading-[1.12]">
            Everything you need.
            <br />
            <span className="text-[#6E60EE]">
              One simple space.
            </span>
          </h2>

          <p className="mx-auto mt-5 sm:mt-6 max-w-xl text-base sm:text-lg font-normal leading-relaxed text-[#A1A1AA]">
            Get started with 1 GB of high-speed cloud storage. Fast setup, intuitive file management, and instant access across all your devices.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              href="/register"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#6E60EE] px-7 sm:px-8 py-3.5 text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#5E50DE] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]"
            >
              <span>Get started free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-[#24242B] bg-[#101014] px-6 sm:px-7 py-3.5 text-sm font-medium text-[#F5F5F7] transition-all duration-150 hover:bg-[#141419] hover:border-[#383842] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </LandingContainer>
    </section>
  )
}

