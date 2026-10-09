'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight } from 'lucide-react'
import { LandingContainer } from '@/components/landing/landing-container'

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev))
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-[#24242B] transition-colors duration-200 motion-reduce:transition-none ${
        isScrolled
          ? 'bg-[#0B0B0D]/88 backdrop-blur-md'
          : 'bg-[#0B0B0D]'
      }`}
    >
      <LandingContainer className="flex h-16 items-center justify-between">
        {/* Left: Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-85 select-none shrink-0"
          aria-label="CloudSpaceGo Home"
        >
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <Image
              src="/images/cloudeLogo.png"
              width={32}
              height={28}
              alt="cloudspacego logo"
              className="w-8 h-auto object-contain shrink-0"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#F5F5F7] font-sans">
            cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 lg:gap-8 text-[13.5px] font-medium text-[#A1A1AA] md:flex">
          <a
            href="#organize"
            className="transition-colors duration-150 hover:text-[#F5F5F7] focus-visible:outline-none focus-visible:text-[#F5F5F7]"
          >
            Features
          </a>
          <a
            href="#search"
            className="transition-colors duration-150 hover:text-[#F5F5F7] focus-visible:outline-none focus-visible:text-[#F5F5F7]"
          >
            How it works
          </a>
          <a
            href="#sharing"
            className="transition-colors duration-150 hover:text-[#F5F5F7] focus-visible:outline-none focus-visible:text-[#F5F5F7]"
          >
            Security
          </a>
          <a
            href="#storage"
            className="transition-colors duration-150 hover:text-[#F5F5F7] focus-visible:outline-none focus-visible:text-[#F5F5F7]"
          >
            Pricing
          </a>
        </nav>

        {/* Right: Desktop Actions (GitHub Icon + Log in + Get started Primary CTA) */}
        <div className="hidden items-center gap-4 sm:flex">
          {/* GitHub Repository Link */}
          <a
            href="https://github.com/prashantkumarpro/cloudspacego"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-[#141419] border border-[#24242B] flex items-center justify-center text-[#A1A1AA] hover:text-[#F5F5F7] hover:border-[#383842] hover:bg-[#181820] transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE]"
            aria-label="GitHub Repository"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Log in Text Link */}
          <Link
            href="/login"
            className="text-[13.5px] font-medium text-[#A1A1AA] transition-colors duration-150 hover:text-[#F5F5F7] px-2 py-1.5 focus-visible:outline-none focus-visible:text-[#F5F5F7]"
          >
            Log in
          </Link>

          {/* Get started - Single Prominent CTA */}
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#6E60EE] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#5E50DE] hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E60EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0D]"
          >
            <span>Get started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Header Controls */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/login"
            className="text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors duration-150 px-1.5 py-1"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1 rounded-lg bg-[#6E60EE] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#5E50DE] active:scale-95"
          >
            <span>Get started</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#A1A1AA] hover:bg-[#141419] hover:text-[#F5F5F7] focus:outline-none cursor-pointer transition-colors duration-150 active:scale-95"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </LandingContainer>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#24242B] bg-[#0D0D10] px-5 pt-2 pb-5 sm:hidden text-[#F5F5F7]">
          <div className="flex flex-col space-y-1 pt-1 pb-3">
            <a
              href="#organize"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#A1A1AA] hover:bg-[#141419] hover:text-[#F5F5F7] transition-colors"
            >
              Features
            </a>
            <a
              href="#search"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#A1A1AA] hover:bg-[#141419] hover:text-[#F5F5F7] transition-colors"
            >
              How it works
            </a>
            <a
              href="#sharing"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#A1A1AA] hover:bg-[#141419] hover:text-[#F5F5F7] transition-colors"
            >
              Security
            </a>
            <a
              href="#storage"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#A1A1AA] hover:bg-[#141419] hover:text-[#F5F5F7] transition-colors"
            >
              Pricing
            </a>
          </div>

          <div className="flex flex-col gap-2.5 pt-3 border-t border-[#24242B] px-1">
            <div className="flex items-center justify-between">
              <a
                href="https://github.com/prashantkumarpro/cloudspacego"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </a>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors"
              >
                Log in
              </Link>
            </div>

            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#6E60EE] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#5E50DE] active:scale-95 transition-all"
            >
              <span>Get started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
