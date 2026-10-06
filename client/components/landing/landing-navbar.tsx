'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react'
import { useApp } from '@/providers/app-provider'

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useApp()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 border-b border-card-border ${
        isScrolled ? 'bg-background shadow-xs' : 'bg-background'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90 select-none shrink-0"
          aria-label="CloudSpaceGo Home"
        >
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
          <span className="text-base font-bold tracking-tight font-sans text-foreground flex items-center whitespace-nowrap">
            cloud<span className="font-extrabold text-[#6E60EE]">spacego</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 text-[13px] font-medium text-text-secondary md:flex">
          <a
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="#security"
            className="transition-colors hover:text-foreground"
          >
            Security
          </a>
        </nav>

        {/* Desktop Auth Buttons + Theme Toggle */}
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-input-bg border border-card-border text-text-secondary hover:text-foreground hover:bg-card-hover transition-colors cursor-pointer focus:outline-none"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>

          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:bg-input-bg hover:text-foreground"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#6E60EE] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#6052E6] active:scale-[0.98]"
          >
            Get started
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Mobile Menu Button + Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-input-bg border border-card-border text-text-secondary hover:text-foreground hover:bg-card-hover transition-colors cursor-pointer focus:outline-none"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-3 h-3 text-amber-400" />
            ) : (
              <Moon className="w-3 h-3" />
            )}
          </button>

          <Link
            href="/login"
            className="rounded-lg px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-input-bg hover:text-foreground"
          >
            Log in
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-1.5 text-text-secondary hover:bg-input-bg hover:text-foreground focus:outline-none cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-card-border bg-card-bg px-4 pt-2 pb-5 sm:hidden animate-landing-fade-in text-foreground">
          <div className="flex flex-col space-y-1 pt-1 pb-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-foreground"
            >
              Security
            </a>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-card-border">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#6E60EE] px-4 py-2 text-center text-xs font-semibold text-white shadow-xs"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
