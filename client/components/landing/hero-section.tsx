'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ProductPreview } from './product-preview'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
      {/* Background Subtle Gradient Blobs */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#F2EFFF]/70 to-transparent blur-3xl opacity-70 -z-10"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-5xl text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E1FF] bg-[#F2EFFF] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#6E60EE] shadow-2xs animate-landing-fade-up">
          <Sparkles className="h-3.5 w-3.5 text-[#6E60EE]" />
          <span>Simple cloud storage for everyone</span>
        </div>

        {/* Main Heading */}
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-[#1E1B24] sm:text-5xl md:text-6xl lg:text-[64px] lg:leading-[1.1] animate-landing-fade-up animation-delay-75">
          Your files.
          <br />
          <span className="text-[#6E60EE]">One simple space.</span>
        </h1>

        {/* Supporting Paragraph */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#71717A] sm:text-lg animate-landing-fade-up animation-delay-150">
          Store, organize, search, and share your files from one simple
          cloud workspace built to keep everything within reach.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row animate-landing-fade-up animation-delay-225">
          <Link
            href="/register"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#6E60EE] px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#6052E6] hover:shadow-sm active:scale-[0.98]"
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/login"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-[#ECEAF0] bg-white px-6 py-3.5 text-sm font-semibold text-[#1E1B24] shadow-2xs transition-all duration-200 hover:border-[#D6D1FF] hover:bg-[#FAF9F7] active:scale-[0.98]"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Product Preview */}
      <ProductPreview />
    </section>
  )
}
