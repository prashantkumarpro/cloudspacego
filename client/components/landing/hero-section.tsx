'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { ProductPreview } from './product-preview'

export function HeroSection() {
  const scrollToDemo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById('product-demo') || document.getElementById('how-it-works')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="relative overflow-hidden px-4 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:px-8">
      {/* Background Subtle Gradient Blobs - Soft purple glow, not excessive */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[480px] bg-gradient-to-b from-[#F2EFFF]/80 via-[#ECE8FF]/40 to-transparent dark:from-[#6E60EE]/15 dark:via-[#6E60EE]/5 dark:to-transparent blur-3xl opacity-70 -z-10 animate-glow-pulse"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-5xl text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#6E60EE]/20 bg-[#6E60EE]/10 px-4 py-1.5 text-[11px] sm:text-xs font-bold tracking-[0.14em] uppercase text-[#6E60EE] dark:text-[#8E82F8] shadow-2xs animate-landing-fade-up">
          <Sparkles className="h-3.5 w-3.5 text-[#6E60EE]" />
          <span>YOUR FILES, FINALLY IN ONE PLACE</span>
        </div>

        {/* Confident Editorial Headline */}
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-[-0.035em] text-foreground sm:text-6xl md:text-7xl lg:text-[72px] lg:leading-[1.08] animate-landing-fade-up animation-delay-75">
          Everything you need
          <br />
          <span className="text-[#6E60EE]">to manage your files.</span>
        </h1>

        {/* Subtitle / Value Proposition */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg md:text-xl font-normal leading-relaxed text-text-secondary animate-landing-fade-up animation-delay-150">
          Store, organize, search, preview, and share your files from one simple workspace.
        </p>

        {/* Primary & Secondary Action Buttons */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row animate-landing-fade-up animation-delay-225">
          <Link
            href="/register"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#6E60EE] px-7 py-3.5 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#6052E6] hover:shadow-sm active:scale-[0.98]"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href="#product-demo"
            onClick={scrollToDemo}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-card-border bg-card-bg px-6 py-3.5 text-sm font-semibold text-foreground shadow-2xs transition-all duration-200 hover:border-card-border/80 hover:bg-input-bg active:scale-[0.98]"
          >
            <Play className="h-3.5 w-3.5 text-[#6E60EE] fill-[#6E60EE]/20" />
            See how it works
          </a>
        </div>
      </div>

      {/* Realistic Interactive Product Preview */}
      <ProductPreview />
    </section>
  )
}
