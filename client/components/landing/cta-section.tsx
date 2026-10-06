'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 bg-background border-t border-card-border transition-colors duration-200">
      <div className="relative mx-auto max-w-5xl rounded-2xl bg-card-bg border border-card-border px-6 py-12 text-center shadow-md dark:shadow-xl dark:shadow-black/50 sm:px-12 sm:py-16">
        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-input-bg px-3.5 py-1 text-[11px] font-semibold text-text-secondary tracking-wider uppercase mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
            <span>Ready to get started?</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Keep your files within reach.
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-text-secondary">
            Start building your personal cloud workspace with CloudSpaceGo today. Fast setup, intuitive file management, and instant access.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#6E60EE] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#6052E6] active:scale-[0.98]"
            >
              Get started free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/login"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-card-border bg-input-bg px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground transition-all duration-150 hover:bg-card-hover active:scale-[0.98]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
