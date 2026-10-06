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
    <section className="relative px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        {/* Eyebrow Badge - Tight, subtle, understated */}
        <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-input-bg px-3.5 py-1 text-[11px] font-semibold tracking-wider uppercase text-text-secondary animate-landing-fade-up">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6E60EE]" />
          <span>Cloud Storage for Modern Teams</span>
        </div>

        {/* Polished Editorial Headline - Refined SaaS Scale */}
        <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.12] animate-landing-fade-up animation-delay-75">
          Everything you need
          <br />
          <span className="text-[#6E60EE]">to manage your files.</span>
        </h1>

        {/* Subtitle / Value Proposition */}
        <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base md:text-lg font-normal leading-relaxed text-text-secondary animate-landing-fade-up animation-delay-150">
          Store, organize, search, preview, and share your files from one simple workspace.
        </p>

        {/* Primary & Secondary Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row animate-landing-fade-up animation-delay-225">
          <Link
            href="/register"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#6E60EE] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#6052E6] active:scale-[0.98]"
          >
            Get started free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <a
            href="#product-demo"
            onClick={scrollToDemo}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-card-border bg-card-bg px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground transition-all duration-150 hover:bg-input-bg active:scale-[0.98]"
          >
            <Play className="h-3.5 w-3.5 text-text-muted" />
            See how it works
          </a>
        </div>
      </div>

      {/* Realistic Interactive Product Preview */}
      <ProductPreview />
    </section>
  )
}
