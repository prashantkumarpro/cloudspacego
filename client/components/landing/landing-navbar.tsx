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
      setIsScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 border-b border-[#24242B] ${
        isScrolled ? 'bg-[#0B0B0D]/95 backdrop-blur-md' : 'bg-[#0B0B0D]'
      }`}
    >
      <LandingContainer className="flex h-16 items-center justify-between">
        {/* Brand Logo matching actual CloudSpaceGo application */}
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

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#A1A1AA] md:flex">
          <a href="#organize" className="transition-colors duration-150 hover:text-[#F5F5F7]">
            Features
          </a>
          <a href="#search" className="transition-colors duration-150 hover:text-[#F5F5F7]">
            How it works
          </a>
          <a href="#sharing" className="transition-colors duration-150 hover:text-[#F5F5F7]">
            Security
          </a>
          <a href="#storage" className="transition-colors duration-150 hover:text-[#F5F5F7]">
            Pricing
          </a>
        </nav>

        {/* Desktop Auth: Log in / Get started → */}
        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-[#A1A1AA] transition-colors duration-150 hover:text-[#F5F5F7]"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7C6CFF] hover:text-[#9B8CFF] transition-all duration-150 group active:scale-[0.98]"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4 text-[#7C6CFF] group-hover:text-[#9B8CFF] group-hover:translate-x-0.5 transition-transform duration-150" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 sm:hidden">
          <Link
            href="/login"
            className="text-xs font-medium text-[#A1A1AA] hover:text-[#F5F5F7] transition-colors duration-150"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C6CFF] hover:text-[#9B8CFF] transition-colors duration-150"
          >
            <span>Get started</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#A1A1AA] hover:bg-[#141419] hover:text-[#F5F5F7] focus:outline-none cursor-pointer ml-1 transition-colors duration-150 active:scale-95"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </LandingContainer>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-[#24242B] bg-[#0D0D10] px-5 pt-2 pb-5 sm:hidden text-[#F5F5F7]">
          <div className="flex flex-col space-y-1 pt-1 pb-3">
            <a
              href="#organize"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#A1A1AA] hover:bg-[#141419] hover:text-[#F5F5F7]"
            >
              Features
            </a>
            <a
              href="#search"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#A1A1AA] hover:bg-[#141419] hover:text-[#F5F5F7]"
            >
              How it works
            </a>
            <a
              href="#sharing"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#A1A1AA] hover:bg-[#141419] hover:text-[#F5F5F7]"
            >
              Security
            </a>
            <a
              href="#storage"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#A1A1AA] hover:bg-[#141419] hover:text-[#F5F5F7]"
            >
              Pricing
            </a>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#24242B] px-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-[#A1A1AA] hover:text-[#F5F5F7]"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F5F5F7] hover:text-[#7C6CFF]"
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

