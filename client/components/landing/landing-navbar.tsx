'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight } from 'lucide-react'

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-250 ${isScrolled
          ? 'bg-[#FAF9F7]/95 backdrop-blur-md shadow-[0_2px_18px_rgba(30,25,60,0.05)] border-b border-[#ECEAF0]'
          : 'bg-[#FAF9F7]/85 backdrop-blur-sm border-b border-[#ECEAF0]'
        }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
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
              alt="CloudSpaceGo"
              className="w-8 h-auto object-contain shrink-0"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight font-sans text-[#1E1B24] flex items-center whitespace-nowrap">
            cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#585361] md:flex">
          <a
            href="#features"
            className="transition-colors hover:text-[#6E60EE] focus-visible:text-[#6E60EE]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-[#6E60EE] focus-visible:text-[#6E60EE]"
          >
            How it works
          </a>
          <a
            href="#security"
            className="transition-colors hover:text-[#6E60EE] focus-visible:text-[#6E60EE]"
          >
            Security
          </a>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#585361] transition hover:bg-[#F2EFFF] hover:text-[#6E60EE]"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#6E60EE] px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-[#6052E6] active:scale-[0.98]"
          >
            Get started free
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#585361] hover:bg-[#F2EFFF] hover:text-[#6E60EE]"
          >
            Log in
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#585361] hover:bg-[#F2EFFF] hover:text-[#6E60EE] focus:outline-none cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-[#ECEAF0] bg-white px-4 pt-2 pb-6 sm:hidden animate-landing-fade-in">
          <div className="flex flex-col space-y-2 pt-2 pb-4">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-[#585361] hover:bg-[#F2EFFF] hover:text-[#6E60EE]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-[#585361] hover:bg-[#F2EFFF] hover:text-[#6E60EE]"
            >
              How it works
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-[#585361] hover:bg-[#F2EFFF] hover:text-[#6E60EE]"
            >
              Security
            </a>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#ECEAF0]">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#6E60EE] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-xs"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
