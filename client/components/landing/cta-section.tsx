'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 bg-[#FAF9F7] border-t border-[#ECEAF0]">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#1E1B24] px-6 py-16 text-center shadow-[0_20px_50px_rgba(30,25,60,0.15)] sm:px-12 sm:py-20">
        {/* Subtle radial purple glow accent inside dark container */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-[#6E60EE]/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-[#D6D1FF] backdrop-blur-xs mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#6E60EE]" />
            <span>Ready to get started?</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Keep your files within reach.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
            Start building your personal cloud workspace with CloudSpaceGo today. Fast setup, intuitive file management, and instant access.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#6E60EE] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#6052E6] hover:shadow-md active:scale-[0.98]"
            >
              Get started for free
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xs transition-all duration-200 hover:bg-white/10 active:scale-[0.98]"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
